import type { AddOn, PricingConfig } from '@/data/club';

export type PlayerTypeId = 'member' | 'non-member';
export type RoundId = '18' | '9';

export const PLAYER_TYPES: { id: PlayerTypeId; label: string }[] = [
  { id: 'member', label: 'Member' },
  { id: 'non-member', label: 'Non-member' },
];

const cents = (n: number) => Math.round(n * 100) / 100;

/** Green fee for one player. */
export function greenFee(pricing: PricingConfig, playerType: PlayerTypeId, round: RoundId): number {
  const base = playerType === 'member' ? pricing.greenFeeMember : pricing.greenFeeNonMember;
  return cents(round === '9' ? base * pricing.nineHoleFactor : base);
}

export type BookingQuote = { perPlayerFee: number; addOnsPerPlayer: number; total: number };

export function quoteBooking(args: {
  pricing: PricingConfig;
  addOns: AddOn[];
  playerType: PlayerTypeId;
  round: RoundId;
  players: number;
  addOnIds: string[];
}): BookingQuote {
  const perPlayerFee = greenFee(args.pricing, args.playerType, args.round);
  const addOnsPerPlayer = cents(
    args.addOnIds.reduce((s, id) => s + (args.addOns.find((a) => a.id === id)?.price ?? 0), 0),
  );
  return {
    perPlayerFee,
    addOnsPerPlayer,
    total: cents((perPlayerFee + addOnsPerPlayer) * args.players),
  };
}
