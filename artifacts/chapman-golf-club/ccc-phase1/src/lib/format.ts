/** Formats an amount of money: whole numbers show no decimals ($175), others show cents ($7.50). */
export function formatMoney(amount: number, symbol = '$'): string {
  if (!Number.isFinite(amount)) return `${symbol}0`;
  const rounded = Math.round(amount * 100) / 100;
  return Number.isInteger(rounded) ? `${symbol}${rounded}` : `${symbol}${rounded.toFixed(2)}`;
}

/** Thousands separator for distances: 6500 -> "6,500". */
export function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}

/** Turns "a, b ,c" into ['a','b','c'] (ignores blanks). */
export function splitList(value: string, separator: RegExp = /\n|,/): string[] {
  return value.split(separator).map((s) => s.trim()).filter(Boolean);
}

/** A short, collision-resistant id with a readable prefix. */
export function makeId(prefix: string): string {
  const rand = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${rand}`;
}
