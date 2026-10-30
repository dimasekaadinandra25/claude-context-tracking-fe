const NICE_STEPS = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
const PRECISION = 12;
const DECADE = 10;

export function niceMax(value: number): number {
  if (value <= 0) return 0;
  const magnitude = DECADE ** Math.floor(Math.log10(value));
  const candidates = NICE_STEPS.map((step) => Number((step * magnitude).toPrecision(PRECISION)));
  return candidates.find((candidate) => candidate >= value) ?? value;
}

export function shareOf(value: number, max: number): number {
  return max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;
}
