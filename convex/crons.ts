import { cronJobs } from "convex/server";
import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

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

const crons = cronJobs();

crons.daily(
  "reset-daily-bids",
  { hourUTC: 0, minuteUTC: 0 },
  internal.crons.resetDailyBids
);

crons.weekly(
  "reset-weekly-bids",
  { dayOfWeek: "monday", hourUTC: 0, minuteUTC: 0 },
  internal.crons.resetWeeklyBids
);

export default crons;
