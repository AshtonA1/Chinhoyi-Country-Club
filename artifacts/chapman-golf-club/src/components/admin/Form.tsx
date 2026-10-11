import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, Trash2 } from 'lucide-react';

const input = 'mt-2 w-full border border-club-ink/20 bg-white px-3 py-2.5 text-sm text-club-ink outline-none placeholder:text-club-ink/50 focus:border-club-green';
const labelCls = 'font-mono-club text-[9px] tracking-[.14em] text-club-ink/70';

export function TextField({
  label, value, onChange, type = 'text', placeholder, hint, step, min, max, required,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; hint?: string;
  step?: string; min?: string; max?: string; required?: boolean;
}) {
  return (
    <label className="block">
      <span className={labelCls}>{label.toUpperCase()}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} step={step} min={min} max={max} required={required} className={input} />
      {hint && <span className="mt-1 block text-[11px] text-club-ink/70">{hint}</span>}
    </label>
  );
}

/** A number input that tolerates an empty box while typing. Reports NaN-safe values. */
export function NumberField({
  label, value, onChange, hint, step = '1', min = '0', allowEmpty = false, placeholder,
}: {
  label: string; value: number | null; onChange: (v: number | null) => void; hint?: string; step?: string; min?: string; allowEmpty?: boolean; placeholder?: string;
}) {
  return (
    <TextField
      label={label}
      type="number"
      step={step}
      min={min}
      placeholder={placeholder}
      hint={hint}
      value={value === null ? '' : String(value)}
      onChange={(raw) => {
        if (raw.trim() === '') {
          if (allowEmpty) onChange(null);
          else onChange(0);
          return;
        }
        const n = Number(raw);
        if (Number.isFinite(n)) onChange(n);
      }}
    />
  );
}

export function AreaField({
  label, value, onChange, rows = 3, hint, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; rows?: number; hint?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className={labelCls}>{label.toUpperCase()}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} className={`${input} resize-y`} />
      {hint && <span className="mt-1 block text-[11px] text-club-ink/70">{hint}</span>}
    </label>
  );
}

export function SelectField({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="block">
      <span className={labelCls}>{label.toUpperCase()}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={input}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

export function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-club-ink">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-club-green" />
      {label}
    </label>
  );
}

type BtnProps = { children: ReactNode; onClick?: () => void; type?: 'button' | 'submit'; disabled?: boolean; testId?: string };

export function PrimaryButton({ children, onClick, type = 'button', disabled, testId }: BtnProps) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} data-testid={testId} className="inline-flex items-center justify-center gap-2 bg-club-green px-5 py-3 text-[10px] font-bold tracking-[.14em] text-club-white hover:bg-club-ink disabled:cursor-not-allowed disabled:opacity-40">
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, type = 'button', disabled, testId }: BtnProps) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} data-testid={testId} className="inline-flex items-center justify-center gap-2 border border-club-ink/20 px-4 py-3 text-[10px] font-bold tracking-[.14em] text-club-ink hover:border-club-green disabled:cursor-not-allowed disabled:opacity-40">
      {children}
    </button>
  );
}

/** Two-step delete: first click arms it, second click confirms. No browser dialogs. */
export function DeleteButton({ onConfirm, label = 'DELETE' }: { onConfirm: () => void; label?: string }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = window.setTimeout(() => setArmed(false), 4000);
    return () => window.clearTimeout(t);
  }, [armed]);
  return armed ? (
    <button type="button" onClick={() => { setArmed(false); onConfirm(); }} className="inline-flex items-center gap-2 bg-club-alert px-4 py-3 text-[10px] font-bold tracking-[.14em] text-white">
      <Trash2 size={13} /> CLICK AGAIN TO CONFIRM
    </button>
  ) : (
    <button type="button" onClick={() => setArmed(true)} className="inline-flex items-center gap-2 border border-club-alert/40 px-4 py-3 text-[10px] font-bold tracking-[.14em] text-club-alert hover:bg-club-alert/5">
      <Trash2 size={13} /> {label}
    </button>
  );
}

/** Brief "Saved" / "could not save" feedback. */
export function useSaveNotice() {
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const flash = useCallback((ok: boolean, text?: string) => {
    setNotice({ ok, text: text ?? (ok ? 'Saved in this browser.' : 'Could not save: browser storage is full or blocked.') });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setNotice(null), 4000);
  }, []);
  return { notice, flash };
}

export function SaveNotice({ notice }: { notice: { ok: boolean; text: string } | null }) {
  if (!notice) return null;
  return (
    <p role="status" className={`flex items-center gap-2 text-xs ${notice.ok ? 'text-club-green' : 'text-club-alert'}`}>
      {notice.ok && <Check size={14} />}{notice.text}
    </p>
  );
}

export function StorageNote() {
  return (
    <p className="mt-6 border-l-2 border-club-gold bg-club-gold/15 px-4 py-3 text-xs leading-5 text-club-ink">
      Demo storage: changes are saved in this browser only, so other devices will not see them until the club's online database is connected.
    </p>
  );
}

export function Panel({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="border border-club-ink/10 bg-club-white p-5 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-2xl text-club-ink">{title}</h3>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
