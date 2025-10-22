export const LoadingSpinner: React.FC<{ message?: string }> = ({
  message = "Loading...",
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "200px",
      padding: "40px",
    }}
  >
    <div
      style={{
        width: "40px",
        height: "40px",
        border: "4px solid #f3f3f3",
        borderTop: "4px solid #4CAF50",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    />
    <p style={{ marginTop: "16px", color: "#666" }}>{message}</p>

    <style
      dangerouslySetInnerHTML={{
        __html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `,
      }}
    />
  </div>
);
