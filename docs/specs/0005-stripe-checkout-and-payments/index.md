# 0005. Stripe Checkout Integration and Payment Fulfillment

**Date**: 2026-09-19
**Status**: Accepted

## Summary

This specification defines the Stripe Checkout session creation and webhook fulfillment engine for BidRank. Authenticated founders create hosted Stripe Checkout sessions to pay for initial listings and outbid increments. Backend actions enforce server side ownership and bid math validation, while verified webhooks idempotently fulfill payments, activate pending products, and update leaderboard rankings.

## Requirements

**User stories**:
- As a founder, I want to click pay for my initial listing so that I am redirected to a secure Stripe Checkout page.
- As a founder, I want to pay only the difference when outbidding so that my card is charged only the incremental amount.
- As a platform operator, I want payments fulfilled only upon verified webhook signatures so that client redirects cannot spoof ranks.
- As a founder, I want duplicate webhook deliveries safely handled without double counting bids or charges.

**Acceptance criteria**:
- **AC-1**: `createCheckoutSession` validates authenticated user, product ownership, and minimum bid requirements before calling Stripe.
- **AC-2**: Stripe Checkout session includes metadata with `productId`, `userId`, `newBid`, and `type`.
- **AC-3**: Stripe webhook endpoint verifies signature and calls `fulfillPayment` upon `checkout.session.completed`.
- **AC-4**: Payment fulfillment updates product status from `awaiting_payment` to `active`, updates bids and counters, and records immutable rank events.
- **AC-5**: Webhook handling is strictly idempotent using provider payment IDs to prevent duplicate fulfillment.

## Decision

**Chosen option**: Option 1: Hosted Stripe Checkout with Server Action and Idempotent Webhook Router

We use Stripe hosted checkout sessions initiated via Convex actions, validate all pricing server side, and fulfill through a signature verified HTTP webhook router into internal Convex mutations.

**Implementation skills**: `convex` (`convex-dev/convex`, `.agents/skills/convex/`)

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Feature design

**Data model sketch**:
- Uses `payments`, `bids`, `products`, `bidEvents` tables in `convex/schema.ts`.
- `payments`: `userId`, `productId`, `provider`, `providerPaymentId`, `amount`, `currency`, `status`, `type`, `createdAt`.

**State transitions**:
- `awaiting_payment` -> `active` (on initial bid fulfillment).
- `active` remains `active` with updated `currentBid` (on outbid fulfillment).

**API surface**:
| Endpoint / Function | Type | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `payments:createCheckoutSession` | Action | `productId`, `proposedBid` | `checkoutUrl` | Authenticated | 401 unauthenticated, 403 forbidden, 400 invalid bid |
| `payments:fulfillPayment` | Internal Mutation | `provider`, `providerPaymentId`, `productId`, `userId`, `amountPaidInCents` | `success`, `newRank` | Internal Only | 404 product not found |
| `/stripe/webhook` | HTTP Action | Raw Stripe Event payload | `{ received: true }` | Public Webhook | 400 invalid signature |

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| `createCheckoutSession` | `amountDueCents` | `(proposedBid - product.currentBid) * 100` (or `initialBid * 100`) |
| `createCheckoutSession` | `metadata` | `productId`, `userId`, `newBid`, `type` |
| `fulfillPayment` | `newBid` | From session metadata or calculated bid delta |
| `fulfillPayment` | `status` | Activated to `"active"` |

**Key invariants**:
- Client never passes charge amount directly as authoritative.
- Amount charged must strictly equal the difference between new bid and current bid.
- Provider payment ID uniqueness guarantees idempotency.

**Security model**:
- Product ownership checked on backend before creating session.
- Webhooks verify Stripe signing secret before executing state changes.

**Configuration required**:
- `STRIPE_SECRET_KEY`: Stripe API secret key.
- `STRIPE_WEBHOOK_SECRET`: Webhook endpoint signing secret.
- `SITE_URL`: Base application URL for success and cancel redirects.

**Critical test scenarios**:
- Happy path: Successful checkout session creation returns valid checkout URL, satisfies **AC-1**, **AC-2**.
- Webhook fulfillment: Webhook triggers `fulfillPayment` and promotes `awaiting_payment` product to `active`, satisfies **AC-3**, **AC-4**.
- Idempotency check: Duplicate webhook with same provider payment ID returns without duplicate bid increments, satisfies **AC-5**.
- Ownership check: Non owner attempting to create checkout for another user product throws forbidden error, satisfies **AC-1**.

## Build plan

- [x] 1. Implement `payments:createCheckoutSession` action in `convex/payments.ts`, satisfies **AC-1**, **AC-2**
- [x] 2. Ensure Stripe webhook handler in `convex/http.ts` verifies signatures and routes session events, satisfies **AC-3**
- [x] 3. Connect OutbidDialog and SubmitPage payment buttons to `createCheckoutSession`, satisfies **AC-1**, **AC-4**
- [x] 4. Add unit and integration tests in `tests/payments.test.ts`, satisfies **AC-1**, **AC-4**, **AC-5**

## Consequences

**Positive**:
- PCI compliance handled entirely by Stripe hosted checkout.
- Full server side price validation prevents frontend price tampering.
- Idempotent execution protects against double charges during network retries.

**Negative / tradeoffs**:
- Requires Stripe API keys configured in environment variables for live charges.

**Neutral**:
- Mock checkout adapter provided for local testing without active Stripe account.

## Follow-up

- [ ] Add Dodo Payments adapter support for international parity as alternate payment provider.
