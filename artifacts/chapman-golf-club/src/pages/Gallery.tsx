import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SectionLabel, usePageMeta } from '@/components/layout/Shared';
import { StorySubmissionForm } from '@/components/club-stories/StorySubmissionForm';
import { type ClubStory, type GalleryCategory, galleryItems } from '@/data/club';
import { useLocalCollection } from '@/lib/local-store';

const CATEGORIES: (GalleryCategory | 'All')[] = ['All', 'Course', 'Clubhouse', 'Events', 'Members', 'Golf'];

export default function Gallery() {
  usePageMeta('Gallery', 'The course in the changing light. The people around the table.');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('All');
  const [selected, setSelected] = useState<number | null>(null);
  const [showStoryForm, setShowStoryForm] = useState(false);
  const { items: stories } = useLocalCollection<ClubStory>('chapman:club-stories');
  const approvedStories = stories.filter((s) => s.status === 'approved');

  const filtered = category === 'All' ? galleryItems : galleryItems.filter((g) => g.category === category);

  return (
    <div className="bg-club-green text-club-white">
      <Header />
      <main className="mx-auto max-w-[1480px] px-5 pb-24 pt-36 md:px-10 md:pt-48">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <SectionLabel light>THE ARCHIVE</SectionLabel>
            <h1 className="font-display mt-5 text-6xl leading-[.88] md:text-8xl">
              A sense<br /><em>of place.</em>
            </h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-white/65">
              The course in the changing light. The people around the table. A few frames from a very good day.
            </p>
          </div>
          <button
            onClick={() => setShowStoryForm(true)}
            className="flex items-center gap-2 self-start border border-club-gold px-5 py-3 text-[10px] font-bold tracking-[.14em] text-club-gold hover:bg-club-gold/10"
            data-testid="button-open-story-form"
          >
            <Plus size={14} /> SHARE YOUR ROUND
          </button>
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`border px-4 py-2 text-[10px] font-bold tracking-[.12em] transition-colors ${category === c ? 'border-club-gold bg-club-gold text-club-ink' : 'border-white/25 text-white/70 hover:border-club-gold'}`}
              data-testid={`button-gallery-filter-${c.toLowerCase()}`}
            >
              {c.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {filtered.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setSelected(i)}
              className="group relative mb-4 block w-full overflow-hidden text-left"
              data-testid={`button-gallery-${i}`}
            >
              <img src={item.src} alt={item.label} className="image-zoom block w-full" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-club-ink/80 p-4 pt-10 text-left font-mono-club text-[9px] tracking-[.1em] text-white/85 opacity-0 transition-opacity group-hover:opacity-100">
                {item.label.toUpperCase()}
              </span>
            </button>
          ))}
        </div>

        {approvedStories.length > 0 && (
          <div className="mt-20 border-t border-white/15 pt-14">
            <SectionLabel light>CLUB STORIES</SectionLabel>
            <h2 className="font-display mt-4 text-4xl md:text-5xl">Shared by our members.</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {approvedStories.map((story) => (
                <div key={story.id} className="border border-white/15 p-5">
                  {story.photoDataUrl && <img src={story.photoDataUrl} alt="" className="mb-4 h-40 w-full object-cover" />}
                  <p className="font-mono-club text-[9px] tracking-[.14em] text-club-gold">SCORE {story.score}</p>
                  <p className="mt-3 text-sm leading-6 text-white/75">{story.description}</p>
                  <p className="mt-4 font-mono-club text-[9px] tracking-[.12em] text-white/40">— {story.memberName.toUpperCase()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {selected !== null && filtered.length > 0 && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-club-ink/95 p-5" role="dialog" aria-label="Gallery preview">
          <button onClick={() => setSelected(null)} className="absolute right-5 top-5 grid h-11 w-11 place-items-center border border-white/25 text-white" data-testid="button-gallery-close">
            <X size={19} />
          </button>
          <button onClick={() => setSelected((selected + filtered.length - 1) % filtered.length)} className="absolute left-3 top-1/2 grid h-11 w-11 place-items-center border border-white/25 text-white md:left-8" data-testid="button-gallery-previous">
            <ChevronLeft size={20} />
          </button>
          <img src={filtered[selected].src} alt={filtered[selected].label} className="max-h-[78vh] max-w-full object-contain" />
          <button onClick={() => setSelected((selected + 1) % filtered.length)} className="absolute right-3 top-1/2 grid h-11 w-11 place-items-center border border-white/25 text-white md:right-8" data-testid="button-gallery-next">
            <ChevronRight size={20} />
          </button>
          <p className="absolute bottom-7 left-0 right-0 text-center font-mono-club text-[10px] tracking-[.16em] text-white/70">
            {filtered[selected].label.toUpperCase()}
          </p>
        </div>
      )}

      {showStoryForm && <StorySubmissionForm onClose={() => setShowStoryForm(false)} />}
      <Footer />
    </div>
  );
}
