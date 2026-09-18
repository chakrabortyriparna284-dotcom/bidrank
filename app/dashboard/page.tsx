"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AuthModal } from "@/components/auth/auth-modal";
import { OutbidDialog } from "@/components/bidding/outbid-dialog";
import { EditProductDialog } from "@/components/dashboard/edit-product-dialog";
import {
  Trophy,
  Flame,
  PlusCircle,
  ExternalLink,
  Edit,
  MousePointerClick,
  TrendingUp,
  DollarSign,
  Package,
  AlertCircle,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function DashboardPage() {
  const user = useQuery(api.users.currentUser);
  const userProducts = useQuery(api.products.getUserProducts);
  const leaderboard = useQuery(api.products.getLeaderboard, { timeframe: "all" });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedProductForBid, setSelectedProductForBid] = useState<any | null>(null);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<any | null>(null);

  // Calculate founder overview statistics
  const stats = useMemo(() => {
    if (!userProducts) {
      return { totalProducts: 0, totalSpent: 0, totalClicks: 0, bestRank: "--" };
    }

    const totalProducts = userProducts.length;
    const totalSpent = userProducts.reduce((acc: number, p: any) => acc + (p.lifetimeAmountPaid || 0), 0);
    const totalClicks = userProducts.reduce((acc: number, p: any) => acc + (p.totalClicks || 0), 0);

    // Calculate best rank among active products on the leaderboard
    let bestRank: string | number = "--";
    if (leaderboard) {
      const activeIds = new Set(userProducts.filter((p: any) => p.status === "active").map((p: any) => p._id));
      const rankedMatches = leaderboard.filter((p: any) => activeIds.has(p._id));
      if (rankedMatches.length > 0) {
        bestRank = `#${rankedMatches[0].rank || 1}`;
      }
    }

    return { totalProducts, totalSpent, totalClicks, bestRank };
  }, [userProducts, leaderboard]);

  if (user === undefined) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="h-8 w-48 bg-zinc-900 animate-pulse rounded-md mx-auto mb-4" />
        <div className="h-4 w-64 bg-zinc-900 animate-pulse rounded-md mx-auto" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
          <Trophy className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-100">Sign in to view your dashboard</h1>
        <p className="text-xs text-zinc-400">
          Manage your listed SaaS products, adjust your bids, and track visitor traffic.
        </p>
        <Button
          onClick={() => setAuthModalOpen(true)}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold"
        >
          Sign In
        </Button>
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          defaultMode="signIn"
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-100">
            Founder Dashboard
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Welcome back, {user.name || "Founder"}. Monitor your SaaS rankings and visitor engagement.
          </p>
        </div>

        <Button
          asChild
          className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold shadow-lg shadow-emerald-500/20"
        >
          <Link href="/submit">
            <PlusCircle className="w-4 h-4 mr-2" />
            List Another SaaS
          </Link>
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800/80 p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-zinc-400 uppercase font-semibold block">
                Total Products
              </span>
              <span className="text-2xl font-black text-zinc-100 font-mono">
                {stats.totalProducts}
              </span>
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800/80 p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-zinc-400 uppercase font-semibold block">
                Total Spent
              </span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                ${stats.totalSpent.toLocaleString()}
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
                {stats.totalClicks.toLocaleString()}
              </span>
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800/80 p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-zinc-400 uppercase font-semibold block">
                Best Rank
              </span>
              <span className="text-2xl font-black text-amber-400 font-mono">
                {stats.bestRank}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Listed Products List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-zinc-100">Your SaaS Products</h2>

        {userProducts === undefined ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-28 w-full bg-zinc-900/50 animate-pulse rounded-2xl border border-zinc-800"
              />
            ))}
          </div>
        ) : userProducts.length === 0 ? (
          <Card className="bg-zinc-900/30 border-zinc-800 text-center py-16 px-4">
            <Package className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-300">You haven't listed any SaaS yet</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-6">
              Submit your product, choose your initial bid, and start competing on the leaderboard.
            </p>
            <Button
              asChild
              className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold"
            >
              <Link href="/submit">List your first SaaS</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {userProducts.map((product: any) => {
              const isActive = product.status === "active";
              const isAwaitingPayment = product.status === "awaiting_payment";

              return (
                <div
                  key={product._id}
                  className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                    {/* Left details */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-14 w-14 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center font-bold text-lg text-zinc-200 shrink-0 overflow-hidden shadow-sm">
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

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-base text-zinc-100 truncate">
                            {product.name}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] uppercase font-semibold ${
                              isActive
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : isAwaitingPayment
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                : "bg-zinc-800 text-zinc-400 border-zinc-700"
                            }`}
                          >
                            {product.status.replace("_", " ")}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="text-[10px] bg-zinc-800 text-zinc-400"
                          >
                            {product.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-1">
                          {product.tagline}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-zinc-500 pt-1">
                          <span>Current Bid: <strong className="text-zinc-200">${product.currentBid}</strong></span>
                          <span>Lifetime Paid: <strong className="text-zinc-200">${product.lifetimeAmountPaid || 0}</strong></span>
                          <span>Clicks: <strong className="text-zinc-200">{product.totalClicks || 0}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 border-zinc-800/60 pt-3 md:pt-0">
                      {isAwaitingPayment ? (
                        <Button
                          asChild
                          size="sm"
                          className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs"
                        >
                          <Link href="/submit">
                            Activate Listing (${product.currentBid})
                            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => setSelectedProductForBid(product)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs shadow-md shadow-emerald-500/20"
                        >
                          <Flame className="w-3.5 h-3.5 mr-1.5" />
                          Increase Bid
                        </Button>
                      )}

                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 text-xs"
                      >
                        <Link href={`/product/${product.slug}`}>
                          <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                          Public Page
                        </Link>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedProductForEdit(product)}
                        className="border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 text-xs"
                      >
                        <Edit className="w-3.5 h-3.5 mr-1.5" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <OutbidDialog
        isOpen={!!selectedProductForBid}
        onClose={() => setSelectedProductForBid(null)}
        targetProduct={selectedProductForBid}
      />

      <EditProductDialog
        isOpen={!!selectedProductForEdit}
        onClose={() => setSelectedProductForEdit(null)}
        product={selectedProductForEdit}
      />
    </div>
  );
}
