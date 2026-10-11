/**
 * Central club configuration.
 *
 * Club-specific data lives here: identity, contact details, the DEFAULT course
 * scorecard, events, facilities, fees, gallery, golf rules and the RBAC role
 * matrix. The `default*` exports are only starting values; the live copies are
 * edited by admins and read through the hooks in `@/lib/club-data`. Swapping this file (and /public/images)
 * is enough to re-skin the whole platform for a different golf club without
 * touching component code — this is what makes the codebase SaaS-ready
 * rather than hardcoded to one club.
 */

/** One set of tees (men's or ladies') for a single hole, taken from the club's printed scorecard. */
export type TeeData = {
  par: number;
  metres: number;
  /** Stroke index (handicap allocation), 1 = hardest. */
  stroke: number;
};

export type Hole = {
  id: string;
  number: number;
  men: TeeData;
  ladies: TeeData;
  /** Optional editorial content. Empty = not shown on the public site. */
  name: string;
  description: string;
  hazards: string[];
  proTip: string;
  image: string;
  /** Fly-over video: a path under /public (e.g. /videos/hole-1.mp4) or a direct .mp4 link. Empty = no video. */
  video?: string;
  /** Still image shown before the video plays. Empty = use the hero image. */
  videoPoster?: string;
};

export type EventStatus = 'proposed' | 'confirmed' | 'cancelled';

export type EventItem = {
  id: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  title: string;
  type: string;
  text: string;
  status: EventStatus;
  /** Optional: shown only when filled in. */
  time?: string;
  entryFee?: string;
  registrationDeadline?: string;
  schedule?: string[];
  prizes?: string[];
  rules?: string[];
};

export type FacilityIconId =
  | 'pool' | 'gym' | 'squash' | 'bowling' | 'soccer' | 'tennis' | 'carwash'
  | 'restaurant' | 'bar' | 'clubhouse' | 'generic';

export type FacilityItem = {
  id: string;
  title: string;
  text: string;
  icon: FacilityIconId;
  /** Optional photo URL or uploaded image (data URL). */
  image?: string;
  /** Free text, e.g. "Included with membership" or "$5 per wash". Hidden when empty. */
  access?: string;
  active: boolean;
};

export type PricingConfig = {
  currency: string;
  currencySymbol: string;
  joiningFee: number;
  joiningBilling: string;
  membershipFee: number;
  /** e.g. "per year" / "per month". Left empty until the club confirms it. */
  membershipBilling: string;
  hnaFee: number;
  hnaBilling: string;
  greenFeeMember: number;
  greenFeeNonMember: number;
  nineHoleEnabled: boolean;
  /** Share of the 18-hole green fee charged for 9 holes. */
  nineHoleFactor: number;
};

export type AddOn = { id: string; label: string; price: number; active: boolean };

export type BookingSettings = {
  /** Tee time slots, HH:MM, club time. */
  slots: string[];
  maxPlayers: number;
  cancellationHours: number;
  /** How many days ahead a round can be requested. */
  advanceDays: number;
};

/**
 * Totals the club prints on the card. When set they are shown instead of the
 * sum of the hole rows (and the admin screen warns if the two disagree).
 */
export type CourseConfig = {
  menFrontOfficial: number | null;
  menBackOfficial: number | null;
  menTotalOfficial: number | null;
  ladiesFrontOfficial: number | null;
  ladiesBackOfficial: number | null;
  ladiesTotalOfficial: number | null;
  /** Course rating / slope: shown only once the club supplies them. */
  menRating: number | null;
  menSlope: number | null;
  ladiesRating: number | null;
  ladiesSlope: number | null;
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
  | 'facilities'
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
  { id: 'facilities', label: 'Facilities' },
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
      gallery: all, facilities: all, payments: all, analytics: all, users_roles: all, settings: all,
    },
  },
  {
    id: 'golf_ops_manager',
    label: 'Golf Operations Manager',
    description: 'Runs the tee sheet, bookings and course data day to day.',
    permissions: {
      tee_sheet: all, bookings: all, course: ['read', 'write', 'publish'], events: r,
      memberships: r, gallery: none, facilities: none, payments: r, analytics: r,
      users_roles: none, settings: none,
    },
  },
  {
    id: 'membership_manager',
    label: 'Membership Manager',
    description: 'Owns membership applications, renewals and member records.',
    permissions: {
      tee_sheet: none, bookings: r, course: none, events: r,
      memberships: all, gallery: none, facilities: none, payments: r, analytics: r,
      users_roles: none, settings: none,
    },
  },
  {
    id: 'events_manager',
    label: 'Events Manager',
    description: 'Creates and publishes competitions and club events.',
    permissions: {
      tee_sheet: r, bookings: none, course: none, events: all,
      memberships: none, gallery: rw, facilities: none, payments: none, analytics: r,
      users_roles: none, settings: none,
    },
  },
  {
    id: 'content_manager',
    label: 'Content Manager',
    description: 'Manages gallery, club stories and public-facing content.',
    permissions: {
      tee_sheet: none, bookings: none, course: ['read', 'write'], events: rw,
      memberships: none, gallery: all, facilities: none, payments: none, analytics: none,
      users_roles: none, settings: none,
    },
  },
  {
    id: 'pro_shop_manager',
    label: 'Facilities Manager',
    description: 'Manages facilities (pool, gym, courts, restaurant and bar) and their pricing.',
    permissions: {
      tee_sheet: none, bookings: none, course: none, events: none,
      memberships: none, gallery: none, facilities: all, payments: r, analytics: r,
      users_roles: none, settings: none,
    },
  },
  {
    id: 'accountant',
    label: 'Accountant',
    description: 'Read access to payments and financial analytics only.',
    permissions: {
      tee_sheet: none, bookings: none, course: none, events: none,
      memberships: r, gallery: none, facilities: r, payments: all, analytics: r,
      users_roles: none, settings: none,
    },
  },
];

export const club = {
  name: 'Chinhoyi Country Club',
  shortCode: 'CCC',
  /** Club badge (circular PNG in /public/images). */
  logo: '/images/club-logo.png',
  legalFooterName: 'CHINHOYI COUNTRY CLUB',
  /** Unknown until the club confirms it; do not invent a founding year. */
  establishedYear: null as number | null,
  city: 'Chinhoyi',
  country: 'Zimbabwe',
  // Contact details below are PLACEHOLDERS until the club supplies the real ones.
  address: 'Chinhoyi, Zimbabwe',
  phone: '+263 00 000 0000',
  whatsapp: '',
  email: 'info@example.com',
  mapsUrl: 'https://maps.google.com/?q=Chinhoyi+Country+Club+Zimbabwe',
  openingHours: [['Opening hours', 'To be confirmed']],
  social: {
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
  },
  /**
   * While true, the site shows a "preview" banner and marks sample data. Set to
   * false when the club is live and the placeholders above have been replaced.
   */
  demoMode: true,
  timeZone: 'Africa/Harare',
  /** Static fallback for places that cannot use the course hooks (e.g. a footer). */
  stats: [
    ['18', 'Holes'],
    ['72', 'Par'],
    ['6,500', 'Metres'],
  ],
};

export function whatsappLink(message = "Hi, I'd like to know more about Chinhoyi Country Club."): string | null {
  const digits = club.whatsapp.replace(/[^\d]/g, '');
  if (!digits) return null;
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

/**
 * Scorecard transcribed from the club's printed card (par 72).
 * Row format: [hole, menPar, menMetres, menStroke, ladiesPar, ladiesMetres, ladiesStroke]
 */
const SCORECARD: [number, number, number, number, number, number, number][] = [
  [1, 4, 415, 5, 4, 367, 11],
  [2, 3, 160, 15, 3, 152, 15],
  [3, 5, 545, 7, 5, 481, 3],
  [4, 4, 392, 11, 4, 356, 5],
  [5, 3, 135, 17, 3, 111, 17],
  [6, 4, 390, 1, 4, 291, 13],
  [7, 5, 470, 9, 5, 368, 7],
  [8, 4, 397, 3, 4, 345, 1],
  [9, 4, 316, 13, 4, 279, 9],
  [10, 4, 409, 4, 4, 367, 12],
  [11, 3, 156, 16, 3, 117, 16],
  [12, 5, 497, 10, 5, 452, 2],
  [13, 4, 360, 14, 4, 319, 14],
  [14, 3, 133, 18, 3, 120, 18],
  [15, 4, 386, 6, 4, 323, 10],
  [16, 4, 398, 2, 4, 309, 8],
  [17, 5, 547, 8, 5, 402, 6],
  [18, 4, 363, 12, 4, 324, 4],
];

const holeImages = [images.fairway, images.green, images.hero, images.sunset, images.clubhouse];

/**
 * Hole names, descriptions, hazards and tips are intentionally empty: the club
 * has not supplied them, and the public pages hide empty fields rather than
 * show invented copy. Admins can fill them in under Admin > Course & holes.
 */
export const defaultHoles: Hole[] = SCORECARD.map(([number, mp, mm, ms, lp, lm, ls]) => ({
  id: `hole-${number}`,
  number,
  men: { par: mp, metres: mm, stroke: ms },
  ladies: { par: lp, metres: lm, stroke: ls },
  name: '',
  description: '',
  hazards: [],
  proTip: '',
  image: holeImages[(number - 1) % holeImages.length],
  // Fly-over videos exist for holes 1-9 so far. If a file is not uploaded yet the
  // hole page quietly falls back to the photo.
  video: number <= 9 ? `/videos/hole-${number}.mp4` : '',
  videoPoster: number <= 9 ? `/videos/hole-${number}.jpg` : '',
}));

export const defaultCourse: CourseConfig = {
  // Men's card: the club confirms 6,500 m overall. The 18 hole rows add up to
  // 6,469 m, a 31 m gap that is being checked with the club (see Admin > Course).
  menFrontOfficial: 3251,
  menBackOfficial: 3249,
  menTotalOfficial: 6500,
  ladiesFrontOfficial: null,
  ladiesBackOfficial: null,
  ladiesTotalOfficial: null,
  menRating: null,
  menSlope: null,
  ladiesRating: null,
  ladiesSlope: null,
};

export const defaultPricing: PricingConfig = {
  currency: 'USD',
  currencySymbol: '$',
  joiningFee: 100,
  joiningBilling: 'once-off',
  membershipFee: 175,
  membershipBilling: '',
  hnaFee: 80,
  hnaBilling: '',
  greenFeeMember: 10,
  greenFeeNonMember: 15,
  nineHoleEnabled: true,
  nineHoleFactor: 0.6,
};

/** Sample add-on prices: confirm with the club. Admins can edit, add and remove them. */
export const defaultAddOns: AddOn[] = [
  { id: 'cart', label: 'Golf cart', price: 20, active: true },
  { id: 'caddie', label: 'Caddie', price: 15, active: true },
  { id: 'clubs', label: 'Club rental (full set)', price: 30, active: true },
];

export const defaultBookingSettings: BookingSettings = {
  slots: ['06:40', '07:30', '08:20', '09:10', '10:00', '10:50', '11:40', '12:40', '13:30', '14:20'],
  maxPlayers: 4,
  cancellationHours: 24,
  advanceDays: 60,
};

const PROGRAMME_NOTE = "A date on the Captain's proposed golf programme for October to December 2026. Entry fee, tee times and format will be confirmed by the club.";

function programmeEvent(date: string, title: string, type: string, slug: string): EventItem {
  return { id: `ev-${slug}`, date, title, type, text: `${title}. ${PROGRAMME_NOTE}`, status: 'proposed' };
}

/** The Captain's proposed golf programme, October to December 2026 (subject to approval). */
export const defaultEvents: EventItem[] = [
  programmeEvent('2026-10-04', 'Monthly Medal', 'Competition', 'monthly-medal-oct'),
  programmeEvent('2026-10-16', 'Munhumutapa Tournament', 'Competition', 'munhumutapa'),
  programmeEvent('2026-10-24', 'Chengetanai Fundraiser', 'Fundraiser', 'chengetanai'),
  programmeEvent('2026-11-07', 'Senior Citizens Fundraiser', 'Fundraiser', 'senior-citizens'),
  programmeEvent('2026-11-14', 'CUT Innovation Invitational', 'Competition', 'cut-innovation'),
  programmeEvent('2026-11-22', 'Green Jacket Final', 'Competition', 'green-jacket-final'),
  programmeEvent('2026-11-28', 'Samboko Memorial Tournament', 'Competition', 'samboko-memorial'),
  programmeEvent('2026-12-05', "Captain's Challenge", 'Competition', 'captains-challenge'),
  programmeEvent('2026-12-13', "Greenkeeper's Revenge", 'Competition', 'greenkeepers-revenge'),
  programmeEvent('2026-12-22', 'Unity Day Turkey Trot Tombstone Challenge', 'Competition', 'turkey-trot'),
];

export const EVENT_TYPES = ['Competition', 'Fundraiser', 'Social', 'Dining', 'Other'] as const;

const MEMBERS_ACCESS = 'Included with membership';

export const defaultFacilities: FacilityItem[] = [
  { id: 'fac-pool', title: 'Swimming pool', text: 'Cool off after a round, or make an afternoon of it with the family.', icon: 'pool', access: MEMBERS_ACCESS, active: true },
  { id: 'fac-gym', title: 'Gym', text: 'Keep fit between rounds.', icon: 'gym', access: MEMBERS_ACCESS, active: true },
  { id: 'fac-squash', title: 'Squash', text: 'Squash for members who like a faster game.', icon: 'squash', access: MEMBERS_ACCESS, active: true },
  { id: 'fac-bowling', title: 'Bowling', text: 'Bowling at the club.', icon: 'bowling', access: MEMBERS_ACCESS, active: true },
  { id: 'fac-soccer', title: 'Soccer', text: 'Soccer at the club.', icon: 'soccer', access: MEMBERS_ACCESS, active: true },
  { id: 'fac-tennis', title: 'Tennis', text: 'Tennis for members and their families.', icon: 'tennis', access: MEMBERS_ACCESS, active: true },
  { id: 'fac-carwash', title: 'Car wash', text: 'Have the car cleaned while you play.', icon: 'carwash', access: '', active: true },
  { id: 'fac-restaurant', title: 'Restaurant', text: 'Meals at the club, before or after your round.', icon: 'restaurant', access: '', active: true },
  { id: 'fac-bar', title: 'Bar', text: 'A place to unwind once the round is done.', icon: 'bar', access: '', active: true },
  { id: 'fac-clubhouse', title: 'Clubhouse', text: "The club's social home, for before and after the round.", icon: 'clubhouse', access: MEMBERS_ACCESS, active: true },
];

export const galleryItems: GalleryItem[] = [
  { id: 'g1', src: images.hero, label: 'First light over the course', category: 'Course' },
  { id: 'g2', src: images.clubhouse, label: 'The clubhouse', category: 'Clubhouse' },
  { id: 'g3', src: images.sunset, label: 'Evening on the course', category: 'Course' },
  { id: 'g4', src: images.dining, label: 'Lunch on the veranda', category: 'Clubhouse' },
  { id: 'g5', src: images.fairway, label: 'Along the fairway', category: 'Course' },
  { id: 'g6', src: images.green, label: 'The putting green', category: 'Golf' },
  { id: 'g7', src: images.hero, label: 'Club day', category: 'Events' },
  { id: 'g8', src: images.sunset, label: 'Social afternoon', category: 'Events' },
];

/**
 * General golf etiquette and housekeeping. These are generic and are meant to be
 * replaced by the club's own course rules and local rules once supplied.
 */
export const golfInfo = {
  courseRules: [
    'Repair pitch marks and replace or fill divots.',
    'Rake bunkers smooth after playing out of them.',
    'Keep pace with the group ahead and invite faster groups to play through.',
    'Follow the Rules of Golf unless a local rule says otherwise.',
  ],
  localRules: [
    "The club's local rules will be published here once they are confirmed.",
  ],
  etiquette: [
    'Keep pace with the group ahead; invite faster groups to play through.',
    'Stay quiet and still while others are playing their shot.',
    'Avoid standing in another player’s line of sight or shadow on the green.',
    'Switch mobile phones to silent on the course out of respect for other players.',
    'Thank the greenstaff.',
  ],
  hazardsOverview: [] as string[],
};
