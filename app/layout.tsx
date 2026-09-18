import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import { Navbar } from "@/components/navbar";

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
      <body className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-emerald-500/30 selection:text-emerald-300">
        <ConvexClientProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
