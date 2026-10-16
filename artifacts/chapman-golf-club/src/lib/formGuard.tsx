import { useRef, type ReactNode } from 'react';

/**
 * Light protection for public forms against bots, with nothing for real people to do.
 *  - A hidden "website" box that people never see and never fill in. Bots fill every box.
 *  - A minimum time on the page: a person needs a few seconds to fill a form, a script does not.
 * This stops the cheap, common spam. It is not a replacement for a CAPTCHA if the club is ever targeted.
 */
export type GuardVerdict = 'ok' | 'too-fast' | 'bot';

const DEFAULT_MIN_MS = 2500;

/** Tests may set globalThis.__CCC_FORM_GUARD_MS to 0 so forms can be submitted instantly. */
function minMs(): number {
  const v = (globalThis as { __CCC_FORM_GUARD_MS?: number }).__CCC_FORM_GUARD_MS;
  return typeof v === 'number' ? v : DEFAULT_MIN_MS;
}

export function useFormGuard(): { field: ReactNode; verdict: () => GuardVerdict } {
  const born = useRef(Date.now());
  const trap = useRef<HTMLInputElement>(null);
  const field = (
    <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
      <label>Leave this empty<input ref={trap} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" /></label>
    </div>
  );
  const verdict = (): GuardVerdict => {
    if ((trap.current?.value ?? '') !== '') return 'bot';
    if (Date.now() - born.current < minMs()) return 'too-fast';
    return 'ok';
  };
  return { field, verdict };
}

/** The message to show when the guard stops a submit. */
export const GUARD_MESSAGE = 'That was very quick. Please check your details and press submit again.';
