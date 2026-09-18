import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";

export const metadata: Metadata = {
  title: "BidRank — Pay your way to the top",
  description: "The SaaS leaderboard where founders compete for attention. Bid higher, rank higher, get discovered.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background font-sans antialiased">
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
