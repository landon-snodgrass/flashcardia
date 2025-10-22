interface StatBoxProps {
  value: string | number;
  label: string;
  color: string;
}

export const StatBox: React.FC<StatBoxProps> = ({
  value,
  label,
  color,
}: StatBoxProps) => {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "32px", fontWeight: "bold", color }}>{value}</div>
      <div style={{ fontSize: "14px", color: "#666" }}>{label}</div>
    </div>
  );
};
