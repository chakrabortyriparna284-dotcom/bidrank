# AGENTS.md

Context and operational guidelines for AI agents working in the BidRank repository.

## Stack

* Next.js 15 App Router with TypeScript
* Tailwind CSS and Lucide React icons
* Convex reactive backend with schema validation and automated crons
* Stripe Checkout and payment fulfillment adapter
* Vitest test framework

## Build approach

Tracer Bullet

## Key commands

* `npm run dev`: Start local Next.js development server
* `npm run build`: Run Next.js production build and TypeScript check
* `npm test`: Run Vitest automated test suite
* `npx convex dev`: Run Convex live sync development server

## Architecture and key directories

* `app/`: Next.js 15 App Router pages and routes:
  * `/`: Public leaderboard with top three spotlight cards and live timeframe ranking
  * `/submit`: SaaS product listing form with logo upload and initial bid validation
  * `/dashboard`: Founder management portal with performance metrics and quick bid controls
  * `/product/[slug]`: Public SaaS profile page with ranking and bid history timeline
  * `/admin`: Operator console with platform gross revenue and product moderation
  * `/go/[productId]`: Outbound referral tracking and destination redirect
* `components/`: Modular UI component library:
  * `components/bidding/`: Outbid dialog with dynamic price delta math
  * `components/leaderboard/`: Leaderboard table and top 3 podium spotlight cards
  * `components/dashboard/`: Product editing modal and founder controls
  * `components/auth/`: User sign in and registration modal
  * `components/ui/`: Accessible base primitives styled with Tailwind CSS
* `convex/`: Reactive backend functions and data models:
  * `schema.ts`: Database schema with indexes for products, bids, payments, and bidEvents
  * `products.ts`: Leaderboard ranking, slug generation, and CRUD queries
  * `bids.ts`: Unique bid validation, outbid delta math, and history queries
  * `payments.ts`: Stripe checkout session generation and webhook fulfillment
  * `admin.ts`: Operator overview metrics, full inventory, and status toggles
  * `seed.ts`: Seed engine with 15 realistic SaaS listings with unique bids
  * `crons.ts`: Scheduled resets for rolling 24 hour and 7 day counters
  * `auth.ts` & `users.ts`: Authentication configuration and user profile resolution
* `docs/specs/`: Formal engineering specifications (0001 through 0008)
* `docs/scope/`: Living product roadmap and delivery tracking (`scope.md`)
* `docs/releases/`: User facing release documentation
* `tests/`: Automated unit and integration test suites

## Key invariants

* Bids must be strictly unique among active products; duplicate bids are rejected.
* Tie breaks are resolved deterministically by earliest bid timestamp (`lastBidAt`).
* Rolling timeframe counters (`dailyBid`, `weeklyBid`) are reset by scheduled crons.
* Next.js page components must not export non standard helper functions to preserve App Router type safety.
