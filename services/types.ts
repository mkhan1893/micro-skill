export interface Quiz {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  avatar: string;
  isPremium: boolean;
  isCreator: boolean;
  xp: number;
  streak: number;
  coins: number;
  level: number;
  bio?: string;
  badges?: string[];
  achievements?: string[];
  interests?: string[];
  skillLevel?: string;
  dailyGoal?: number; // in minutes: e.g. 2, 5, 10
  createdAt?: string;
}

export interface MicroLesson {
  id: string;
  title: string;
  category: string;
  description: string;
  duration: string; // e.g. "45s", "2m", "1m"
  creatorName: string;
  creatorAvatar: string;
  videoUrl?: string;
  imageBg: string;
  contentMarkdown: string;
  quiz: Quiz;
  likes: number;
  commentsCount: number;
  createdAt?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  tags?: string[];
  xpReward?: number;
  weakPointsAddressed?: string[];
  summary?: string;
  flashcard?: { front: string; back: string };
}

export interface SkillPath {
  id: string;
  title: string;
  description: string;
  lessonsCount: number;
  xpReward: number;
  progress: number; // 0 to 100
  unlocked: boolean;
  color: string;
}

export interface UserProgress {
  userId: string;
  completedLessonIds: string[];
  pathProgress: Record<string, number>; // e.g. { path_ai: 28 }
  savedLessonIds: string[];
  downloadedLessonIds: string[];
  streakCount: number;
  lastActiveDate?: string; // format YYYY-MM-DD
  weeklyActivity?: Record<string, number>; // e.g., { "Mon": 100, "Tue": 50, ... }
  updatedAt: string;
}
