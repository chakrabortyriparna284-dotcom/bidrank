# 0006. Founder Dashboard and SaaS Product Management

**Date**: 2026-09-19
**Status**: Accepted

## Summary

This specification defines the founder dashboard on `/dashboard` for managing listed SaaS products. Authenticated founders inspect key performance metrics including total bids spent, total clicks received, best current leaderboard rank, and manage their listings with quick bid increases, profile updates, and public link previews.

## Requirements

**User stories**:
- As an authenticated founder, I want to view an overview dashboard of all my listed SaaS products so that I can monitor their performance.
- As a founder, I want to see total clicks received, total bids spent, and my best leaderboard rank in metric cards.
- As a founder, I want to click increase bid directly from my product card to easily boost my ranking position.
- As a founder, I want to edit product details like tagline, description, and website URL whenever needed.

**Acceptance criteria**:
- **AC-1**: `/dashboard` route is protected and prompts unauthenticated visitors to sign in before accessing metrics.
- **AC-2**: Dashboard displays four key metric cards: Total Products, Total Bids Spent, Total Clicks Received, and Best Current Rank.
- **AC-3**: Each listed product displays status badge, current rank, current bid, lifetime spent, and total clicks.
- **AC-4**: Founders can trigger an outbid or bid increase modal directly from their product card.
- **AC-5**: Founders can update listing information via server validated `updateProduct` mutation.

## Decision

**Chosen option**: Option 1: Reactive Founder Portal with Integrated Bid Management

We build `/dashboard` as a reactive Next.js client component connected to `getUserProducts`, `currentUser`, and `getLeaderboard`, providing real time statistics and instant bid adjustment actions.

**Implementation skills**: `convex` (`convex-dev/convex`, `.agents/skills/convex/`)

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

**Data model sketch**:
- Relies on `products` entity indexed by `by_userId`.

**API surface**:
| Endpoint / Function | Type | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `products:getUserProducts` | Query | none | `Product[]` | Authenticated | 401 unauthenticated |
| `products:updateProduct` | Mutation | `productId`, editable fields | `{ success: true }` | Authenticated Owner | 401 unauthenticated, 403 forbidden |

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| `/dashboard` | `totalProducts` | Count of products returned by `getUserProducts` |
| `/dashboard` | `totalSpent` | Sum of `lifetimeAmountPaid` across user products |
| `/dashboard` | `totalClicks` | Sum of `totalClicks` across user products |
| `/dashboard` | `bestRank` | Minimum `rank` among user active products |

**Key invariants**:
- Users can only view and edit products where `product.userId === authenticatedUser._id`.
- Metrics update reactively when payments succeed or clicks are registered.

**Security model**:
- Route redirects unauthenticated visitors to sign in.
- Backend mutation strictly verifies ownership before applying updates.

**Critical test scenarios**:
- Happy path: Authenticated founder views their SaaS cards and aggregated metric summaries, satisfies **AC-1**, **AC-2**, **AC-3**.
- Quick bid adjustment: Clicking increase bid opens OutbidDialog with product pre selected, satisfies **AC-4**.
- Product updates: Updating tagline patches the database and reflects immediately, satisfies **AC-5**.

## Build plan

1. Build dashboard page (`app/dashboard/page.tsx`) with metric cards and product grid, satisfies **AC-1**, **AC-2**, **AC-3**
2. Add edit product modal component (`components/dashboard/edit-product-dialog.tsx`), satisfies **AC-5**
3. Connect quick increase bid action with OutbidDialog, satisfies **AC-4**
4. Add unit and component tests in `tests/dashboard.test.ts`, satisfies **AC-1**, **AC-2**, **AC-3**

## Consequences

**Positive**:
- Founders have a central home to manage all their submissions and monitor ROI.
- Quick bid adjustments make climbing ranks effortless.

**Negative / tradeoffs**:
- Requires authenticated session state before rendering metrics.

## Follow-up

- [ ] Add conversion tracking or detailed click breakdown charts in a future release.
