import { useNavigate } from "@tanstack/react-router";

export function StatsEmpty() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        padding: "28px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "32px",
          marginBottom: "12px",
        }}
      >
        📚
      </div>
      <h2
        style={{
          fontSize: "18px",
          fontWeight: 600,
          color: "var(--color-text-primary)",
          marginBottom: "8px",
        }}
      >
        No vocabulary yet
      </h2>
      <p
        style={{
          fontSize: "14px",
          color: "var(--color-text-secondary)",
          marginBottom: "20px",
          maxWidth: "300px",
        }}
      >
        Start reading and saving words to see your progress here
      </p>
      <button
        onClick={() => navigate({ to: "/explore" })}
        style={{
          fontSize: "14px",
          padding: "8px 16px",
          borderRadius: "6px",
          border: "0.5px solid var(--color-border-secondary)",
          backgroundColor: "#111",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Explore Books
      </button>
    </div>
  );
}
