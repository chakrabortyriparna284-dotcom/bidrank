"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { OutbidDialog } from "@/components/bidding/outbid-dialog";
import {
  Trophy,
  Flame,
  ExternalLink,
  MousePointerClick,
  DollarSign,
  TrendingUp,
  Calendar,
  ArrowLeft,
  Share2,
  Check,
  Globe,
  Twitter,
  Play,
  Clock,
  Award,
} from "lucide-react";

export default function ProductProfilePage() {
  const params = useParams();
  const slug = (params?.slug as string) || "";

  const product = useQuery(api.products.getBySlug, slug ? { slug } : "skip");
  const leaderboard = useQuery(api.products.getLeaderboard, { timeframe: "all" });
  const bidHistory = useQuery(
    api.bids.getHistory,
    product ? { productId: product._id } : "skip"
  );

  const [outbidModalOpen, setOutbidModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Loading state
  if (product === undefined) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-6">
        <div className="h-6 w-32 bg-zinc-900 animate-pulse rounded" />
        <div className="flex gap-6 items-center">
          <div className="h-20 w-20 rounded-2xl bg-zinc-900 animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-8 w-64 bg-zinc-900 animate-pulse rounded" />
            <div className="h-4 w-96 bg-zinc-900 animate-pulse rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-zinc-900 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // Not found state
  if (product === null) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto">
          <Trophy className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-100">Product Not Found</h1>
        <p className="text-xs text-zinc-400">
          The requested SaaS profile does not exist or has been removed from the directory.
        </p>
        <Button
          asChild
          className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold"
        >
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leaderboard
          </Link>
        </Button>
      </div>
    );
  }

  const isRankOne = product.rank === 1;
  const topProduct = leaderboard && leaderboard.length > 0 ? leaderboard[0] : null;
  const gapToFirst = topProduct && !isRankOne
    ? Math.max(0, topProduct.currentBid - product.currentBid)
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      {/* Back Link */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Back to Global Leaderboard
        </Link>
      </div>

      {/* Main Profile Header */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-5">
            <div className="h-20 w-20 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-2xl font-bold text-zinc-100 shrink-0 overflow-hidden shadow-md">
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

            <div className="space-y-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-100">
                  {product.name}
                </h1>
                {product.rank && (
                  <Badge
                    className={`font-black text-xs px-2.5 py-0.5 ${
                      product.rank === 1
                        ? "bg-amber-500 text-zinc-950 border-amber-400 font-extrabold"
                        : product.rank === 2
                        ? "bg-zinc-300 text-zinc-950 border-zinc-200"
                        : product.rank === 3
                        ? "bg-amber-700 text-zinc-100 border-amber-600"
                        : "bg-zinc-800 text-zinc-300 border-zinc-700"
                    }`}
                  >
                    Rank #{product.rank}
                  </Badge>
                )}
                <Badge
                  variant="secondary"
                  className="text-xs bg-zinc-800 text-zinc-300 border border-zinc-700"
                >
                  {product.category}
                </Badge>
              </div>

              <p className="text-sm text-zinc-300 font-medium max-w-2xl">
                {product.tagline}
              </p>

              {/* Social and links */}
              <div className="flex items-center gap-4 text-xs text-zinc-400 pt-2 flex-wrap">
                <a
                  href={product.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 mr-1" />
                  Visit Website
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>

                {product.twitterUrl && (
                  <a
                    href={product.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    <Twitter className="w-3.5 h-3.5 mr-1" />
                    Founder Twitter
                  </a>
                )}

                {product.demoUrl && (
                  <a
                    href={product.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 mr-1" />
                    Interactive Demo
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 text-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 mr-1" />
                  Share
                </>
              )}
            </Button>

            <Button
              size="sm"
              onClick={() => setOutbidModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs shadow-md shadow-emerald-500/20"
            >
              <Flame className="w-3.5 h-3.5 mr-1.5" />
              {isRankOne ? "Increase Lead" : `Outbid Rank #${product.rank || 1}`}
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800/80 p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-zinc-400 uppercase font-semibold block">
                Leaderboard Position
              </span>
              <span className="text-2xl font-black text-amber-400 font-mono">
                {product.rank ? `#${product.rank}` : "Unranked"}
              </span>
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800/80 p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-zinc-400 uppercase font-semibold block">
                Current Bid
              </span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                ${product.currentBid.toLocaleString()}
              </span>
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800/80 p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <MousePointerClick className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-zinc-400 uppercase font-semibold block">
                Total Clicks
              </span>
              <span className="text-2xl font-black text-zinc-100 font-mono">
                {(product.totalClicks || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800/80 p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-zinc-400 uppercase font-semibold block">
                Lifetime Paid
              </span>
              <span className="text-2xl font-black text-zinc-100 font-mono">
                ${(product.lifetimeAmountPaid || product.currentBid).toLocaleString()}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Description & Competitor Context */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          <h2 className="text-lg font-bold text-zinc-100">About {product.name}</h2>
          <div className="bg-zinc-900/30 border border-zinc-800/70 rounded-2xl p-6 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {product.description}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-zinc-100">Competitive Status</h2>
          <div className="bg-zinc-900/30 border border-zinc-800/70 rounded-2xl p-6 space-y-4">
            {isRankOne ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-400">
                  <Award className="w-5 h-5" />
                  <span className="font-bold text-sm">Leader of the Pack</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  This product currently holds the #1 crown on BidRank. Defend the position by raising your bid before rivals strike.
                </p>
              </div>
            ) : topProduct ? (
              <div className="space-y-3">
                <div>
                  <span className="text-[11px] text-zinc-400 uppercase font-semibold block">
                    Distance to Crown (#1)
                  </span>
                  <span className="text-xl font-bold text-amber-400 font-mono">
                    ${gapToFirst.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Currently trailing #{topProduct.name} by ${gapToFirst}. A bid of ${topProduct.currentBid + 1} takes the throne.
                </p>
              </div>
            ) : null}

            <Button
              onClick={() => setOutbidModalOpen(true)}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs"
            >
              <Flame className="w-3.5 h-3.5 mr-1.5" />
              Claim Higher Rank
            </Button>
          </div>
        </div>
      </div>

      {/* Ranking & Bid History Timeline */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-100">Ranking & Bid History</h2>

        {bidHistory === undefined ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-zinc-900/50 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : bidHistory.length === 0 ? (
          <div className="bg-zinc-900/30 border border-zinc-800/70 rounded-2xl p-8 text-center space-y-2">
            <Clock className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-xs text-zinc-400">
              No historical bid changes recorded yet. Initial listing bid is active.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bidHistory.map((event: any, index: number) => {
              const dateStr = new Date(event.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              const bidIncrease = event.newBid - event.previousBid;

              return (
                <div
                  key={event._id || index}
                  className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-zinc-100">
                          Bid increased to ${event.newBid}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        >
                          +${bidIncrease}
                        </Badge>
                      </div>
                      <span className="text-xs text-zinc-500">
                        Achieved Rank #{event.newRank} • {dateStr}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-zinc-300 block">
                      ${event.newBid}
                    </span>
                    <span className="text-[11px] text-zinc-500">Total Bid</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <OutbidDialog
        isOpen={outbidModalOpen}
        onClose={() => setOutbidModalOpen(false)}
        targetProduct={product}
      />
    </div>
  );
}
