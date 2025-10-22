import { useNavigate } from "react-router-dom";

interface DeckCardProps {
  deck: any;
}

export const DeckCard: React.FC<DeckCardProps> = ({ deck }: DeckCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/decks/${deck.id}`)}
      style={{
        border: "2px solid #ddd",
        borderRadius: "12px",
        padding: "20px",
        backgroundColor: "white",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#4CAF50";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#ddd";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "8px",
          backgroundColor: deck.color || "#4CAF50",
          marginBottom: "15px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
        }}
      >
        📚
      </div>
      <h3 style={{ margin: "0 0 8px 0", fontSize: "18px" }}>{deck.name}</h3>
      <p
        style={{
          margin: "0 0 15px 0",
          color: "#666",
          fontSize: "14px",
          lineHeight: "1.4",
        }}
      >
        {deck.description || "No description"}
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "12px",
          color: "#888",
        }}
      >
        <span>{deck.totalCards} cards</span>
        <span>{deck.isActive ? "🟢 Active" : "⚫ Inactive"}</span>
      </div>
    </div>
  );
};
