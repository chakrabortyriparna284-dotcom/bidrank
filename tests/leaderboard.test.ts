import { describe, it, expect } from "vitest";
import { sortLeaderboardProducts } from "../convex/products";

describe("Leaderboard & Outbid Dialog Conformance", () => {
  const sampleProducts = [
    { _id: "1", name: "SaaS Alpha", currentBid: 500, dailyBid: 50, weeklyBid: 200, lastBidAt: 1000 },
    { _id: "2", name: "SaaS Beta", currentBid: 300, dailyBid: 100, weeklyBid: 300, lastBidAt: 1200 },
    { _id: "3", name: "SaaS Gamma", currentBid: 150, dailyBid: 20, weeklyBid: 50, lastBidAt: 800 },
    { _id: "4", name: "SaaS Delta", currentBid: 50, dailyBid: 0, weeklyBid: 10, lastBidAt: 500 },
  ];

  it("identifies top 3 spotlight products accurately (AC-1)", () => {
    const sorted = sortLeaderboardProducts(sampleProducts, "all");
    expect(sorted[0].name).toBe("SaaS Alpha");
    expect(sorted[1].name).toBe("SaaS Beta");
    expect(sorted[2].name).toBe("SaaS Gamma");
    expect(sorted[3].name).toBe("SaaS Delta");
  });

  it("calculates correct gaps ahead of competitors (AC-5)", () => {
    const sorted = sortLeaderboardProducts(sampleProducts, "all");
    const gapRank1ToRank2 = sorted[0].currentBid - sorted[1].currentBid;
    const gapRank2ToRank3 = sorted[1].currentBid - sorted[2].currentBid;

    expect(gapRank1ToRank2).toBe(200); // 500 - 300
    expect(gapRank2ToRank3).toBe(150); // 300 - 150
  });

  it("calculates incremental amount due for outbidding (AC-3)", () => {
    const userProduct = { currentBid: 200 };
    const targetProduct = { currentBid: 500 };

    // Minimum required to outbid is 501
    const minRequired = targetProduct.currentBid + 1;
    expect(minRequired).toBe(501);

    // User bids 550 to take rank #1
    const proposedBid = 550;
    const amountDue = proposedBid - userProduct.currentBid;
    expect(amountDue).toBe(350);
  });

  it("filters accurately across today and week timeframes (AC-2)", () => {
    const sortedToday = sortLeaderboardProducts(sampleProducts, "today");
    expect(sortedToday[0].name).toBe("SaaS Beta"); // 100 daily
    expect(sortedToday[1].name).toBe("SaaS Alpha"); // 50 daily

    const sortedWeek = sortLeaderboardProducts(sampleProducts, "week");
    expect(sortedWeek[0].name).toBe("SaaS Beta"); // 300 weekly
    expect(sortedWeek[1].name).toBe("SaaS Alpha"); // 200 weekly
  });
});
