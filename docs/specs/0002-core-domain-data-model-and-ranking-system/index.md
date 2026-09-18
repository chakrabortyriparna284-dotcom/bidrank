# 0002. Core domain data model and ranking engine

**Date**: 2026-09-18
**Status**: Proposed

## Summary

This specification defines the core database schema, ranking engine, and subscription queries for BidRank in Convex. We establish a strict ranking order where products are sorted by current bid descending with unique bid validation. Scheduled Convex cron actions manage rolling daily and weekly bid counters to support multiple leaderboard views.

## Requirements

**User stories**:
- As a visitor, I want to see an automatically ordered leaderboard where higher bids rank higher, so that I can discover top products.
- As a founder, I want to see my product rank move up immediately after payment settles, so that my outbid is rewarded instantly.
- As a platform admin, I want all bids to be strictly unique and server validated, so that there is never ambiguity about who holds each rank.

**Acceptance criteria**:
- **AC-1**: Active products are ordered by currentBid descending with compound index acceleration.
- **AC-2**: Every new bid must be unique across all active listings and strictly higher than the target rank to outbid.
- **AC-3**: Products in `draft` or `awaiting_payment` states are excluded from the public leaderboard until payment confirmation.
- **AC-4**: Scheduled cron jobs reset `dailyBid` and `weeklyBid` counters at midnight UTC without interrupting real time queries.
- **AC-5**: Each bid update records an immutable `bidEvents` entry capturing previous and new rank positions.

## Decision

**Chosen option**: Option 1: Indexed compound queries with unique bid enforcement and cron based window counters

We select strict unique bid validation on the server, paired with status and currentBid compound indexing in Convex and scheduled actions for rolling window counters.

**Implementation skills**: `convex` (`get-convex/agent-skills`, `.agents/skills/convex/`)

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

**Data model sketch**:

- `products`:
  - `userId`: `Id<"users">` (required, foreign key)
  - `name`: string (required)
  - `slug`: string (required, unique index)
  - `websiteUrl`: string (required)
  - `logoUrl`: string (optional)
  - `logoStorageId`: `Id<"_storage">` (optional)
  - `tagline`: string (required, max 120 chars)
  - `description`: string (required)
  - `category`: string (required)
  - `founderName`: string (required)
  - `twitterUrl`: string (optional)
  - `demoUrl`: string (optional)
  - `currentBid`: number (required, minimum $10, unique across active products)
  - `lifetimeAmountPaid`: number (required, cumulative total)
  - `dailyBid`: number (required, rolling 24h total)
  - `weeklyBid`: number (required, rolling 7d total)
  - `lastBidAt`: number (required, unix timestamp)
  - `totalClicks`: number (required, default 0)
  - `status`: union of `"draft"`, `"awaiting_payment"`, `"active"`, `"suspended"`, `"archived"`
  - `createdAt`: number (timestamp)
  - `updatedAt`: number (timestamp)

- `bids`:
  - `productId`: `Id<"products">` (required)
  - `userId`: `Id<"users">` (required)
  - `previousBid`: number (required)
  - `newBid`: number (required)
  - `amountPaid`: number (required, difference paid)
  - `paymentId`: string (required, provider reference)
  - `status`: union of `"pending"`, `"succeeded"`, `"failed"`
  - `createdAt`: number (timestamp)

- `payments`:
  - `userId`: `Id<"users">` (required)
  - `productId`: `Id<"products">` (required)
  - `provider`: string (required, e.g. "stripe")
  - `providerPaymentId`: string (required, unique index)
  - `amount`: number (required, in cents)
  - `currency`: string (required, e.g. "usd")
  - `status`: string (required)
  - `type`: string (required, "initial_bid" or "outbid")
  - `createdAt`: number (timestamp)

- `clicks`:
  - `productId`: `Id<"products">` (required)
  - `timestamp`: number (timestamp)
  - `referrer`: string (optional)

- `bidEvents`:
  - `productId`: `Id<"products">` (required)
  - `previousRank`: number (optional)
  - `newRank`: number (required)
  - `previousBid`: number (required)
  - `newBid`: number (required)
  - `createdAt`: number (timestamp)

**State transitions**:
- Product lifecycle: `draft` -> `awaiting_payment` -> `active` -> `suspended` or `archived`
- Bid transaction: `pending` -> `succeeded` or `failed`

**API surface**:
| Endpoint / Function | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `products:getLeaderboard` | Query | `timeframe: "all" \| "today" \| "week"` | `Array<ProductDoc>` | Public | None |
| `products:getBySlug` | Query | `slug: string` | `ProductDoc` | Public | 404 not found |
| `bids:validateOutbid` | Query | `productId: string, proposedBid: number` | `isValid: boolean, minRequired: number, amountDue: number` | Authenticated | 400 invalid bid, 409 duplicate bid |
| `bids:getHistory` | Query | `productId: string` | `Array<BidEventDoc>` | Public | 404 not found |
| `crons:resetDailyBids` | Internal Mutation | None | `count: number` | Internal Cron | None |
| `crons:resetWeeklyBids` | Internal Mutation | None | `count: number` | Internal Cron | None |

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| `getLeaderboard` | Product rank number | Derived from array index plus 1 in sorted result |
| `getLeaderboard` | Current bid amount | `products.currentBid` column |
| `getLeaderboard` | Time window totals | `products.dailyBid` or `products.weeklyBid` column |
| `validateOutbid` | Minimum required bid | Derived from target `product.currentBid + 1` |
| `validateOutbid` | Amount due in dollars | Derived from `proposedBid - userProduct.currentBid` |

**Key invariants**:
- Active product bids are strictly unique (no two active listings can share the identical currentBid value).
- `currentBid` is monotonically increasing for any active product (it can never decrease).
- `amountPaid` for any outbid equals `newBid - previousBid`.
- Minimum initial bid is $10.
- Only products with `status: "active"` appear in `getLeaderboard`.

**Security model**:
- Leaderboard queries and product profile reads are public.
- Outbid validation requires an authenticated session.
- Payment fulfillment and cron resets execute strictly through Convex internal mutations.

**Configuration required**:
- `CRON_SECRET`: optional key if invoking cron hooks externally (Convex crons run natively inside the engine).

**Critical test scenarios**:
- Happy path: Query active listings, place higher unique bid, verify instant rank update and event log, verifies **AC-1**, **AC-5**
- Failure case: Attempt to submit an identical bid amount to an existing product, verify rejection with duplicate bid error, verifies **AC-2**
- State isolation: Create product in `awaiting_payment` state, verify it is invisible on the public board, verifies **AC-3**
- Cron execution: Run internal mutation `resetDailyBids`, verify daily counters reset to zero while lifetime amounts remain intact, verifies **AC-4**

## Build plan

1. Update `convex/schema.ts` with `dailyBid`, `weeklyBid`, and strict indexes, satisfies **AC-1**, **AC-4**
2. Implement unique bid validation and outbid math in `convex/bids.ts`, satisfies **AC-2**
3. Implement `getLeaderboard` with time window sorting in `convex/products.ts`, satisfies **AC-1**, **AC-3**
4. Configure scheduled cron handlers in `convex/crons.ts` for rolling bid resets, satisfies **AC-4**
5. Record immutable rank change entries in `convex/payments.ts` on checkout success, satisfies **AC-5**

## Consequences

**Positive**:
- Deterministic, unambiguous leaderboard rankings with zero duplicate bid confusion
- Built in support for Today and This Week leaderboard tabs without complex time aggregation queries on read
- Complete audit trail of rank movements in `bidEvents` table

**Negative / tradeoffs**:
- Rejecting duplicate bids requires founders to bid at least $1 above an existing identical amount
- Cron based counters require Convex scheduled functions to run consistently

**Neutral**:
- Rolling window counters reset at midnight UTC

## Follow-up

- [ ] Design authentication and founder submission flows in spec 0003
- [ ] Connect frontend leaderboard tabs (All Time, Today, This Week) to the timeframe query parameter
