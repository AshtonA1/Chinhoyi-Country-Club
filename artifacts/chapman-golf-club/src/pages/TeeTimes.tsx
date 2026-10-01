import { club } from '@/data/club';
import { Header } from '@/components/layout/Header';
import { SectionLabel, usePageMeta } from '@/components/layout/Shared';
import { BookingWizard } from '@/components/booking/BookingWizard';

export default function TeeTimes() {
  usePageMeta('Book a Tee Time', `Reserve your round at ${club.name} in a few quick steps.`);
  return (
    <div className="min-h-dvh bg-[#e8e9df]">
      <Header />
      <main className="mx-auto max-w-5xl px-5 pb-20 pt-32 md:px-10 md:pt-44">
        <div className="max-w-2xl">
          <SectionLabel>TEE TIME RESERVATIONS</SectionLabel>
          <h1 className="font-display mt-5 text-6xl leading-[.88] text-[#12372A] md:text-8xl">
            Get out<br /><em>there.</em>
          </h1>
          <p className="mt-7 max-w-lg text-base leading-7 text-[#5d6b63]">
            Choose a date, find your rhythm, and you're on your way. Members and guests welcome.
          </p>
        </div>
        <BookingWizard />
      </main>
    </div>
  );
}
