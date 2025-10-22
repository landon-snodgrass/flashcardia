import { create } from "zustand";
import {
  AuthState,
  User,
  LoginCredentials,
  RegisterCredentials,
} from "../types/auth";
import { AuthService } from "../services/authService";

interface AuthStore extends AuthState {
  // Actions
  signIn: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  clearError: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // State
  user: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  // Actions
  signIn: async (credentials) => {
    set({ isLoading: true, error: null });

    const result = await AuthService.signIn(credentials);

    if (result.success && result.data) {
      set({
        user: result.data,
        isLoading: false,
        error: null,
      });
      return true;
    } else {
      set({
        isLoading: false,
        error: result.error || "Sign in failed",
      });
      return false;
    }
  },
  register: async (credentials) => {
    set({ isLoading: true, error: null });

    const result = await AuthService.register(credentials);

    if (result.success && result.data) {
      set({
        user: result.data,
        isLoading: false,
        error: null,
      });
      return false;
    } else {
      set({
        isLoading: false,
        error: result.error || "Registration failed",
      });
      return false;
    }
  },
  signOut: async () => {
    set({ isLoading: true });

    await AuthService.signOut();

    set({
      user: null,
      isLoading: false,
      error: null,
    });
  },
  resetPassword: async (email) => {
    set({ isLoading: true, error: null });

    const result = await AuthService.resetPassword(email);

    set({ isLoading: false });

    if (!result.success) {
      set({ error: result.error || "Password reset failed" });
      return false;
    }

    return true;
  },
  clearError: () => {
    set({ error: null });
  },
  initializeAuth: () => {
    AuthService.onAuthStateChanged((user) => {
      set({
        user,
        isInitialized: true,
        isLoading: false,
      });
    });
  },
}));

export const useAuth = () => {
  const authStore = useAuthStore();

  return {
    ...authStore,
    isAuthenticated: !!authStore.user,
    isGuest: !authStore.user && authStore.isInitialized,
  };
};
