import "./globals.css";
import React from "react";

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
      </head>
      <body>{children}</body>
    </html>
  );
}
