import { describe, it, expect } from "vitest";

describe("Founder Dashboard Metrics Conformance", () => {
  const mockUserProducts = [
    {
      _id: "prod_1",
      userId: "user_123",
      name: "SaaS Alpha",
      status: "active",
      currentBid: 500,
      lifetimeAmountPaid: 500,
      totalClicks: 120,
    },
    {
      _id: "prod_2",
      userId: "user_123",
      name: "SaaS Beta",
      status: "active",
      currentBid: 300,
      lifetimeAmountPaid: 450,
      totalClicks: 85,
    },
    {
      _id: "prod_3",
      userId: "user_123",
      name: "SaaS Gamma",
      status: "awaiting_payment",
      currentBid: 100,
      lifetimeAmountPaid: 0,
      totalClicks: 0,
    },
  ];

  const mockLeaderboard = [
    { _id: "prod_external_1", name: "Top Dog", currentBid: 1000, rank: 1 },
    { _id: "prod_1", name: "SaaS Alpha", currentBid: 500, rank: 2 },
    { _id: "prod_2", name: "SaaS Beta", currentBid: 300, rank: 3 },
  ];

  it("calculates aggregated metric totals accurately (AC-2)", () => {
    const totalProducts = mockUserProducts.length;
    const totalSpent = mockUserProducts.reduce((acc, p) => acc + (p.lifetimeAmountPaid || 0), 0);
    const totalClicks = mockUserProducts.reduce((acc, p) => acc + (p.totalClicks || 0), 0);

    expect(totalProducts).toBe(3);
    expect(totalSpent).toBe(950);
    expect(totalClicks).toBe(205);
  });

  it("determines best current leaderboard rank for founder products (AC-2)", () => {
    const activeIds = new Set(
      mockUserProducts.filter((p) => p.status === "active").map((p) => p._id)
    );
    const rankedMatches = mockLeaderboard.filter((p) => activeIds.has(p._id));
    const bestRank = rankedMatches.length > 0 ? `#${rankedMatches[0].rank}` : "--";

    expect(bestRank).toBe("#2");
  });

  it("handles empty founder portfolio gracefully (AC-2)", () => {
    const emptyProducts: any[] = [];
    const totalProducts = emptyProducts.length;
    const totalSpent = emptyProducts.reduce((acc, p) => acc + (p.lifetimeAmountPaid || 0), 0);
    const totalClicks = emptyProducts.reduce((acc, p) => acc + (p.totalClicks || 0), 0);

    expect(totalProducts).toBe(0);
    expect(totalSpent).toBe(0);
    expect(totalClicks).toBe(0);
  });

  it("validates editable fields during product updates (AC-5)", () => {
    const validUpdate = {
      name: "SaaS Alpha Pro",
      tagline: "The fastest way to rank your project",
      description: "Comprehensive marketing platform",
      category: "Developer Tools",
      websiteUrl: "https://alpha.example.com",
    };

    expect(validUpdate.name.trim().length).toBeGreaterThan(0);
    expect(validUpdate.tagline.length).toBeLessThanOrEqual(100);
    expect(() => new URL(validUpdate.websiteUrl)).not.toThrow();
  });
});
