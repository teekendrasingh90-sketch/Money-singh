"use client";

import React, { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Cash Earn Render Exception:", error);
  }, [error]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#080C14", color: "#ffffff", fontFamily: "system-ui, -apple-system, sans-serif", padding: "20px", textAlign: "center" }}>
      <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#EF4444", marginBottom: "8px" }}>Something went wrong!</h2>
      <p style={{ color: "#94a3b8", marginBottom: "20px", fontSize: "14px", maxWidth: "340px", lineHeight: "1.5" }}>
        An unexpected error occurred during interface interaction.
      </p>
      <button
        onClick={() => reset()}
        style={{ backgroundColor: "#F59E0B", color: "#080C14", padding: "10px 20px", borderRadius: "8px", border: "none", fontWeight: "bold", cursor: "pointer", fontSize: "14px", boxShadow: "0 4px 14px rgba(245,158,11,0.25)" }}
      >
        Try again
      </button>
    </div>
  );
}
