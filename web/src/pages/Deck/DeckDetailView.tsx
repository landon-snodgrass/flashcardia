import {
  SpacedRepetitionEngine,
  useAddFlaschcardMutation,
  useDeleteFlashcardMutation,
  useGetDeckDetail,
  useUpdateFlashcardMutation,
} from "@flashcard-rpg/shared";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

import { LoadingSpinner } from "../../components/LoadingSpinner";
import { CardModal } from "./CardModal";

export interface EditableCard {
  id: string;
  front: string;
  back: string;
}

export const DeckDetailView: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();

  const navigate = useNavigate();

  const { isLoading, isError, error, data } = useGetDeckDetail(deckId || "");

  const addCardMutation = useAddFlaschcardMutation();
  const editCardMutation = useUpdateFlashcardMutation();
  const deleteCardMutation = useDeleteFlashcardMutation();

  const [isCardModalOpen, setIsCardModalOpen] = useState<boolean>(false);
  const [editingCard, setEditingCard] = useState<EditableCard | null>(null);

  const handleCreateCard = () => {
    setEditingCard(null);
    setIsCardModalOpen(true);
  };

  const handleEditCard = (card: EditableCard) => {
    setEditingCard(card);
    setIsCardModalOpen(true);
  };

  const handleSaveCard = async (cardData: { front: string; back: string }) => {
    if (!deckId) return false;

    if (editingCard && editingCard.id) {
      // Update existing card
      const response = await editCardMutation.mutateAsync({
        cardId: editingCard.id,
        updates: cardData,
      });
      if (response.success) {
        return true;
      }
      return false;
    } else {
      // Create new card
      const newCard = SpacedRepetitionEngine.initializeNewCard({
        ...cardData,
        deckId,
        createdAt: new Date(),
      });
      const response = await addCardMutation.mutateAsync(newCard);
      if (response.success) {
        return true;
      }
      return false;
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!deckId) return;

    if (confirm("Delete this card? This cannot be undone.")) {
      deleteCardMutation.mutate(cardId);
    }
  };

  const handleStudyDeck = () => {
    // if (!deckDetail || deckDetail.cards.length === 0) {
    //   alert("This deck has no cards yet. Add some cards before studying!");
    //   return;
    // }

    // // Start custom study session with all cards from this deck
    // startStudySession(deckDetail.cards, "custom", "medium");

    navigate("/battle");
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading deck..." />;
  }

  if (isError) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ color: "#F44336", marginBottom: "20px" }}>
          Error: {error.message}
        </div>
        <button onClick={() => navigate("/decks")}>Back to Decks</button>
      </div>
    );
  }

  if (!data || !data.cards || !data.deck) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div>Deck not found!</div>
      </div>
    );
  }

  const { deck, cards } = data;

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
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
          <button
            onClick={() => navigate("/decks")}
            style={{
              padding: "8px 16px",
              backgroundColor: "white",
              color: "#666",
              border: "2px solid #ddd",
              borderRadius: "4px",
              cursor: "pointer",
              marginBottom: "10px",
            }}
          >
            ← Back to Decks
          </button>
          <h1 style={{ margin: "10px 0", fontSize: "28px" }}>{deck.name}</h1>
          <div style={{ color: "#666" }}>
            {cards.length} cards • {deck.isActive ? "🟢 Active" : "⚫ Inactive"}
          </div>
        </div>

        <button
          onClick={handleStudyDeck}
          disabled={cards.length === 0}
          style={{
            padding: "12px 24px",
            backgroundColor: cards.length === 0 ? "#ccc" : "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: cards.length === 0 ? "not-allowed" : "pointer",
            fontWeight: "bold",
          }}
        >
          ⚔️ Study Deck
        </button>
        <button
          onClick={handleCreateCard}
          style={{
            padding: "12px 24px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          + Add Card
        </button>
      </div>

      {/* Deck Info */}
      {deck.description && (
        <div
          style={{
            backgroundColor: "#f9f9f9",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "30px",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
            Description:
          </div>
          <div>{deck.description}</div>
        </div>
      )}

      {/* Cards List */}
      {cards.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            backgroundColor: "#f9f9f9",
            borderRadius: "12px",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>📝</div>
          <h3>No cards yet!</h3>
          <p style={{ marginBottom: "20px", color: "#666" }}>
            Add your first flashcard to start studying.
          </p>
          <button
            onClick={handleCreateCard}
            style={{
              padding: "12px 24px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Add Your First Card
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "15px" }}>
          {cards.map((card: any) => (
            <div
              key={card.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "20px",
                backgroundColor: "white",
                display: "grid",
                gridTemplateColumns: "1fr 1fr auto",
                gap: "20px",
                alignItems: "start",
              }}
            >
              {/* Front */}
              <div>
                <div
                  style={{
                    fontWeight: "bold",
                    marginBottom: "8px",
                    color: "#666",
                    fontSize: "12px",
                    textTransform: "uppercase",
                  }}
                >
                  Front
                </div>
                <div style={{ whiteSpace: "pre-wrap" }}>{card.front}</div>
              </div>

              {/* Back */}
              <div>
                <div
                  style={{
                    fontWeight: "bold",
                    marginBottom: "8px",
                    color: "#666",
                    fontSize: "12px",
                    textTransform: "uppercase",
                  }}
                >
                  Back
                </div>
                <div style={{ whiteSpace: "pre-wrap" }}>{card.back}</div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "5px" }}>
                <button
                  onClick={() => handleEditCard(card)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#2196F3",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCard(card.id)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#F44336",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Card Modal - Only render when open */}
      {isCardModalOpen && (
        <CardModal
          card={editingCard}
          onClose={() => {
            setIsCardModalOpen(false);
            setEditingCard(null);
          }}
          onSave={handleSaveCard}
        />
      )}
    </div>
  );
};
