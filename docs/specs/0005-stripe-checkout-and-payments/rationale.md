# 0005 Rationale: Stripe Checkout Integration and Payment Fulfillment

## Context

Financial integrity is paramount for BidRank. Bids determine leaderboard ranks, so the application must never allow unverified client side redirects to update bids or grant leaderboard spotlight.

All payments must be verified through cryptographic webhook signatures from Stripe, validated server side, and handled idempotently to protect against double execution or fraud.

## Options considered

### Option 1: Hosted Stripe Checkout with Server Action and Idempotent Webhook Router

Use Stripe Checkout with server actions and a webhook handler in `convex/http.ts`. The adapter pattern abstracts Stripe API calls so other payment providers can be introduced later without rewriting domain ranking logic.

**Pros**:
- Zero client credit card handling or PCI scope.
- Hosted mobile friendly checkout with Apple Pay and Google Pay built in.
- Clean separation between payment provider and ranking mutations.

**Cons**:
- Requires redirecting user to external Stripe checkout page and back.

### Option 2: Custom Elements with Stripe PaymentIntents

Render Stripe Elements directly inside an embedded modal on the site.

**Pros**:
- User stays on the page throughout checkout.

**Cons**:
- Higher frontend complexity and more client state to maintain.
- Harder to swap with alternative checkout providers like Dodo Payments.

## Rationale

Option 1 provides the highest reliability and matches the product requirements in `bidrank.md`. It fulfills the requirement that Stripe can later be swapped or complemented with Dodo Payments via the adapter interface without altering the core ranking and fulfillment logic.
