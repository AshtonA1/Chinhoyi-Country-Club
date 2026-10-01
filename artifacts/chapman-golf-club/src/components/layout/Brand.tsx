import { Link } from 'wouter';
import { club } from '@/data/club';

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-3 ${light ? 'text-[#F7F5EF]' : 'text-[#12372A]'}`}
      data-testid="link-brand"
    >
      <span className="grid h-10 w-10 place-items-center border border-current/40 text-[11px] font-bold tracking-[.18em]">
        {club.shortCode}
      </span>
      <span className="leading-[.92]">
        <strong className="block text-[12px] tracking-[.26em]">{club.name.split(' ')[0].toUpperCase()}</strong>
        <small className="block pt-1 text-[9px] tracking-[.2em] opacity-70">
          {club.name.split(' ').slice(1).join(' ').toUpperCase()} · EST. {club.establishedYear}
        </small>
      </span>
    </Link>
  );
}
