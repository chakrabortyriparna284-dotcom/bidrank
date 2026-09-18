import { internalMutation } from "./_generated/server";

export const resetDailyBids = internalMutation({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    let count = 0;
    for (const product of products) {
      if (product.dailyBid !== 0) {
        await ctx.db.patch(product._id, { dailyBid: 0 });
        count++;
      }
    }
    return { resetCount: count };
  },
});

export const resetWeeklyBids = internalMutation({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    let count = 0;
    for (const product of products) {
      if (product.weeklyBid !== 0) {
        await ctx.db.patch(product._id, { weeklyBid: 0 });
        count++;
      }
    }
    return { resetCount: count };
  },
});
