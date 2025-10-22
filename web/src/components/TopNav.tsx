import { Player, User } from "@flashcard-rpg/shared";
import { Link, useLocation } from "react-router-dom";

interface TopNavProps {
  player: Player;
  user: User;
  onSignOut: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ player, user, onSignOut }) => {
  const location = useLocation();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px",
        backgroundColor: "white",
        borderBottom: "1px solid #ddd",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          <h1 style={{ margin: 0, fontSize: "24px" }}>🎮 Flashcard RPG</h1>
        </Link>

        <div style={{ fontSize: "14px", color: "#666" }}>
          Level {player.level} • {player.currentXp}/{player.requiredXp} XP
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <Link
          to="/decks"
          style={{
            padding: "8px 16px",
            backgroundColor: location.pathname.startsWith("/decks")
              ? "#1976D2"
              : "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            textDecoration: "none",
          }}
        >
          📚 Manage Decks
        </Link>

        <div
          style={{
            padding: "8px 16px",
            backgroundColor: "#f5f5f5",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        >
          {user.displayName || user.email}
        </div>

        <button
          onClick={onSignOut}
          style={{
            padding: "8px 16px",
            backgroundColor: "#666",
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
    </div>
  );
};
