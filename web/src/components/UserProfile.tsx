import React from "react";

interface UserProfileProps {
  user: {
    displayName?: string;
    email: string;
    emailVerified: boolean;
    createdAt: Date;
    lastLoginAt: Date;
  };
  onSignOut: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onSignOut,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        backgroundColor: "white",
        padding: "16px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        border: "1px solid #ddd",
        minWidth: "200px",
      }}
    >
      <div style={{ marginBottom: "12px" }}>
        <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
          {user.displayName || "Hero"}
        </div>
        <div style={{ fontSize: "14px", color: "#666" }}>{user.email}</div>
        {!user.emailVerified && (
          <div
            style={{
              fontSize: "12px",
              color: "#f44336",
              marginTop: "4px",
            }}
          >
            Email not verified
          </div>
        )}
      </div>

      <div
        style={{
          fontSize: "12px",
          color: "#888",
          marginBottom: "12px",
          borderTop: "1px solid #eee",
          paddingTop: "8px",
        }}
      >
        <div>Joined: {user.createdAt.toLocaleDateString()}</div>
        <div>Last login: {user.lastLoginAt.toLocaleDateString()}</div>
      </div>

      <button
        onClick={onSignOut}
        style={{
          width: "100%",
          padding: "8px",
          backgroundColor: "#f44336",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        Sign Out
      </button>
    </div>
  );
};
