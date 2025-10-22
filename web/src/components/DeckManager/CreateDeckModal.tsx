import { useState } from "react";
import { buttonStyle, inputStyle, modalOverlayStyle, modalStyle } from ".";
import { Deck, useAddDeckMutation, useGameStore } from "@flashcard-rpg/shared";

interface CreateDeckModal {
  onClose: () => void;
  onSave: (deckData: any) => void;
}

export const CreateDeckModal: React.FC<CreateDeckModal> = ({
  onClose,
  onSave,
}: CreateDeckModal) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerData?.data?.userId) {
      return;
    }

    if (!formData.name.trim()) return;
    
    const deckData: Omit<Deck, "id"> =  {
      ...formData,
      userId: playerData.data.userId,
      createdAt: new Date(),
      totalCards: 0,
    }
    createDeckMutation.mutate(deckData);
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalStyle}>
        <h2 style={{ marginBottom: "20px" }}>Create New Deck</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Deck name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={inputStyle}
            required
          />
          <textarea
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
          />
          <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "14px",
                }}
              >
                Color
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                style={{
                  width: "100%",
                  height: "40px",
                  border: "none",
                  borderRadius: "4px",
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "14px",
                }}
              >
                New cards/day
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
                min="1"
                max="100"
                style={inputStyle}
              />
            </div>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                style={{ marginRight: "8px" }}
              />
              Include in daily study sessions
            </label>
          </div>
          <div
            style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{ ...buttonStyle, backgroundColor: "#666" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ ...buttonStyle, backgroundColor: "#4CAF50" }}
            >
              Create Deck
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
