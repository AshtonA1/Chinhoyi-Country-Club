import type { TeeKey } from '@/lib/scorecard';

export function TeeToggle({ value, onChange, light = false }: { value: TeeKey; onChange: (tee: TeeKey) => void; light?: boolean }) {
  const options: [TeeKey, string][] = [['men', "MEN'S TEES"], ['ladies', "LADIES' TEES"]];
  return (
    <div className="inline-flex" role="group" aria-label="Choose tees">
      {options.map(([key, label]) => {
        const active = value === key;
        const activeCls = light ? 'border-[#C8A951] bg-[#C8A951] text-[#17201C]' : 'border-[#2E6B4E] bg-[#2E6B4E] text-white';
        const idleCls = light ? 'border-white/25 text-white/70 hover:border-[#C8A951]' : 'border-[#12372A]/20 text-[#5d6b63] hover:border-[#2E6B4E]';
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
