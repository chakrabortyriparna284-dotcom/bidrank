import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export function sortLeaderboardProducts(
  products: any[],
  timeframe: "all" | "today" | "week" = "all"
) {
  return [...products].sort((a, b) => {
    let scoreA = a.currentBid;
    let scoreB = b.currentBid;

    if (timeframe === "today") {
      scoreA = a.dailyBid ?? 0;
      scoreB = b.dailyBid ?? 0;
    } else if (timeframe === "week") {
      scoreA = a.weeklyBid ?? 0;
      scoreB = b.weeklyBid ?? 0;
    }

    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }
    // Fallback tie break by lastBidAt timestamp ascending (earliest wins)
    return (a.lastBidAt ?? 0) - (b.lastBidAt ?? 0);
  });
}

export const getLeaderboard = query({
  args: {
    timeframe: v.optional(v.union(v.literal("all"), v.literal("today"), v.literal("week"))),
  },
  handler: async (ctx, args) => {
    const timeframe = args.timeframe || "all";
    const products = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    const sorted = sortLeaderboardProducts(products, timeframe);

    // Attach 1-based rank and rank diff text
    return sorted.map((product, index) => {
      const rank = index + 1;
      const nextProduct = sorted[index + 1];
      const gapToNext = nextProduct
        ? Math.max(0, product.currentBid - nextProduct.currentBid)
        : 0;

      return {
        ...product,
        rank,
        gapToNext,
      };
    });
  },
});

export const getBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!product) {
      return null;
    }

    // Compute current rank if active
    let rank = null;
    if (product.status === "active") {
      const allActive = await ctx.db
        .query("products")
        .withIndex("by_status", (q) => q.eq("status", "active"))
        .collect();

      const sorted = sortLeaderboardProducts(allActive, "all");
      const index = sorted.findIndex((p) => p._id === product._id);
      if (index !== -1) {
        rank = index + 1;
      }
    }

    return {
      ...product,
      rank,
    };
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    const totalBids = products.reduce((acc, p) => acc + (p.lifetimeAmountPaid || 0), 0);
    const totalProducts = products.length;
    const totalClicks = products.reduce((acc, p) => acc + (p.totalClicks || 0), 0);

    return {
      totalBids,
      totalProducts,
      totalClicks,
    };
  },
});
