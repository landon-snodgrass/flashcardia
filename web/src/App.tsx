import React, { useEffect, useState } from "react";
import { AuthForm } from "./components/AuthForm";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { UserProfile } from "./components/UserProfile";
import { queryClient, useAuth, useGameStore } from "@flashcard-rpg/shared";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { QueryClientProvider } from "@tanstack/react-query";

const App: React.FC = () => {
  return <AuthenticatedApp />;
};

const AuthenticatedApp: React.FC = () => {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // Initialize auth
  const {
    user,
    isLoading: authLoading,
    isInitialized,
    error: authError,
    signIn,
    register,
    signOut,
    resetPassword,
    clearError,
    initializeAuth,
  } = useAuth();

  // Initialize game store
  const { initializeForUser, resetGameData } = useGameStore();

  // Initialize auth listener on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Initialize game data when user signs in
  useEffect(() => {
    if (user) {
      initializeForUser(user.uid);
    } else {
      resetGameData();
    }
  }, [user, initializeForUser, resetGameData]);

  // Handle authentication actions
  const handleAuthSubmit = async (data: {
    email: string;
    password: string;
    displayName?: string;
  }) => {
    clearError();

    if (authMode === "login") {
      await signIn({ email: data.email, password: data.password });
    } else {
      await register({
        email: data.email,
        password: data.password,
        displayName: data.displayName,
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleForgotPassword = async (email: string) => {
    const success = await resetPassword(email);
    if (success) {
      alert("Password reset email sent! Check your inbox.");
    }
  };

  // Show loading while auth initializes
  if (!isInitialized) {
    return <LoadingSpinner message="Initializing authentication..." />;
  }

  // Show auth form if not logged in
  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AuthForm
          mode={authMode}
          onSubmit={handleAuthSubmit}
          isLoading={authLoading}
          error={authError}
          onModeChange={setAuthMode}
          onForgotPassword={handleForgotPassword}
        />
      </div>
    );
  }

  // Show main game app if logged in
  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <UserProfile user={user} onSignOut={handleSignOut} />
      <QueryClientProvider client={queryClient}>
        <GameApp />
      </QueryClientProvider>
    </div>
  );
};

// Main game component (your existing game logic)
const GameApp: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;
