/**
 * SAMPLE data used only to make the member and admin portals look lived-in for
 * demos. None of it is real. Every screen that shows it carries a SAMPLE tag
 * while `club.demoMode` is true. It disappears when the portals are connected to
 * real member and payment records.
 */
export const sampleMember = {
  firstName: 'Tendai',
  lastName: 'Moyo',
  memberNo: 'SAMPLE-0001',
  email: 'tendai@example.com',
  phone: '+263 00 000 0000',
  address: 'Chinhoyi, Zimbabwe',
  handicapIndex: '12.4',
  memberSince: '2019',
};

export const sampleInvoices = [
  { id: 'INV-S3', label: 'Green fee (member)', date: '2026-09-12', amount: 10, status: 'Paid' },
  { id: 'INV-S2', label: 'Membership fee', date: '2026-01-05', amount: 175, status: 'Paid' },
  { id: 'INV-S1', label: 'Joining fee', date: '2019-02-02', amount: 100, status: 'Paid' },
];

export const samplePastRounds = [
  { date: '2026-09-26', time: '08:20', detail: '4 players · Member game', score: '86' },
  { date: '2026-09-12', time: '06:40', detail: '2 players · Member game', score: '91' },
  { date: '2026-08-29', time: '13:30', detail: '1 player · Member play', score: '84' },
];

/** Admin-side sample people and activity. */
export const sampleAdmin = {
  name: 'Sample Admin',
  title: 'Super Admin',
};

export const sampleTeeSheet = [
  { time: '06:40', who: 'M. Chikore', players: 4, type: 'Member' },
  { time: '07:30', who: 'T. Moyo', players: 2, type: 'Member' },
  { time: '08:20', who: 'A. Ncube', players: 3, type: 'Non-member' },
  { time: '09:10', who: 'R. Dube', players: 4, type: 'Member' },
];

export const sampleActivity = [
  { text: 'New tee time request · T. Moyo', time: '8 min ago', kind: 'booking' },
  { text: 'Payment received · $10', time: '24 min ago', kind: 'payment' },
  { text: 'Event updated · Captain’s Challenge', time: '1 hr ago', kind: 'event' },
  { text: 'New membership enquiry · F. Ncube', time: '2 hrs ago', kind: 'member' },
];
