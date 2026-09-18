import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { sortLeaderboardProducts } from "./products";

export const getOverviewStats = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();

    const totalProducts = products.length;
    const activeCount = products.filter((p) => p.status === "active").length;
    const suspendedCount = products.filter((p) => p.status === "suspended").length;
    const totalClicks = products.reduce((acc, p) => acc + (p.totalClicks || 0), 0);
    const totalRevenue = products.reduce((acc, p) => acc + (p.lifetimeAmountPaid || p.currentBid || 0), 0);

    return {
      totalRevenue,
      totalProducts,
      activeCount,
      suspendedCount,
      totalClicks,
    };
  },
});

export const getAllProducts = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    const sorted = sortLeaderboardProducts(products, "all");

    return Promise.all(
      sorted.map(async (product, index) => {
        let displayLogo = product.logoUrl;
        if (!displayLogo && product.logoStorageId) {
          displayLogo = (await ctx.storage.getUrl(product.logoStorageId)) || undefined;
        }

        return {
          ...product,
          logoUrl: displayLogo,
          rank: index + 1,
        };
      })
    );
  },
});

export const toggleProductStatus = mutation({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const newStatus = product.status === "active" ? "suspended" : "active";

    await ctx.db.patch(args.productId, {
      status: newStatus,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      productId: args.productId,
      newStatus,
    };
  },
});
