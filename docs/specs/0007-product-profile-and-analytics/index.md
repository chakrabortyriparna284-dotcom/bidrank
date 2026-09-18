# 0007. Product Profile Pages and Ranking History

**Date**: 2026-09-19
**Status**: Accepted

## Summary

This specification defines the public product profile pages at `/product/[slug]` and historical ranking analytics. Visitors and founders can inspect comprehensive SaaS details, verify live leaderboard rank and bid amounts, track total outbound clicks received, explore a visual timeline of bid increases and rank transitions, and initiate outbids directly.

## Requirements

**User stories**:
* As a visitor, I want to inspect a SaaS product profile page so that I can learn about its offering and visit its verified website.
* As a visitor or potential competitor, I want to see a product ranking history so that I can understand its bid trajectory and momentum.
* As a founder, I want a dedicated public link for my product so that I can share my rank with my community.
* As a competing founder, I want to trigger an outbid directly from any competitor profile page so that I can attempt to surpass them.

**Acceptance criteria**:
* **AC-1**: Dynamic route `/product/[slug]` loads product information reactively using `products:getBySlug`.
* **AC-2**: Profile displays product name, logo, category, tagline, description, external website visit link, and social links.
* **AC-3**: Profile displays high impact metric badges: Current Rank, Current Bid, Total Outbound Clicks, and Lifetime Bid Investment.
* **AC-4**: A ranking and bid timeline renders bid events queried from `bids:getHistory`, displaying timestamp, previous bid, new bid, and achieved rank.
* **AC-5**: An interactive outbid action button allows competing founders or current owners to open `OutbidDialog` and submit a higher bid.

## Decision

**Chosen option**: Option 1: Dynamic Profile Page with Reactive Convex Subscriptions

We construct `/product/[slug]` as a Next.js App Router dynamic route. The page fetches listing data using Convex `api.products.getBySlug` and bid events using `api.bids.getHistory`.

**Implementation skills**: `convex` (`convex-dev/convex`, `.agents/skills/convex/`)

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

**Data model sketch**:
* Reads `products` table via `by_slug` index.
* Reads `bidEvents` table via `by_productId` index.

**API surface**:
| Endpoint / Function | Type | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `products:getBySlug` | Query | `slug: string` | `ProductWithRank` or `null` | Public | None |
| `bids:getHistory` | Query | `productId: Id<products>` | `BidEvent[]` | Public | None |

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| `/product/[slug]` | Product details | `products:getBySlug` |
| `/product/[slug]` | Bid history timeline | `bids:getHistory` |
| Outbid trigger | Pre configured `targetProduct` | Current product object passed to `OutbidDialog` |

**Security model**:
* Product profiles are public read operations.
* Submitting an outbid triggers authenticated Stripe Checkout session flow.

**Critical test scenarios**:
* Happy path: Visiting valid `/product/[slug]` renders details, metric cards, and timeline, satisfies **AC-1**, **AC-2**, **AC-3**, **AC-4**.
* Missing product: Non existent slug renders helpful 404 state with button back to leaderboard.
* Outbid trigger: Clicking outbid button activates `OutbidDialog` with target product, satisfies **AC-5**.

## Build plan

1. Build `/product/[slug]/page.tsx` dynamic profile view, satisfies **AC-1**, **AC-2**, **AC-3**, **AC-4**, **AC-5**
2. Create unit tests in `tests/profile.test.ts` covering slug formatting, timeline rendering math, and outbid triggers
3. Verify with vitest and Next.js build
