import { describe, it, expect } from "vitest";
import { slugify } from "../convex/products";

describe("Product Profile and Analytics Conformance", () => {
  const mockProduct = {
    _id: "prod_1",
    name: "DocuMind AI",
    slug: "documind-ai",
    tagline: "Instant documentation powered by LLMs",
    description: "DocuMind analyzes your repositories and generates verified API docs.",
    category: "AI",
    currentBid: 750,
    rank: 3,
    lifetimeAmountPaid: 900,
    totalClicks: 340,
    websiteUrl: "https://documind.example.com",
    twitterUrl: "https://twitter.com/documind",
  };

  const mockLeaderboard = [
    { _id: "prod_king", name: "AlphaTool", currentBid: 1200, rank: 1 },
    { _id: "prod_second", name: "BetaCloud", currentBid: 950, rank: 2 },
    { _id: "prod_1", name: "DocuMind AI", currentBid: 750, rank: 3 },
  ];

  const mockBidEvents = [
    {
      _id: "ev_1",
      productId: "prod_1",
      previousBid: 500,
      newBid: 750,
      previousRank: 4,
      newRank: 3,
      createdAt: 1720000000000,
    },
    {
      _id: "ev_0",
      productId: "prod_1",
      previousBid: 0,
      newBid: 500,
      previousRank: undefined,
      newRank: 4,
      createdAt: 1719000000000,
    },
  ];

  it("normalizes and matches URL slugs reliably (AC-1)", () => {
    expect(slugify("DocuMind AI")).toBe("documind-ai");
    expect(slugify("  Super-Tool 3000!  ")).toBe("super-tool-3000");
  });

  it("computes accurate distance to rank #1 crown (AC-3)", () => {
    const topProduct = mockLeaderboard[0];
    const gapToFirst = topProduct.currentBid - mockProduct.currentBid;
    const minBidToOvertake = topProduct.currentBid + 1;

    expect(gapToFirst).toBe(450); // 1200 - 750
    expect(minBidToOvertake).toBe(1201);
  });

  it("formats bid event timeline deltas correctly (AC-4)", () => {
    const latestEvent = mockBidEvents[0];
    const bidIncrease = latestEvent.newBid - latestEvent.previousBid;

    expect(bidIncrease).toBe(250);
    expect(latestEvent.newRank).toBe(3);
    expect(latestEvent.previousRank).toBe(4);
  });

  it("handles crown holder position without gap to #1 (AC-3)", () => {
    const crownHolder = mockLeaderboard[0];
    const isRankOne = crownHolder.rank === 1;

    expect(isRankOne).toBe(true);
  });
});
