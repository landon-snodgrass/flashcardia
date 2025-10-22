import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";

import { Flashcard, Deck, Player } from "../types";
import { COLLECTIONS, processFromFirestore } from "./firebaseService";
import { db } from "../config/firebase";

export class RealTimeService {
  /**
   * Listen to changes in user's decks
   */
  static subscribeToUserDecks(
    userId: string,
    callback: (decks: Deck[]) => void
  ): () => void {
    const decksQuery = query(
      collection(db, COLLECTIONS.DECKS),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(decksQuery, (snapshot) => {
      const decks = snapshot.docs.map(
        (doc) =>
          processFromFirestore({
            id: doc.id,
            ...doc.data(),
          }) as Deck
      );
      callback(decks);
    });
  }

  /**
   * Listen to changes in deck cards
   */
  static subscribeToDeckCards(
    deckId: string,
    callback: (cards: Flashcard[]) => void
  ): () => void {
    const cardsQuery = query(
      collection(db, COLLECTIONS.FLASHCARDS),
      where("deckId", "==", deckId),
      orderBy("createdAt", "asc")
    );

    return onSnapshot(cardsQuery, (snapshot) => {
      const cards = snapshot.docs.map(
        (doc) =>
          processFromFirestore({
            id: doc.id,
            ...doc.data(),
          }) as Flashcard
      );
      callback(cards);
    });
  }

  /**
   * Listen to player changes
   */
  static subscribeToPlayer(
    userId: string,
    callback: (player: Player | null) => void
  ): () => void {
    const playerQuery = query(
      collection(db, COLLECTIONS.PLAYERS),
      where("userId", "==", userId),
      limit(1)
    );

    return onSnapshot(playerQuery, (snapshot) => {
      if (snapshot.empty) {
        callback(null);
        return;
      }

      const playerDoc = snapshot.docs[0];
      const player = processFromFirestore({
        id: playerDoc.id,
        ...playerDoc.data(),
      }) as Player;

      callback(player);
    });
  }
}
