import {
  Flashcard,
  CardPerformance,
  DueCardsSummary,
  MonsterType,
  NewCardData,
} from "../types";

/**
 * SM-2 Space Repetition Algorithm
 * Based on the SuperMemo 2 algorithm by Piotr Wozniak
 */

export class SpacedRepetitionEngine {
  /**
   * Calculate the next review date and update card paramaters
   * base on user performance
   */
  static updateCard(card: Flashcard, performance: CardPerformance): Flashcard {
    const now = new Date();
    let { interval, repetitions, easeFactor } = card;

    // Update ease factor based on performance
    easeFactor = this.calculateEaseFactor(easeFactor, performance);

    // Calculate new interval based on performance
    switch (performance) {
      case "again":
        // Reset this card - state over
        interval = 1;
        repetitions = 0;
        break;
      case "hard":
        interval = Math.max(1, Math.floor(interval * 0.8));
        repetitions += 1;
        break;
      case "good":
        interval = this.calculateInterval(interval, repetitions, easeFactor);
        repetitions += 1;
        break;
      case "easy":
        // Longer interval, higher ease factor
        interval =
          this.calculateInterval(interval, repetitions, easeFactor) * 1.3;
        repetitions += 1;
        easeFactor = Math.min(easeFactor + 0.1, 2.5); // Cap at 2.5
        break;
    }

    // Calculate next review date
    const nextReviewDate = new Date(now);
    nextReviewDate.setDate(nextReviewDate.getDate() + Math.round(interval));

    return {
      ...card,
      interval: Math.round(interval),
      repetitions,
      easeFactor: Math.round(easeFactor * 100) / 100, // Round to 2 decimal places
      nextReviewDate,
      lastReviewed: now,
    };
  }

  /**
   * Calculate new ease factor based on performance
   */
  private static calculateEaseFactor(
    currentEase: number,
    performance: CardPerformance
  ): number {
    let newEase = currentEase;

    switch (performance) {
      case "again":
        newEase = Math.max(1.3, currentEase - 0.2);
        break;
      case "hard":
        newEase = Math.max(1.3, currentEase - 0.15);
        break;
      case "good":
        // No change
        break;
      case "easy":
        newEase = Math.min(2.5, currentEase + 0.1);
        break;
    }

    return newEase;
  }

  /**
   * Calculate the next interval using SM-2 formale
   */
  private static calculateInterval(
    currentInterval: number,
    repetitions: number,
    easeFactor: number
  ): number {
    if (repetitions === 0) {
      return 1;
    } else if (repetitions === 1) {
      return 6;
    } else {
      return Math.round(currentInterval * easeFactor);
    }
  }

  /**
   * Get all cards that are due for review
   */
  static getDueCards(
    cards: Flashcard[],
    includeNew: boolean = true
  ): Flashcard[] {
    const now = new Date();
    now.setHours(23, 59, 59, 999); // End of today

    return cards.filter((card) => {
      // Include new cards (never reviewed)
      if (includeNew && card.repetitions === 0 && !card.lastReviewed) {
        return true;
      }

      // Include cards due for review
      return card.nextReviewDate <= now;
    });
  }

  /**
   * Get cards that should be introduced as "new" cards today
   */
  static getNewCards(
    cards: Flashcard[],
    dailyNewCardLimit: number
  ): Flashcard[] {
    const newCards = cards.filter((card) => {
      return card.repetitions === 0 && !card.lastReviewed;
    });

    return newCards.slice(0, dailyNewCardLimit);
  }

  /**
   * Get cards due for review (excluding new cards)
   */
  static getReviewCards(cards: Flashcard[]): Flashcard[] {
    const now = new Date();
    now.setHours(23, 59, 59, 999); // End of today

    return cards.filter((card) => {
      return card.repetitions > 0 && card.nextReviewDate <= now;
    });
  }

  /**
   * Generate a summary of due cards for battle planning
   */
  static getDueCardsSummary(
    cards: Flashcard[],
    dailyNewCardLimit: number = 20
  ): DueCardsSummary {
    const newCards = this.getNewCards(cards, dailyNewCardLimit);
    const reviewCards = this.getReviewCards(cards);
    const totalDue = newCards.length + reviewCards.length;

    const estimatedTime = Math.round(totalDue * 0.5);

    let recommendedBattleType: MonsterType;
    if (totalDue <= 5) {
      recommendedBattleType = "goblin";
    } else if (totalDue <= 15) {
      recommendedBattleType = "orc";
    } else if (totalDue <= 30) {
      recommendedBattleType = "dragon";
    } else if (totalDue <= 50) {
      recommendedBattleType = "skeleton";
    } else {
      recommendedBattleType = "boss";
    }

    return {
      totalDue,
      newCards: newCards.length,
      reviewCards: reviewCards.length,
      estimatedTime,
      recommendedBattleType,
    };
  }

  /**
   * Mix new and review cards for optimal learning
   */
  static createStudyQueue(
    cards: Flashcard[],
    dailyNewCardLimit: number = 20
  ): Flashcard[] {
    const newCards = this.getNewCards(cards, dailyNewCardLimit);
    const reviewCards = this.getReviewCards(cards);

    // Mix new and review cards
    const studyQueue: Flashcard[] = [];
    const maxLength = Math.max(newCards.length, reviewCards.length);

    for (let i = 0; i < maxLength; i++) {
      // Add review card first (prioritize retention)
      if (i < reviewCards.length) {
        studyQueue.push(reviewCards[i]);
      }

      // Then add new card
      if (i < newCards.length) {
        studyQueue.push(newCards[i]);
      }
    }

    return studyQueue;
  }

  /**
   * Initialize a new card with default SM-2 parameters
   */
  static initializeNewCard(cardData: NewCardData): Omit<Flashcard, 'id'> {
    const now = new Date();

    return {
      ...cardData,
      interval: 1,
      repetitions: 0,
      easeFactor: 2.5, // Default ease factor
      nextReviewDate: now,
    };
  }

  /**
   * Calculate retention rate for a set of cards
   */
  static calculateRetentionRate(cards: Flashcard[]): number {
    const reviewedCards = cards.filter((card) => card.repetitions > 0);

    if (reviewedCards.length === 0) return 0;

    // Cards with ease factor >= 2.5 are considered "retained"
    const retainedCards = reviewedCards.filter(
      (card) => card.easeFactor >= 2.5
    );

    return (retainedCards.length / reviewedCards.length) * 100;
  }

  /**
   * Get study statistics for progress tracking
   */
  static getStudyStats(cards: Flashcard[]) {
    const totalCards = cards.length;
    const newCards = cards.filter((card) => card.repetitions === 0).length;
    const learningCards = cards.filter(
      (card) => card.repetitions > 0 && card.repetitions < 3
    ).length;
    const matureCards = cards.filter((card) => card.repetitions >= 3).length;
    const dueToday = this.getDueCards(cards).length;

    return {
      totalCards,
      newCards,
      learningCards,
      matureCards,
      dueToday,
      retentionRate: this.calculateRetentionRate(cards),
    };
  }
}
