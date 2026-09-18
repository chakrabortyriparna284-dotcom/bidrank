import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export function calculateOutbidRequirement(targetBid: number): number {
  return targetBid + 1;
}

export function calculateAmountDue(currentBid: number, proposedBid: number): {
  amountDueDollars: number;
  amountDueCents: number;
} {
  const diff = Math.max(0, proposedBid - currentBid);
  return {
    amountDueDollars: diff,
    amountDueCents: Math.round(diff * 100),
  };
}

export const validateOutbid = query({
  args: {
    targetProductId: v.id("products"),
    userProductId: v.optional(v.id("products")),
    proposedBid: v.number(),
  },
  handler: async (ctx, args) => {
    const targetProduct = await ctx.db.get(args.targetProductId);
    if (!targetProduct || targetProduct.status !== "active") {
      return {
        isValid: false,
        error: "Target product not found or not currently active",
        minRequiredBid: 10,
        amountDueDollars: 0,
        amountDueCents: 0,
        isDuplicateBid: false,
      };
    }

    const minRequiredBid = calculateOutbidRequirement(targetProduct.currentBid);

    if (args.proposedBid < minRequiredBid) {
      return {
        isValid: false,
        error: `Bid must be at least $${minRequiredBid} to outbid rank #${targetProduct.name}`,
        minRequiredBid,
        amountDueDollars: 0,
        amountDueCents: 0,
        isDuplicateBid: false,
      };
    }

    // Check if proposed bid is a duplicate of any active listing
    const existingActiveProducts = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    const isDuplicate = existingActiveProducts.some(
      (p) => p._id !== args.userProductId && p.currentBid === args.proposedBid
    );

    if (isDuplicate) {
      return {
        isValid: false,
        error: `Another active product already has a bid of $${args.proposedBid}. Bids must be strictly unique.`,
        minRequiredBid: args.proposedBid + 1,
        amountDueDollars: 0,
        amountDueCents: 0,
        isDuplicateBid: true,
      };
    }

    let userCurrentBid = 0;
    if (args.userProductId) {
      const userProduct = await ctx.db.get(args.userProductId);
      if (userProduct) {
        userCurrentBid = userProduct.currentBid;
      }
    }

    const { amountDueDollars, amountDueCents } = calculateAmountDue(
      userCurrentBid,
      args.proposedBid
    );

    return {
      isValid: true,
      error: null,
      minRequiredBid,
      amountDueDollars,
      amountDueCents,
      isDuplicateBid: false,
    };
  },
});

export const getHistory = query({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bidEvents")
      .withIndex("by_productId", (q) => q.eq("productId", args.productId))
      .order("desc")
      .take(50);
  },
});
