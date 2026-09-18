import { action, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { StripePaymentAdapter } from "./lib/payments/stripe";
import { internal } from "./_generated/api";

export const getPaymentRequirement = internalQuery({
  args: {
    productId: v.id("products"),
    userId: v.id("users"),
    proposedBid: v.number(),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) {
      return { canProceed: false, reason: "Product not found", amountDueInCents: 0, productName: "", slug: "" };
    }

    if (product.userId !== args.userId) {
      return { canProceed: false, reason: "Forbidden: You do not own this product", amountDueInCents: 0, productName: "", slug: "" };
    }

    const isInitial = product.status === "awaiting_payment" || (product.lifetimeAmountPaid || 0) === 0;

    if (isInitial) {
      if (args.proposedBid < 10) {
        return { canProceed: false, reason: "Minimum initial bid is $10", amountDueInCents: 0, productName: "", slug: "" };
      }
      return {
        canProceed: true,
        amountDueInCents: Math.round(args.proposedBid * 100),
        productName: product.name,
        slug: product.slug,
      };
    }

    // Outbid on active listing: must be strictly greater than current bid
    if (args.proposedBid <= product.currentBid) {
      return {
        canProceed: false,
        reason: `Proposed bid must be strictly greater than current bid of $${product.currentBid}`,
        amountDueInCents: 0,
        productName: product.name,
        slug: product.slug,
      };
    }

    const diff = args.proposedBid - product.currentBid;
    return {
      canProceed: true,
      amountDueInCents: Math.round(diff * 100),
      productName: product.name,
      slug: product.slug,
    };
  },
});

export const createCheckoutSession = action({
  args: {
    productId: v.id("products"),
    proposedBid: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: Please sign in to complete checkout");
    }

    const validation: any = await ctx.runQuery(internal.payments.getPaymentRequirement, {
      productId: args.productId,
      userId,
      proposedBid: args.proposedBid,
    });

    if (!validation.canProceed) {
      throw new Error(validation.reason || "Payment validation failed");
    }

    const adapter = new StripePaymentAdapter();
    const siteUrl = process.env.SITE_URL || "http://localhost:3000";

    const result = await adapter.createCheckoutSession({
      productId: args.productId,
      userId,
      productName: validation.productName,
      amountDue: validation.amountDueInCents,
      newBid: args.proposedBid,
      successUrl: `${siteUrl}/product/${validation.slug}?payment=success`,
      cancelUrl: `${siteUrl}/#leaderboard`,
    });

    return {
      checkoutUrl: result.checkoutUrl,
      amountDue: validation.amountDueInCents / 100,
    };
  },
});

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
    const isInitialListing = product.status === "awaiting_payment" || (product.lifetimeAmountPaid || 0) === 0;
    
    const previousBid = isInitialListing ? 0 : product.currentBid;
    const newBid = isInitialListing ? product.currentBid : product.currentBid + amountInDollars;
    const now = Date.now();

    // Compute previous rank among active products
    const activeProducts = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    const previousSorted = [...activeProducts].sort((a, b) => b.currentBid - a.currentBid);
    const prevIndex = previousSorted.findIndex((p) => p._id === product._id);
    const previousRank = prevIndex !== -1 ? prevIndex + 1 : undefined;

    // Record payment
    await ctx.db.insert("payments", {
      userId: args.userId,
      productId: args.productId,
      provider: args.provider,
      providerPaymentId: args.providerPaymentId,
      amount: args.amountPaidInCents,
      currency: "usd",
      status: "succeeded",
      type: isInitialListing ? "initial_bid" : "outbid",
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
      lifetimeAmountPaid: (product.lifetimeAmountPaid || 0) + amountInDollars,
      dailyBid: (product.dailyBid || 0) + amountInDollars,
      weeklyBid: (product.weeklyBid || 0) + amountInDollars,
      lastBidAt: now,
      status: "active",
      updatedAt: now,
    });

    // Compute new rank
    const updatedActive = activeProducts.map((p) =>
      p._id === product._id ? { ...p, currentBid: newBid } : p
    );
    if (!updatedActive.some((p) => p._id === product._id)) {
      updatedActive.push({ ...product, currentBid: newBid, status: "active" });
    }
    const newSorted = updatedActive.sort((a, b) => b.currentBid - a.currentBid);
    const newRank = newSorted.findIndex((p) => p._id === product._id) + 1;

    // Record immutable bid event
    await ctx.db.insert("bidEvents", {
      productId: args.productId,
      previousRank,
      newRank,
      previousBid,
      newBid,
      createdAt: now,
    });

    return { success: true, previousRank, newRank };
  },
});
