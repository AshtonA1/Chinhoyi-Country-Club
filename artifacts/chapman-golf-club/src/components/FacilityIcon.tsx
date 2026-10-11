import {
  Building2, Car, CircleDot, Dumbbell, Goal, Shapes, Target, Utensils, Waves, Wine, Zap,
  type LucideIcon,
} from 'lucide-react';
import type { FacilityIconId } from '@/data/club';

export const FACILITY_ICONS: Record<FacilityIconId, { label: string; Icon: LucideIcon }> = {
  pool: { label: 'Swimming pool', Icon: Waves },
  gym: { label: 'Gym', Icon: Dumbbell },
  squash: { label: 'Squash', Icon: Zap },
  bowling: { label: 'Bowling', Icon: Target },
  soccer: { label: 'Soccer', Icon: Goal },
  tennis: { label: 'Tennis', Icon: CircleDot },
  carwash: { label: 'Car wash', Icon: Car },
  restaurant: { label: 'Restaurant', Icon: Utensils },
  bar: { label: 'Bar', Icon: Wine },
  clubhouse: { label: 'Clubhouse', Icon: Building2 },
  generic: { label: 'Other', Icon: Shapes },
};

export function FacilityIcon({ icon, size = 24, className }: { icon: FacilityIconId; size?: number; className?: string }) {
  const { Icon } = FACILITY_ICONS[icon] ?? FACILITY_ICONS.generic;
  return <Icon size={size} strokeWidth={1.3} className={className} />;
}
