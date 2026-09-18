import { describe, it, expect } from "vitest";
import {
  calculateOutbidRequirement,
  calculateAmountDue,
} from "../convex/bids";
import { sortLeaderboardProducts } from "../convex/products";

describe("Ranking Engine & Bidding Math", () => {
  // AC-2: Outbid requirements and calculations
  it("calculates minimum outbid requirement strictly 1 dollar above target (AC-2)", () => {
    expect(calculateOutbidRequirement(500)).toBe(501);
    expect(calculateOutbidRequirement(10)).toBe(11);
    expect(calculateOutbidRequirement(12500)).toBe(12501);
  });

  it("calculates exact price difference so founders only pay the delta (AC-2)", () => {
    // Brand new product bidding $100
    const initial = calculateAmountDue(0, 100);
    expect(initial.amountDueDollars).toBe(100);
    expect(initial.amountDueCents).toBe(10000);

    // Existing product at $250 outbidding to $400
    const outbid = calculateAmountDue(250, 400);
    expect(outbid.amountDueDollars).toBe(150);
    expect(outbid.amountDueCents).toBe(15000);

    // Existing product at $200 outbidding to $550
    const topOutbid = calculateAmountDue(200, 550);
    expect(topOutbid.amountDueDollars).toBe(350);
    expect(topOutbid.amountDueCents).toBe(35000);

    // Proposed bid equal or lower than current bid produces zero difference
    const invalid = calculateAmountDue(500, 400);
    expect(invalid.amountDueDollars).toBe(0);
    expect(invalid.amountDueCents).toBe(0);
  });

  // AC-1: Leaderboard sorting by currentBid descending
  it("sorts all-time leaderboard products by currentBid descending (AC-1)", () => {
    const products = [
      { _id: "1", name: "Product C", currentBid: 200, lastBidAt: 1000 },
      { _id: "2", name: "Product A", currentBid: 500, lastBidAt: 2000 },
      { _id: "3", name: "Product B", currentBid: 350, lastBidAt: 1500 },
      { _id: "4", name: "Product D", currentBid: 100, lastBidAt: 500 },
    ];

    const sorted = sortLeaderboardProducts(products, "all");
    expect(sorted.map((p) => p.name)).toEqual([
      "Product A",
      "Product B",
      "Product C",
      "Product D",
    ]);
    expect(sorted[0].currentBid).toBe(500);
    expect(sorted[3].currentBid).toBe(100);
  });

  // AC-1: Tie-breaking fallback by earliest lastBidAt
  it("breaks ties deterministically by earliest lastBidAt timestamp (AC-1)", () => {
    const products = [
      { _id: "1", name: "Second To Reach 300", currentBid: 300, lastBidAt: 2000 },
      { _id: "2", name: "First To Reach 300", currentBid: 300, lastBidAt: 1000 },
    ];

    const sorted = sortLeaderboardProducts(products, "all");
    expect(sorted[0].name).toBe("First To Reach 300");
    expect(sorted[1].name).toBe("Second To Reach 300");
  });

  // AC-4: Timeframe sorting for Today and This Week
  it("sorts daily and weekly leaderboards by respective rolling counters (AC-4)", () => {
    const products = [
      { _id: "1", name: "Product A", currentBid: 1000, dailyBid: 50, weeklyBid: 300 },
      { _id: "2", name: "Product B", currentBid: 500, dailyBid: 200, weeklyBid: 400 },
      { _id: "3", name: "Product C", currentBid: 200, dailyBid: 0, weeklyBid: 100 },
    ];

    const sortedToday = sortLeaderboardProducts(products, "today");
    expect(sortedToday.map((p) => p.name)).toEqual([
      "Product B", // 200 today
      "Product A", // 50 today
      "Product C", // 0 today
    ]);

    const sortedWeek = sortLeaderboardProducts(products, "week");
    expect(sortedWeek.map((p) => p.name)).toEqual([
      "Product B", // 400 this week
      "Product A", // 300 this week
      "Product C", // 100 this week
    ]);
  });
});
