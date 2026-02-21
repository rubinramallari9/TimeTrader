import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/auth/AuthProvider";

export const metadata: Metadata = {
  title: { default: "TimeTrader — The Luxury Watch Marketplace", template: "%s | TimeTrader" },
  description: "Buy, sell, and authenticate luxury watches. Discover certified pre-owned Rolex, Patek Philippe, Audemars Piguet, and more from verified sellers worldwide.",
  keywords: ["luxury watches", "pre-owned watches", "Rolex", "Patek Philippe", "Audemars Piguet", "watch authentication", "watch marketplace"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
