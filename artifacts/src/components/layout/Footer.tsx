import { Link } from 'wouter';
import { Instagram, MessageCircle } from 'lucide-react';
import { Brand } from './Brand';
import { club, navItems, whatsappLink } from '@/data/club';

export function Footer() {
  return (
    <footer className="bg-[#12372A] text-[#F7F5EF]">
      <div className="mx-auto grid max-w-[1480px] gap-12 px-5 py-16 md:grid-cols-12 md:px-10 md:py-20">
        <div className="md:col-span-5">
          <Brand light />
          <p className="mt-8 max-w-sm text-sm leading-7 text-white/60">
            A considered place for golf, conversation and the good fortune of being outdoors. Borrowed from
            Zimbabwe, built for the long view.
          </p>
          <div className="mt-8 flex gap-3">
            <a
              href={club.social.instagram}
              className="grid h-9 w-9 place-items-center border border-white/20 transition-colors hover:border-[#C8A951] hover:text-[#C8A951]"
              aria-label="Instagram"
              data-testid="link-footer-instagram"
            >
              <Instagram size={15} />
            </a>
            <a
              href={club.social.facebook}
              className="grid h-9 w-9 place-items-center border border-white/20 text-xs font-bold transition-colors hover:border-[#C8A951] hover:text-[#C8A951]"
              aria-label="Facebook"
              data-testid="link-footer-facebook"
            >
              f
            </a>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noreferrer"
              className="grid h-9 w-9 place-items-center border border-white/20 transition-colors hover:border-[#C8A951] hover:text-[#C8A951]"
              aria-label="WhatsApp"
              data-testid="link-footer-whatsapp"
            >
              <MessageCircle size={15} />
            </a>
          </div>
        </div>
        <div className="md:col-span-2">
          <p className="font-mono-club text-[9px] tracking-[.18em] text-[#C8A951]">EXPLORE</p>
          <div className="mt-5 grid gap-3 text-sm text-white/70">
            {navItems.slice(0, 5).map(([l, h]) => (
              <Link key={h} href={h} className="transition-colors hover:text-white" data-testid={`link-footer-${l.toLowerCase().replaceAll(' ', '-')}`}>
                {l}
              </Link>
            ))}
          </div>
        </div>
        <div className="md:col-span-2">
          <p className="font-mono-club text-[9px] tracking-[.18em] text-[#C8A951]">THE CLUB</p>
          <div className="mt-5 grid gap-3 text-sm text-white/70">
            <Link href="/facilities" data-testid="link-footer-facilities">Facilities</Link>
            <Link href="/gallery" data-testid="link-footer-gallery">Gallery</Link>
            <Link href="/golf-info" data-testid="link-footer-golf-info">Golf Info</Link>
            <Link href="/membership" data-testid="link-footer-membership">Membership</Link>
            <Link href="/member/login" data-testid="link-footer-login">Member Login</Link>
          </div>
        </div>
        <div className="md:col-span-3">
          <p className="font-mono-club text-[9px] tracking-[.18em] text-[#C8A951]">FIND US</p>
          <p className="mt-5 text-sm leading-7 text-white/70">{club.address}</p>
          <p className="mt-4 text-sm text-white/70">
            {club.phone}
            <br />
            {club.email}
          </p>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-[#C8A951] hover:text-[#e3c86b]"
            data-testid="link-footer-whatsapp-text"
          >
            <MessageCircle size={14} /> Chat on WhatsApp
          </a>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 md:px-10">
        <div className="mx-auto flex max-w-[1480px] flex-col justify-between gap-2 text-[10px] tracking-[.12em] text-white/40 sm:flex-row">
          <span>© {new Date().getFullYear()} {club.legalFooterName}</span>
          <span>A GREYCODE TECHNOLOGIES REFERENCE EXPERIENCE</span>
        </div>
      </div>
    </footer>
  );
}
