import { Deck, useAddDeckMutation, useGameStore } from "@flashcard-rpg/shared";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const DeckCreate: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<
    Omit<Deck, "id" | "userId" | "createdAt" | "totalCards">
  >({
    name: "",
    description: "",
    color: "#4CAF50",
    isActive: true,
    newCardsPerDay: 20,
  });

  const { playerData } = useGameStore();

  const createDeckMutation = useAddDeckMutation();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerData?.data?.userId) {
      return;
    }

    if (!formData.name.trim()) return;

    const deckData: Omit<Deck, "id"> = {
      ...formData,
      userId: playerData.data.userId,
      createdAt: new Date(),
      totalCards: 0,
    };

    setIsSubmitting(true);
    try {
      const result = await createDeckMutation.mutateAsync(deckData);
      if (!result.data?.id) {
        setError("Failed to create deck");
      } else {
        navigate(`/decks/${result.data?.id}`)
      }
    } catch (error) {
      setError("Failed to create deck");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/decks");
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ margin: "0 0 10px 0", fontSize: "28px" }}>
          Create New Deck
        </h1>
        <p style={{ margin: 0, color: "#666" }}>
          Add a new flashcard deck to start studying
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            backgroundColor: "#ffebee",
            color: "#c62828",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "20px",
            border: "1px solid #e57373",
          }}
        >
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Deck Name */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            Deck Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Spanish Vocabulary, World Capitals"
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: "12px",
              border: "2px solid #ddd",
              borderRadius: "8px",
              fontSize: "16px",
              boxSizing: "border-box",
            }}
            autoFocus
            required
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            Description (optional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="What topics does this deck cover?"
            disabled={isSubmitting}
            rows={4}
            style={{
              width: "100%",
              padding: "12px",
              border: "2px solid #ddd",
              borderRadius: "8px",
              fontSize: "16px",
              boxSizing: "border-box",
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* Settings Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          {/* Color Picker */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              Deck Color
            </label>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                disabled={isSubmitting}
                style={{
                  width: "60px",
                  height: "40px",
                  border: "2px solid #ddd",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              />
              <div
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "4px",
                  fontSize: "14px",
                  color: "#666",
                }}
              >
                {formData.color}
              </div>
            </div>
          </div>

          {/* New Cards Per Day */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              New Cards/Day
            </label>
            <input
              type="number"
              value={formData.newCardsPerDay}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  newCardsPerDay: parseInt(e.target.value) || 20,
                })
              }
              disabled={isSubmitting}
              min={1}
              max={100}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #ddd",
                borderRadius: "8px",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
            />
            <div
              style={{
                fontSize: "12px",
                color: "#666",
                marginTop: "4px",
              }}
            >
              How many new cards to introduce daily
            </div>
          </div>
        </div>

        {/* Active Toggle */}
        <div
          style={{
            marginBottom: "30px",
            padding: "15px",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              gap: "10px",
            }}
          >
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              disabled={isSubmitting}
              style={{
                width: "20px",
                height: "20px",
                cursor: "pointer",
              }}
            />
            <div>
              <div style={{ fontWeight: "bold", fontSize: "14px" }}>
                Include in Daily Study Sessions
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>
                Cards from this deck will appear in your daily battles
              </div>
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "flex-end",
            paddingTop: "20px",
            borderTop: "1px solid #ddd",
          }}
        >
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            style={{
              padding: "12px 24px",
              backgroundColor: "white",
              color: "#666",
              border: "2px solid #ddd",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              fontWeight: "bold",
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting || !formData.name.trim()}
            style={{
              padding: "12px 24px",
              backgroundColor:
                isSubmitting || !formData.name.trim() ? "#ccc" : "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              cursor:
                isSubmitting || !formData.name.trim()
                  ? "not-allowed"
                  : "pointer",
              fontWeight: "bold",
            }}
          >
            {isSubmitting ? "Creating..." : "Create Deck"}
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div
        style={{
          marginTop: "30px",
          padding: "15px",
          backgroundColor: "#e3f2fd",
          borderRadius: "8px",
          fontSize: "14px",
          color: "#1976d2",
        }}
      >
        <strong>💡 Tip:</strong> After creating your deck, you'll be able to add
        flashcards to it immediately.
      </div>
    </div>
  );
};
