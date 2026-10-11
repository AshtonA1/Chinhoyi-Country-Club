import type { CourseConfig, Hole } from '@/data/club';

export type TeeKey = 'men' | 'ladies';
export const TEE_LABEL: Record<TeeKey, string> = { men: "Men's tees", ladies: "Ladies' tees" };

type Split = { front: number; back: number; total: number };
type NullableSplit = { front: number | null; back: number | null; total: number | null };

export type TeeTotals = {
  par: Split;
  /** What the public card shows: the club's printed totals when set, otherwise the sum of the holes. */
  metres: Split;
  /** Straight sum of the 18 hole rows. */
  computed: Split;
  /** Totals printed on the club's card (null = not entered). */
  official: NullableSplit;
  /** official minus computed, 0 when there is no official figure. A non-zero gap means the card needs checking. */
  gap: Split;
};

export function sortHoles(holes: Hole[]): Hole[] {
  return [...holes].sort((a, b) => a.number - b.number);
}

export function frontNine(holes: Hole[]): Hole[] {
  return sortHoles(holes).filter((h) => h.number <= 9);
}

export function backNine(holes: Hole[]): Hole[] {
  return sortHoles(holes).filter((h) => h.number > 9);
}

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

export function teeTotals(holes: Hole[], course: CourseConfig, tee: TeeKey): TeeTotals {
  const front = frontNine(holes);
  const back = backNine(holes);
  const par: Split = {
    front: sum(front.map((h) => h[tee].par)),
    back: sum(back.map((h) => h[tee].par)),
    total: 0,
  };
  par.total = par.front + par.back;

  const computed: Split = {
    front: sum(front.map((h) => h[tee].metres)),
    back: sum(back.map((h) => h[tee].metres)),
    total: 0,
  };
  computed.total = computed.front + computed.back;

  const official: NullableSplit =
    tee === 'men'
      ? { front: course.menFrontOfficial, back: course.menBackOfficial, total: course.menTotalOfficial }
      : { front: course.ladiesFrontOfficial, back: course.ladiesBackOfficial, total: course.ladiesTotalOfficial };

  const frontShown = official.front ?? computed.front;
  const backShown = official.back ?? computed.back;
  const metres: Split = {
    front: frontShown,
    back: backShown,
    total: official.total ?? frontShown + backShown,
  };

  const gap: Split = {
    front: official.front === null ? 0 : official.front - computed.front,
    back: official.back === null ? 0 : official.back - computed.back,
    total: official.total === null ? 0 : official.total - computed.total,
  };

  return { par, metres, computed, official, gap };
}

/** Course rating / slope for a tee, or null while the club has not supplied them. */
export function teeRating(course: CourseConfig, tee: TeeKey): { rating: number; slope: number } | null {
  const rating = tee === 'men' ? course.menRating : course.ladiesRating;
  const slope = tee === 'men' ? course.menSlope : course.ladiesSlope;
  return rating !== null && slope !== null ? { rating, slope } : null;
}

/** Problems an admin should fix before the scorecard can be trusted. */
export function validateHoles(holes: Hole[]): string[] {
  const issues: string[] = [];
  if (holes.length !== 18) issues.push(`The course has ${holes.length} holes; expected 18.`);
  for (const tee of ['men', 'ladies'] as TeeKey[]) {
    const label = TEE_LABEL[tee];
    const strokes = holes.map((h) => h[tee].stroke).sort((a, b) => a - b);
    const expected = holes.map((_, i) => i + 1);
    if (strokes.some((s, i) => s !== expected[i])) {
      issues.push(`${label}: stroke index must use each number from 1 to ${holes.length} exactly once.`);
    }
    const par = sum(holes.map((h) => h[tee].par));
    if (holes.length === 18 && par !== 72) issues.push(`${label}: par adds up to ${par}, not 72.`);
    const bad = holes.filter((h) => !(h[tee].metres > 0)).map((h) => h.number);
    if (bad.length) issues.push(`${label}: metres missing on hole${bad.length > 1 ? 's' : ''} ${bad.join(', ')}.`);
  }
  return issues;
}
