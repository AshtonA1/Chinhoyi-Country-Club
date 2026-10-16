import { useState } from 'react';
import { CircleCheck, ImagePlus, X } from 'lucide-react';
import type { ClubStory } from '@/data/club';
import { GUARD_MESSAGE, useFormGuard } from '@/lib/formGuard';
import { resizeImage } from '@/lib/image';
import { useLocalCollection } from '@/lib/local-store';

export function StorySubmissionForm({ onClose }: { onClose: () => void }) {
  const { add } = useLocalCollection<ClubStory>('chapman:club-stories');
  const guard = useFormGuard();
  const [memberName, setMemberName] = useState('');
  const [score, setScore] = useState('');
  const [description, setDescription] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>(undefined);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPhotoDataUrl(await resizeImage(file));
      setError('');
    } catch {
      setPhotoDataUrl(undefined);
      setError('That photo could not be used. Try a different image.');
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (guard.verdict() !== 'ok') { setError(GUARD_MESSAGE); return; }
    const saved = add({
      id: crypto.randomUUID(),
      memberName,
      score,
      description,
      photoDataUrl,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    });
    if (!saved) {
      setError('Your browser could not store the story (storage is full or blocked). Try again without a photo.');
      return;
    }
    setSubmitted(true);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-club-ink/70 p-5" role="dialog" aria-label="Submit a club story">
      <div className="relative w-full max-w-lg bg-club-white p-7 md:p-9">
        <button onClick={onClose} className="absolute right-5 top-5 text-club-ink" aria-label="Close" data-testid="button-close-story-form">
          <X size={20} />
        </button>
        {submitted ? (
          <div>
            <CircleCheck className="text-club-green" size={34} />
            <h3 className="font-display mt-5 text-3xl text-club-ink">Thanks for sharing.</h3>
            <p className="mt-3 text-sm leading-7 text-club-ink/70">
              Your story is marked <strong>Pending</strong> and will appear in the gallery once an administrator approves it.
            </p>
            <button onClick={onClose} className="mt-6 bg-club-ink px-5 py-3 text-[10px] font-bold tracking-[.14em] text-club-white" data-testid="button-close-story-confirmation">
              DONE
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-5">
            {guard.field}
            <div>
              <h3 className="font-display text-3xl text-club-ink">Share your round.</h3>
              <p className="mt-2 text-sm text-club-ink/70">Submissions are reviewed by our team before appearing publicly.</p>
            </div>
            <div>
              <label htmlFor="story-name" className="font-mono-club text-[9px] tracking-[.15em] text-club-ink/70">YOUR NAME</label>
              <input id="story-name" required value={memberName} onChange={(e) => setMemberName(e.target.value)} className="mt-2 w-full border border-club-ink/20 bg-transparent px-4 py-3 text-sm text-club-ink outline-none focus:border-club-green" data-testid="input-story-name" />
            </div>
            <div>
              <label htmlFor="story-score" className="font-mono-club text-[9px] tracking-[.15em] text-club-ink/70">YOUR SCORE</label>
              <input id="story-score" required placeholder="e.g. 84" value={score} onChange={(e) => setScore(e.target.value)} className="mt-2 w-full border border-club-ink/20 bg-transparent px-4 py-3 text-sm text-club-ink outline-none focus:border-club-green" data-testid="input-story-score" />
            </div>
            <div>
              <label htmlFor="story-description" className="font-mono-club text-[9px] tracking-[.15em] text-club-ink/70">TELL US ABOUT YOUR ROUND</label>
              <textarea id="story-description" required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2 w-full resize-none border border-club-ink/20 bg-transparent px-4 py-3 text-sm text-club-ink outline-none focus:border-club-green" data-testid="textarea-story-description" />
            </div>
            <div>
              <label className="flex cursor-pointer items-center gap-3 border border-dashed border-club-ink/20 px-4 py-4 text-sm text-club-ink/70 hover:border-club-green">
                <ImagePlus size={18} className="text-club-green" />
                {photoDataUrl ? 'Photo attached' : 'Attach a photo (optional)'}
                <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" data-testid="input-story-photo" />
              </label>
            </div>
            {error && <p role="alert" className="text-xs text-club-alert">{error}</p>}
            <button type="submit" className="bg-club-gold py-4 text-[10px] font-bold tracking-[.15em] text-club-ink hover:bg-club-gold/85" data-testid="button-submit-story">
              SUBMIT FOR REVIEW
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
