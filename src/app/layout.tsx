import "./globals.css";
import React from "react";
import PWAInstallPrompt from "../components/PWAInstallPrompt";

export const metadata = {
  title: "Cash Earn - Play and Earn Coins",
  description: "Complete Tasks, Claim Rewards and Withdraw Coins securely with our automated rewarding system.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#F59E0B" />
        <link rel="apple-touch-icon" href="https://picsum.photos/seed/cashearn192/192/192" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>
        {children}
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
