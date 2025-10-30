import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

import { StudySession, ApiResponse } from "../types";
import {
  COLLECTIONS,
  prepareForFirestore,
  processFromFirestore,
} from "./firebaseService";
import { db } from "../config/firebase";

export class StudySessionService {
  static async createSession(
    userId: string,
    sessionData: Omit<StudySession, "id">
  ): Promise<ApiResponse<StudySession>> {
    try {
      // First end current session if we have one
      const currentSession = await this.getUserCurrentSession(userId);
      if (currentSession.data != null) {
        const endedSession: StudySession = {
          ...currentSession.data,
          endTime: new Date(),
        };
        const response = await this.updateSession(endedSession.id, endedSession);
        if (response.error) {
          throw new Error(response.error);
        }
      }

      // Create new session
      const preparedData = prepareForFirestore(sessionData);
      const docRef = await addDoc(
        collection(db, COLLECTIONS.STUDY_SESSIONS),
        preparedData
      );

      const newSession: StudySession = {
        id: docRef.id,
        ...sessionData,
      };

      return { success: true, data: newSession, timestamp: new Date() };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create session: ${error}`,
        timestamp: new Date(),
      };
    }
  }

  static async updateSession(
    sessionId: string,
    updates: Partial<StudySession>
  ): Promise<ApiResponse<void>> {
    try {
      const sessionRef = doc(db, COLLECTIONS.STUDY_SESSIONS, sessionId);
      const preparedUpdates = prepareForFirestore(updates);

      await updateDoc(sessionRef, preparedUpdates);

      return { success: true, timestamp: new Date() };
    } catch (error) {
      return {
        success: false,
        error: `Failed to update session: ${error}`,
        timestamp: new Date(),
      };
    }
  }

  static async getUserCurrentSession(
    userId: string
  ): Promise<ApiResponse<StudySession | null>> {
    try {
      const sessionQuery = query(
        collection(db, COLLECTIONS.STUDY_SESSIONS),
        where("userId", "==", userId),
        where("endTime", "==", null)
      );

      const snapshot = await getDocs(sessionQuery);
      const sessions = snapshot.docs.map(
        (doc) =>
          processFromFirestore({ id: doc.id, ...doc.data() }) as StudySession
      );

      if (sessions.length > 0) {
        return { success: true, data: sessions[0], timestamp: new Date() };
      } else {
        return { success: true, data: null, timestamp: new Date() };
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to get current sesssion: ${error}`,
        timestamp: new Date(),
      };
    }
  }

  static async getUserSessions(
    userId: string,
    limitCount: number = 10
  ): Promise<ApiResponse<StudySession[]>> {
    try {
      const sessionsQuery = query(
        collection(db, COLLECTIONS.STUDY_SESSIONS),
        where("userId", "==", userId),
        orderBy("startTime", "desc"),
        limit(limitCount)
      );

      const snapshot = await getDocs(sessionsQuery);
      const sessions = snapshot.docs.map(
        (doc) =>
          processFromFirestore({
            id: doc.id,
            ...doc.data(),
          }) as StudySession
      );

      return { success: true, data: sessions, timestamp: new Date() };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get sessions: ${error}`,
        timestamp: new Date(),
      };
    }
  }
}
