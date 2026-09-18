# 0008. Admin Panel and Realistic Seed Engine

**Date**: 2026-09-19
**Status**: Accepted

## Summary

This specification defines the administrative control center on `/admin` and the development database seed engine. The admin console gives platform operators visibility into aggregate platform revenue, product moderation actions like suspension or reactivation, and a one click realistic data seeding system with fifteen curated SaaS products featuring distinct bids, categories, and ranking histories.

## Requirements

**User stories**:
* As a platform operator, I want to view global platform metrics such as total revenue, total listings, and total traffic so that I can monitor business health.
* As an administrator, I want to inspect all listed SaaS products and suspend abusive or spam listings so that leaderboard integrity is preserved.
* As a developer or evaluator, I want to trigger a database seed with 15 realistic SaaS listings so that the leaderboard is immediately populated with rich competitive data without manual entries.

**Acceptance criteria**:
* **AC-1**: `/admin` displays key platform overview cards: Gross Revenue, Active SaaS Listings, Suspended Listings, and Outbound Clicks.
* **AC-2**: A product moderation table lists all submissions with status badges and quick toggle actions to suspend or reactivate.
* **AC-3**: A database seed engine mutates the database to insert fifteen realistic SaaS products spanning AI, Developer Tools, Productivity, and Analytics.
* **AC-4**: Seed listings strictly satisfy the unique bid constraint, with current bids ranging from 150 dollars to 12500 dollars.
* **AC-5**: Seed engine populates initial `bidEvents` records so that product profile ranking timelines display realistic historical trajectories.

## Decision

**Chosen option**: Option 1: Integrated Admin Surface with Server Backed Seed Mutation

We implement `convex/admin.ts` for operator queries and moderation mutations, `convex/seed.ts` for deterministic data seeding, and `/admin` as a responsive management interface with live reactive status updates.

**Implementation skills**: `convex` (`convex-dev/convex`, `.agents/skills/convex/`)

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

**Data model sketch**:
* Reads and updates `products` table across all statuses.
* Writes initial products and `bidEvents` records during seeding.

**API surface**:
| Endpoint / Function | Type | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `admin:getOverviewStats` | Query | None | `{ totalRevenue, totalProducts, activeCount, suspendedCount, totalClicks }` | Operator | None |
| `admin:getAllProducts` | Query | None | `Product[]` | Operator | None |
| `admin:toggleProductStatus` | Mutation | `productId: Id<products>` | `{ success: boolean, newStatus: string }` | Operator | 404 not found |
| `seed:seedProducts` | Mutation | None | `{ seededCount: number, message: string }` | Operator / Dev | None |

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| `/admin` | Platform revenue and volume metrics | `admin:getOverviewStats` |
| Moderation table | Complete inventory of SaaS products | `admin:getAllProducts` |
| Seed button | 15 pre populated listings with distinct bids | `seed:seedProducts` |

**Security model**:
* Moderation mutations ensure products exist and invert status between `active` and `suspended`.
* Seed engine skips insertion if products already exist to avoid duplicate bid violations.

**Critical test scenarios**:
* Unique bid invariant: All seeded listings have strictly unique `currentBid` values, satisfies **AC-4**.
* Status toggle: Suspending an active listing changes status to `suspended` and removes it from public leaderboard, satisfies **AC-2**.
* Platform revenue aggregation: Accurately sums revenue across all products, satisfies **AC-1**.

## Build plan

1. Implement `convex/admin.ts` with overview stats query, all products query, and status toggle mutation, satisfies **AC-1**, **AC-2**
2. Implement `convex/seed.ts` with 15 realistic SaaS products and initial bid events, satisfies **AC-3**, **AC-4**, **AC-5**
3. Build `/admin/page.tsx` operator console with metrics cards, seed button, and moderation table, satisfies **AC-1**, **AC-2**, **AC-3**
4. Add unit and integration tests in `tests/admin.test.ts`, satisfies **AC-1**, **AC-2**, **AC-4**
5. Verify with vitest and Next.js build
