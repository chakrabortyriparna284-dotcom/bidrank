import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const recordClick = mutation({
  args: {
    productId: v.id("products"),
    referrer: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) {
      return null;
    }

    await ctx.db.insert("clicks", {
      productId: args.productId,
      timestamp: Date.now(),
      referrer: args.referrer,
    });

    await ctx.db.patch(args.productId, {
      totalClicks: product.totalClicks + 1,
    });

    return product.websiteUrl;
  },
});
