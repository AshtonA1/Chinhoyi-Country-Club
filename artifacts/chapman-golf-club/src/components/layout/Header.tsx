import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X } from 'lucide-react';
import { Brand } from './Brand';
import { navItems } from '@/data/club';

export function Header({ solid = false }: { solid?: boolean }) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const isSolid = solid || location === '/tee-times';
  return (
    <header className={`absolute left-0 right-0 top-0 z-40 ${isSolid ? 'bg-[#F7F5EF] text-[#12372A]' : 'text-[#F7F5EF]'}`}>
      <div className="mx-auto flex max-w-[1480px] items-center justify-between px-5 py-5 lg:px-10 lg:py-7">
        <Brand light={!isSolid} />
        <nav className="hidden items-center gap-5 xl:flex" aria-label="Main navigation">
          {navItems.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className={`text-[11px] font-medium tracking-[.1em] transition-colors hover:text-[#C8A951] ${location === href ? 'text-[#C8A951]' : isSolid ? 'text-[#12372A]/70' : 'text-white/80'}`}
              data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/tee-times"
            className="hidden border border-[#C8A951] bg-[#C8A951] px-4 py-3 text-[10px] font-bold tracking-[.14em] text-[#17201C] transition-colors hover:bg-[#f0db87] sm:block"
            data-testid="link-header-book"
          >
            BOOK A TEE TIME
          </Link>
          <Link
            href="/member/login"
            className={`hidden border px-4 py-3 text-[10px] font-bold tracking-[.14em] transition-colors hover:border-[#C8A951] hover:text-[#C8A951] lg:block ${isSolid ? 'border-[#12372A]/30' : 'border-white/35'}`}
            data-testid="link-header-login"
          >
            MEMBER LOGIN
          </Link>
          <button
            className={`grid h-11 w-11 place-items-center border xl:hidden ${isSolid ? 'border-[#12372A]/25' : 'border-white/30'}`}
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            data-testid="button-menu-toggle"
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-white/15 bg-[#12372A] px-5 py-5 xl:hidden">
          <div className="grid gap-1">
            {navItems.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="border-b border-white/10 py-3 text-sm tracking-[.08em]"
                data-testid={`link-mobile-${label.toLowerCase().replaceAll(' ', '-')}`}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/tee-times"
              onClick={() => setOpen(false)}
              className="mt-4 bg-[#C8A951] px-4 py-3 text-center text-[11px] font-bold tracking-[.14em] text-[#17201C]"
              data-testid="link-mobile-book"
            >
              BOOK A TEE TIME
            </Link>
            <Link
              href="/member/login"
              onClick={() => setOpen(false)}
              className="py-3 text-center text-[11px] tracking-[.14em]"
              data-testid="link-mobile-login"
            >
              MEMBER LOGIN
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
