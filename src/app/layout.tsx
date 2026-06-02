import "./globals.css";
import React from "react";

export const metadata = {
  title: "AdMob Cash Earn - Play and Earn Coins",
  description: "Watch Ads, Claim Rewards and Withdraw Coins securely with Google AdMob Reward system.",
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
      </head>
      <body>{children}</body>
    </html>
  );
}
