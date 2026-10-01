import { useState } from 'react';
import { CircleCheck, ImagePlus, X } from 'lucide-react';
import type { ClubStory } from '@/data/club';
import { useLocalCollection } from '@/lib/local-store';

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function StorySubmissionForm({ onClose }: { onClose: () => void }) {
  const { add } = useLocalCollection<ClubStory>('chapman:club-stories');
  const [memberName, setMemberName] = useState('');
  const [score, setScore] = useState('');
  const [description, setDescription] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>(undefined);
  const [submitted, setSubmitted] = useState(false);

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoDataUrl(await fileToDataUrl(file));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    add({
      id: crypto.randomUUID(),
      memberName,
      score,
      description,
      photoDataUrl,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    });
    setSubmitted(true);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#12372A]/70 p-5" role="dialog" aria-label="Submit a club story">
      <div className="relative w-full max-w-lg bg-[#F7F5EF] p-7 md:p-9">
        <button onClick={onClose} className="absolute right-5 top-5 text-[#12372A]" aria-label="Close" data-testid="button-close-story-form">
          <X size={20} />
        </button>
        {submitted ? (
          <div>
            <CircleCheck className="text-[#2E6B4E]" size={34} />
            <h3 className="font-display mt-5 text-3xl text-[#12372A]">Thanks for sharing.</h3>
            <p className="mt-3 text-sm leading-7 text-[#5d6b63]">
              Your story is marked <strong>Pending</strong> and will appear in the gallery once an administrator approves it.
            </p>
            <button onClick={onClose} className="mt-6 bg-[#12372A] px-5 py-3 text-[10px] font-bold tracking-[.14em] text-[#F7F5EF]" data-testid="button-close-story-confirmation">
              DONE
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-5">
            <div>
              <h3 className="font-display text-3xl text-[#12372A]">Share your round.</h3>
              <p className="mt-2 text-sm text-[#5d6b63]">Submissions are reviewed by our team before appearing publicly.</p>
            </div>
            <div>
              <label htmlFor="story-name" className="font-mono-club text-[9px] tracking-[.15em] text-[#5d6b63]">YOUR NAME</label>
              <input id="story-name" required value={memberName} onChange={(e) => setMemberName(e.target.value)} className="mt-2 w-full border border-[#cfd4cd] bg-transparent px-4 py-3 text-sm text-[#12372A] outline-none focus:border-[#2E6B4E]" data-testid="input-story-name" />
            </div>
            <div>
              <label htmlFor="story-score" className="font-mono-club text-[9px] tracking-[.15em] text-[#5d6b63]">YOUR SCORE</label>
              <input id="story-score" required placeholder="e.g. 84" value={score} onChange={(e) => setScore(e.target.value)} className="mt-2 w-full border border-[#cfd4cd] bg-transparent px-4 py-3 text-sm text-[#12372A] outline-none focus:border-[#2E6B4E]" data-testid="input-story-score" />
            </div>
            <div>
              <label htmlFor="story-description" className="font-mono-club text-[9px] tracking-[.15em] text-[#5d6b63]">TELL US ABOUT YOUR ROUND</label>
              <textarea id="story-description" required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2 w-full resize-none border border-[#cfd4cd] bg-transparent px-4 py-3 text-sm text-[#12372A] outline-none focus:border-[#2E6B4E]" data-testid="textarea-story-description" />
            </div>
            <div>
              <label className="flex cursor-pointer items-center gap-3 border border-dashed border-[#cfd4cd] px-4 py-4 text-sm text-[#5d6b63] hover:border-[#2E6B4E]">
                <ImagePlus size={18} className="text-[#2E6B4E]" />
                {photoDataUrl ? 'Photo attached' : 'Attach a photo (optional)'}
                <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" data-testid="input-story-photo" />
              </label>
            </div>
            <button type="submit" className="bg-[#C8A951] py-4 text-[10px] font-bold tracking-[.15em] text-[#17201C] hover:bg-[#e3c86b]" data-testid="button-submit-story">
              SUBMIT FOR REVIEW
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
