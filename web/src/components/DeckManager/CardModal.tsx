import { useState } from "react";
import { EditableCard } from "./DeckDetailView";

interface CardModalProps {
  card?: EditableCard | null;
  onClose: () => void;
  onSave: (cardData: { front: string; back: string }) => Promise<boolean>;
}

export const CardModal: React.FC<CardModalProps> = ({
  card,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    front: card?.front || "",
    back: card?.back || "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.front.trim() || !formData.back.trim()) {
      setError("Both question and answer are required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const success = await onSave({
      front: formData.front.trim(),
      back: formData.back.trim(),
    });

    setIsSubmitting(false);
    if (success) {
      onClose();
    } else {
      setError("Failed to save card. Please try again.");
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={handleCancel}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "30px",
          maxWidth: "600px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <h2 style={{ margin: "0 0 20px 0", fontSize: "24px" }}>
          {card ? "Edit Card" : "Create New Card"}
        </h2>

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
          {/* Front (Question) */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              Front (Question) *
            </label>
            <textarea
              value={formData.front}
              onChange={(e) =>
                setFormData({ ...formData, front: e.target.value })
              }
              placeholder="Enter the question or prompt..."
              disabled={isSubmitting}
              rows={4}
              autoFocus
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
              required
            />
            <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
              {formData.front.length} characters
            </div>
          </div>

          {/* Back (Answer) */}
          <div style={{ marginBottom: "30px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              Back (Answer) *
            </label>
            <textarea
              value={formData.back}
              onChange={(e) =>
                setFormData({ ...formData, back: e.target.value })
              }
              placeholder="Enter the answer..."
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
              required
            />
            <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
              {formData.back.length} characters
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "flex-end",
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
              disabled={
                isSubmitting || !formData.front.trim() || !formData.back.trim()
              }
              style={{
                padding: "12px 24px",
                backgroundColor:
                  isSubmitting ||
                  !formData.front.trim() ||
                  !formData.back.trim()
                    ? "#ccc"
                    : "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                cursor:
                  isSubmitting ||
                  !formData.front.trim() ||
                  !formData.back.trim()
                    ? "not-allowed"
                    : "pointer",
                fontWeight: "bold",
              }}
            >
              {isSubmitting
                ? "Saving..."
                : card
                ? "Update Card"
                : "Create Card"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
