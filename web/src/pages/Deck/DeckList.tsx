import { useGameStore, useGetUserDecks } from "@flashcard-rpg/shared";
import { Link, useNavigate } from "react-router-dom";
import { DeckCard } from "./DeckCard";

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#4CAF50",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: "16px",
};

export const DeckList: React.FC = () => {
  const navigate = useNavigate();

  const { playerData } = useGameStore();

  const { isError, error, isLoading, data } = useGetUserDecks(
    playerData.data?.userId || ""
  );

  if (isLoading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div>📊 Loading deck data...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#F44336" }}>
        <div>❌ Error loading decks</div>
        <div style={{ fontSize: "14px", marginTop: "10px" }}>
          {error.message}
        </div>
      </div>
    );
  }

  if (!data || !Array.isArray(data)) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div>No deck data available</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <div>
          <button onClick={() => navigate("/")} style={buttonStyle}>
            ← Back
          </button>
          <h1 style={{ display: "inline", marginLeft: "20px" }}>📚 My Decks</h1>
        </div>
        <Link
          to="/decks/new"
          style={{
            padding: "12px 24px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: "pointer",
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          + Create New Deck
        </Link>
      </div>

      {/* Decks Grid */}
      {data.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px",
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>📚</div>
          <h3>No decks yet!</h3>
          <p>Create your first deck to start studying with flashcards.</p>
          <Link
            to="/decks/new"
            style={{
              padding: "12px 24px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            + Create Your First Deck
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {data.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
        </div>
      )}
    </div>
  );
};
