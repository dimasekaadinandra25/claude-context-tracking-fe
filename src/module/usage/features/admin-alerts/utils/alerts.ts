import type { AlertSettings } from '../../../types';

export const ALERT_WORDS = [
  'pace',
  'summary',
  'stale',
  'runaway',
  'project',
  'budget',
  'version',
] as const;

export type AlertWord = (typeof ALERT_WORDS)[number];

export type AlertForm = {
  thresholds: number[];
  words: AlertWord[];
  runawayShare: string;
  projectShare: string;
};

export const MIN_PERCENT = 1;
export const MAX_PERCENT = 100;

export const DEFAULT_SETTINGS: AlertSettings = {
  alerts: '80,90,pace,summary,stale,runaway,project,budget,version',
  runaway_share: 5,
  project_share: 40,
};

const isWord = (part: string): part is AlertWord =>
  (ALERT_WORDS as readonly string[]).includes(part);

export const isPercent = (value: number) =>
  Number.isInteger(value) && value >= MIN_PERCENT && value <= MAX_PERCENT;

export function addThreshold(thresholds: number[], value: number) {
  if (!isPercent(value) || thresholds.includes(value)) return thresholds;
  return [...thresholds, value].sort((a, b) => a - b);
}

export function formFromSettings(settings: AlertSettings): AlertForm {
  const parts = settings.alerts
    .split(/[\s,]+/)
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
  return {
    thresholds: parts
      .filter((part) => !isWord(part))
      .map(Number)
      .reduce<number[]>(addThreshold, []),
    words: ALERT_WORDS.filter((word) => parts.includes(word)),
    runawayShare: String(settings.runaway_share),
    projectShare: String(settings.project_share),
  };
}

export function settingsFromForm(form: AlertForm): AlertSettings | null {
  const runaway = Number(form.runawayShare);
  const project = Number(form.projectShare);
  if (!isPercent(runaway) || !isPercent(project)) return null;
  const words = ALERT_WORDS.filter((word) => form.words.includes(word));
  return {
    alerts: [...form.thresholds, ...words].join(','),
    runaway_share: runaway,
    project_share: project,
  };
}
