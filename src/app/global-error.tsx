"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h1 style={{ fontSize: "3rem", fontWeight: "bold", color: "#111827" }}>
            500
          </h1>
          <p style={{ marginTop: "1rem", fontSize: "1.25rem", color: "#4B5563" }}>
            Something went wrong
          </p>
          <p style={{ marginTop: "0.5rem", color: "#6B7280" }}>
            An unexpected error occurred. Please try again.
          </p>
          <div style={{ marginTop: "2rem", display: "flex", gap: "0.75rem" }}>
            <button
              onClick={reset}
              style={{
                padding: "0.625rem 1.5rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                borderRadius: "0.5rem",
                border: "1px solid #D1D5DB",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
            <a
              href="/"
              style={{
                padding: "0.625rem 1.5rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                borderRadius: "0.5rem",
                background: "#F26B1D",
                color: "#fff",
                textDecoration: "none",
              }}
            >
              Back to Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
