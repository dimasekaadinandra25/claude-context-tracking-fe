const STEP_HALF_QUARTER = 2.5;
const STEP_THREE = 3;
const STEP_FOUR = 4;
const STEP_FIVE = 5;
const STEP_SIX = 6;
const STEP_EIGHT = 8;
const STEP_TEN = 10;
const NICE_STEPS = [
  1,
  2,
  STEP_HALF_QUARTER,
  STEP_THREE,
  STEP_FOUR,
  STEP_FIVE,
  STEP_SIX,
  STEP_EIGHT,
  STEP_TEN,
];
const PRECISION = 12;
const DECADE = 10;

export function niceMax(value: number): number {
  if (value <= 0) return 0;
  const magnitude = DECADE ** Math.floor(Math.log10(value));
  const candidates = NICE_STEPS.map((step) => Number((step * magnitude).toPrecision(PRECISION)));
  return candidates.find((candidate) => candidate > value) ?? DECADE * magnitude;
}

export function shareOf(value: number, max: number): number {
  return max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;
}

const PERCENT = 100;

export function percentChange(current: number, previous: number): number | null {
  return previous > 0 ? Math.round(((current - previous) / previous) * PERCENT) : null;
}
