import { buttonStyle } from ".";

interface CardRowProps {
  card: any;
  onEdit: () => void;
  onDelete: () => void;
}

export const CardRow: React.FC<CardRowProps> = ({ card, onEdit, onDelete }) => {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "15px",
        backgroundColor: "white",
        display: "grid",
        gridTemplateColumns: "1fr 1fr auto",
        gap: "15px",
        alignItems: "center",
      }}
    >
      <div>
        <div style={{ fontWeight: "bold", marginBottom: "5px" }}>Front:</div>
        <div>{card.front}</div>
      </div>
      <div>
        <div style={{ fontWeight: "bold", marginBottom: "5px" }}>Back:</div>
        <div>{card.back}</div>
      </div>
      <div style={{ display: "flex", gap: "5px" }}>
        <button
          onClick={onEdit}
          style={{ ...buttonStyle, padding: "5px 10px", fontSize: "12px" }}
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          style={{
            ...buttonStyle,
            padding: "5px 10px",
            fontSize: "12px",
            backgroundColor: "#f44336",
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};
