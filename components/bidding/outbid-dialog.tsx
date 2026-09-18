"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AuthModal } from "@/components/auth/auth-modal";
import {
  Trophy,
  Flame,
  ArrowRight,
  Sparkles,
  AlertCircle,
  PlusCircle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface OutbidDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetProduct: any | null;
}

export function OutbidDialog({ isOpen, onClose, targetProduct }: OutbidDialogProps) {
  const user = useQuery(api.users.currentUser);
  const userProducts = useQuery(api.products.getUserProducts);
  const leaderboard = useQuery(api.products.getLeaderboard, { timeframe: "all" });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [newBid, setNewBid] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Minimum bid strictly required to overtake target
  const minRequiredBid = useMemo(() => {
    if (!targetProduct) return 10;
    return targetProduct.currentBid + 1;
  }, [targetProduct]);

  // Set initial selected product and initial new bid
  useEffect(() => {
    if (targetProduct) {
      setNewBid(targetProduct.currentBid + 1);
    }
  }, [targetProduct]);

  // Select user product: if user owns target product, pre-select it
  useEffect(() => {
    if (userProducts && userProducts.length > 0) {
      const ownsTarget = userProducts.find((p: any) => p._id === targetProduct?._id);
      if (ownsTarget) {
        setSelectedProductId(ownsTarget._id);
      } else if (!selectedProductId) {
        setSelectedProductId(userProducts[0]._id);
      }
    }
  }, [userProducts, targetProduct, selectedProductId]);

  const selectedProduct = useMemo(() => {
    if (!userProducts) return null;
    return userProducts.find((p: any) => p._id === selectedProductId) || null;
  }, [userProducts, selectedProductId]);

  const currentProductBid = selectedProduct?.currentBid || 0;

  // Amount due calculation: difference between new bid and current bid
  const amountDue = useMemo(() => {
    if (newBid <= currentProductBid) {
      return 0;
    }
    return newBid - currentProductBid;
  }, [newBid, currentProductBid]);

  // Estimate new rank
  const estimatedNewRank = useMemo(() => {
    if (!leaderboard) return 1;
    const filtered = leaderboard.filter((p: any) => p._id !== selectedProduct?._id);
    const index = filtered.findIndex((p: any) => newBid > p.currentBid);
    if (index === -1) {
      return filtered.length + 1;
    }
    return index + 1;
  }, [leaderboard, newBid, selectedProduct]);

  const handleOutbidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (!selectedProduct) {
      setError("Please select one of your SaaS products to place this bid");
      return;
    }

    if (newBid < minRequiredBid) {
      setError(`Your bid must be at least $${minRequiredBid} to outbid this product`);
      return;
    }

    if (amountDue <= 0) {
      setError("Amount due must be greater than zero");
      return;
    }

    // In a live system, this triggers Stripe checkout creation
    alert(
      `Ready to checkout: Pay $${amountDue} to raise ${selectedProduct.name} to $${newBid} (Estimated Rank #${estimatedNewRank})`
    );
    onClose();
  };

  if (!targetProduct) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-lg bg-zinc-950 border-zinc-800 text-zinc-100 p-6">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Flame className="w-4 h-4" />
              </div>
              <DialogTitle className="text-xl font-bold">
                Outbid {targetProduct.name}
              </DialogTitle>
            </div>
            <DialogDescription className="text-zinc-400 text-xs">
              Increase your bid to claim a higher position on the public leaderboard.
            </DialogDescription>
          </DialogHeader>

          {/* Competitor Overview */}
          <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-sm text-zinc-200 overflow-hidden">
                {targetProduct.logoUrl ? (
                  <img
                    src={targetProduct.logoUrl}
                    alt={targetProduct.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  targetProduct.name[0]
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-zinc-100">
                    {targetProduct.name}
                  </span>
                  <Badge variant="outline" className="text-[10px] bg-zinc-800 text-zinc-300">
                    Rank #{targetProduct.rank || 1}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-400">Current Bid: ${targetProduct.currentBid}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold text-zinc-500 block">
                Minimum To Outbid
              </span>
              <span className="text-base font-black text-emerald-400">
                ${minRequiredBid}
              </span>
            </div>
          </div>

          {!user ? (
            <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800 text-center space-y-3 my-2">
              <p className="text-xs text-zinc-300">
                You must be signed in to outbid competitors and manage products.
              </p>
              <Button
                size="sm"
                onClick={() => setAuthModalOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-semibold"
              >
                Sign In to Outbid
              </Button>
            </div>
          ) : userProducts && userProducts.length === 0 ? (
            <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800 text-center space-y-3 my-2">
              <p className="text-xs text-zinc-300">
                You do not have any listed SaaS products yet. Submit your SaaS first to compete.
              </p>
              <Button
                asChild
                size="sm"
                className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-semibold"
              >
                <Link href="/submit">
                  <PlusCircle className="w-4 h-4 mr-1.5" />
                  List your SaaS
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleOutbidSubmit} className="space-y-4 pt-1">
              {/* Product Selector */}
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">Select Your SaaS Product</Label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {userProducts?.map((product: any) => (
                    <option key={product._id} value={product._id}>
                      {product.name} (Current Bid: ${product.currentBid})
                    </option>
                  ))}
                </select>
              </div>

              {/* Proposed New Bid */}
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">Your New Bid ($USD)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-400 font-bold">$</span>
                  <Input
                    type="number"
                    min={minRequiredBid}
                    step={1}
                    value={newBid}
                    onChange={(e) => setNewBid(Number(e.target.value))}
                    className="pl-8 bg-zinc-900 border-zinc-700 text-zinc-100 font-bold text-lg focus-visible:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Price Calculation Card */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2 text-xs">
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Your Current Bid</span>
                  <span className="font-semibold text-zinc-300">${currentProductBid}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Target Competitor Bid</span>
                  <span className="font-semibold text-zinc-300">${targetProduct.currentBid}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Estimated New Position</span>
                  <span className="font-bold text-emerald-400 text-sm">#{estimatedNewRank}</span>
                </div>
                <div className="border-t border-zinc-800/80 pt-2 flex justify-between items-center text-sm font-bold">
                  <span className="text-zinc-200">Amount Due Today</span>
                  <span className="text-emerald-400 text-base">${amountDue}</span>
                </div>
              </div>

              {error && (
                <div className="p-3 text-xs bg-red-950/40 border border-red-800/60 rounded-md text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold py-6 text-sm shadow-lg shadow-emerald-500/20"
              >
                Pay ${amountDue} and Move to #{estimatedNewRank}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode="signIn"
      />
    </>
  );
}
