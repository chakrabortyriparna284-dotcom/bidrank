import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^a-z0-9-]/g, "") // Remove all non-word chars except hyphen
    .replace(/-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

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

    // Attach 1-based rank and resolved logo URLs
    return Promise.all(
      sorted.map(async (product, index) => {
        const rank = index + 1;
        const nextProduct = sorted[index + 1];
        const gapToNext = nextProduct
          ? Math.max(0, product.currentBid - nextProduct.currentBid)
          : 0;

        let displayLogo = product.logoUrl;
        if (!displayLogo && product.logoStorageId) {
          displayLogo = (await ctx.storage.getUrl(product.logoStorageId)) || undefined;
        }

        return {
          ...product,
          logoUrl: displayLogo,
          rank,
          gapToNext,
        };
      })
    );
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

    let displayLogo = product.logoUrl;
    if (!displayLogo && product.logoStorageId) {
      displayLogo = (await ctx.storage.getUrl(product.logoStorageId)) || undefined;
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
      logoUrl: displayLogo,
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

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: Please sign in to upload assets");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const checkSlugAvailability = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const normalized = slugify(args.slug);
    if (!normalized) {
      return false;
    }
    const existing = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", normalized))
      .first();

    return !existing;
  },
});

export const createProduct = mutation({
  args: {
    name: v.string(),
    tagline: v.string(),
    description: v.string(),
    category: v.string(),
    websiteUrl: v.string(),
    founderName: v.string(),
    initialBid: v.number(),
    logoUrl: v.optional(v.string()),
    logoStorageId: v.optional(v.id("_storage")),
    twitterUrl: v.optional(v.string()),
    demoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: Please sign in to submit a SaaS listing");
    }

    if (!args.name.trim()) {
      throw new Error("Product name is required");
    }

    if (args.initialBid < 10) {
      throw new Error("Minimum initial bid is $10");
    }

    // Generate unique slug
    let baseSlug = slugify(args.name);
    if (!baseSlug) {
      baseSlug = "saas";
    }

    let candidateSlug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", candidateSlug))
        .first();

      if (!existing) {
        break;
      }
      counter += 1;
      candidateSlug = `${baseSlug}-${counter}`;
    }

    const now = Date.now();
    const productId = await ctx.db.insert("products", {
      userId,
      name: args.name.trim(),
      slug: candidateSlug,
      tagline: args.tagline.trim(),
      description: args.description.trim(),
      category: args.category.trim(),
      websiteUrl: args.websiteUrl.trim(),
      founderName: args.founderName.trim(),
      logoUrl: args.logoUrl?.trim() || undefined,
      logoStorageId: args.logoStorageId,
      twitterUrl: args.twitterUrl?.trim() || undefined,
      demoUrl: args.demoUrl?.trim() || undefined,
      currentBid: args.initialBid,
      dailyBid: args.initialBid,
      weeklyBid: args.initialBid,
      lifetimeAmountPaid: 0,
      totalClicks: 0,
      lastBidAt: now,
      status: "awaiting_payment",
      createdAt: now,
      updatedAt: now,
    });

    return {
      productId,
      slug: candidateSlug,
    };
  },
});

export const getUserProducts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const products = await ctx.db
      .query("products")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    // Map and resolve logo storage IDs
    return Promise.all(
      products.map(async (product) => {
        let displayLogo = product.logoUrl;
        if (!displayLogo && product.logoStorageId) {
          displayLogo = (await ctx.storage.getUrl(product.logoStorageId)) || undefined;
        }

        return {
          ...product,
          logoUrl: displayLogo,
        };
      })
    );
  },
});

export const updateProduct = mutation({
  args: {
    productId: v.id("products"),
    name: v.optional(v.string()),
    tagline: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    founderName: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    logoStorageId: v.optional(v.id("_storage")),
    twitterUrl: v.optional(v.string()),
    demoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: Please sign in");
    }

    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    if (product.userId !== userId) {
      throw new Error("Forbidden: You do not own this product listing");
    }

    const updates: Record<string, any> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name.trim();
    if (args.tagline !== undefined) updates.tagline = args.tagline.trim();
    if (args.description !== undefined) updates.description = args.description.trim();
    if (args.category !== undefined) updates.category = args.category.trim();
    if (args.websiteUrl !== undefined) updates.websiteUrl = args.websiteUrl.trim();
    if (args.founderName !== undefined) updates.founderName = args.founderName.trim();
    if (args.logoUrl !== undefined) updates.logoUrl = args.logoUrl.trim() || undefined;
    if (args.logoStorageId !== undefined) updates.logoStorageId = args.logoStorageId;
    if (args.twitterUrl !== undefined) updates.twitterUrl = args.twitterUrl.trim() || undefined;
    if (args.demoUrl !== undefined) updates.demoUrl = args.demoUrl.trim() || undefined;

    await ctx.db.patch(args.productId, updates);
    return { success: true };
  },
});
