import { Link } from 'wouter';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SectionLabel, usePageMeta } from '@/components/layout/Shared';

export default function NotFound() {
  usePageMeta('Page not found', 'The page you are looking for does not exist.');
  return (
    <div className="bg-club-white">
      <Header solid />
      <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-5 pb-20 pt-40 md:px-10">
        <SectionLabel>ERROR 404</SectionLabel>
        <h1 className="font-display mt-5 text-6xl leading-[.9] text-club-ink md:text-8xl">
          Off the<br /><em>fairway.</em>
        </h1>
        <p className="mt-6 max-w-md text-sm leading-7 text-club-ink/70">We could not find that page. It may have moved, or the link may be wrong.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="bg-club-green px-6 py-4 text-[10px] font-bold tracking-[.15em] text-club-white hover:bg-club-ink">BACK TO HOME</Link>
          <Link href="/course" className="border border-club-ink/25 px-6 py-4 text-[10px] font-bold tracking-[.15em] text-club-ink hover:border-club-green">THE COURSE</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
