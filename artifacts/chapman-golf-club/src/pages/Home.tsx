import { Link } from 'wouter';
import { ArrowDownRight, ArrowUpRight, Compass } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ButtonLink, LocationBand, SectionLabel, StatStrip, usePageMeta } from '@/components/layout/Shared';
import { FacilityIcon } from '@/components/FacilityIcon';
import { club, images } from '@/data/club';
import { dateParts } from '@/lib/dates';
import { upcomingEvents, useCourseStats, useEvents, useFacilities, useHoles } from '@/lib/club-data';
import { formatNumber } from '@/lib/format';
import { teeTotals } from '@/lib/scorecard';
import { useCourseConfig } from '@/lib/club-data';

function EventRow({ id, day, month, title, meta }: { id: string; day: string; month: string; title: string; meta: string }) {
  return (
    <Link href={`/events/${id}`} className="flex items-center gap-5 border-b border-club-ink/20 py-5">
      <div className="w-12 shrink-0 text-center">
        <span className="block font-display text-3xl leading-none">{day}</span>
        <span className="font-mono-club text-[9px]">{month}</span>
      </div>
      <div>
        <h3 className="font-display text-2xl">{title}</h3>
        <p className="mt-1 text-xs text-club-ink/70">{meta}</p>
      </div>
      <ArrowUpRight size={16} className="ml-auto" />
    </Link>
  );
}

export default function Home() {
  usePageMeta('Golf, sport and good company', `${club.name} in ${club.city}, ${club.country}: an 18-hole golf course and a full country club.`);
  const { items: holes } = useHoles();
  const { items: allEvents } = useEvents();
  const { items: allFacilities } = useFacilities();
  const { value: course } = useCourseConfig();
  const stats = useCourseStats();
  const upcoming = upcomingEvents(allEvents).slice(0, 3);
  const facilities = allFacilities.filter((f) => f.active);
  const hole1 = holes.find((h) => h.number === 1);
  const menTotals = teeTotals(holes, course, 'men');
  return (
    <div className="bg-club-white">
      <section className="relative min-h-[760px] overflow-hidden bg-club-green text-club-white md:min-h-[850px]">
        <Header />
        <img src={images.hero} alt="Aerial view of the fairway" className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-club-green via-club-green/20 to-club-green/40" />
        <div className="relative mx-auto flex min-h-[760px] max-w-[1480px] items-end px-5 pb-20 md:min-h-[850px] md:px-10 md:pb-28">
          <div className="max-w-4xl reveal">
            <SectionLabel light>{club.city.toUpperCase()} · {club.country.toUpperCase()}</SectionLabel>
            <h1 className="font-display mt-5 max-w-4xl text-[clamp(4.5rem,13vw,11.5rem)] leading-[.78] tracking-[-.035em]">
              Play the<br /><em>long view.</em>
            </h1>
            <p className="mt-9 max-w-lg text-base leading-7 text-white/75 md:text-lg">
              Eighteen holes of golf, plus the pool, gym, courts, restaurant and bar. A country club for the whole family.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/tee-times">BOOK A TEE TIME</ButtonLink>
              <ButtonLink href="/course" dark className="border border-white/30 bg-transparent hover:bg-white/10">EXPLORE THE COURSE</ButtonLink>
            </div>
          </div>
          <div className="absolute bottom-8 right-5 hidden items-center gap-3 text-[10px] tracking-[.16em] text-white/60 md:flex">
            <ArrowDownRight size={15} className="text-club-white" /> SCROLL TO DISCOVER
          </div>
        </div>
      </section>
      <main>
        <section className="mx-auto max-w-[1480px] px-5 py-20 md:px-10 md:py-32">
          <div className="grid gap-12 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <SectionLabel>THE CLUB, IN BRIEF</SectionLabel>
              <h2 className="font-display mt-5 max-w-3xl text-5xl leading-[.95] text-club-ink md:text-7xl">
                A little further<br /><em>from ordinary.</em>
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-club-ink/70 md:col-span-4 md:col-start-9">
              {club.name} is more than a golf course. Golf is the heart of the club, and members also have the pool, gym, squash, bowling, soccer, tennis, restaurant, bar and clubhouse on the same grounds.
            </p>
          </div>
          <div className="mt-16">
            <StatStrip items={[[String(stats.holes), 'Holes'], [String(stats.par), 'Par'], [formatNumber(stats.metres), 'Metres']]} />
          </div>
        </section>
        <section className="on-gold py-20 md:py-28">
          <div className="mx-auto max-w-[1480px] px-5 md:px-10">
            <div className="grid gap-10 md:grid-cols-12 md:items-center">
              <div className="md:col-span-5">
                <SectionLabel>THE DAY AHEAD</SectionLabel>
                <h2 className="font-display mt-5 text-5xl leading-[.92] text-club-ink md:text-7xl">
                  Your best<br /><em>hours.</em>
                </h2>
                <p className="mt-7 max-w-md text-sm leading-7 text-club-ink/70">
                  From an early tee time to a meal in the clubhouse, there is always something to do.
                </p>
                <ButtonLink href="/about" dark className="mt-8">ABOUT THE CLUB</ButtonLink>
              </div>
              <div className="group relative min-h-[430px] overflow-hidden md:col-span-7">
                <img src={images.clubhouse} alt="The clubhouse" className="image-zoom absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-club-ink/65 to-transparent" />
                <div className="absolute bottom-6 left-6 text-club-white">
                  <p className="font-mono-club text-[9px] tracking-[.18em] text-club-gold">THE CLUBHOUSE</p>
                  <p className="mt-2 font-display text-3xl">Where the round continues.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-[1480px] px-5 py-20 md:px-10 md:py-32">
          <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
            <div>
              <SectionLabel>THE COURSE</SectionLabel>
              <h2 className="font-display mt-5 text-5xl leading-[.95] text-club-ink md:text-7xl">
                Eighteen holes,<br /><em>par seventy-two.</em>
              </h2>
            </div>
            <Link href="/course" className="group flex items-center gap-3 text-[10px] font-bold tracking-[.16em] text-club-green" data-testid="link-home-course">
              VIEW ALL HOLES <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <Link href="/course/hole/1" className="group relative min-h-[410px] overflow-hidden md:col-span-2" data-testid="link-home-hole-1">
              <img src={images.fairway} alt="Course fairway" className="image-zoom absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-club-ink/80 via-transparent to-transparent" />
              {hole1 && (
                <div className="absolute bottom-6 left-6 text-club-white">
                  <span className="font-mono-club text-[10px] text-club-gold">01 / PAR {hole1.men.par} / {hole1.men.metres} M</span>
                  <h3 className="font-display mt-2 text-4xl">{hole1.name || 'Hole 1'}</h3>
                </div>
              )}
            </Link>
            <div className="flex flex-col justify-between bg-club-green p-7 text-club-white md:p-9">
              <Compass className="text-club-white" size={26} strokeWidth={1.2} />
              <div>
                <p className="font-mono-club text-[9px] tracking-[.18em] text-club-white/80">THE SCORECARD</p>
                <p className="mt-4 font-display text-3xl leading-tight">Par {menTotals.par.total}, {formatNumber(menTotals.metres.total)} metres from the men’s tees.</p>
                <p className="mt-6 text-xs leading-6 text-white/80">Full hole-by-hole card for men’s and ladies’ tees.</p>
              </div>
              <Link href="/golf-info" className="mt-10 flex items-center gap-2 text-[10px] font-bold tracking-[.14em] text-club-white" data-testid="link-course-note">
                VIEW THE SCORECARD <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </section>
        <section className="on-gold py-20 md:py-28">
          <div className="mx-auto max-w-[1480px] px-5 md:px-10">
            <div className="grid gap-12 md:grid-cols-12">
              <div className="md:col-span-5">
                <SectionLabel>WHAT'S ON</SectionLabel>
                <h2 className="font-display mt-5 text-5xl leading-[.92] text-club-ink md:text-7xl">
                  On the<br /><em>calendar.</em>
                </h2>
                <ButtonLink href="/events" dark className="mt-8">SEE ALL EVENTS</ButtonLink>
              </div>
              <div className="md:col-span-6 md:col-start-7">
                <div className="border-t border-club-ink/20">
                  {upcoming.map((e) => {
                    const p = dateParts(e.date);
                    return (
                      <EventRow
                        key={e.id}
                        id={e.id}
                        day={p.day}
                        month={p.month}
                        title={e.title}
                        meta={`${e.type}${e.time ? ` · ${e.time}` : ''}`}
                      />
                    );
                  })}
                  {upcoming.length === 0 && <p className="py-6 text-sm text-club-ink/70">No upcoming events are listed right now. Check back soon.</p>}
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="mx-auto grid max-w-[1480px] gap-12 px-5 py-20 md:grid-cols-12 md:items-center md:px-10 md:py-32">
          <div className="order-2 md:order-1 md:col-span-6">
            <div className="group relative h-[420px] overflow-hidden md:h-[580px]">
              <img src={images.dining} alt="Dining at the club" className="image-zoom h-full w-full object-cover" />
              <div className="absolute bottom-5 left-5 flex items-center gap-3 bg-club-white/90 px-4 py-3 text-club-ink">
                <span className="font-mono-club text-[9px] tracking-[.1em]">THE RESTAURANT</span>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2 md:col-span-5 md:col-start-8">
            <SectionLabel>MORE THAN GOLF</SectionLabel>
            <h2 className="font-display mt-5 text-5xl leading-[.92] text-club-ink md:text-7xl">
              More than<br /><em>a round.</em>
            </h2>
            <p className="mt-7 text-sm leading-7 text-club-ink/70">
              A place for the whole day. Membership includes the use of the club’s other facilities, so the family can swim, train, play and eat all in one place.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-y-4 text-xs text-club-green">
              {facilities.map((f) => (
                <span key={f.id} className="flex items-center gap-2 uppercase"><FacilityIcon icon={f.icon} size={15} /> {f.title}</span>
              ))}
            </div>
            <ButtonLink href="/facilities" dark className="mt-9">DISCOVER FACILITIES</ButtonLink>
          </div>
        </section>
        <section className="on-gold relative overflow-hidden py-20 md:py-28">
          <div className="mx-auto grid max-w-[1480px] gap-10 px-5 md:grid-cols-12 md:px-10">
            <div className="md:col-span-5">
              <SectionLabel>MEMBERSHIP</SectionLabel>
              <h2 className="font-display mt-5 text-5xl leading-[.92] text-club-ink md:text-7xl">
                One membership,<br /><em>the whole club.</em>
              </h2>
            </div>
            <div className="md:col-span-5 md:col-start-8">
              <p className="text-lg leading-8 text-club-ink">
                Members have access to the golf course and the club’s other facilities. See the joining and membership fees, and what a round costs for members and visitors.
              </p>
              <ButtonLink href="/membership" dark className="mt-9">MEMBERSHIP & FEES</ButtonLink>
            </div>
          </div>
        </section>
        <LocationBand />
      </main>
      <Footer />
    </div>
  );
}
