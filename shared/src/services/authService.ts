import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser,
  UserCredential,
} from "firebase/auth";
import { auth } from "../config/firebase";
import {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthError,
} from "../types/auth";
import { ApiResponse } from "../types";

export class AuthService {
  /**
   * Sign in with email and password
   */
  static async signIn(
    credentials: LoginCredentials
  ): Promise<ApiResponse<User>> {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const user = this.mapFirebaseUser(userCredential.user);
      return { success: true, data: user, timestamp: new Date() };
    } catch (error: any) {
      return {
        success: false,
        error: this.mapAuthError(error).message,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Register new user with email and password
   */
  static async register(
    credentials: RegisterCredentials
  ): Promise<ApiResponse<User>> {
    try {
      const userCredential: UserCredential =
        await createUserWithEmailAndPassword(
          auth,
          credentials.email,
          credentials.password
        );

      if (credentials.displayName) {
        await updateProfile(userCredential.user, {
          displayName: credentials.displayName,
        });
      }

      const user = this.mapFirebaseUser(userCredential.user);
      return { success: true, data: user, timestamp: new Date() };
    } catch (error: any) {
      return {
        success: false,
        error: this.mapAuthError(error).message,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<ApiResponse<void>> {
    try {
      await signOut(auth);
      return { success: true, timestamp: new Date() };
    } catch (error: any) {
      return {
        success: false,
        error: this.mapAuthError(error).message,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Send password reset email
   */
  static async resetPassword(email: string): Promise<ApiResponse<void>> {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, timestamp: new Date() };
    } catch (error: any) {
      return {
        success: false,
        error: this.mapAuthError(error).message,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Subscribe to authentication state changes
   */
  static onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, (firebaseUser) => {
      const user = firebaseUser ? this.mapFirebaseUser(firebaseUser) : null;
      callback(user);
    });
  }

  /**
   * Get current user
   */
  static getCurrentUser(): User | null {
    const firebaseUser = auth.currentUser;
    return firebaseUser ? this.mapFirebaseUser(firebaseUser) : null;
  }

  /**
   * Map Firebase user to our User Type
   */
  private static mapFirebaseUser(firebaseUser: FirebaseUser): User {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || undefined,
      photoUrl: firebaseUser.photoURL || undefined,
      emailVerified: firebaseUser.emailVerified,
      createdAt: firebaseUser.metadata.creationTime
        ? new Date(firebaseUser.metadata.creationTime)
        : new Date(),
      lastLoginAt: firebaseUser.metadata.lastSignInTime
        ? new Date(firebaseUser.metadata.lastSignInTime)
        : new Date(),
    };
  }

  /**
   * Map Firebase auth errors to our error type
   */
  private static mapAuthError(error: any): AuthError {
    const errorMap: { [key: string]: string } = {
      "auth/user-not-found": "No account found with this email address.",
      "auth/wrong-password": "Incorrect password.",
      "auth/email-already-in-use": "An account with this email already exists.",
      "auth/weak-password": "Password should be at least 6 characters.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/user-disabled": "This account has been disabled.",
      "auth/too-many-requests":
        "Too many failed attempts. Please try again later.",
      "auth/network-request-failed":
        "Network error. Please check your connection.",
    };

    return {
      code: error.code || "Unknown",
      message:
        errorMap[error.code] || error.message || "An unexpected error occurred",
    };
  }
}
