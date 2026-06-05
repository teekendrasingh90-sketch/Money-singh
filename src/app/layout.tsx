import "./globals.css";
import React from "react";
import ClientOnlyPWA from "../components/ClientOnlyPWA";

export const metadata = {
  title: "Cash Earn - Play and Earn Coins",
  description: "Complete Tasks, Claim Rewards and Withdraw Coins securely with our automated rewarding system.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Cash Earn",
  },
};

export const viewport = {
  themeColor: "#F59E0B",
  width: "device-width",
  initialScale: 1.0,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <ClientOnlyPWA />
      </body>
    </html>
  );
}


