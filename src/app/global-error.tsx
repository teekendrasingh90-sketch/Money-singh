"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, backgroundColor: "#080C14" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#080C14", color: "#ffffff", fontFamily: "system-ui, -apple-system, sans-serif", padding: "20px", textAlign: "center" }}>
          <h1 style={{ fontSize: "48px", fontWeight: "900", color: "#EF4444", marginBottom: "8px" }}>Fatal Error</h1>
          <p style={{ color: "#94a3b8", marginBottom: "20px", fontSize: "14px", maxWidth: "340px", lineHeight: "1.5" }}>
            A fatal exception occurred in Cash Earn. Please reset the application.
          </p>
          <button
            onClick={() => reset()}
            style={{ backgroundColor: "#F59E0B", color: "#080C14", padding: "12px 24px", borderRadius: "12px", border: "none", fontWeight: "800", cursor: "pointer", fontSize: "14px", boxShadow: "0 4px 14px rgba(245,158,11,0.25)" }}
          >
            Reset App Status
          </button>
        </div>
      </body>
    </html>
  );
}
