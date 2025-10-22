import { Timestamp } from "firebase/firestore";

export const COLLECTIONS = {
  USERS: "users",
  PLAYERS: "players",
  DECKS: "decks",
  FLASHCARDS: "flashcards",
  STUDY_SESSIONS: "studySessions",
  BATTLES: "battles",
} as const;

/**
 * Convert Firestore timestamp to Date
 */
const timestampToDate = (timestamp: any): Date => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  return timestamp instanceof Date ? timestamp : new Date(timestamp);
};

/**
 * Convert Date to Firestore timestamp
 */
const dateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

/**
 * Prepare document for Firestore (convert dates)
 */
export const prepareForFirestore = (data: any): any => {
  const prepared = { ...data };

  // Convert Date objects to Timestamps
  Object.keys(prepared).forEach((key) => {
    if (prepared[key] instanceof Date) {
      prepared[key] = dateToTimestamp(prepared[key]);
    }
  });

  return prepared;
};

/**
 * Process document from Firestore (convert timestamps back to date)
 */
export const processFromFirestore = (data: any): any => {
  if (!data) return data;

  const processed = { ...data };

  Object.keys(processed).forEach((key) => {
    if (processed[key]?.toDate) {
      processed[key] = timestampToDate(processed[key]);
    }
  });

  return processed;
};
