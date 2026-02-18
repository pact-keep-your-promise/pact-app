import { colors } from './theme';

export type PactIcon = {
  name: string;
  family: 'Ionicons' | 'MaterialCommunityIcons';
  color: string;
};

export const pactIcons: PactIcon[] = [
  { name: 'fitness', family: 'Ionicons', color: colors.accent1 },
  { name: 'book', family: 'Ionicons', color: colors.accent3 },
  { name: 'restaurant', family: 'Ionicons', color: colors.accent4 },
  { name: 'leaf', family: 'Ionicons', color: colors.accent2 },
  { name: 'phone-portrait-outline', family: 'Ionicons', color: colors.accent6 },
  { name: 'water', family: 'Ionicons', color: '#5B9BD5' },
  { name: 'walk', family: 'Ionicons', color: colors.accent1 },
  { name: 'bicycle', family: 'Ionicons', color: colors.accent2 },
  { name: 'musical-notes', family: 'Ionicons', color: colors.accent5 },
  { name: 'pencil', family: 'Ionicons', color: colors.accent3 },
  { name: 'code-slash', family: 'Ionicons', color: colors.accent6 },
  { name: 'bed', family: 'Ionicons', color: colors.primaryLight },
  { name: 'heart', family: 'Ionicons', color: colors.accent5 },
  { name: 'cafe', family: 'Ionicons', color: '#D4A574' },
  { name: 'camera', family: 'Ionicons', color: colors.primary },
  { name: 'globe', family: 'Ionicons', color: colors.accent2 },
  { name: 'barbell', family: 'Ionicons', color: colors.accent1 },
  { name: 'moon', family: 'Ionicons', color: colors.accent6 },
  { name: 'sunny', family: 'Ionicons', color: colors.accent3 },
  { name: 'people', family: 'Ionicons', color: colors.primary },
];
