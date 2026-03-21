export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  isCurrentUser?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  stats: {
    totalPacts: number;
    totalSubmissions: number;
  };
  sharedPacts: { id: string; title: string; icon: string; iconFamily: string; color: string; frequency: string }[];
  activityMap: Record<string, number>;
  friendshipStatus: 'self' | 'accepted' | 'pending' | 'declined' | 'none';
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

export interface FreezeInfo {
  /** How many freezes available to use */
  available: number;
  /** How many earned (capped at max) */
  totalEarned: number;
  /** How many used total */
  used: number;
  /** Dates when freezes were used (YYYY-MM-DD) */
  freezeDates: string[];
  /** Last freeze date or null */
  lastFreezeDate: string | null;
  /** Whether cooldown is active */
  onCooldown: boolean;
  /** Personal consecutive submission days (real submissions only) */
  personalStreak: number;
  /** Days/weeks until next freeze earned (0 if at max) */
  nextFreezeIn: number;
  /** Maximum freezes that can be banked (2 for daily, timesPerWeek+1 for weekly) */
  maxFreezes: number;
}

export interface WeeklyProgress {
  /** Days submitted this week by the current user */
  completed: number;
  /** Target days per week */
  target: number;
  /** Adjusted target for first week (pro-rated) */
  adjustedTarget: number;
  /** Whether this is the pact's first week */
  isFirstWeek: boolean;
  /** Days remaining in the current week (including today) */
  daysLeft: number;
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
  /** Freeze info for the current user. */
  freezeInfo: FreezeInfo | null;
  /** Weekly progress for the current user (weekly pacts only). */
  weeklyProgress?: WeeklyProgress;
}

export interface Notification {
  id: string;
  type: 'nudge' | 'deadline_warning' | 'streak_milestone' | 'new_submission' | 'pact_invitation' | 'friend_request' | 'friend_accepted' | 'reaction' | 'chat_message' | 'streak_freeze';
  fromUserId?: string;
  pactId?: string;
  message: string;
  timestamp: string;
  read: boolean;
}
