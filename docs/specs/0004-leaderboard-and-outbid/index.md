# 0004. Public Leaderboard and Real Time Outbid Experience

**Date**: 2026-09-19
**Status**: Accepted

## Summary

This specification defines the public interactive leaderboard and the real time outbid dialog for BidRank. Visitors and founders view ranking cards sorted by bid amount with timeframe filters for all time, today, and this week. The outbid dialog calculates server validated incremental amounts due, verifies unique bids, and directs founders seamlessly to payment without requiring full re-payment of previous bids.

## Requirements

**User stories**:
- As a visitor, I want to see a ranked public leaderboard with top three spotlight cards so that I can discover popular SaaS products.
- As a founder, I want to click outbid on any competitor so that I can calculate the exact difference needed to overtake their position.
- As a founder, I want to switch between all time, daily, and weekly leaderboards so that I can view recent competitive movements.
- As a visitor, I want to click visit website so that I am redirected cleanly while click analytics are recorded.

**Acceptance criteria**:
- **AC-1**: Leaderboard displays active products sorted by bid amount descending with distinct visual styling for ranks one, two, and three.
- **AC-2**: Timeframe tabs filter between all time, today, and this week using reactive Convex queries.
- **AC-3**: Outbid dialog shows current bid, required minimum outbid (one dollar higher), estimated new rank, and calculates difference due.
- **AC-4**: Unauthenticated users clicking outbid are guided to authenticate first before placing an outbid checkout.
- **AC-5**: Product cards render competitive callouts showing the dollar lead ahead of the next competitor or amount required to climb.

## Decision

**Chosen option**: Option 1: Reactive Convex Subscriptions with Incremental Delta Calculation

We use Convex queries on the public homepage to deliver real time leaderboard position updates, compute rank leads on the server layer, and render an interactive outbid modal that validates server side calculations.

**Implementation skills**: `convex` (`convex-dev/convex`, `.agents/skills/convex/`)

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

**Data model sketch**:
- Uses existing `products`, `bids`, `clicks`, and `bidEvents` tables in `convex/schema.ts`.
- `products`: `currentBid`, `dailyBid`, `weeklyBid`, `lifetimeAmountPaid`, `status`, `totalClicks`.

**State transitions**:
- An outbid is initiated in the UI -> dialog validates new proposed bid -> initiates checkout -> payment confirms -> rank updates reactively.

**API surface**:
| Endpoint / Function | Type | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `products:getLeaderboard` | Query | `timeframe` (opt: "all", "today", "week") | `ProductWithRank[]` | Public | None |
| `bids:validateOutbid` | Query | `productId`, `newBid` | `valid`, `amountDue`, `estimatedRank` | Public / Authenticated | 400 invalid bid, 404 product not found |
| `bids:getHistory` | Query | `productId` | `BidEvent[]` | Public | None |

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| `products:getLeaderboard` | `rank` | 1-based index from sorted array by `currentBid` descending |
| `products:getLeaderboard` | `gapToNext` | Difference between `currentBid` and the next lower product |
| `bids:validateOutbid` | `amountDue` | `newBid - product.currentBid` (must be positive) |
| `bids:validateOutbid` | `estimatedRank` | Simulated rank based on `newBid` compared to all active products |

**Key invariants**:
- New bid must strictly exceed the target product bid by at least one dollar.
- New bid must be strictly unique across all active listings.
- Only products with status `active` appear on the public leaderboard.

**Security model**:
- Public users can view the leaderboard and calculate outbid estimates.
- Only authenticated users can submit the outbid transaction and create checkout sessions.

**Configuration required**:
- None beyond existing Convex setup.

**Critical test scenarios**:
- Happy path: Leaderboard lists active products with correct ranks and gap text, satisfies **AC-1**, **AC-5**.
- Timeframe filter: Switching to today displays products ordered by dailyBid, satisfies **AC-2**.
- Outbid calculation: Bidding 401 on a 400 dollar listing requires 1 dollar payment if already at 400, or 401 minus owner current bid, satisfies **AC-3**.
- Unauthenticated outbid: Clicking outbid opens authentication modal, satisfies **AC-4**.

## Build plan

- [x] 1. Build leaderboard component (`components/leaderboard/leaderboard-table.tsx`) with tabs, top 3 spotlight styling, and gap tags, satisfies **AC-1**, **AC-2**, **AC-5**
- [x] 2. Build outbid dialog component (`components/bidding/outbid-dialog.tsx`) with dynamic delta math and rank preview, satisfies **AC-3**, **AC-4**
- [x] 3. Integrate leaderboard and outbid dialog into homepage (`app/page.tsx`), satisfies **AC-1**, **AC-3**
- [x] 4. Add unit and component tests in `tests/leaderboard.test.ts`, satisfies **AC-1**, **AC-2**, **AC-3**

## Consequences

**Positive**:
- Instant live updates across all active browser windows when ranks change.
- Founders only pay the incremental difference to overtake positions.
- Clean separation between public read queries and secured write mutations.

**Negative / tradeoffs**:
- Requires active Convex web socket connection for real time subscriptions.

**Neutral**:
- Tie breaks default to earliest timestamp reaching that bid amount.

## Follow-up

- [ ] Add sound effects or celebration animations when an outbid moves a product to rank one.
