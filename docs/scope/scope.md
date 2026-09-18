# BidRank Scope

**Workflow**: Beta
**Approach**: Tracer Bullet

## At a glance

| # | Feature | Phase | Status | Spec |
|---|---|---|---|---|
| 1 | Stack and architecture foundation | Phase 1 | in-progress | [0001](../specs/0001-foundational-architecture-and-stack/index.md) |
| 2 | Core domain data model and ranking engine | Phase 1 | done | [0002](../specs/0002-core-domain-data-model-and-ranking-system/index.md) |

## Phase 1: Foundation

### 1. Stack and architecture foundation

Intent: Establish project skeleton with Next.js App Router, Convex reactive database, and Stripe payment adapter.

Done when: Next.js and Convex connect cleanly with basic layout and provider wiring, and Stripe adapter interface is in place.

- [x] Decide the stack (spec): [0001](../specs/0001-foundational-architecture-and-stack/index.md)
- [x] Scaffold from the decision: /develop stack and architecture foundation
- [ ] Verify it: /check verify stack and architecture foundation
- [ ] Test it: /test stack and architecture foundation

### 2. Core domain data model and ranking engine

Intent: Implement Convex schema with rolling window counters, strict unique bid validation, and leaderboard subscriptions.

Done when: Schema has unique bid checks, timeframe queries return properly sorted products, and scheduled cron handlers reset daily/weekly counters.

- [x] Design it (spec): [0002](../specs/0002-core-domain-data-model-and-ranking-system/index.md)
- [x] Build it: /develop core domain data model and ranking engine
  - [x] Schema update with dailyBid and weeklyBid fields, satisfies AC-1, AC-4
  - [x] Unique bid and outbid validation in convex/bids.ts, satisfies AC-2
  - [x] Timeframe leaderboard queries in convex/products.ts, satisfies AC-1, AC-3
  - [x] Scheduled cron actions in convex/crons.ts, satisfies AC-4
  - [x] Event logging in convex/payments.ts, satisfies AC-5
- [x] Verify it: /check verify core domain data model and ranking engine
- [x] Test it: /test core domain data model and ranking engine
