"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import {
  ArrowUpRight,
  Flame,
  Trophy,
  Zap,
  Shield,
  Sparkles,
  MousePointerClick,
  Layers,
} from "lucide-react";

export default function HomePage() {
  const stats = useQuery(api.products.getStats);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-16 sm:pt-24 sm:pb-20 border-b border-zinc-800/80">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(9,9,11,0))]" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 mb-6 px-3 py-1 font-medium"
          >
            <Flame className="w-3.5 h-3.5 mr-1.5 inline" />
            Pay your way to the top
          </Badge>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-100 max-w-4xl mx-auto leading-tight">
            The SaaS Leaderboard Where Founders Compete for Attention
          </h1>

          <p className="mt-5 text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto font-normal">
            Bid higher, rank higher, get discovered. Pay only the difference to outbid competitors in real time.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto text-base font-bold px-8 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 shadow-xl shadow-emerald-500/20"
            >
              <Link href="/submit">
                List your SaaS <ArrowUpRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-base border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
            >
              <a href="#leaderboard">View Leaderboard</a>
            </Button>
          </div>

          {/* Live Reactive Stats */}
          <div className="mt-14 grid grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto p-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md">
            <div className="p-2 sm:p-3 text-center">
              <div className="text-xl sm:text-3xl font-black text-emerald-400 font-mono">
                {stats ? `$${stats.totalBids.toLocaleString()}` : "$0"}
              </div>
              <div className="text-[10px] sm:text-xs text-zinc-400 uppercase font-semibold mt-1">
                Total Bids Placed
              </div>
            </div>

            <div className="p-2 sm:p-3 text-center border-x border-zinc-800">
              <div className="text-xl sm:text-3xl font-black text-zinc-100 font-mono">
                {stats ? stats.totalProducts.toLocaleString() : "0"}
              </div>
              <div className="text-[10px] sm:text-xs text-zinc-400 uppercase font-semibold mt-1">
                Listed Products
              </div>
            </div>

            <div className="p-2 sm:p-3 text-center">
              <div className="text-xl sm:text-3xl font-black text-zinc-100 font-mono">
                {stats ? stats.totalClicks.toLocaleString() : "0"}
              </div>
              <div className="text-[10px] sm:text-xs text-zinc-400 uppercase font-semibold mt-1">
                Founder Clicks
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Leaderboard Section */}
      <section id="leaderboard" className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 w-full">
        <LeaderboardTable />
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 border-t border-zinc-800/80 bg-zinc-900/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
              How BidRank Works
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm mt-2">
              Transparent, competitive, real time promotion for indie founders
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-bold text-base text-zinc-100">List Your Product</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Submit your SaaS details and place an initial bid of at least $10 to claim your starting spot on the leaderboard.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-bold text-base text-zinc-100">Pay the Difference</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                To move past rank #2 or claim the #1 crown, pay only the difference between your current bid and your new bid.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-bold text-base text-zinc-100">Realtime Visibility</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Rankings update instantly across all active visitors via Convex subscriptions as soon as your payment confirms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-8 text-center text-xs text-zinc-500 bg-zinc-950">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 BidRank. Pay to rank SaaS directory.</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-zinc-300 transition-colors">
              Leaderboard
            </Link>
            <Link href="/submit" className="hover:text-zinc-300 transition-colors">
              Submit SaaS
            </Link>
            <Link href="/#how-it-works" className="hover:text-zinc-300 transition-colors">
              How it Works
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
