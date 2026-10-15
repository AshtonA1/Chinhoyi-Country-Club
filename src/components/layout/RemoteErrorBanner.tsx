import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

/** Shows a message when a save to the server is refused or fails. */
export function RemoteErrorBanner() {
  const [message, setMessage] = useState('');
  useEffect(() => {
    const handler = (e: Event) => setMessage((e as CustomEvent<{ message: string }>).detail?.message ?? 'Something went wrong saving to the server.');
    window.addEventListener('ccc:remote-error', handler);
    return () => window.removeEventListener('ccc:remote-error', handler);
  }, []);
  if (!message) return null;
  return (
    <div role="alert" className="fixed inset-x-4 top-4 z-[70] mx-auto flex max-w-xl items-start gap-3 border border-club-alert bg-white p-4 text-sm text-club-alert shadow-lg">
      <span className="flex-1">{message} Your change was not saved. Check your connection and try again.</span>
      <button onClick={() => setMessage('')} aria-label="Dismiss"><X size={16} /></button>
    </div>
  );
}
