export interface Flashcard {
    id: string;
    front: string;
    back: string;
    deckId: string;
    createdAt: Date;

    // Space repetition stuff
    interval: number;
    repetitions: number;
    easeFactor: number;
    nextReviewDate: Date;
    lastReviewed?: Date;
}

// Type for creating new card 
export type NewCardData = Omit<Flashcard, 'interval' | 'repetitions' | 'easeFactor' | 'nextReviewDate' | 'id'>;

export interface Deck {
    id: string;
    name: string;
    description?: string;
    userId: string;
    createdAt: Date;
    isActive: boolean;
    totalCards: number;
    newCardsPerDay: number;
    color?: string;
}

export interface DeckDetail {
    deck: Deck;
    cards: Flashcard[];
}

export type CardPerformance = 'again' | 'hard' | 'good' | 'easy';

export interface CardReview {
    cardId: string;
    performance: CardPerformance;
    responseTime: number;
    timestamp: Date;
}

export interface Player {
    id: string;
    userId: string;
    name: string;
    level: number;
    currentXp: number;
    requiredXp: number;

    // Combat stats
    maxHp: number;
    currentHp: number;
    attackPower: number;
    defense: number;

    gold: number;

    // Equipment
    weapon?: Equipment;
    armor?: Equipment;
    accessorty?: Equipment;

    abilities: string[];

    totalCardsStudied: number;
    studyStreak: number;
    perfectBattles: number;
    createdAt: Date;
}

export interface Equipment {
    id: string;
    name: string;
    type: "weapon" | "armor" | "accessory";
    rarity: "common" | "rare" | "epic" | "legendary";
    attackBonus?: number;
    defenseBonus?: number;
    hpBonus?: number;
    specialEffect?: string;
    description: string;
}

export interface Monster {
    id: string;
    name: string;
    level: number;
    maxHp: number;
    currentHp: number;
    attackPower: number;
    defense: number;
    xpReward: number;
    goldReward: number;

    sprite?: string;
    description: string;
    type: MonsterType;
}

export type MonsterType = "slime" | "goblin" | "orc" | "dragon" | "skeleton" | "boss";

export interface DropItem {
    equipmentId: string;
    dropChance: number;
}

export type SessionType = 'daily' | 'custom';
export type SessionStatus = 'active' | 'victory' | 'defeat' | 'abandoned';

export interface MonsterEncounter {
    monster: Monster;
    startTime: Date;
    endTime?: Date;
    killed: boolean;
}

export interface StudySession {
    id: string;
    userId: string;
    startTime: Date;
    endTime: Date | null;

    // Session metadata
    sessionType: SessionType;
    difficultyTier?: 'easy' | 'medium' | 'hard' | 'boss'; // For custom sessions

    // Study cards for this session
    cards: Flashcard[];
    currentCardIndex: number;
    cardReviews: CardReview[];

    // Current monster encounter
    currentMonster?: Monster;

    // Monster kill tracking
    monstersKilled: Monster[];

    // Player state for this session
    playerStartingHp: number;
    playerCurrentHp: number;

    // Session status
    status: SessionStatus;

    // Final rewards (calculated at the end)
    totalXpEarned?: number;
    totalGoldEarned?: number;
}

export type BattleStatus = 'active' | 'victory' | 'defeat' | 'fled';

export interface BattleUiState {
    showDamageNumbers: boolean;
    animatingAttack: boolean;
    showCardResult: boolean;
    lastDamage?: {
        amount: number;
        type: 'player' | 'monster';
        timestamp: number;
    }
}

export interface GameSettings {
    soundEnabled: boolean;
    musicEnabled: boolean;
    animationSpeed: 'slow' | 'normal' | 'fast';
    showHints: boolean;
    autoRevealAnswer: boolean;
    dailyGoal: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: Date;
}

export interface PaginatedResponse<T> {
    items: T[];
    totalCount: number;
    hasNextPage: boolean;
    nextCursor?: string;
}

export interface DueCardsSummary {
    totalDue: number;
    newCards: number;
    reviewCards: number;
    estimatedTime: number;
    recommendedBattleType: MonsterType;
}