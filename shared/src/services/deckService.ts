import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  writeBatch,
  getDoc,
} from "firebase/firestore";

import { Deck, ApiResponse } from "../types";
import {
  COLLECTIONS,
  prepareForFirestore,
  processFromFirestore,
} from "./firebaseService";
import { db } from "../config/firebase";

export class DeckService {
  static async getUserDecks(userId: string): Promise<ApiResponse<Deck[]>> {
    try {
      const decksQuery = query(
        collection(db, COLLECTIONS.DECKS),
        where("userId", "==", userId)
      );

      const snapshot = await getDocs(decksQuery);

      const decks = snapshot.docs.map(
        (doc) => processFromFirestore({ id: doc.id, ...doc.data() }) as Deck
      );
      return { success: true, data: decks, timestamp: new Date() };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get decks: ${error}`,
        timestamp: new Date(),
      };
    }
  }

  static async createDeck(
    deckData: Omit<Deck, "id">
  ): Promise<ApiResponse<Deck>> {
    try {
      const preparedData = prepareForFirestore(deckData);
      const docRef = await addDoc(
        collection(db, COLLECTIONS.DECKS),
        preparedData
      );

      const newDeck: Deck = {
        ...deckData,
        id: docRef.id,
      };

      return { success: true, data: newDeck, timestamp: new Date() };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create deck: ${error}`,
        timestamp: new Date(),
      };
    }
  }

  static async getDeck(deckId: string): Promise<ApiResponse<Deck>> {
    try {
      const docRef = doc(db, "decks", deckId);

      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return {
          success: false,
          error: `Deck with ID ${deckId} not found`,
          timestamp: new Date(),
        }
      }
      const data = snapshot.data() as Deck;
      return { success: true, data, timestamp: new Date() };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get deck: ${error}`,
        timestamp: new Date(),
      };
    }
  }

  static async updateDeck(
    deckId: string,
    updates: Partial<Deck>
  ): Promise<ApiResponse<void>> {
    try {
      const deckRef = doc(db, COLLECTIONS.DECKS, deckId);
      const preparedUpdates = prepareForFirestore(updates);

      await updateDoc(deckRef, preparedUpdates);

      return { success: true, timestamp: new Date() };
    } catch (error) {
      return {
        success: false,
        error: `Failed to update deck: ${error}`,
        timestamp: new Date(),
      };
    }
  }

  static async deleteDeck(deckId: string): Promise<ApiResponse<void>> {
    try {
      // Delete all flashcards in the deck first
      const cardsQuery = query(
        collection(db, COLLECTIONS.FLASHCARDS),
        where("deckId", "==", deckId)
      );

      const cardsSnapshot = await getDocs(cardsQuery);
      const batch = writeBatch(db);

      cardsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Delete the deck
      const deckRef = doc(db, COLLECTIONS.DECKS, deckId);
      batch.delete(deckRef);

      await batch.commit();

      return { success: true, timestamp: new Date() };
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete deck: ${error}`,
        timestamp: new Date(),
      };
    }
  }
}
