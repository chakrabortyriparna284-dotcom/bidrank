"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ShieldAlert,
  DollarSign,
  Package,
  MousePointerClick,
  Database,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Ban,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export default function AdminPage() {
  const stats = useQuery(api.admin.getOverviewStats);
  const products = useQuery(api.admin.getAllProducts);
  const seedProducts = useMutation(api.seed.seedProducts);
  const toggleStatus = useMutation(api.admin.toggleProductStatus);

  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMessage(null);
    setActionError(null);
    try {
      const result = await seedProducts();
      setSeedMessage(result.message);
    } catch (err: any) {
      setActionError(err?.message || "Failed to seed database");
    } finally {
      setSeeding(false);
    }
  };

  const handleToggle = async (productId: any) => {
    setActionError(null);
    try {
      await toggleStatus({ productId });
    } catch (err: any) {
      setActionError(err?.message || "Failed to toggle product status");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight text-zinc-100">
              Platform Administration
            </h1>
            <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-400 border-red-500/30 font-bold">
              OPERATOR
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Oversee marketplace health, moderate listings, and manage seed data.
          </p>
        </div>

        <Button
          onClick={handleSeed}
          disabled={seeding}
          className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {seeding ? "Seeding Database..." : "Seed 15 Realistic SaaS"}
        </Button>
      </div>

      {seedMessage && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{seedMessage}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-2xl text-red-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Platform Metric Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800/80 p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-zinc-400 uppercase font-semibold block">
                Platform Revenue
              </span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                ${(stats?.totalRevenue || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800/80 p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-zinc-400 uppercase font-semibold block">
                Active Listings
              </span>
              <span className="text-2xl font-black text-zinc-100 font-mono">
                {stats?.activeCount ?? "--"}
              </span>
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800/80 p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-zinc-400 uppercase font-semibold block">
                Suspended
              </span>
              <span className="text-2xl font-black text-amber-400 font-mono">
                {stats?.suspendedCount ?? "--"}
              </span>
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800/80 p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <MousePointerClick className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-zinc-400 uppercase font-semibold block">
                Total Outbound Clicks
              </span>
              <span className="text-2xl font-black text-zinc-100 font-mono">
                {(stats?.totalClicks || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Moderation Inventory Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-100">Product Moderation Inventory</h2>
          <span className="text-xs text-zinc-400">
            {products ? `${products.length} Total Submissions` : "Loading..."}
          </span>
        </div>

        {products === undefined ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-zinc-900/50 animate-pulse rounded-2xl border border-zinc-800" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card className="bg-zinc-900/30 border-zinc-800 text-center py-16 px-4">
            <Database className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-300">Database is empty</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-6">
              Use the seed button above to populate 15 realistic SaaS products across categories.
            </p>
            <Button
              onClick={handleSeed}
              disabled={seeding}
              className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold"
            >
              Seed 15 Realistic SaaS Products
            </Button>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-zinc-800/80 bg-zinc-900/40">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/60 text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="px-5 py-3 font-semibold">Rank & Product</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold text-right">Current Bid</th>
                  <th className="px-5 py-3 font-semibold text-right">Clicks</th>
                  <th className="px-5 py-3 font-semibold text-center">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {products.map((product: any) => {
                  const isActive = product.status === "active";
                  const isSuspended = product.status === "suspended";

                  return (
                    <tr key={product._id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-zinc-500 w-6">
                            #{product.rank}
                          </span>
                          <div className="h-9 w-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-200 shrink-0 overflow-hidden">
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
                          <div>
                            <span className="font-bold text-zinc-100 block text-sm">
                              {product.name}
                            </span>
                            <span className="text-[11px] text-zinc-500 truncate block max-w-xs">
                              {product.tagline}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <Badge variant="secondary" className="text-[10px] bg-zinc-800 text-zinc-400">
                          {product.category}
                        </Badge>
                      </td>

                      <td className="px-5 py-4 text-right font-mono font-bold text-emerald-400">
                        ${product.currentBid.toLocaleString()}
                      </td>

                      <td className="px-5 py-4 text-right font-mono text-zinc-400">
                        {(product.totalClicks || 0).toLocaleString()}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase font-semibold ${
                            isActive
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : isSuspended
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              : "bg-zinc-800 text-zinc-400 border-zinc-700"
                          }`}
                        >
                          {product.status}
                        </Badge>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                          >
                            <Link href={`/product/${product.slug}`}>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </Button>

                          <Button
                            onClick={() => handleToggle(product._id)}
                            variant="outline"
                            size="sm"
                            className={`h-8 text-xs font-semibold ${
                              isActive
                                ? "border-amber-900/40 text-amber-400 hover:bg-amber-950/30"
                                : "border-emerald-900/40 text-emerald-400 hover:bg-emerald-950/30"
                            }`}
                          >
                            {isActive ? (
                              <>
                                <Ban className="w-3 h-3 mr-1" />
                                Suspend
                              </>
                            ) : (
                              <>
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Reactivate
                              </>
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
