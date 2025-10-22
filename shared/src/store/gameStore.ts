import { create } from "zustand";
import {
  Player,
  Deck,
  Flashcard,
  GameSettings,
  BattleUiState,
  DeckDetail,
  StudySessionState,
  SessionType,
  StudySession,
  MonsterEncounter,
  CardReview,
} from "../types";
import { PlayerService } from "../services/playerService";
import { DeckService } from "../services/deckService";
import { FlashcardService } from "../services/flashcardService";
import { DailyStudyData } from "../types/dailyStudy";
import {
  createDataState,
  DataState,
  isStale,
  setError,
  setLoading,
  setSuccess,
} from "../types/dataState";
import { SpacedRepetitionEngine } from "../algorithms/spacedRepetition";
import {
  createMonster,
  DIFFICULTY_TO_MONSTER,
  getMonsterTypeForLevel,
  MONSTER_TEMPLATES,
} from "../data/monsters";

interface GameStore {
  player: Player | null;
  isPlayerLoading: boolean;
  playerData: DataState<Player>;

  // Global game breaking error
  error: string;

  dashboardData: DataState<DailyStudyData>;
  decksData: DataState<Deck[]>;
  deckDetailData: DataState<DeckDetail>;

  currentSession: StudySessionState | null;

  settings: GameSettings;

  /**
   * Dashboard actions
   */
  loadDashboard: () => Promise<void>;
  refreshDashboard: () => Promise<void>;

  /**
   * Deck actions
   */
  loadDecks: () => Promise<void>;
  createDeck: (
    deckData: Omit<Deck, "id" | "userId" | "createdAt" | "totalCards">
  ) => Promise<Deck | null>;
  updateDeck: (deckId: string, updates: Partial<Deck>) => Promise<void>;
  deleteDeck: (deckId: string) => Promise<void>;
  updateDeckCardCount: (deckId: string) => Promise<void>;

  /**
   * Deck detail actions
   */
  loadDeckDetail: (deckId: string) => Promise<void>;

  /**
   * Card actions
   */
  createCard: (
    deckId: string,
    cardData: { front: string; back: string }
  ) => Promise<boolean>;
  updateCard: (
    cardId: string,
    updates: { front?: string; back?: string }
  ) => Promise<boolean>;
  deleteCard: (deckId: string, cardId: string) => Promise<boolean>;

  /**
   * Study session actions
   */
  startStudySession: (
    cards: Flashcard[],
    sessionType: SessionType,
    difficultyTier?: "easy" | "medium" | "hard" | "boss"
  ) => void;
  submitAnswer: (
    isCorrect: boolean,
    responseTime?: number
  ) => { monsterKilled: boolean } | undefined;
  spawnNextMonster: () => void;
  abandonSession: () => void;
  completeSession: () => Promise<void>;

  /***
   * Player actions
   */
  loadPlayer: (userId: string) => Promise<void>;
  updatePlayer: (updates: Partial<Player>) => void;
  gainXp: (amount: number) => void;

  /***
   * Utility
   */
  initializeForUser: (userId: string) => Promise<void>;
  resetGameData: () => void;
}

const createDefaultPlayer = (userId: string, displayName?: string): Player => ({
  id: "",
  userId,
  name: displayName || "Hero",
  level: 1,
  currentXp: 0,
  requiredXp: 100,
  maxHp: 100,
  currentHp: 100,
  attackPower: 10,
  defense: 5,
  gold: 0,
  abilities: [],
  totalCardsStudied: 0,
  studyStreak: 0,
  perfectBattles: 0,
  createdAt: new Date(),
});

const defaultSettings: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  animationSpeed: "normal",
  showHints: true,
  autoRevealAnswer: false,
  dailyGoal: 25,
};

const defaultBattleUi: BattleUiState = {
  showDamageNumbers: false,
  animatingAttack: false,
  showCardResult: false,
};

let saveTimeout: NodeJS.Timeout | null = null;

const debouncedSave = (saveFunction: () => Promise<void>, delay = 1000) => {
  if (saveTimeout) {
    console.log("Clearing old timeout");
    clearTimeout(saveTimeout);
  }
  console.log("Setting timeout");

  saveTimeout = setTimeout(() => {
    console.log("TIMEOUT TRIGGERED");
    saveFunction().catch(console.error);
  }, delay);
};

const levelPlayerUp = (player: Player): Partial<Player> => {
  const newLevel = player.level + 1;
  const newRequireXp = Math.floor(100 * Math.pow(1.2, newLevel - 1));

  const updates = {
    level: newLevel,
    currentXp: player.currentXp - player.requiredXp,
    requiredXp: newRequireXp,
    maxHp: player.maxHp + 10,
    currentHp: player.maxHp + 10, // full heal on level up
    attackPower: player.attackPower + 2,
    defense: player.defense + 1,
  };

  return updates;
};

export const useGameStore = create<GameStore>((set, get) => ({
  player: null,

  playerData: createDataState<Player>(),
  isPlayerLoading: false,

  error: "",

  dashboardData: createDataState<DailyStudyData>(),
  decksData: createDataState<Deck[]>(),
  deckDetailData: createDataState<DeckDetail>(),

  currentSession: null,

  settings: {
    soundEnabled: true,
    musicEnabled: true,
    animationSpeed: "normal",
    showHints: true,
    autoRevealAnswer: false,
    dailyGoal: 25,
  },

  /***
   * Dashboard actions
   */
  loadDashboard: async () => {
    const { playerData, dashboardData } = get();

    // Don't reload if already loading
    if (dashboardData.isLoading) return;

    // Don't reload if fresh data exists
    if (dashboardData.data && !isStale(dashboardData.lastUpdated)) {
      return;
    }

    const player = playerData.data;

    if (!player) return;

    set({ dashboardData: setLoading(dashboardData) });

    try {
      const decksResponse = await DeckService.getUserDecks(player.userId);
      const decks = decksResponse.data || [];

      const cardsResponse = await FlashcardService.getAllUserCards(
        player.userId
      );
      const cards = cardsResponse.data || [];

      const activeDeckIds = decks.filter((d) => d.isActive).map((d) => d.id);
      const activeCards = cards.filter((c) => activeDeckIds.includes(c.deckId));

      const summary = SpacedRepetitionEngine.getDueCardsSummary(
        activeCards,
        20
      );
      const dueCards = SpacedRepetitionEngine.createStudyQueue(activeCards, 20);
      const stats = SpacedRepetitionEngine.getStudyStats(cards);

      const activeDecksWithDue = decks
        .filter((d) => d.isActive)
        .map((deck) => {
          const deckCards = cards.filter((c) => c.deckId === deck.id);
          const deckDueCards = SpacedRepetitionEngine.createStudyQueue(
            deckCards,
            deck.newCardsPerDay || 20
          );
          const allDueCards = SpacedRepetitionEngine.getDueCards(deckCards);

          return {
            deck,
            dueToday: deckDueCards.length,
            totalDue: allDueCards.length,
          };
        });

      const dailyData: DailyStudyData = {
        dueCards,
        summary,
        stats,
        activeDecksWithDue,
      };

      set({ dashboardData: setSuccess(dailyData) });
    } catch (error: any) {
      set({
        dashboardData: setError(error.message || "Failed to load dashboard"),
      });
    }
  },
  refreshDashboard: async () => {
    // Force reload by clearing state first
    set({ dashboardData: createDataState<DailyStudyData>() });
    await get().loadDashboard();
  },

  /***
   * Deck actions
   */
  loadDecks: async () => {
    const { playerData, decksData } = get();

    if (decksData.isLoading) return;

    const player = playerData.data;

    if (!player) return;

    set({ decksData: setLoading(decksData) });

    try {
      const response = await DeckService.getUserDecks(player.userId);
      const decks = response.data || [];

      const decksWithCounts = await Promise.all(
        decks.map(async (deck: any) => {
          const cardsResponse = await FlashcardService.getDeckCards(deck.id);
          const totalCards = cardsResponse.success
            ? cardsResponse.data?.length || 0
            : 0;

          if (deck.totalCards !== totalCards) {
            await DeckService.updateDeck(deck.id, { totalCards });
          }

          return { ...deck, totalCards };
        })
      );

      set({ decksData: setSuccess(decksWithCounts) });
    } catch (error: any) {
      set({ decksData: setError(error.message || "Failed to load decks") });
    }
  },
  createDeck: async (deckData) => {
    const { playerData } = get();

    if (!playerData || !playerData.data) return null;

    const player = playerData.data;

    try {
      const response = await DeckService.createDeck({
        ...deckData,
        userId: player.userId,
        createdAt: new Date(),
        totalCards: 0,
      });

      if (response.success && response.data) {
        // Refresh decks list
        await get().loadDecks();
        return response.data;
      }

      return null;
    } catch (error) {
      console.error("Failed to creat deck: ", error);
      return null;
    }
  },
  updateDeck: async (deckId, updates) => {
    try {
      await DeckService.updateDeck(deckId, updates);
      await get().loadDecks();
    } catch (error) {
      console.error("Failed to update deck: ", error);
    }
  },
  deleteDeck: async (deckId) => {
    try {
      await DeckService.deleteDeck(deckId);
      // Refresh decks
      await get().loadDecks();
    } catch (error) {
      console.error("Failed to delete deck: ", error);
    }
  },
  updateDeckCardCount: async (deckId: string) => {
    try {
      const cardsResponse = await FlashcardService.getDeckCards(deckId);
      const totalCards = cardsResponse.success
        ? cardsResponse.data?.length || 0
        : 0;

      // Update in firebase
      await DeckService.updateDeck(deckId, { totalCards });

      await get().loadDecks();
    } catch (error) {
      console.error("Failed to update deck card count: ", error);
    }
  },

  /**
   * Deck Detail actions
   */
  loadDeckDetail: async (deckId: string) => {
    const { deckDetailData, playerData } = get();

    // Don't reload if same deck and fresh
    if (
      deckDetailData.data?.deck.id === deckId &&
      !isStale(deckDetailData.lastUpdated)
    ) {
      return;
    }

    const player = playerData.data;

    if (!player) return;

    set({ deckDetailData: setLoading(deckDetailData) });

    await get().loadDecks();

    const { decksData } = get();

    if (!decksData.data) return;

    if (deckId === "") {
      // Keep it loading if the deck ID is ""
      return;
    }

    try {
      if (!player || !player.userId) {
        throw new Error("Not logged in");
      }

      const deck = decksData.data?.find((d) => d.id === deckId);

      if (!deck) {
        throw new Error("Deck not found!");
      }

      // Load cards
      const cardsResponse = await FlashcardService.getDeckCards(deckId);
      const cards = cardsResponse.data || [];

      set({
        deckDetailData: setSuccess({
          deck: deck,
          cards,
        }),
      });
    } catch (error: any) {
      set({
        deckDetailData: setError(error.message || "Failed to load deck"),
      });
    }
  },

  /***
   * Card actions
   */
  createCard: async (
    deckId: string,
    cardData: { front: string; back: string }
  ) => {
    try {
      const newCard = SpacedRepetitionEngine.initializeNewCard({
        front: cardData.front,
        back: cardData.back,
        deckId,
        createdAt: new Date(),
      });

      const response = await FlashcardService.createCard(newCard);

      if (response.success && response.data) {
        // Update deck card count
        await get().updateDeckCardCount(deckId);

        // Refresh deck detail if it's current loaded
        const { deckDetailData } = get();
        if (deckDetailData.data?.deck.id === deckId) {
          await get().loadDeckDetail(deckId);
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error("Failed to create card: ", error);
      return false;
    }
  },
  updateCard: async (
    cardId: string,
    updates: { front?: string; back?: string }
  ) => {
    try {
      const response = await FlashcardService.updateCard(cardId, updates);

      if (response.success) {
        const { deckDetailData } = get();
        if (deckDetailData.data) {
          await get().loadDeckDetail(deckDetailData.data.deck.id);
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error("Failed to update card: ", error);
      return false;
    }
  },
  deleteCard: async (deckId: string, cardId: string) => {
    try {
      const response = await FlashcardService.deleteCard(cardId);

      if (response.success) {
        // Update deck card count
        await get().updateDeckCardCount(deckId);

        const { deckDetailData } = get();
        if (deckDetailData.data?.deck.id === deckId) {
          await get().loadDeckDetail(deckId);
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error("Failed to delete card: ", error);
      return false;
    }
  },

  /***
   * Battle actions
   */
  startStudySession: (
    cards: Flashcard[],
    sessionType: SessionType,
    difficultyTier: "easy" | "medium" | "hard" | "boss" = "medium"
  ) => {
    const { playerData } = get();
    const player = playerData.data;

    if (!player) {
      console.error("Cannot start session without player");
      return;
    }

    if (cards.length === 0) {
      console.error("Cannot start session with no cards");
      return;
    }

    // Create initial sessions state
    let session: StudySessionState = {
      id: `session-${Date.now()}`,
      userId: player.userId,
      startTime: new Date(),
      sessionType,
      difficultyTier,
      cards,
      currentCardIndex: 0,
      cardReviews: [],
      currentMonster: null,
      monstersEncountered: [],
      monstersKilled: 0,
      playerStartingHp: player.currentHp,
      playerCurrentHp: player.currentHp,
      status: "active",
    };

    // Spawn first monster
    session = spawnMonster(session, player);

    set({ currentSession: session });
  },
  submitAnswer: (isCorrect: boolean, responseTime: number = 0) => {
    const { currentSession, playerData } = get();
    const player = playerData.data;

    if (!currentSession || !player) return;

    if (currentSession.status !== "active") {
      console.warn("Cannot submit answer - session not active");
      return;
    }

    const currentCard = currentSession.cards[currentSession.currentCardIndex];
    if (!currentCard) {
      console.error("No current card");
      return;
    }

    // Record card review
    const review: CardReview = {
      cardId: currentCard.id,
      performance: isCorrect ? "good" : "again",
      responseTime,
      timestamp: new Date(),
    };

    let updatedSession = {
      ...currentSession,
      cardReviews: [...currentSession.cardReviews, review],
    };

    let monsterKilled = false;

    // Handle combat
    if (isCorrect) {
      // Player attacks monster
      const damage = calculateDamage(player.attackPower, true);

      if (updatedSession.currentMonster) {
        const newMonsterHp = Math.max(
          0,
          updatedSession.currentMonster.monster.currentHp - damage
        );

        // Update current monster HP
        const updatedMonster = {
          ...updatedSession.currentMonster,
          monster: {
            ...updatedSession.currentMonster.monster,
            currentHp: newMonsterHp,
          },
        };

        // Check if monster died
        if (newMonsterHp <= 0) {
          monsterKilled = true;
          updatedMonster.killed = true;
          updatedMonster.endTime = new Date();

          // Update monsters encountered list
          const updatedEncounters = updatedSession.monstersEncountered.map(
            (enc) => {
              return enc.monster.id === updatedMonster.monster.id
                ? updatedMonster
                : enc;
            }
          );

          updatedSession = {
            ...updatedSession,
            currentMonster: updatedMonster,
            monstersEncountered: updatedEncounters,
            monstersKilled: updatedSession.monstersKilled + 1,
          };
        } else {
          // Monster still alive, just update HP
          const updatedEncounters = updatedSession.monstersEncountered.map(
            (enc) => {
              return enc.monster.id === updatedMonster.monster.id
                ? updatedMonster
                : enc;
            }
          );

          updatedSession = {
            ...updatedSession,
            currentMonster: updatedMonster,
            monstersEncountered: updatedEncounters,
          };
        }
      }
    } else {
      // Monster attacks player
      const monsterDamage =
        updatedSession.currentMonster?.monster.attackPower || 0;
      const newPlayerHp = Math.max(
        0,
        updatedSession.playerCurrentHp - monsterDamage
      );

      updatedSession = {
        ...updatedSession,
        playerCurrentHp: newPlayerHp,
      };

      // Check if player died
      if (newPlayerHp <= 0) {
        updatedSession.status = "defeat";
        updatedSession.endTime = new Date();
      }
    }

    // Move to next card is session still active
    if (updatedSession.status === "active") {
      const nextIndex = updatedSession.currentCardIndex + 1;

      if (nextIndex >= updatedSession.cards.length) {
        // All cards completed - session victory!
        updatedSession.status = "victory";
        updatedSession.endTime = new Date();
      } else {
        updatedSession.currentCardIndex = nextIndex;
      }
    }

    set({ currentSession: updatedSession });

    if (updatedSession.status !== "active") {
      get().completeSession();
    }

    return { monsterKilled };
  },
  spawnNextMonster: () => {
    const { currentSession, playerData } = get();
    const player = playerData.data;

    if (!currentSession || !player) return;

    // Spawn the next mosnter
    const updatedSession = spawnMonster(currentSession, player);
    set({ currentSession: updatedSession });
  },
  abandonSession: () => {
    const { currentSession } = get();
    if (!currentSession) return;

    const updatedSession: StudySessionState = {
      ...currentSession,
      status: "abandoned",
      endTime: new Date(),
    };

    set({ currentSession: null });

    console.log("Session abandoned - no rewards granted");
  },
  completeSession: async () => {
    const { currentSession, playerData } = get();
    const player = playerData.data;

    if (!currentSession || !player) return;

    try {
      // Calculate rewards based on monsters killed
      let totalXp = 0;
      let totalGold = 0;

      const killedMonsters = currentSession.monstersEncountered.filter(
        (enc) => enc.killed
      );

      killedMonsters.forEach((enc) => {
        totalXp += enc.monster.xpReward;
        totalGold += enc.monster.goldReward;
      });

      // Half rewards if player died
      if (currentSession.status === "defeat") {
        totalXp = Math.floor(totalXp * 0.5);
        totalGold = Math.floor(totalGold * 0.5);
      }

      // Update session with final rewards
      const updatedSession = {
        ...currentSession,
        totalXpEarned: totalXp,
        totalGoldEarned: totalGold,
      };

      set({ currentSession: updatedSession });

      // Update card reviews with spaced repetition
      const cardUpdatePromises = currentSession.cardReviews.map(
        async (review) => {
          const card = currentSession.cards.find((c) => c.id === review.cardId);
          if (!card) return;

          const updatedCard = SpacedRepetitionEngine.updateCard(
            card,
            review.performance
          );

          try {
            await FlashcardService.updateCard(review.cardId, {
              interval: updatedCard.interval,
              repetitions: updatedCard.repetitions,
              easeFactor: updatedCard.easeFactor,
              nextReviewDate: updatedCard.nextReviewDate,
              lastReviewed: updatedCard.lastReviewed,
            });
          } catch (error) {
            console.error("Failed to update card: ", error);
          }
        }
      );

      await Promise.all(cardUpdatePromises);

      // Update player stats
      const updatedPlayer = {
        ...player,
        currentHp: currentSession.playerCurrentHp,
        gold: player.gold + totalGold,
        currentXp: player.currentXp + totalXp,
        totalCardsStudied:
          player.totalCardsStudied + currentSession.cards.length,
      };

      // Check for level up
      if (updatedPlayer.currentXp >= updatedPlayer.requiredXp) {
        const levelUpUpdates = levelPlayerUp(updatedPlayer);
        Object.assign(updatedPlayer, levelUpUpdates);
      }

      // Save player to database
      await PlayerService.updatePlayer(player.id, {
        currentHp: updatedPlayer.currentHp,
        gold: updatedPlayer.gold,
        currentXp: updatedPlayer.currentXp,
        level: updatedPlayer.level,
        requiredXp: updatedPlayer.requiredXp,
        maxHp: updatedPlayer.maxHp,
        attackPower: updatedPlayer.attackPower,
        defense: updatedPlayer.defense,
        totalCardsStudied: updatedPlayer.totalCardsStudied,
      });

      set({
        player: updatedPlayer,
      });

      console.log(
        `Session complete! Earned ${totalXp} XP and ${totalGold} gold`
      );
    } catch (error) {
      console.error("Failed to complete session: ", error);
    }
  },

  /***
   * Player actions
   */
  loadPlayer: async (userId: string) => {
    const { playerData } = get();

    if (
      playerData.isLoading ||
      (playerData.data && !isStale(playerData.lastUpdated))
    ) {
      return;
    }

    set({ playerData: setLoading(playerData) });

    try {
      const response = await PlayerService.getPlayer(userId);

      if (response.success && response.data) {
        set({ playerData: setSuccess(response.data) });
      } else {
        // Create new player
        const newPlayer: Omit<Player, "id"> = {
          userId,
          name: "Hero",
          level: 1,
          currentXp: 0,
          requiredXp: 100,
          maxHp: 100,
          currentHp: 100,
          attackPower: 10,
          defense: 5,
          gold: 0,
          abilities: [],
          totalCardsStudied: 0,
          studyStreak: 0,
          perfectBattles: 0,
          createdAt: new Date(),
        };

        const createResponse = await PlayerService.createPlayer(newPlayer);

        if (createResponse.success && createResponse.data) {
          set({ playerData: setSuccess(createResponse.data) });
        } else {
          throw new Error("failed to create player");
        }
      }
    } catch (error: any) {
      set({ playerData: setError(error.meesage || "failed to load player") });
    }
  },
  updatePlayer: (updates) => {
    const { player } = get();
    if (!player) return;
    set({ player: { ...player, ...updates } });
  },

  gainXp: (amount) => {
    // TODO: Implement with level-up logic
    console.log("Gain XP: ", amount);
  },

  /***
   * Utility
   */
  initializeForUser: async (userId: string) => {
    await get().loadPlayer(userId);
  },
  resetGameData: () => {
    set({
      player: null,
      dashboardData: createDataState<DailyStudyData>(),
      decksData: createDataState<Deck[]>(),
      currentSession: null,
    });
  },
}));

/**
 * Simplified damage calculation
 * @param attackPower character's attack power
 * @param isCorrect was the answer correct
 * @returns the damage to be done
 */
const calculateDamage = (attackPower: number, isCorrect: boolean): number => {
  if (!isCorrect) return 0;
  return attackPower;
};

const spawnMonster = (
  session: StudySessionState,
  player: Player
): StudySessionState => {
  const { sessionType, difficultyTier } = session;

  // Determine monster type
  let monsterType: string;
  if (sessionType == "daily") {
    monsterType = getMonsterTypeForLevel(player.level);
  } else {
    // Custom session - use difficulty tier
    monsterType = DIFFICULTY_TO_MONSTER[difficultyTier || "medium"];
  }

  const template = MONSTER_TEMPLATES[monsterType];
  if (!template) {
    console.error(`Monster template not found: ${monsterType}`);
    return session;
  }

  const monster = createMonster(template, player.level);

  const encounter: MonsterEncounter = {
    monster,
    startTime: new Date(),
    killed: false,
  };

  return {
    ...session,
    currentMonster: encounter,
    monstersEncountered: [...session.monstersEncountered, encounter],
  };
};

// Computed values that components can use
export const usePlayerStats = () => {
  const player = useGameStore((state) => state.player);

  if (!player) return null;

  return {
    healthPercentage: (player.currentHp / player.maxHp) * 100,
    xpPercentage: (player.currentXp / player.requiredXp) * 100,
    isAlive: player.currentHp > 0,
    canLevelUp: player.currentXp >= player.requiredXp,
  };
};

export const useSessionStats = () => {
  const session = useGameStore((state) => state.currentSession);

  if (!session) return null;

  const currentCard = session.cards[session.currentCardIndex];
  const currentMonster = session.currentMonster?.monster;

  return {
    // Player stats
    playerHealthPercentage:
      session.playerStartingHp > 0
        ? (session.playerCurrentHp / session.playerStartingHp) * 100
        : 0,
    playerCurrentHp: session.playerCurrentHp,
    playerMaxHp: session.playerStartingHp,

    // Monster stats
    monsterHealthPercentage: currentMonster
      ? (currentMonster.currentHp / currentMonster.maxHp) * 100
      : 0,
    monsterCurrentHp: currentMonster?.currentHp || 0,
    monsterMaxHp: currentMonster?.maxHp || 0,
    monsterName: currentMonster?.name || "",
    monsterSprite: currentMonster?.sprite || "❓",
    monsterLevel: currentMonster?.level || 0,

    // Card/session progress
    currentCard,
    currentCardIndex: session.currentCardIndex,
    totalCards: session.cards.length,
    cardsRemaining: session.cards.length - session.currentCardIndex,

    // Session info
    monstersKilled: session.monstersKilled,
    sessionStatus: session.status,
    isSessionActive: session.status === "active",
    isSessionOver: session.status !== "active",
  };
};
