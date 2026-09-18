import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const fulfillPayment = internalMutation({
  args: {
    provider: v.string(),
    providerPaymentId: v.string(),
    productId: v.id("products"),
    userId: v.id("users"),
    amountPaidInCents: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if payment was already processed (idempotency check)
    const existingPayment = await ctx.db
      .query("payments")
      .withIndex("by_providerPaymentId", (q) =>
        q.eq("providerPaymentId", args.providerPaymentId)
      )
      .first();

    if (existingPayment) {
      return { success: true, alreadyProcessed: true };
    }

    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const amountInDollars = args.amountPaidInCents / 100;
    const previousBid = product.currentBid;
    const newBid = product.currentBid + amountInDollars;
    const now = Date.now();

    // Record payment
    await ctx.db.insert("payments", {
      userId: args.userId,
      productId: args.productId,
      provider: args.provider,
      providerPaymentId: args.providerPaymentId,
      amount: args.amountPaidInCents,
      currency: "usd",
      status: "succeeded",
      type: previousBid === 0 ? "initial_bid" : "outbid",
      createdAt: now,
    });

    // Record bid
    await ctx.db.insert("bids", {
      productId: args.productId,
      userId: args.userId,
      previousBid,
      newBid,
      amountPaid: amountInDollars,
      paymentId: args.providerPaymentId,
      status: "succeeded",
      createdAt: now,
    });

    // Update product bid and activate if awaiting payment
    await ctx.db.patch(args.productId, {
      currentBid: newBid,
      lifetimeAmountPaid: product.lifetimeAmountPaid + amountInDollars,
      lastBidAt: now,
      status: product.status === "awaiting_payment" ? "active" : product.status,
      updatedAt: now,
    });

    return { success: true };
  },
});
