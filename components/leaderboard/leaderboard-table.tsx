"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OutbidDialog } from "@/components/bidding/outbid-dialog";
import {
  Trophy,
  Flame,
  ExternalLink,
  MousePointerClick,
  Sparkles,
  TrendingUp,
  Crown,
  Medal,
} from "lucide-react";
import Link from "next/link";

export function LeaderboardTable() {
  const [timeframe, setTimeframe] = useState<"all" | "today" | "week">("all");
  const [outbidTarget, setOutbidTarget] = useState<any | null>(null);
  const [outbidDialogOpen, setOutbidDialogOpen] = useState(false);

  const products = useQuery(api.products.getLeaderboard, { timeframe });

  const handleOpenOutbid = (product: any) => {
    setOutbidTarget(product);
    setOutbidDialogOpen(true);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header with Timeframe Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-zinc-100 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-emerald-400" />
            Rankings Leaderboard
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real time rankings sorted by bid amount. Bids update instantly.
          </p>
        </div>

        <Tabs
          value={timeframe}
          onValueChange={(val: any) => setTimeframe(val)}
          className="w-auto"
        >
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="all" className="text-xs">
              All Time
            </TabsTrigger>
            <TabsTrigger value="today" className="text-xs">
              Today
            </TabsTrigger>
            <TabsTrigger value="week" className="text-xs">
              This Week
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Loading state */}
      {products === undefined ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-24 w-full bg-zinc-900/60 animate-pulse rounded-2xl border border-zinc-800/80"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border border-zinc-800 bg-zinc-900/20">
          <Trophy className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-zinc-300">No Active SaaS Products Yet</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-6">
            Be the first founder to list your product and secure the #1 rank spotlight!
          </p>
          <Button
            asChild
            className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold"
          >
            <Link href="/submit">Claim #1 Spot Now</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product: any, index: number) => {
            const rank = product.rank || index + 1;
            const isRank1 = rank === 1;
            const isRank2 = rank === 2;
            const isRank3 = rank === 3;
            const isTop3 = isRank1 || isRank2 || isRank3;

            return (
              <div
                key={product._id}
                className={`group relative rounded-2xl p-4 sm:p-5 transition-all duration-200 border ${
                  isRank1
                    ? "bg-gradient-to-r from-amber-500/10 via-zinc-900/80 to-zinc-900/80 border-amber-500/40 shadow-xl shadow-amber-500/5 hover:border-amber-500/60"
                    : isRank2
                    ? "bg-gradient-to-r from-slate-300/10 via-zinc-900/80 to-zinc-900/80 border-slate-400/30 hover:border-slate-400/50"
                    : isRank3
                    ? "bg-gradient-to-r from-orange-500/10 via-zinc-900/80 to-zinc-900/80 border-orange-500/30 hover:border-orange-500/50"
                    : "bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/70"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Left Column: Rank + Logo + Details */}
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Rank Badge */}
                    <div
                      className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl font-black text-base sm:text-lg border ${
                        isRank1
                          ? "bg-amber-500 text-zinc-950 border-amber-400 shadow-md shadow-amber-500/30"
                          : isRank2
                          ? "bg-slate-300 text-zinc-950 border-slate-200"
                          : isRank3
                          ? "bg-orange-400 text-zinc-950 border-orange-300"
                          : "bg-zinc-950 text-zinc-400 border-zinc-800"
                      }`}
                    >
                      {isRank1 ? (
                        <Crown className="w-5 h-5 fill-current" />
                      ) : (
                        `#${rank}`
                      )}
                    </div>

                    {/* Logo */}
                    <div className="h-11 w-11 sm:h-12 sm:w-12 shrink-0 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center font-bold text-base text-zinc-200 overflow-hidden shadow-sm">
                      {product.logoUrl ? (
                        <img
                          src={product.logoUrl}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        product.name[0]
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/product/${product.slug}`}
                          className="font-bold text-base text-zinc-100 hover:text-emerald-400 transition-colors truncate"
                        >
                          {product.name}
                        </Link>
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-zinc-800/80 text-zinc-400 border border-zinc-700/50 px-2 py-0.5"
                        >
                          {product.category}
                        </Badge>
                        {product.gapToNext > 0 && isRank1 && (
                          <span className="text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            🔥 ${product.gapToNext} ahead of #2
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-1">
                        {product.tagline}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                        <span>by {product.founderName}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MousePointerClick className="w-3 h-3" />
                          {product.totalClicks || 0} clicks
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Bid Amount + Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 block">
                        Current Bid
                      </span>
                      <span
                        className={`font-black text-xl sm:text-2xl tracking-tight ${
                          isRank1
                            ? "text-amber-400"
                            : isTop3
                            ? "text-zinc-100"
                            : "text-zinc-300"
                        }`}
                      >
                        ${product.currentBid.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 text-xs"
                      >
                        <a
                          href={`/go/${product._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-3.5 h-3.5 sm:mr-1.5" />
                          <span className="hidden sm:inline">Visit</span>
                        </a>
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleOpenOutbid(product)}
                        className={`text-xs font-bold ${
                          isRank1
                            ? "bg-amber-500 hover:bg-amber-600 text-zinc-950 shadow-md shadow-amber-500/20"
                            : "bg-emerald-500 hover:bg-emerald-600 text-zinc-950 shadow-md shadow-emerald-500/20"
                        }`}
                      >
                        <Flame className="w-3.5 h-3.5 mr-1" />
                        Outbid
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <OutbidDialog
        isOpen={outbidDialogOpen}
        onClose={() => setOutbidDialogOpen(false)}
        targetProduct={outbidTarget}
      />
    </div>
  );
}
