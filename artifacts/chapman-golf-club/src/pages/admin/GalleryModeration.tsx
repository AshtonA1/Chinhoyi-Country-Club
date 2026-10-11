import { Check, Plus, X } from 'lucide-react';
import { AdminShell, PortalHeading, PortalStat } from './AdminShell';
import { SectionLabel } from '@/components/layout/Shared';
import { type ClubStory, galleryItems } from '@/data/club';
import { useLocalCollection } from '@/lib/local-store';
import { useCan } from '@/lib/permissions';

export default function AdminGallery() {
  const { items: stories, update } = useLocalCollection<ClubStory>('chapman:club-stories');
  const pending = stories.filter((s) => s.status === 'pending');
  const canPublish = useCan('gallery', 'publish');

  return (
    <AdminShell>
      <PortalHeading
        eyebrow="ADMIN PORTAL / GALLERY & STORIES"
        title="Set the visual tone."
        copy="Curate published photography and moderate member-submitted Club Stories before they go live."
        action={<button disabled title="Not available in the demo" className="inline-flex items-center gap-2 bg-club-ink px-5 py-4 text-[10px] font-bold tracking-[.14em] text-club-white disabled:opacity-40"><Plus size={14} /> UPLOAD IMAGE</button>}
      />
      <div className="mt-8 grid gap-3 md:grid-cols-3">
        <PortalStat label="PUBLISHED IMAGES" value={String(galleryItems.length)} note="Live on the public gallery" />
        <PortalStat label="CLUB STORIES PENDING" value={String(pending.length)} note="Awaiting review" dark={pending.length > 0} />
        <PortalStat label="APPROVED STORIES" value={String(stories.filter((s) => s.status === 'approved').length)} />
      </div>

      <section className="mt-10">
        <SectionLabel>CLUB STORIES — PENDING APPROVAL</SectionLabel>
        {!canPublish && (
          <p className="mt-3 text-xs text-club-gold-deep">Your role has read-only access to this queue. Approving requires publish permission.</p>
        )}
        {pending.length === 0 ? (
          <p className="mt-4 border border-dashed border-club-ink/15 bg-club-white p-6 text-sm text-club-ink/70">
            No pending submissions. Member-submitted stories from the public Gallery page will appear here for review.
          </p>
        ) : (
          <div className="mt-4 grid gap-3">
            {pending.map((story) => (
              <article key={story.id} className="grid gap-4 border border-club-ink/10 bg-club-white p-5 md:grid-cols-12 md:items-center">
                {story.photoDataUrl ? (
                  <img src={story.photoDataUrl} alt="" className="h-24 w-full object-cover md:col-span-2" />
                ) : (
                  <div className="hidden h-24 items-center justify-center bg-club-gold/10 text-[10px] text-club-ink/50 md:col-span-2 md:flex">NO PHOTO</div>
                )}
                <div className="md:col-span-6">
                  <p className="font-mono-club text-[9px] tracking-[.14em] text-club-green">SCORE {story.score} · {new Date(story.submittedAt).toLocaleDateString()}</p>
                  <h3 className="mt-1 font-display text-2xl text-club-ink">{story.memberName}</h3>
                  <p className="mt-1 text-sm text-club-ink/70">{story.description}</p>
                </div>
                <div className="flex gap-2 md:col-span-4 md:justify-end">
                  <button
                    disabled={!canPublish}
                    onClick={() => update(story.id, { status: 'approved' })}
                    className="flex items-center gap-2 bg-club-green px-4 py-3 text-[10px] font-bold tracking-[.12em] text-white disabled:cursor-not-allowed disabled:opacity-40"
                    data-testid={`button-approve-story-${story.id}`}
                  >
                    <Check size={14} /> APPROVE
                  </button>
                  <button
                    disabled={!canPublish}
                    onClick={() => update(story.id, { status: 'rejected' })}
                    className="flex items-center gap-2 border border-club-ink/20 px-4 py-3 text-[10px] font-bold tracking-[.12em] text-club-ink/70 disabled:cursor-not-allowed disabled:opacity-40"
                    data-testid={`button-reject-story-${story.id}`}
                  >
                    <X size={14} /> REJECT
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <SectionLabel>PUBLISHED GALLERY</SectionLabel>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {galleryItems.map((item) => (
            <div key={item.id} className="group relative overflow-hidden">
              <img src={item.src} alt={item.label} className="h-32 w-full object-cover" />
              <span className="absolute inset-x-0 bottom-0 bg-club-ink/70 px-2 py-1 text-[9px] text-white">{item.category}</span>
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
