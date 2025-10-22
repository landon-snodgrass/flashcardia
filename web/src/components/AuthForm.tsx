import { useState } from "react";

interface FormData {
  email: string;
  password: string;
  displayName?: string;
}

interface AuthFormProps {
  mode: "login" | "register";
  onSubmit: (data: FormData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  onModeChange: (mode: "login" | "register") => void;
  onForgotPassword: (email: string) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  mode,
  onSubmit,
  isLoading,
  error,
  onModeChange,
  onForgotPassword,
}: AuthFormProps) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleForgotPassword = () => {
    if (formData.email) {
      onForgotPassword(formData.email);
      setShowForgotPassword(false);
    } else {
      alert("Please enter your email address first");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    marginBottom: "16px",
    border: "2px solid #ddd",
    borderRadius: "8px",
    fontSize: "16px",
    outline: "none",
  };

  const buttonStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: isLoading ? "not-allowed" : "pointer",
    opacity: isLoading ? 0.7 : 1,
  };

  const linkStyle: React.CSSProperties = {
    color: "#2196F3",
    textDecoration: "none",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "0 auto",
        padding: "40px 20px",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        border: "2px solid #f0f0f0",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1 style={{ margin: "0 0 8px 0", fontSize: "28px" }}>🎮</h1>
        <h2 style={{ margin: "0 0 8px 0", color: "#333" }}>
          {mode === "login" ? "Welcome Back!" : "Join the Adventure!"}
        </h2>
        <p style={{ margin: 0, color: "#666" }}>
          {mode === "login"
            ? "Sign in to continue your learning journey"
            : "Create your account to start battling with flashcards"}
        </p>
      </div>
      {error && (
        <div
          style={{
            backgroundColor: "#ffebee",
            color: "#c62828",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "16px",
            border: "1px solid #e57373",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {mode === "register" && (
          <input
            type="text"
            placeholder="Display Name (optional)"
            value={formData.displayName}
            onChange={(e) =>
              setFormData({ ...formData, displayName: e.target.value })
            }
            style={inputStyle}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
          minLength={6}
          style={inputStyle}
        />

        <button type="submit" disabled={isLoading} style={buttonStyle}>
          {isLoading
            ? mode === "login"
              ? "Signing In..."
              : "Creating Account..."
            : mode === "login"
            ? "Sign In"
            : "Create Account"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: "24px" }}>
        {mode === "login" && (
          <div style={{ marginBottom: "16px" }}>
            <span
              onClick={() => setShowForgotPassword(!showForgotPassword)}
              style={linkStyle}
            >
              Forgot Password?
            </span>
          </div>
        )}

        {showForgotPassword && (
          <div
            style={{
              backgroundColor: "#f5f5f5",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "16px",
            }}
          >
            <p style={{ margin: "0 0 12px 0", fontSize: "14px" }}>
              We'll send you a password reset link
            </p>
            <button
              onClick={handleForgotPassword}
              style={{
                ...buttonStyle,
                backgroundColor: "#2196F3",
                fontSize: "14px",
                padding: "8px 16px",
              }}
            >
              Send Reset Email
            </button>
          </div>
        )}

        <p style={{ margin: 0, color: "#666" }}>
          {mode === "login"
            ? "Don't have an account? "
            : "Already have an account? "}
          <span
            onClick={() =>
              onModeChange(mode === "login" ? "register" : "login")
            }
            style={linkStyle}
          >
            {mode === "login" ? "Sign Up" : "Sign In"}
          </span>
        </p>
      </div>
    </div>
  );
};
