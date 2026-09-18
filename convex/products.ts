import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    // Sort by currentBid descending, and tie break by earliest lastBidAt ascending
    return products.sort((a, b) => {
      if (b.currentBid !== a.currentBid) {
        return b.currentBid - a.currentBid;
      }
      return a.lastBidAt - b.lastBidAt;
    });
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    const totalBids = products.reduce((acc, p) => acc + p.lifetimeAmountPaid, 0);
    const totalProducts = products.length;
    const totalClicks = products.reduce((acc, p) => acc + p.totalClicks, 0);

    return {
      totalBids,
      totalProducts,
      totalClicks,
    };
  },
});
