import type { TeeKey } from '@/lib/scorecard';

export function TeeToggle({ value, onChange, light = false }: { value: TeeKey; onChange: (tee: TeeKey) => void; light?: boolean }) {
  const options: [TeeKey, string][] = [['men', "MEN'S TEES"], ['ladies', "LADIES' TEES"]];
  return (
    <div className="inline-flex" role="group" aria-label="Choose tees">
      {options.map(([key, label]) => {
        const active = value === key;
        const activeCls = light ? 'border-club-gold bg-club-gold text-club-ink' : 'border-club-green bg-club-green text-white';
        const idleCls = light ? 'border-white/25 text-white/70 hover:border-club-gold' : 'border-club-ink/20 text-club-ink/70 hover:border-club-green';
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            aria-pressed={active}
            className={`border px-4 py-2 text-[10px] font-bold tracking-[.12em] transition-colors ${active ? activeCls : idleCls}`}
            data-testid={`button-tee-${key}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
