# Rationale: 0001. Foundational architecture and tech stack for BidRank

## Context

BidRank is a public leaderboard SaaS where founders compete for visibility by placing cash bids. The product mechanics require that the product with the highest bid holds rank number one, and founders outbid competitors by paying only the price difference between their current bid and their target bid.

This model creates three distinct architectural pressures:

First, the public leaderboard demands instantaneous reactivity. When a founder completes a checkout, all active visitors must see the new ranking, updated bid numbers, and modified leaderboard badges immediately without refreshing or waiting for polling intervals. Managing custom WebSocket servers or Server Sent Events introduces significant operational overhead and connection state complexity.

Second, bidding and financial accounting require strict consistency. Bids can never decrease, payment amounts must be computed strictly on the server, and race conditions between competing bids must resolve deterministically. If two listings share the same bid amount, the listing that reached the bid earliest must retain the higher rank.

Third, the application requires future payment provider flexibility. While Stripe Checkout powers the initial release, the architecture must allow swapping or adding alternative providers such as Dodo Payments without rewriting ranking rules, database mutations, or frontend presentation.

## Options considered

### Option 1: Next.js App Router with Convex reactive backend and Stripe adapter (Chosen)

A unified TypeScript stack using Next.js App Router for frontend UI, routing, and metadata, backed by Convex as a reactive database platform that handles queries, mutations, scheduled actions, and real time client subscriptions. Stripe Checkout sessions and webhooks route through a standardized payment adapter interface.

**Pros**:
- Native reactive subscriptions update frontend UI instantly on database write with zero WebSocket configuration
- ACID transactional mutations guarantee atomic balance and bid updates without race conditions
- Eliminates cache invalidation and state synchronization boilerplate across client and server
- Official `@convex-dev/auth` keeps identity inside the database without third party redirects

**Cons**:
- Ties database and real time query layer to the Convex runtime
- Requires adhering to Convex serverless execution limits and transaction semantics

### Option 2: Next.js App Router with PostgreSQL, Prisma ORM, and Supabase Realtime

A traditional relational architecture pairing Next.js with PostgreSQL hosted on Supabase, using Prisma for database access and Supabase Realtime replication channels to broadcast table changes to clients.

**Pros**:
- Standard SQL database with extensive ecosystem tooling and portable schema definitions
- Direct relational joins and broad hosting choices

**Cons**:
- Maintaining real time replication subscriptions alongside Prisma mutations introduces dual source synchronization risk
- Requires configuring and managing connection poolers for serverless Next.js edge environments
- More moving pieces to configure for authentication, webhooks, and database migrations

### Option 3: TanStack Start with Express API, Redis PubSub, and WebSockets

A decoupled architecture featuring a dedicated Node.js Express API server, TanStack Start frontend, Redis for pub sub message distribution, and custom WebSocket connections for live client updates.

**Pros**:
- Complete control over persistent TCP connections and protocol serialization
- Zero vendor lock in for application server or database layers

**Cons**:
- Tremendous operational burden for a small team, requiring container management, health monitoring, and scaling
- Massive boilerplate required for subscription lifecycle, reconnection logic, and authentication handshakes
- Directly violates the requirement to not over engineer the application

## Rationale

Convex provides the ideal foundation for BidRank because its core design matches the application's most critical requirement: automatic real time synchronization without manual cache invalidation or WebSocket connection maintenance (basis: Convex reactive subscription model). In Convex, queries are deterministic pure functions of database state. When a Stripe webhook confirms a bid payment and mutates a listing, every client subscribed to the leaderboard query receives the new state automatically with sub second latency.

Convex mutations execute in serializable transactions (basis: ACID transactional guarantees for financial mutations). This guarantees that bid differences, lifetime paid totals, and tie breaking timestamps update atomically without dirty reads or concurrent overwrite anomalies.

Using a payment provider adapter interface isolates Stripe SDK specific calls from the core ranking domain (basis: adapter pattern for external integrations). Webhooks hit a dedicated Convex HTTP action with raw signature verification, normalize the payload into a standard domain event, and trigger internal mutations. This ensures that substituting Dodo Payments later requires only writing a new adapter implementation while keeping all schema, queries, and ranking logic intact.

## References

**Project sources**:
- `bidrank.md`: full product requirements, tech stack constraints, and user flows
- `.agents/skills/convex/`: installed Convex community skill conventions and guidelines

**Practices & standards**:
- Idempotency keys and provider payment IDs for financial mutation deduplication
- Adapter pattern for external payment provider isolation
- Reactive document subscription pattern for real time leaderboard interfaces

**Links**:
- Convex Auth Guide: https://docs.convex.dev
- Convex Next.js Quickstart: https://docs.convex.dev/quickstart/nextjs
- Convex Stripe Integration: https://github.com/get-convex/stripe
