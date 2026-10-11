import { useState, type FormEvent } from 'react';
import { CircleCheck, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { LocationBand, PageIntro, SectionLabel, usePageMeta } from '@/components/layout/Shared';
import { club, images, whatsappLink } from '@/data/club';

function Field({
  label, value, onChange, placeholder, type = 'text', testId,
}: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string; testId: string }) {
  return (
    <div>
      <label htmlFor={testId} className="font-mono-club text-[9px] tracking-[.15em] text-[#5d6b63]">{label}</label>
      <input
        id={testId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="mt-2 w-full border border-[#cfd4cd] bg-transparent px-4 py-4 text-sm text-[#12372A] outline-none placeholder:text-[#9aa29b] focus:border-[#2E6B4E]"
        data-testid={testId}
      />
    </div>
  );
}

export default function Contact() {
  usePageMeta('Contact', `Get in touch with ${club.name}.`);
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('Booking a tee time');
  const [message, setMessage] = useState('');
  const wa = whatsappLink();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!club.demoMode) {
      // No server yet: hand the message to the visitor's own email app so it really reaches the club.
      const body = `${message}\n\nFrom: ${name} <${email}>`;
      window.location.href = `mailto:${club.email}?subject=${encodeURIComponent(reason)}&body=${encodeURIComponent(body)}`;
    }
    setSent(true);
  }

  return (
    <div className="bg-[#F7F5EF]">
      <PageIntro eyebrow="COME SAY HELLO" title="Let's make a plan." copy="Whether you are visiting, joining, entering a tournament or just curious, get in touch." image={images.detail} />
      <main className="mx-auto grid max-w-[1480px] gap-14 px-5 py-20 md:grid-cols-12 md:px-10 md:py-28">
        <div className="md:col-span-4">
          <SectionLabel>CONTACT US</SectionLabel>
          <h2 className="font-display mt-5 text-5xl leading-[.92] text-[#12372A] md:text-7xl">
            A warm<br /><em>welcome.</em>
          </h2>
          <div className="mt-9 grid gap-5 text-sm leading-7 text-[#5d6b63]">
            <p className="flex gap-3"><MapPin size={17} className="mt-1 shrink-0 text-[#2E6B4E]" />{club.address}</p>
            <p className="flex gap-3"><Phone size={16} className="mt-1 shrink-0 text-[#2E6B4E]" />{club.phone}</p>
            <p className="flex gap-3"><Mail size={16} className="mt-1 shrink-0 text-[#2E6B4E]" />{club.email}</p>
            {wa && (
              <a href={wa} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-[#2E6B4E] hover:text-[#12372A]" data-testid="link-contact-whatsapp">
                <MessageCircle size={16} className="shrink-0" /> Chat with us on WhatsApp
              </a>
            )}
            <a href={club.mapsUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-[#2E6B4E] hover:text-[#12372A]" data-testid="link-contact-directions">
              <MapPin size={16} className="shrink-0" /> Get directions on Google Maps
            </a>
          </div>
          <div className="mt-9 border-t border-[#12372A]/15 pt-6">
            <p className="font-mono-club text-[9px] tracking-[.15em] text-[#2E6B4E]">OPENING HOURS</p>
            <div className="mt-4 grid gap-2 text-sm text-[#5d6b63]">
              {club.openingHours.map(([day, hours]) => (
                <div key={day} className="flex justify-between"><span>{day}</span><span className="text-[#12372A]">{hours}</span></div>
              ))}
            </div>
          </div>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          {sent ? (
            <div className="border border-[#2E6B4E]/30 bg-[#e8e9df] p-8">
              <CircleCheck className="text-[#2E6B4E]" size={32} />
              <h3 className="font-display mt-5 text-4xl text-[#12372A]">Thank you, {name || 'friend'}.</h3>
              <p className="mt-3 text-sm leading-7 text-[#5d6b63]">
                {club.demoMode
                  ? 'This is a preview, so your message was not sent to anyone. On the live site it opens your email app, addressed to the club.'
                  : 'Your email app should now be open with your message, ready to send to the club.'}
              </p>
              <button onClick={() => setSent(false)} className="mt-6 text-[10px] font-bold tracking-[.15em] text-[#2E6B4E]" data-testid="button-contact-another">
                SEND ANOTHER NOTE
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-5">
              <Field label="YOUR NAME" value={name} onChange={setName} placeholder="How should we address you?" testId="input-contact-name" />
              <Field label="EMAIL ADDRESS" value={email} onChange={setEmail} placeholder="you@example.com" testId="input-contact-email" type="email" />
              <div>
                <label htmlFor="contact-reason" className="font-mono-club text-[9px] tracking-[.15em] text-[#5d6b63]">I'M GETTING IN TOUCH ABOUT</label>
                <select id="contact-reason" value={reason} onChange={(e) => setReason(e.target.value)} className="mt-2 w-full border border-[#cfd4cd] bg-transparent px-4 py-4 text-sm text-[#12372A] outline-none focus:border-[#2E6B4E]" data-testid="select-contact-reason">
                  <option>Booking a tee time</option>
                  <option>Membership</option>
                  <option>Entering an event</option>
                  <option>Facilities</option>
                  <option>Something else</option>
                </select>
              </div>
              <div>
                <label htmlFor="contact-message" className="font-mono-club text-[9px] tracking-[.15em] text-[#5d6b63]">YOUR MESSAGE</label>
                <textarea id="contact-message" required value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder="Tell us a little more…" className="mt-2 w-full resize-none border border-[#cfd4cd] bg-transparent px-4 py-4 text-sm text-[#12372A] outline-none placeholder:text-[#9aa29b] focus:border-[#2E6B4E]" data-testid="textarea-contact-message" />
              </div>
              <button type="submit" className="flex items-center justify-center gap-2 bg-[#12372A] py-4 text-[10px] font-bold tracking-[.15em] text-[#F7F5EF] hover:bg-[#2E6B4E]" data-testid="button-contact-submit">
                SEND MESSAGE
              </button>
            </form>
          )}
        </div>
      </main>
      <LocationBand />
      <Footer />
    </div>
  );
}
