import { Link } from 'wouter';
import { club } from '@/data/club';

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-3 ${light ? 'text-club-white' : 'text-club-ink'}`}
      data-testid="link-brand"
    >
      <img src={club.logo} alt={`${club.name} badge`} className="h-11 w-11 shrink-0 rounded-full object-cover" />
      <span className="leading-[.92]">
        <strong className="block text-[12px] tracking-[.26em]">{club.name.split(' ')[0].toUpperCase()}</strong>
        <small className="block pt-1 text-[9px] tracking-[.2em] opacity-70">
          {club.name.split(' ').slice(1).join(' ').toUpperCase()}{club.establishedYear ? ` · EST. ${club.establishedYear}` : ''}
        </small>
      </span>
    </Link>
  );
}
