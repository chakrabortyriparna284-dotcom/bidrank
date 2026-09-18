import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  products: defineTable({
    userId: v.id("users"),
    name: v.string(),
    slug: v.string(),
    websiteUrl: v.string(),
    logoUrl: v.optional(v.string()),
    logoStorageId: v.optional(v.id("_storage")),
    tagline: v.string(),
    description: v.string(),
    category: v.string(),
    founderName: v.string(),
    twitterUrl: v.optional(v.string()),
    demoUrl: v.optional(v.string()),
    currentBid: v.number(), // in dollars
    lifetimeAmountPaid: v.number(), // in dollars
    lastBidAt: v.number(), // timestamp for tie breaking
    totalClicks: v.number(),
    status: v.union(
      v.literal("draft"),
      v.literal("awaiting_payment"),
      v.literal("active"),
      v.literal("suspended"),
      v.literal("archived")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_status_and_currentBid", ["status", "currentBid"]),

  bids: defineTable({
    productId: v.id("products"),
    userId: v.id("users"),
    previousBid: v.number(),
    newBid: v.number(),
    amountPaid: v.number(), // in dollars
    paymentId: v.string(),
    status: v.union(v.literal("pending"), v.literal("succeeded"), v.literal("failed")),
    createdAt: v.number(),
  })
    .index("by_productId", ["productId"])
    .index("by_userId", ["userId"])
    .index("by_paymentId", ["paymentId"]),

  payments: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    provider: v.string(), // "stripe" | "dodo"
    providerPaymentId: v.string(),
    amount: v.number(), // in cents
    currency: v.string(),
    status: v.string(),
    type: v.string(), // "initial_bid" | "outbid"
    createdAt: v.number(),
  })
    .index("by_providerPaymentId", ["providerPaymentId"])
    .index("by_productId", ["productId"])
    .index("by_userId", ["userId"]),

  clicks: defineTable({
    productId: v.id("products"),
    timestamp: v.number(),
    referrer: v.optional(v.string()),
  }).index("by_productId", ["productId"]),

  bidEvents: defineTable({
    productId: v.id("products"),
    previousRank: v.optional(v.number()),
    newRank: v.number(),
    previousBid: v.number(),
    newBid: v.number(),
    createdAt: v.number(),
  }).index("by_productId", ["productId"]),
});
