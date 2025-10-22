import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
} from "firebase/firestore";

import { Flashcard, ApiResponse } from "../types";
import {
  COLLECTIONS,
  prepareForFirestore,
  processFromFirestore,
} from "./firebaseService";
import { db } from "../config/firebase";
import { DeckService } from "./deckService";

export class FlashcardService {
  static async getDeckCards(deckId: string): Promise<ApiResponse<Flashcard[]>> {
    try {
      const cardsQuery = query(
        collection(db, COLLECTIONS.FLASHCARDS),
        where("deckId", "==", deckId)
      );

      const snapshot = await getDocs(cardsQuery);
      const cards = snapshot.docs.map(
        (doc) =>
          processFromFirestore({ id: doc.id, ...doc.data() }) as Flashcard
      );

      return { success: true, data: cards, timestamp: new Date() };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get cards: ${error}`,
        timestamp: new Date(),
      };
    }
  }

  static async getAllUserCards(
    userId: string
  ): Promise<ApiResponse<Flashcard[]>> {
    try {
      // First get user's decks
      const decksResponse = await DeckService.getUserDecks(userId);
      if (!decksResponse.success || !decksResponse.data) {
        return {
          success: false,
          error: "Failed to get user decks",
          timestamp: new Date(),
        };
      }

      const deckIds = decksResponse.data.map((deck) => deck.id);

      if (deckIds.length === 0) {
        return { success: true, data: [], timestamp: new Date() };
      }

      // Next get all cards from decks
      const cardsQuery = query(
        collection(db, COLLECTIONS.FLASHCARDS),
        where("deckId", "in", deckIds)
      );

      const snapshot = await getDocs(cardsQuery);
      const cards = snapshot.docs.map(
        (doc) =>
          processFromFirestore({
            id: doc.id,
            ...doc.data(),
          }) as Flashcard
      );

      return { success: true, data: cards, timestamp: new Date() };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get user cards: ${error}`,
        timestamp: new Date(),
      };
    }
  }

  static async createCard(
    cardData: Omit<Flashcard, "id">
  ): Promise<ApiResponse<Flashcard>> {
    try {
      const preparedData = prepareForFirestore(cardData);
      const docRef = await addDoc(
        collection(db, COLLECTIONS.FLASHCARDS),
        preparedData
      );

      const newCard: Flashcard = {
        ...cardData,
        id: docRef.id,
      };

      return { success: true, data: newCard, timestamp: new Date() };
    } catch (error) {
      return {
        success: false,
        error: `Failed to created card: ${error}`,
        timestamp: new Date(),
      };
    }
  }

  static async updateCard(
    cardId: string,
    updates: Partial<Flashcard>
  ): Promise<ApiResponse<void>> {
    try {
      const cardRef = doc(db, COLLECTIONS.FLASHCARDS, cardId);
      const preparedUpdates = prepareForFirestore(updates);

      await updateDoc(cardRef, preparedUpdates);

      return { success: true, timestamp: new Date() };
    } catch (error) {
      return {
        success: false,
        error: `Failed to update card: ${error}`,
        timestamp: new Date(),
      };
    }
  }

  static async updateMultipleCards(
    updates: Array<{ id: string; data: Partial<Flashcard> }>
  ): Promise<ApiResponse<void>> {
    try {
      const batch = writeBatch(db);

      updates.forEach(({ id, data }) => {
        const cardRef = doc(db, COLLECTIONS.FLASHCARDS, id);
        const preparedData = prepareForFirestore(data);
        batch.update(cardRef, preparedData);
      });

      await batch.commit();

      return { success: true, timestamp: new Date() };
    } catch (error) {
      return {
        success: false,
        error: `Failed to update cards: ${error}`,
        timestamp: new Date(),
      };
    }
  }

  static async deleteCard(cardId: string): Promise<ApiResponse<void>> {
    try {
      const cardRef = doc(db, COLLECTIONS.FLASHCARDS, cardId);
      await deleteDoc(cardRef);

      return { success: true, timestamp: new Date() };
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete card: ${error}`,
        timestamp: new Date(),
      };
    }
  }
}
