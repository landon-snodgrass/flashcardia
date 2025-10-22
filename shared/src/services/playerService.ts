import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  limit,
} from "firebase/firestore";

import { Player, ApiResponse } from "../types";
import {
  COLLECTIONS,
  prepareForFirestore,
  processFromFirestore,
} from "./firebaseService";
import { db } from "../config/firebase";

export class PlayerService {
  static async getPlayer(userId: string): Promise<ApiResponse<Player | null>> {
    try {
      const playerQuery = query(
        collection(db, COLLECTIONS.PLAYERS),
        where("userId", "==", userId),
        limit(1)
      );

      const snapshot = await getDocs(playerQuery);

      if (snapshot.empty) {
        return { success: true, data: null, timestamp: new Date() };
      }

      const playerDoc = snapshot.docs[0];
      const playerData = processFromFirestore({
        id: playerDoc.id,
        ...playerDoc.data(),
      }) as Player;

      return { success: true, data: playerData, timestamp: new Date() };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get player: ${error}`,
        timestamp: new Date(),
      };
    }
  }

  static async createPlayer(
    playerData: Omit<Player, "id">
  ): Promise<ApiResponse<Player>> {
    try {
      const preparedData = prepareForFirestore(playerData);
      const docRef = await addDoc(
        collection(db, COLLECTIONS.PLAYERS),
        preparedData
      );

      const newPlayer: Player = {
        ...playerData,
        id: docRef.id,
      };

      return { success: true, data: newPlayer, timestamp: new Date() };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create player: ${error}`,
        timestamp: new Date(),
      };
    }
  }

  static async updatePlayer(
    playerId: string,
    updates: Partial<Player>
  ): Promise<ApiResponse<void>> {
    try {
      const playerRef = doc(db, COLLECTIONS.PLAYERS, playerId);
      const preparedUpdates = prepareForFirestore(updates);

      await updateDoc(playerRef, preparedUpdates);

      return { success: true, timestamp: new Date() };
    } catch (error) {
      return {
        success: false,
        error: `Failed to update player: ${error}`,
        timestamp: new Date(),
      };
    }
  }
}
