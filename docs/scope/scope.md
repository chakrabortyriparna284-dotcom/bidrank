# BidRank Scope

**Workflow**: Beta
**Approach**: Tracer Bullet

## At a glance

| # | Feature | Phase | Status | Spec |
|---|---|---|---|---|
| 1 | Stack and architecture foundation | Phase 1 | in-progress | [0001](../specs/0001-foundational-architecture-and-stack/index.md) |
| 2 | Core domain data model and ranking engine | Phase 1 | done | [0002](../specs/0002-core-domain-data-model-and-ranking-system/index.md) |
| 3 | User authentication and SaaS product submission | Phase 1 | done | [0003](../specs/0003-auth-and-product-submission/index.md) |
| 4 | Public leaderboard and real time outbid experience | Phase 2 | done | [0004](../specs/0004-leaderboard-and-outbid/index.md) |
| 5 | Stripe checkout and payment fulfillment | Phase 2 | done | [0005](../specs/0005-stripe-checkout-and-payments/index.md) |
| 6 | Founder dashboard and SaaS product management | Phase 3 | in-progress | [0006](../specs/0006-founder-dashboard/index.md) |
| 7 | Product profile pages and ranking history | Phase 3 | planned | [0007](../specs/0007-product-profile-and-analytics/index.md) |
| 8 | Admin panel and realistic seed engine | Phase 4 | planned | [0008](../specs/0008-admin-panel-and-seed-engine/index.md) |

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

### 3. User authentication and SaaS product submission

Intent: Provide secure user registration, session management, and SaaS product submission with logo upload and initial bid validation.

Done when: Users can sign in or sign up, submit a SaaS product with minimum 10 dollar initial bid, and have it saved in awaiting_payment state.

- [x] Design it (spec): [0003](../specs/0003-auth-and-product-submission/index.md)
- [x] Build it: /develop user authentication and saas product submission
  - [x] Install and configure Convex Auth with schema and HTTP router, satisfies AC-1, AC-2
  - [x] Update product schema with storage references and owner indexes, satisfies AC-3
  - [x] Implement createProduct, generateUploadUrl, and slug generator in convex/products.ts, satisfies AC-3, AC-4, AC-5
  - [x] Build auth modal and sign in component, satisfies AC-1, AC-2
  - [x] Build SaaS submission page with form validation and bid input, satisfies AC-3, AC-4
- [x] Verify it: /check verify user authentication and saas product submission
- [x] Test it: /test user authentication and saas product submission

## Phase 2: Core User Loop

### 4. Public leaderboard and real time outbid experience

Intent: Deliver the primary public engagement experience with reactive leaderboard cards, top 3 spotlight styling, and outbid dialog.

Done when: Visitors see live ranked listings across timeframe filters, and founders can calculate and initiate outbids.

- [x] Design it (spec): [0004](../specs/0004-leaderboard-and-outbid/index.md)
- [x] Build it: /develop public leaderboard and real time outbid experience
  - [x] Build leaderboard table with tabs, top 3 spotlight styling, and gap tags, satisfies AC-1, AC-2, AC-5
  - [x] Build outbid dialog with dynamic delta math and rank preview, satisfies AC-3, AC-4
  - [x] Integrate into homepage with live stat counters, satisfies AC-1, AC-3
  - [x] Add unit and component tests in tests/leaderboard.test.ts, satisfies AC-1, AC-2, AC-3
- [x] Verify it: /check verify public leaderboard and real time outbid experience
- [x] Test it: /test public leaderboard and real time outbid experience

### 5. Stripe checkout and payment fulfillment

Intent: Enable founders to pay for initial listings and outbid increments with Stripe Checkout sessions and verified webhook fulfillment.

Done when: Founders complete Stripe checkout, webhook fulfills payment, bid is updated, and product becomes active.

- [x] Design it (spec): [0005](../specs/0005-stripe-checkout-and-payments/index.md)
- [x] Build it: /develop stripe checkout and payment fulfillment
  - [x] Implement createCheckoutSession action in convex/payments.ts, satisfies AC-1, AC-2
  - [x] Ensure Stripe webhook handler verifies signatures and routes session events, satisfies AC-3
  - [x] Connect OutbidDialog and SubmitPage payment buttons to createCheckoutSession, satisfies AC-1, AC-4
  - [x] Add unit and integration tests in tests/payments.test.ts, satisfies AC-1, AC-4, AC-5
- [x] Verify it: /check verify stripe checkout and payment fulfillment
- [x] Test it: /test stripe checkout and payment fulfillment

## Phase 3: Founder & Product Profiles

### 6. Founder dashboard and SaaS product management

Intent: Provide authenticated founders with an overview of their listed products, total clicks, lifetime spent, and quick bid adjustment.

Done when: Founders can view and manage their SaaS products on /dashboard.

- [ ] Design it (spec): [0006](../specs/0006-founder-dashboard/index.md)
- [ ] Build it: /develop founder dashboard and saas product management
- [ ] Verify it: /check verify founder dashboard and saas product management
- [ ] Test it: /test founder dashboard and saas product management

### 7. Product profile pages and ranking history

Intent: Provide public /product/[slug] profile pages displaying product details, links, clicks, and ranking history timeline.

Done when: Visitors can inspect individual SaaS profile pages and view their ranking journey.

- [ ] Design it (spec): [0007](../specs/0007-product-profile-and-analytics/index.md)
- [ ] Build it: /develop product profile pages and ranking history
- [ ] Verify it: /check verify product profile pages and ranking history
- [ ] Test it: /test product profile pages and ranking history

## Phase 4: Administration & Launch Polish

### 8. Admin panel and realistic seed engine

Intent: Provide platform administration on /admin and seed database with 15 realistic SaaS listings across categories and bid tiers.

Done when: Admin can review/suspend listings, and database seeds with realistic data.

- [ ] Design it (spec): [0008](../specs/0008-admin-panel-and-seed-engine/index.md)
- [ ] Build it: /develop admin panel and realistic seed engine
- [ ] Verify it: /check verify admin panel and realistic seed engine
- [ ] Test it: /test admin panel and realistic seed engine
