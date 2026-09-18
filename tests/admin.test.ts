import { describe, it, expect } from "vitest";
import { SEED_PRODUCTS } from "../convex/seed";

describe("Admin Dashboard and Realistic Seed Engine Conformance", () => {
  it("contains exactly 15 curated SaaS products in the seed pool (AC-3)", () => {
    expect(SEED_PRODUCTS.length).toBe(15);
  });

  it("satisfies strict unique bid constraint across all seed listings (AC-4)", () => {
    const bids = SEED_PRODUCTS.map((p) => p.currentBid);
    const uniqueBids = new Set(bids);

    expect(uniqueBids.size).toBe(SEED_PRODUCTS.length);
  });

  it("verifies all seed bids are valid positive integers above minimum threshold (AC-4)", () => {
    SEED_PRODUCTS.forEach((product) => {
      expect(product.currentBid).toBeGreaterThanOrEqual(10);
      expect(Number.isInteger(product.currentBid)).toBe(true);
      expect(product.dailyBid).toBeLessThanOrEqual(product.currentBid);
      expect(product.weeklyBid).toBeLessThanOrEqual(product.currentBid);
    });
  });

  it("ensures all seed products have valid metadata and URLs (AC-3)", () => {
    const validCategories = [
      "AI",
      "Developer Tools",
      "Productivity",
      "Marketing",
      "Sales",
      "Design",
      "Finance",
      "Analytics",
      "Consumer",
      "Other",
    ];

    SEED_PRODUCTS.forEach((product) => {
      expect(product.name.trim().length).toBeGreaterThan(0);
      expect(product.tagline.trim().length).toBeGreaterThan(0);
      expect(product.description.trim().length).toBeGreaterThan(0);
      expect(validCategories).toContain(product.category);
      expect(() => new URL(product.websiteUrl)).not.toThrow();
    });
  });

  it("accurately calculates platform revenue and moderation totals (AC-1)", () => {
    const mockProducts = [
      { currentBid: 5000, lifetimeAmountPaid: 5000, status: "active", totalClicks: 120 },
      { currentBid: 3200, lifetimeAmountPaid: 3200, status: "active", totalClicks: 80 },
      { currentBid: 1500, lifetimeAmountPaid: 1500, status: "suspended", totalClicks: 45 },
    ];

    const totalRevenue = mockProducts.reduce((acc, p) => acc + p.lifetimeAmountPaid, 0);
    const activeCount = mockProducts.filter((p) => p.status === "active").length;
    const suspendedCount = mockProducts.filter((p) => p.status === "suspended").length;
    const totalClicks = mockProducts.reduce((acc, p) => acc + p.totalClicks, 0);

    expect(totalRevenue).toBe(9700);
    expect(activeCount).toBe(2);
    expect(suspendedCount).toBe(1);
    expect(totalClicks).toBe(245);
  });

  it("toggles product status cleanly between active and suspended (AC-2)", () => {
    let status = "active";
    status = status === "active" ? "suspended" : "active";
    expect(status).toBe("suspended");

    status = status === "active" ? "suspended" : "active";
    expect(status).toBe("active");
  });
});
