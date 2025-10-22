export type {
  // Core types
  Flashcard,
  Deck,
  Player,
  Equipment,
  Monster,
  StudySessionState,
  StudySession,

  // Enums and unions
  CardPerformance,
  MonsterType,
  BattleStatus,

  // UI types
  BattleUiState,
  GameSettings,

  // API types
  ApiResponse,
  PaginatedResponse,
  DueCardsSummary,

  // Utility types
  DropItem,
  CardReview,
} from "./types";

export type { User, AuthState, LoginCredentials, RegisterCredentials, AuthError } from './types/auth';

export {
  useGameStore,
  usePlayerStats,
  useSessionStats
} from "./store/gameStore";

export { useAuthStore, useAuth } from './store/authStore';

export { SpacedRepetitionEngine } from "./algorithms/spacedRepetition";

export { PlayerService } from "./services/playerService";
export { DeckService } from "./services/deckService";
export { FlashcardService } from "./services/flashcardService";
export { RealTimeService } from "./services/realTimeService";
export { StudySessionService } from "./services/studySessionService";

export { AuthService } from './services/authService';

export { db, auth, app } from "./config/firebase";

// Utility functions
/**
 * Generate a random ID for temporary use
 */
export const generateTempId = (): string => {
  return `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Format time duration in a human readable way
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 1) return "Less than a minute";
  if (minutes < 60) return `${Math.round(minutes)} minutes`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);

  if (hours === 1) {
    return remainingMinutes > 0
      ? `1 hour ${remainingMinutes} minutes`
      : "1 hour";
  }

  return remainingMinutes > 0
    ? `${hours} hours ${remainingMinutes} minutes`
    : `${hours} hours`;
};

/**
 * Calculate XP required for a given level
 */
export const calculateRequiredXP = (level: number): number => {
  return Math.floor(100 * Math.pow(1.2, level - 1));
};

/**
 * Calculate damage based on correct answer and player stats
 */
export const calculatePlayerDamage = (
  baseAttack: number,
  isCorrect: boolean,
  streak: number = 0,
  responseTime?: number
): number => {
  if (!isCorrect) return 0;

  let damage = baseAttack;

  // Streak bonus (up to 50% bonus)
  const streakBonus = Math.min(streak * 0.1, 0.5);
  damage *= 1 + streakBonus;

  // Speed bonus (faster answers = more damage)
  if (responseTime) {
    const speedBonus =
      responseTime < 3000 ? 0.2 : responseTime < 5000 ? 0.1 : 0;
    damage *= 1 + speedBonus;
  }

  return Math.round(damage);
};

/**
 * Calculate monster damage based on wrong answer
 */
export const calculateMonsterDamage = (
  baseAttack: number,
  isCorrect: boolean,
  cardDifficulty: number = 1
): number => {
  if (isCorrect) return 0;

  // Harder cards = more damage when wrong
  return Math.round(baseAttack * cardDifficulty);
};

/**
 * Get the color string for the battle type
 */
export const getBattleTypeColor = (battleType: string): string => {
  const colors: { [key: string]: string } = {
    goblin: '#4CAF50',
    orc: '#FF9800',
    dragon: '#E53E3E',
    skeleton: '#9C27B0',
    boss: '#795548'
  };
  return colors[battleType] || '#666';
};


/**
 * Format large numbers (1000 -> 1K, 1000000 -> 1M)
 */
export const formatNumber = (num: number): string => {
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${Math.round(num / 100) / 10}K`;
  return `${Math.round(num / 100000) / 10}M`;
};

/**
 * Get relative time (e.g., "2 hours ago", "in 3 days")
 */
export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 0) return `In ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
};

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Clamp a number between min and max values
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Get a random item from an array
 */
export const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Debounce function calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Constants
export const GAME_CONSTANTS = {
  // Spaced repetition defaults
  DEFAULT_EASE_FACTOR: 2.5,
  MIN_EASE_FACTOR: 1.3,
  MAX_EASE_FACTOR: 2.5,

  // Battle system
  BASE_PLAYER_HP: 100,
  BASE_PLAYER_ATTACK: 10,
  BASE_PLAYER_DEFENSE: 5,

  // XP and progression
  BASE_XP_REQUIREMENT: 100,
  XP_GROWTH_RATE: 1.2,
  XP_PER_CORRECT_ANSWER: 10,
  XP_BONUS_PERFECT_BATTLE: 50,

  // Study limits
  DEFAULT_NEW_CARDS_PER_DAY: 20,
  MAX_NEW_CARDS_PER_DAY: 50,

  // UI timing
  DAMAGE_ANIMATION_DURATION: 1000,
  CARD_FLIP_DURATION: 300,
  BATTLE_RESULT_DELAY: 2000,

  // Monster types and their base stats
  MONSTER_STATS: {
    goblin: { hp: 30, attack: 8, xp: 15, gold: 5, defense: 0 },
    orc: { hp: 60, attack: 12, xp: 25, gold: 10, defense: 3 },
    skeleton: { hp: 80, attack: 15, xp: 35, gold: 15, defense: 5 },
    dragon: { hp: 150, attack: 20, xp: 75, gold: 30, defense: 7 },
    boss: { hp: 300, attack: 25, xp: 150, gold: 50, defense: 11 },
  },

  // Performance thresholds
  RESPONSE_TIME_THRESHOLDS: {
    fast: 3000, // < 3 seconds
    normal: 5000, // < 5 seconds
    slow: 10000, // < 10 seconds
  },
} as const;

export { useDashboardData, useDeckListData, useDataState, useDeckDetailData } from './hooks/useData';

export { useGetUserDecks, useGetDeckDetail, useAddDeckMutation } from './queries/deckQueries';

export { queryClient } from "./queries/queryClient";

// Export data state helpers
export { 
  createDataState, 
  setLoading, 
  setSuccess, 
  setError, 
  isStale 
} from './types/dataState';
export type { DataState } from './types/dataState';
export type { DailyStudyData } from './types/dailyStudy';