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
  timezone?: string;
}

export interface ReactionSummary {
  emoji: string;
  count: number;
  reacted: boolean;
}

export interface Submission {
  id: string;
  pactId: string;
  userId: string;
  photoUri: string;
  timestamp: string;
  verified: boolean;
  reactions?: ReactionSummary[];
}

export interface ChatMessage {
  id: string;
  pactId: string;
  userId: string;
  text: string;
  createdAt: string;
  user: User;
}

export interface StreakData {
  pactId: string;
  /** Unified streak: consecutive days/weeks where ALL participants completed. */
  currentStreak: number;
  longestStreak: number;
  /** Dates where ALL participants submitted (unified). */
  completedDates: string[];
  /** Current user's own completed dates. */
  myCompletedDates: string[];
  /** 'daily' or 'weekly' — mirrors the pact's frequency for display purposes. */
  streakType: 'daily' | 'weekly';
  /** How many participants completed today vs total. */
  todayStatus: { completed: number; total: number };
}

export interface Notification {
  id: string;
  type: 'nudge' | 'deadline_warning' | 'streak_milestone' | 'new_submission' | 'pact_invitation' | 'friend_request' | 'friend_accepted' | 'reaction' | 'chat_message';
  fromUserId?: string;
  pactId?: string;
  message: string;
  timestamp: string;
  read: boolean;
}
