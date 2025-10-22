import { AuthForm } from "@/components/AuthForm";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { TopNav } from "@/components/TopNav";
import { useAuth, useGameStore } from "@flashcard-rpg/shared";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

export const AuthLayout: React.FC = () => {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

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

  const { playerData, initializeForUser, resetGameData } = useGameStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Initialize player when user logs in
  useEffect(() => {
    if (user) {
      initializeForUser(user.uid);
    } else {
      resetGameData();
    }
  }, [user, initializeForUser, resetGameData]);

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
      alert("Password reset email sent!");
    }
  };

  // Auth not initialized
  if (!isInitialized) {
    return <LoadingSpinner message="Initializing..." />;
  }

  // Not logged in - show auth form
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

  // Player loading
  if (playerData.isLoading) {
    return <LoadingSpinner message="Loading your character..." />;
  }

  // Player error
  if (playerData.error) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ color: "#F44336", marginBottom: "20px" }}>
          Error loading playing: {playerData.error}
        </div>
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
    );
  }

  // Player not loaded
  if (!playerData.data) {
    return <LoadingSpinner message="Creating your character..." />;
  }

  // All good - render the app with top nav
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <TopNav player={playerData.data} user={user} onSignOut={handleSignOut} />
      <Outlet />
    </div>
  );
};
