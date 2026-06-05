import React from "react";

export default function NotFound() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#080C14", color: "#ffffff", fontFamily: "system-ui, -apple-system, sans-serif", padding: "20px", textAlign: "center" }}>
      <h1 style={{ fontSize: "64px", fontWeight: "900", color: "#F59E0B", marginBottom: "8px", letterSpacing: "-0.05em" }}>404</h1>
      <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>Page Not Found</h2>
      <p style={{ color: "#94a3b8", marginBottom: "24px", maxWidth: "340px", fontSize: "14px", lineHeight: "1.5" }}>
        Cruising back towards safety. The requested page does not exist in Cash Earn.
      </p>
      <a href="/" style={{ backgroundColor: "#F59E0B", color: "#080C14", padding: "12px 24px", borderRadius: "12px", textDecoration: "none", fontWeight: "800", fontSize: "14px", boxShadow: "0 4px 14px rgba(245,158,11,0.25)" }}>
        Return to App
      </a>
    </div>
  );
}

