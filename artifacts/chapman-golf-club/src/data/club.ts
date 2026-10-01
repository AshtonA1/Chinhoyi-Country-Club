/**
 * Central club configuration.
 *
 * Every piece of club-specific data (identity, contact details, course data,
 * membership plans, events, facilities, gallery, golf rules, and the RBAC
 * role matrix used by the admin portal) lives here instead of being
 * scattered through page components. Swapping this file (and /public/images)
 * is enough to re-skin the whole platform for a different golf club without
 * touching component code — this is what makes the codebase SaaS-ready
 * rather than hardcoded to one club.
 */

export type Hole = {
  number: number;
  par: number;
  metres: number;
  stroke: number;
  name: string;
  description: string;
  image: string;
  hazards: string[];
  proTip: string;
};

export type MembershipPlan = {
  id: string;
  title: string;
  note: string;
  price: string;
  billing: string;
  perks: string[];
  comparison: Record<string, boolean | string>;
};

export type EventItem = {
  id: string;
  day: string;
  month: string;
  year: string;
  title: string;
  type: string;
  text: string;
  entryFee?: string;
  registrationDeadline?: string;
  schedule?: string[];
  prizes?: string[];
  rules?: string[];
};

export type FacilityItem = {
  id: string;
  title: string;
  text: string;
  image: string;
  cta: string;
};

export type GalleryCategory = 'Course' | 'Clubhouse' | 'Events' | 'Members' | 'Golf';

export type GalleryItem = {
  id: string;
  src: string;
  label: string;
  category: GalleryCategory;
};

export type ClubStory = {
  id: string;
  memberName: string;
  score: string;
  description: string;
  photoDataUrl?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
};

export type RoleId =
  | 'super_admin'
  | 'golf_ops_manager'
  | 'membership_manager'
  | 'events_manager'
  | 'content_manager'
  | 'pro_shop_manager'
  | 'accountant';

export type PermissionAction = 'read' | 'write' | 'delete' | 'publish';

export type PermissionModule =
  | 'tee_sheet'
  | 'bookings'
  | 'course'
  | 'events'
  | 'memberships'
  | 'gallery'
  | 'pro_shop'
  | 'payments'
  | 'analytics'
  | 'users_roles'
  | 'settings';

export type RoleDefinition = {
  id: RoleId;
  label: string;
  description: string;
  permissions: Record<PermissionModule, PermissionAction[]>;
};

export const PERMISSION_MODULES: { id: PermissionModule; label: string }[] = [
  { id: 'tee_sheet', label: 'Tee Sheet' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'course', label: 'Course & Holes' },
  { id: 'events', label: 'Events' },
  { id: 'memberships', label: 'Memberships' },
  { id: 'gallery', label: 'Gallery & Stories' },
  { id: 'pro_shop', label: 'Pro Shop' },
  { id: 'payments', label: 'Payments' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'users_roles', label: 'Users & Roles' },
  { id: 'settings', label: 'Settings' },
];

const all: PermissionAction[] = ['read', 'write', 'delete', 'publish'];
const rw: PermissionAction[] = ['read', 'write'];
const r: PermissionAction[] = ['read'];
const none: PermissionAction[] = [];

export const ROLES: RoleDefinition[] = [
  {
    id: 'super_admin',
    label: 'Super Admin',
    description: 'Full access to every module, including user and role management.',
    permissions: {
      tee_sheet: all, bookings: all, course: all, events: all, memberships: all,
      gallery: all, pro_shop: all, payments: all, analytics: all, users_roles: all, settings: all,
    },
  },
  {
    id: 'golf_ops_manager',
    label: 'Golf Operations Manager',
    description: 'Runs the tee sheet, bookings and course data day to day.',
    permissions: {
      tee_sheet: all, bookings: all, course: ['read', 'write', 'publish'], events: r,
      memberships: r, gallery: none, pro_shop: none, payments: r, analytics: r,
      users_roles: none, settings: none,
    },
  },
  {
    id: 'membership_manager',
    label: 'Membership Manager',
    description: 'Owns membership applications, renewals and member records.',
    permissions: {
      tee_sheet: none, bookings: r, course: none, events: r,
      memberships: all, gallery: none, pro_shop: none, payments: r, analytics: r,
      users_roles: none, settings: none,
    },
  },
  {
    id: 'events_manager',
    label: 'Events Manager',
    description: 'Creates and publishes competitions and club events.',
    permissions: {
      tee_sheet: r, bookings: none, course: none, events: all,
      memberships: none, gallery: rw, pro_shop: none, payments: none, analytics: r,
      users_roles: none, settings: none,
    },
  },
  {
    id: 'content_manager',
    label: 'Content Manager',
    description: 'Manages gallery, club stories and public-facing content.',
    permissions: {
      tee_sheet: none, bookings: none, course: ['read', 'write'], events: rw,
      memberships: none, gallery: all, pro_shop: none, payments: none, analytics: none,
      users_roles: none, settings: none,
    },
  },
  {
    id: 'pro_shop_manager',
    label: 'Pro Shop Manager',
    description: 'Manages the pro shop catalogue, stock and orders.',
    permissions: {
      tee_sheet: none, bookings: none, course: none, events: none,
      memberships: none, gallery: none, pro_shop: all, payments: r, analytics: r,
      users_roles: none, settings: none,
    },
  },
  {
    id: 'accountant',
    label: 'Accountant',
    description: 'Read access to payments and financial analytics only.',
    permissions: {
      tee_sheet: none, bookings: none, course: none, events: none,
      memberships: r, gallery: none, pro_shop: r, payments: all, analytics: r,
      users_roles: none, settings: none,
    },
  },
];

export const club = {
  name: 'Chinhoyi Country Club',
  shortCode: 'CCC',
  legalFooterName: 'CHINHOYI COUNTRY CLUB',
  establishedYear: 1968,
  city: 'Chinhoyi',
  country: 'Zimbabwe',
  address: '41 Lomagundi Road, Chinhoyi, Zimbabwe',
  phone: '+263 6721 234 567',
  whatsapp: '+263 77 123 4567',
  email: 'hello@chinhoyicountryclub.co.zw',
  mapsUrl: 'https://maps.google.com/?q=Chinhoyi+Country+Club+Zimbabwe',
  openingHours: [
    ['Monday – Friday', '06:00 – 19:00'],
    ['Saturday – Sunday', '05:30 – 19:30'],
    ['Public Holidays', '06:00 – 18:00'],
  ],
  social: {
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
  },
  stats: [
    ['18', 'Holes'],
    ['71', 'Par'],
    ['6,291', 'Metres'],
    ['1968', 'Established'],
  ],
};

export function whatsappLink(message = "Hi, I'd like to know more about Chinhoyi Country Club."): string {
  const digits = club.whatsapp.replace(/[^\d]/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export const images = {
  hero: '/images/chapman-aerial.jpg',
  fairway: '/images/chapman-sunset.jpg',
  clubhouse: '/images/chapman-clubhouse.jpg',
  green: '/images/chapman-green.jpg',
  sunset: '/images/chapman-sunset.jpg',
  detail: '/images/chapman-green.jpg',
  dining: '/images/chapman-dining.jpg',
};

export const navItems: [string, string][] = [
  ['About', '/about'], ['The Course', '/course'], ['Tee Times', '/tee-times'],
  ['Membership', '/membership'], ['Events', '/events'], ['Facilities', '/facilities'],
  ['Gallery', '/gallery'], ['Golf Info', '/golf-info'], ['Contact', '/contact'],
];

export const holes: Hole[] = [
  { number: 1, par: 4, metres: 374, stroke: 7, name: 'The Invitation', description: 'A generous opening tee shot into a broad fairway, framed by msasa and an elevated green. The first of many quiet tests.', image: images.fairway, hazards: ['Left fairway bunker at 220 metres', 'Runoff beyond the back of green'], proTip: 'Favour the right half of the fairway — it opens the safest angle into the green.' },
  { number: 2, par: 3, metres: 161, stroke: 15, name: 'The Lookout', description: 'The course begins to reveal its scale here. Choose the club for the day’s wind and let the sloped putting surface do the rest.', image: images.green, hazards: ['Native grass short right', 'Deep bunker guarding the left'], proTip: 'Take one club more than you think — the green runs away from short approaches.' },
  { number: 3, par: 5, metres: 495, stroke: 3, name: 'Long View', description: 'A par five that rewards a bold line from the tee and a measured second. The green sits softly above the valley floor.', image: images.hero, hazards: ['Out of bounds to the right', 'Two fairway bunkers at the landing zone'], proTip: 'Lay up short of the second bunker complex; it leaves a full, uncomplicated wedge in.' },
  { number: 4, par: 4, metres: 349, stroke: 11, name: 'The Fold', description: 'A strategic dogleg where position matters more than power. Take the corner and the approach opens beautifully.', image: images.sunset, hazards: ['Creek crossing the approach', 'Bunker short left'], proTip: 'A 3-wood off the tee takes the creek out of play entirely.' },
  { number: 5, par: 4, metres: 398, stroke: 1, name: 'Cedar Ridge', description: 'The signature challenge of the outward nine. A long, exacting hole with a narrow entrance to a two-tier green.', image: images.fairway, hazards: ['Trees pinch the fairway at 256 metres', 'Bunkers on both sides of green'], proTip: 'Aim centre of green and accept two putts here — this hole is not for heroics.' },
  { number: 6, par: 3, metres: 144, stroke: 17, name: 'The Pause', description: 'A small green suspended above the land. There is more room than the eye first suggests, if you find the centre.', image: images.green, hazards: ['Drop-off behind green', 'Wind off the ridge'], proTip: 'Check the flag on the practice green before you tee off — the ridge wind is deceptive.' },
  { number: 7, par: 4, metres: 363, stroke: 9, name: 'The Crossing', description: 'The fairway turns gently through a stand of indigenous trees. A well-chosen tee line leaves a short, inviting iron in.', image: images.clubhouse, hazards: ['Native scrub left', 'Bunker front right'], proTip: 'Start your tee shot at the left edge of the trees and let it fade back.' },
  { number: 8, par: 5, metres: 472, stroke: 5, name: 'Riverside', description: 'The cool line of the stream accompanies the hole all the way home. A three-shot route is often the cleverer play.', image: images.fairway, hazards: ['Seasonal stream left', 'Wetland beyond the green'], proTip: 'Play safely away from the stream side on your second — the reward isn’t worth the risk.' },
  { number: 9, par: 4, metres: 342, stroke: 13, name: 'Halfway House', description: 'A composed finish to the first loop, with the veranda in view. Keep your rhythm and the birdie chance is real.', image: images.dining, hazards: ['Bunker short of green', 'Out of bounds behind clubhouse'], proTip: 'A mid-iron off the tee for position beats a driver chasing distance here.' },
  { number: 10, par: 4, metres: 385, stroke: 2, name: 'The Return', description: 'The back nine opens with a long, stern par four. The green accepts a running approach from the right.', image: images.hero, hazards: ['Fairway bunker right', 'False front on green'], proTip: 'Land your approach short and let it release — the false front repels anything too bold.' },
  { number: 11, par: 3, metres: 176, stroke: 16, name: 'The Stone', description: 'An elevated tee and a clean horizon. Trust the number and commit to a high, soft shot.', image: images.green, hazards: ['Stone wall short', 'Bunker behind green'], proTip: 'Commit fully to your club choice — decelerating into this shot is the most common miss.' },
  { number: 12, par: 5, metres: 514, stroke: 6, name: 'Open Country', description: 'The widest fairway on the property invites a proper drive. The final approach bends around a sentinel acacia.', image: images.fairway, hazards: ['Acacia tree at the lay-up', 'Deep hollow left of green'], proTip: 'Swing freely off the tee — this is the most forgiving fairway on the course.' },
  { number: 13, par: 4, metres: 334, stroke: 14, name: 'The Gate', description: 'A quiet transition hole, shaped by old boundary stones and a green that falls away at the edges.', image: images.clubhouse, hazards: ['Boundary stones right', 'Runoff left'], proTip: 'A shorter club off the tee for accuracy sets up a simple approach.' },
  { number: 14, par: 4, metres: 410, stroke: 4, name: 'The Quarry', description: 'The land shows its character here. A strong par four with a demanding carry and a precise, elevated target.', image: images.sunset, hazards: ['Rocky waste short right', 'Bunker left of green'], proTip: 'Play for the fat of the green; the pin positions here punish anything greedy.' },
  { number: 15, par: 3, metres: 134, stroke: 18, name: 'Birdsong', description: 'The shortest hole on the course, but never a giveaway. A pocket of calm, birdsong and a delicate putting surface.', image: images.green, hazards: ['Bunker front left', 'Native grass surrounds green'], proTip: 'A full, comfortable swing beats a delicate half-shot on this green.' },
  { number: 16, par: 5, metres: 485, stroke: 8, name: 'The Reach', description: 'A chance to open the shoulders. Find the fairway and the green is reachable for the brave, with the wind behind.', image: images.fairway, hazards: ['Trees right of landing area', 'Bunker short of green'], proTip: 'Only go for the green in two if you have a clean lie and a following wind.' },
  { number: 17, par: 4, metres: 368, stroke: 10, name: 'The Long Light', description: 'Late afternoon light runs down this fairway. A sweeping approach across the water sets up the final tee.', image: images.sunset, hazards: ['Water left', 'Bunker at the green entrance'], proTip: 'Favour the right side off the tee — it takes the water out of the equation for your approach.' },
  { number: 18, par: 4, metres: 387, stroke: 12, name: 'Homeward', description: 'The clubhouse watches from beyond the final green. It is a hole for a last good decision, and a walk worth taking slowly.', image: images.clubhouse, hazards: ['Water short right', 'Large bunker left of green'], proTip: 'A conservative tee shot to the left-centre sets up the safest angle home.' },
];

export const membershipPlans: MembershipPlan[] = [
  {
    id: 'full', title: 'Full Membership', note: 'For the complete Chinhoyi rhythm.', price: '$185', billing: 'per month',
    perks: ['Unlimited course access', 'Full clubhouse privileges', 'Member events & competitions', 'Reciprocal club access'],
    comparison: { 'Course access': 'Unlimited', 'Guest rounds / year': '12', 'Clubhouse privileges': true, Competitions: true, 'Reciprocal clubs': true },
  },
  {
    id: 'young-professional', title: 'Young Professional', note: 'For your first years in the city.', price: '$95', billing: 'per month',
    perks: ['Weekday course access', 'Weekend twilight play', 'Young members calendar'],
    comparison: { 'Course access': 'Weekday + twilight', 'Guest rounds / year': '4', 'Clubhouse privileges': true, Competitions: true, 'Reciprocal clubs': false },
  },
  {
    id: 'corporate', title: 'Corporate', note: 'A better place to do business.', price: '$420', billing: 'per month · up to 4 named users',
    perks: ['Named member allocation', 'Guest rounds included', 'Private room access'],
    comparison: { 'Course access': 'Unlimited', 'Guest rounds / year': '24', 'Clubhouse privileges': true, Competitions: false, 'Reciprocal clubs': true },
  },
];

export const events: EventItem[] = [
  { id: 'ev-solstice', day: '14', month: 'JUN', year: '2026', title: 'Winter Solstice Supper', type: 'Dining', text: 'A long table, a roaring fire and a menu that follows the season.', entryFee: '$45 per person', registrationDeadline: '10 June 2026', schedule: ['18:30 Arrival & drinks', '19:15 Seated dinner', '21:00 Fireside coffee'] },
  { id: 'ev-cup-final', day: '22', month: 'JUN', year: '2026', title: 'Chinhoyi Cup — Final', type: 'Competition', text: 'The club championship reaches its final, followed by the prizegiving.', entryFee: 'Included for qualifiers', registrationDeadline: 'Qualifiers closed', schedule: ['07:10 First tee time', '13:00 Prizegiving on the veranda'], prizes: ['Chinhoyi Cup trophy', 'Runner-up medal', 'Nett division prize'], rules: ['Stroke play, championship tees', 'USGA handicap rules apply'] },
  { id: 'ev-sundowners', day: '06', month: 'JUL', year: '2026', title: 'Sunday Sundowners', type: 'Social', text: 'Bring the family. We’ll take care of the blankets, the music and the sunset.', entryFee: 'Free for members', registrationDeadline: 'Walk-ins welcome', schedule: ['16:00 Lawn opens', '17:45 Sunset toast'] },
  { id: 'ev-ladies-fourball', day: '19', month: 'JUL', year: '2026', title: 'Ladies’ Spring Fourball', type: 'Competition', text: 'A relaxed morning of fourball golf and a generous lunch.', entryFee: '$25 per pair', registrationDeadline: '15 July 2026', schedule: ['07:00 Shotgun start', '12:00 Lunch & prizegiving'], prizes: ['1st & 2nd pairs', 'Nearest the pin', 'Longest drive'], rules: ['Fourball better ball', 'Maximum handicap 36'] },
];

export const facilities: FacilityItem[] = [
  { id: 'pro-shop', title: 'Pro Shop', text: 'Clubs, apparel and expert fitting advice from a team that plays the course daily.', image: images.clubhouse, cta: 'Browse the shop' },
  { id: 'restaurant', title: 'Restaurant & Bar', text: 'Local ingredients, simple cooking and a table where you can stay as long as you like.', image: images.dining, cta: 'View the menu' },
  { id: 'academy', title: 'Golf Academy', text: 'One-on-one coaching and video analysis for every stage of the game.', image: images.green, cta: 'Book a lesson' },
  { id: 'driving-range', title: 'Driving Range', text: 'A floodlit, all-weather range with covered bays and target greens.', image: images.fairway, cta: 'Check availability' },
  { id: 'clubhouse', title: 'Clubhouse', text: 'A bright, unhurried home base with a wide veranda and fire-lit lounge.', image: images.clubhouse, cta: 'Take a look inside' },
];

export const galleryItems: GalleryItem[] = [
  { id: 'g1', src: images.hero, label: 'First light over the course', category: 'Course' },
  { id: 'g2', src: images.clubhouse, label: 'The clubhouse, from the ninth', category: 'Clubhouse' },
  { id: 'g3', src: images.sunset, label: 'A Chinhoyi evening', category: 'Course' },
  { id: 'g4', src: images.dining, label: 'Lunch on the veranda', category: 'Clubhouse' },
  { id: 'g5', src: images.fairway, label: 'The line into sixteen', category: 'Course' },
  { id: 'g6', src: images.green, label: 'The putting green', category: 'Golf' },
  { id: 'g7', src: images.hero, label: 'Chinhoyi Cup — Final', category: 'Events' },
  { id: 'g8', src: images.sunset, label: 'Sunday Sundowners', category: 'Events' },
];

export const golfInfo = {
  scorecard: {
    tees: [
      { name: 'Championship', rating: 74.1, slope: 138 },
      { name: 'Men’s', rating: 71.8, slope: 131 },
      { name: 'Women’s', rating: 73.2, slope: 129 },
    ],
  },
  courseRules: [
    'Only registered players may access the course; all rounds must be booked in advance.',
    'Soft spikes only — metal spikes are not permitted on any green or clubhouse floor.',
    'Repair all pitch marks and replace or fill divots on every hole.',
    'Rakes provided in bunkers must be used to smooth the sand after play.',
    'Maximum group size is four players unless otherwise approved by golf operations.',
  ],
  localRules: [
    'Ground under repair (GUR) is marked with white lines — free relief applies.',
    'The seasonal stream on hole 8 and hole 17 water hazard are played as lateral hazards.',
    'Temporary greens, when in use, will be clearly marked and communicated at the pro shop.',
    'Preferred lies apply on the fairway only during the designated wet-season period.',
  ],
  etiquette: [
    'Keep pace with the group ahead; invite faster groups to play through.',
    'Stay quiet and still while others are playing their shot.',
    'Avoid standing in another player’s line of sight or shadow on the green.',
    'Switch mobile phones to silent on the course out of respect for other members.',
    'Thank the greenstaff — they are usually out well before the first tee time.',
  ],
  hazardsOverview: [
    'Water hazards on holes 4, 8, 10 (wetland) and 17.',
    'Native grass and scrub rough on holes 2, 8, 9 and 15 — a provisional ball is recommended if in doubt.',
    'Out of bounds runs along the right of holes 3 and 9, marked with white stakes.',
  ],
};

export const bookingConfig = {
  timeSlots: ['06:40', '07:30', '08:20', '09:10', '10:00', '10:50', '11:40', '12:40', '13:30', '14:20'],
  holesOptions: [
    { id: '18', label: '18 holes', priceModifier: 1 },
    { id: '9', label: '9 holes', priceModifier: 0.6 },
  ],
  playerTypes: [
    { id: 'member', label: 'Member', basePrice: 0 },
    { id: 'guest', label: 'Member guest', basePrice: 25 },
    { id: 'visitor', label: 'Visitor / public', basePrice: 45 },
  ],
  addOns: [
    { id: 'cart', label: 'Golf cart', price: 20 },
    { id: 'caddie', label: 'Caddie', price: 15 },
    { id: 'clubs', label: 'Club rental (full set)', price: 30 },
  ],
};
