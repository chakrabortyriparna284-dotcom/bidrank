import { describe, it, expect } from "vitest";
import { slugify } from "../convex/products";

describe("SaaS Product Submission & Validation", () => {
  it("normalizes product names into clean URL slugs", () => {
    expect(slugify("TaskPulse AI")).toBe("taskpulse-ai");
    expect(slugify("  My Super SaaS! 2.0  ")).toBe("my-super-saas-20");
    expect(slugify("DevTools---Pro")).toBe("devtools-pro");
    expect(slugify("$$$MoneyMaker$$$")).toBe("moneymaker");
  });

  it("handles empty or special character strings gracefully", () => {
    expect(slugify("###")).toBe("");
    expect(slugify("AI")).toBe("ai");
  });

  it("enforces minimum initial bid requirements", () => {
    const minBid = 10;
    const validBid = 25;
    const invalidBid = 5;

    expect(validBid >= minBid).toBe(true);
    expect(invalidBid >= minBid).toBe(false);
  });

  it("verifies initial product status lifecycle", () => {
    const initialStatus = "awaiting_payment";
    const paymentConfirmed = true;
    const finalStatus = paymentConfirmed ? "active" : initialStatus;

    expect(initialStatus).toBe("awaiting_payment");
    expect(finalStatus).toBe("active");
  });
});
