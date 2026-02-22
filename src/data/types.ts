export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isCurrentUser?: boolean;
}

export interface Pact {
  id: string;
  title: string;
  icon: string;
  iconFamily: 'Ionicons' | 'MaterialCommunityIcons';
  color: string;
  frequency: 'daily' | 'weekly';
  timesPerWeek?: number;
  participants: string[];
  pendingParticipants?: User[];
  createdBy?: string;
  createdAt: string;
  deadline: string;
}

export interface Submission {
  id: string;
  pactId: string;
  userId: string;
  photoUri: string;
  timestamp: string;
  verified: boolean;
}

export interface StreakData {
  pactId: string;
  userId: string;
  /** For daily pacts: consecutive days. For weekly pacts: consecutive weeks meeting the target. */
  currentStreak: number;
  longestStreak: number;
  completedDates: string[];
  /** 'daily' or 'weekly' — mirrors the pact's frequency for display purposes. */
  streakType: 'daily' | 'weekly';
}

export interface Notification {
  id: string;
  type: 'nudge' | 'deadline_warning' | 'streak_milestone' | 'new_submission' | 'pact_invitation';
  fromUserId?: string;
  pactId: string;
  message: string;
  timestamp: string;
  read: boolean;
}
