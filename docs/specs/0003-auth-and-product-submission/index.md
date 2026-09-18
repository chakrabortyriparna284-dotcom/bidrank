# 0003. User Authentication and SaaS Product Submission System

**Date**: 2026-09-18
**Status**: In Progress

## Summary

This specification defines the authentication system and the SaaS product submission workflow for BidRank. Users authenticate securely with Convex Auth using email passwords or GitHub and Google accounts. Authenticated founders submit their SaaS details with custom image uploads or direct URLs, choose an initial bid of at least 10 dollars, and generate a payment checkout before their listing becomes active on the public leaderboard.

## Requirements

**User stories**:
- As a founder, I want to create an account and sign in securely so that I can list and manage my SaaS products.
- As a founder, I want to submit my SaaS with logo, description, category, and links so that potential users can discover it.
- As a founder, I want to set an initial bid of at least 10 dollars and pay for it so that my listing enters the ranked leaderboard.
- As a visitor, I want to see anonymous browsing protected so that only authenticated users can create listings or outbid competitors.

**Acceptance criteria**:
- **AC-1**: Users can register, sign in, sign out, and maintain an active session using Convex Auth.
- **AC-2**: Unauthenticated visitors attempting to access submission or outbid dialogs are redirected to the authentication flow.
- **AC-3**: Founders can submit a SaaS with name, unique slug, tagline, description, category, logo image or URL, website link, founder name, social profile, and initial bid amount (minimum 10 dollars).
- **AC-4**: Submitted products are initially created in `awaiting_payment` state and only transition to `active` rank after successful payment confirmation.
- **AC-5**: Product slugs are automatically normalized and verified as globally unique across all database records.

## Decision

**Chosen option**: Option 1: Native Convex Auth with File Storage Uploads and Awaiting Payment Workflow

We use `@convex-dev/auth` for zero latency reactive sessions directly within Convex tables, support both direct image URLs and Convex storage for product logos, and enforce a strict `awaiting_payment` state until Stripe checkout completes.

**Implementation skills**: `convex` (`convex-dev/convex`, `.agents/skills/convex/`)

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

**Data model sketch**:
- `users`: Managed by `@convex-dev/auth` (name, email, image, createdAt).
- `products`:
  - `userId`: `v.id("users")` (owner foreign key)
  - `name`: `v.string()`
  - `slug`: `v.string()` (globally unique index `by_slug`)
  - `tagline`: `v.string()`
  - `description`: `v.string()`
  - `category`: `v.string()`
  - `logoUrl`: `v.optional(v.string())`
  - `logoStorageId`: `v.optional(v.id("_storage"))`
  - `websiteUrl`: `v.string()`
  - `twitterUrl`: `v.optional(v.string())`
  - `demoUrl`: `v.optional(v.string())`
  - `founderName`: `v.string()`
  - `currentBid`: `v.number()`
  - `dailyBid`: `v.number()`
  - `weeklyBid`: `v.number()`
  - `lifetimeAmountPaid`: `v.number()`
  - `status`: `v.union(v.literal("draft"), v.literal("awaiting_payment"), v.literal("active"), v.literal("suspended"), v.literal("archived"))`
  - `createdAt`: `v.number()`
  - `updatedAt`: `v.number()`

**State transitions**:
- `draft` -> `awaiting_payment`: Founder submits SaaS details with initial bid amount.
- `awaiting_payment` -> `active`: Payment webhook confirms initial bid checkout settlement.
- `active` -> `suspended`: Admin suspends listing for policy violations.
- `active` -> `archived`: Founder or admin archives product.

**API surface**:
| Endpoint / Function | Type | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `auth:currentUser` | Query | none | `user` object or `null` | Public / Authenticated | None |
| `products:createProduct` | Mutation | `name`, `tagline`, `description`, `category`, `websiteUrl`, `logoUrl` (opt), `logoStorageId` (opt), `founderName`, `twitterUrl` (opt), `demoUrl` (opt), `initialBid` | `productId`, `slug` | Authenticated | 401 unauthenticated, 400 invalid bid, 409 duplicate slug |
| `products:generateUploadUrl` | Mutation | none | `uploadUrl: string` | Authenticated | 401 unauthenticated |
| `products:getUserProducts` | Query | none | `Product[]` | Authenticated | 401 unauthenticated |
| `products:checkSlugAvailability` | Query | `slug: string` | `available: boolean` | Authenticated | None |

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| `products:createProduct` | `userId` | `ctx.auth.getUserIdentity()` or `getAuthUserId(ctx)` |
| `products:createProduct` | `slug` | Derived from `name` via kebab case normalization and collision suffix generator |
| `products:createProduct` | `currentBid` | Input parameter `initialBid` (must be at least 10) |
| `products:createProduct` | `status` | Initialized to `"awaiting_payment"` |
| `products:createProduct` | `createdAt`, `updatedAt` | `Date.now()` server timestamp |
| `products:generateUploadUrl` | `uploadUrl` | `ctx.storage.generateUploadUrl()` |

**Key invariants**:
- Initial bid must be greater than or equal to 10 dollars.
- Product slug must match alphanumeric kebab case format and be globally unique.
- Only authenticated users can call `createProduct` and `generateUploadUrl`.
- A product in `awaiting_payment` state never appears in public leaderboard queries.

**Security model**:
- Public users can read active products and check slug availability.
- Only authenticated owners can view their unlisted draft or `awaiting_payment` products in dashboard queries.
- Ownership is verified on the backend by matching `product.userId` with the authenticated session user ID.

**Configuration required**:
- `SITE_URL`: Next.js frontend canonical base URL for OAuth redirects.
- `CONVEX_AUTH_SECRET`: Secret key for JWT signing used by Convex Auth.

**Critical test scenarios**:
- Happy path: Authenticated user creates SaaS product with 25 dollar initial bid, receives product ID in `awaiting_payment` status, satisfies **AC-1**, **AC-3**, **AC-4**.
- Failure case: Unauthenticated request to `createProduct` is rejected with authentication error, satisfies **AC-2**.
- Slug collision: Submitting a product with an existing name appends an incremental numeric suffix to maintain uniqueness, satisfies **AC-5**.
- Invalid bid: Submitting a bid under 10 dollars throws a validation exception, satisfies **AC-3**.

## Build plan

- [x] 1. Install and configure `@convex-dev/auth` with auth schema and HTTP router in `convex/auth.ts` and `convex/http.ts`, satisfies **AC-1**, **AC-2**
- [x] 2. Update `convex/schema.ts` with complete product fields, storage references, and owner indexes, satisfies **AC-3**
- [x] 3. Create `products:createProduct`, `products:generateUploadUrl`, and slug generator in `convex/products.ts`, satisfies **AC-3**, **AC-4**, **AC-5**
- [x] 4. Build authentication UI modal and sign in component with email and social buttons, satisfies **AC-1**, **AC-2**
- [x] 5. Build SaaS submission page (`app/submit/page.tsx`) with form validation, image upload, and bid input, satisfies **AC-3**, **AC-4**

## Consequences

**Positive**:
- Direct reactivity for auth state and user profiles without separate webhook sync for user creation.
- Founders can upload local logos or paste remote image URLs with ease.
- Strict state isolation ensures unpaid listings never pollute the public leaderboard.

**Negative / tradeoffs**:
- Requires configuring OAuth app client credentials for production deployment.
- Initial listing submission requires two step flow (submission followed by Stripe checkout) before public visibility.

**Neutral**:
- Convex file storage requires generating short lived upload URLs prior to direct client upload.

## Follow-up

- [ ] Configure GitHub and Google OAuth application client IDs and secrets in Convex environment variables.
