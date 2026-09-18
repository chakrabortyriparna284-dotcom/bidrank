# 0003 Rationale: User Authentication and SaaS Product Submission System

## Context

BidRank requires verified user authentication before founders can submit products or submit outbid increments. Founders must be able to securely sign up, log in, manage their listed products, and upload their brand assets.

Without an integrated authentication layer, anonymous users could spoof submissions or manipulate bids. We need an authentication and submission flow that connects directly with Convex reactive tables, prevents unpaid listings from appearing on the public leaderboard, and maintains clean slug uniqueness.

## Options considered

### Option 1: Native Convex Auth (@convex-dev/auth) with File Storage and Two Step Activation

Integrate `@convex-dev/auth` using email password and social OAuth directly within Convex server functions. Use Convex file storage for logo uploads alongside optional direct URLs.

**Pros**:
- Zero external database syncing or user webhook latency.
- Authentication state updates trigger reactive UI rerenders instantly.
- Secure HTTP cookies and JWT tokens managed natively.

**Cons**:
- Requires Convex auth secret and provider client keys configured in environment variables.

### Option 2: Clerk Authentication with Webhook Sync to Convex

Use Clerk as a hosted identity provider and synchronize user records to Convex via webhooks.

**Pros**:
- Rich prebuilt user profile and organization management components.

**Cons**:
- Adds external dependency and potential sync delays between Clerk and Convex databases.
- More complex token verification bridging required.

### Option 3: NextAuth / Auth.js with Custom Adapter

Deploy Auth.js inside Next.js API routes with custom Convex database adapter.

**Pros**:
- Open source and flexible across different hosting platforms.

**Cons**:
- Requires maintaining custom adapter logic and session synchronization with Convex queries.

## Rationale

Option 1 provides the highest performance and cleanest architectural cohesion for BidRank. Because BidRank uses Convex as its primary reactive backend, `@convex-dev/auth` ensures authenticated user state is immediately available to queries and mutations without external sync latency.

Separating the submission into an initial `awaiting_payment` state guarantees that only founders who successfully complete their initial bid checkout appear on the public leaderboard.
