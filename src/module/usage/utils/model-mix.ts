import type { UsageSession } from '../types';

type Price = { input: number; output: number; cacheWrite: number; cacheRead: number };

const MILLION = 1_000_000;
export const SMALL_REQUESTS = 15;
export const SMALL_OUTPUT = 20_000;

export const SONNET: Price = { input: 2, output: 10, cacheWrite: 2.5, cacheRead: 0.1 };

const PRICES: [RegExp, Price][] = [
  [/opus-5-5/, { input: 4, output: 20, cacheWrite: 5, cacheRead: 0.2 }],
  [/opus/, { input: 5, output: 25, cacheWrite: 6.25, cacheRead: 0.5 }],
  [/sonnet-5-5/, SONNET],
  [/sonnet/, { input: 2, output: 10, cacheWrite: 2.5, cacheRead: 0.2 }],
];

export function modelPrice(model: string): Price | null {
  return PRICES.find(([pattern]) => pattern.test(model))?.[1] ?? null;
}

export function opusPrice(model: string): Price | null {
  return model.includes('opus') ? modelPrice(model) : null;
}

const outputOf = (session: UsageSession) => session.output_tokens + session.subagent_output_tokens;

export function sessionCost(session: UsageSession, price: Price): number {
  return (
    (session.input_tokens * price.input +
      session.cache_write_tokens * price.cacheWrite +
      session.cache_read_tokens * price.cacheRead +
      outputOf(session) * price.output) /
    MILLION
  );
}

const opusOf = (session: UsageSession) =>
  [session.model, ...session.models].map(opusPrice).find((price) => price !== null) ?? null;

const isSmall = (session: UsageSession) =>
  session.requests <= SMALL_REQUESTS && outputOf(session) <= SMALL_OUTPUT;

export type SmallOpusSession = { session: UsageSession; cost: number; saving: number };

export type ModelMixTip = {
  sessions: SmallOpusSession[];
  opusSessions: number;
  cost: number;
  saving: number;
};

export function modelMixTip(all: UsageSession[]): ModelMixTip {
  const opus = all.flatMap((session) => {
    const price = opusOf(session);
    return price ? [{ session, price }] : [];
  });
  const sessions = opus
    .filter(({ session }) => isSmall(session))
    .map(({ session, price }) => {
      const cost = sessionCost(session, price);
      return { session, cost, saving: cost - sessionCost(session, SONNET) };
    })
    .sort((a, b) => b.saving - a.saving);
  return {
    sessions,
    opusSessions: opus.length,
    cost: sessions.reduce((total, row) => total + row.cost, 0),
    saving: sessions.reduce((total, row) => total + row.saving, 0),
  };
}
