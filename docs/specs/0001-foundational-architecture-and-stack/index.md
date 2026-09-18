# 0001. Foundational architecture and tech stack for BidRank

**Date**: 2026-09-18
**Status**: Accepted

## Summary

This specification establishes the foundational technology stack and architectural patterns for BidRank. We choose the Next.js App Router combined with Convex for the reactive database backend and Stripe Checkout via a provider adapter. This foundation gives us real time leaderboard updates without managing WebSocket servers, guaranteed transactional bid updates, and clean separation between payment providers and domain rankings.

## Decision

**Chosen option**: Option 1: Next.js App Router with Convex reactive backend and Stripe adapter

We select Next.js App Router paired with Convex and Stripe Checkout through a provider adapter interface.

**Implementation skills**: `convex` (`get-convex/agent-skills`, `.agents/skills/convex/`)

## Rationale

Reasoning and options: see [rationale.md](rationale.md).

## Proposed stack

| Layer | Choice | Reason |
|---|---|---|
| Language | TypeScript (strict mode) | End to end type safety across database schema, backend functions, and frontend components |
| Framework | Next.js latest App Router | React Server Components for SEO and initial landing page speed, combined with client components for live reactivity |
| Styling and UI | Tailwind CSS and shadcn/ui | Accessible, customizable component primitives with fast development velocity and dark mode support |
| Primary DB and Real Time Sync | Convex | Serverless document database with transactional mutations and reactive subscriptions |
| Authentication | @convex-dev/auth | Native Convex authentication supporting GitHub and Google OAuth plus email links without external redirect services |
| Payments | Stripe Checkout via Payment Adapter | Hosted checkout pages ensuring PCI compliance, structured behind an adapter for future Dodo Payments support |
| File Storage | Convex Storage | Built in file storage via uploadUrl for direct logo uploads, supplemented by external URL support |
| Observability | Structured logging and Convex Dashboard | Integrated mutation and action telemetry with function execution logs and error monitoring |
| Hosting | Vercel and Convex Cloud | Zero infrastructure maintenance with optimized Next.js edge routing and managed backend scaling |

## Architecture design

### System topology

```text
[ Browser / Client ]
      │  ▲
      │  │ Convex WebSocket (Reactive queries, live leaderboard)
      ▼  │
[ Next.js App Router on Vercel ]
   ├── Public Pages (/, /product/[slug], /categories)
   ├── Protected Pages (/dashboard, /admin)
   ├── Redirect Router (/go/[productId] -> HTTP 307 + Convex click mutation)
   └── UI Components (shadcn/ui + Lucide icons)
      │
      ▼ Client SDK calls
[ Convex Backend Cloud ]
   ├── schema.ts (Data model, compound indexes)
   ├── products.ts (Queries, submission mutations, tie breaking)
   ├── bids.ts (Bid calculation actions, status checks)
   ├── payments.ts (Payment records, provider verification)
   ├── clicks.ts (Click recording mutations)
   ├── http.ts (Direct HTTP actions for Stripe webhooks with raw signature verification)
   ├── auth.ts (@convex-dev/auth configuration and session verification)
   └── lib/payments/ (Payment provider adapter interface + Stripe implementation)
      │
      ▼ Checkout creation & webhook events
[ Stripe API & Webhooks ]
```

### Payment provider adapter contract

To guarantee that Stripe can later be replaced with Dodo Payments without rewriting the ranking engine, all payment interactions implement the following interface in `convex/lib/payments/types.ts`:

```typescript
export interface CreateCheckoutParams {
  userId: string;
  productId: string;
  productName: string;
  newBid: number;
  amountDue: number; // in cents
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResult {
  checkoutUrl: string;
  sessionId: string;
}

export interface NormalizedPaymentEvent {
  provider: "stripe" | "dodo";
  providerPaymentId: string;
  productId: string;
  userId: string;
  amountPaid: number; // in cents
  currency: string;
  status: "succeeded" | "failed";
}

export interface PaymentProviderAdapter {
  createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutResult>;
  verifyAndNormalizeWebhook(request: Request): Promise<NormalizedPaymentEvent | null>;
}
```

### Directory structure

```text
bidrank/
├── .agents/
│   └── skills/
│       └── convex/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    // Homepage and live leaderboard
│   ├── dashboard/page.tsx          // Founder dashboard
│   ├── product/[slug]/page.tsx     // Public product profile
│   ├── admin/page.tsx              // Admin moderation panel
│   ├── go/[productId]/route.ts     // Click tracker and redirect router
│   └── signin/page.tsx             // Auth sign in page
├── components/
│   ├── ui/                         // shadcn/ui components
│   ├── leaderboard/                // Leaderboard list, rank cards, badge highlights
│   ├── bidding/                    // Outbid dialog, calculation preview
│   ├── products/                   // Submission form, edit forms
│   └── dashboard/                  // Overview stats cards, product management
├── convex/
│   ├── _generated/
│   ├── schema.ts                   // Tables: users, products, bids, payments, clicks, bidEvents
│   ├── auth.ts                     // Convex Auth configuration
│   ├── http.ts                     // Stripe webhook HTTP action
│   ├── products.ts                 // Public queries, ranked listings, submissions
│   ├── bids.ts                     // Outbid validation, diff computation, bid history
│   ├── payments.ts                 // Payment records, webhook fulfillment mutations
│   ├── clicks.ts                   // Click ingestion
│   ├── admin.ts                    // Moderation queries and actions
│   └── lib/
│       └── payments/
│           ├── types.ts            // Provider adapter interface
│           └── stripe.ts           // Stripe SDK adapter implementation
├── docs/
│   └── specs/
│       └── 0001-foundational-architecture-and-stack/
│           ├── index.md
│           ├── rationale.md
│           └── verify.md
└── package.json
```

## Consequences

**Positive**:
- Live real time leaderboard updates across all active users with zero custom socket plumbing
- Complete server side validation for all financial math, ensuring users only pay the exact bid difference
- Strict ACID transaction guarantees prevent concurrent bidding conflicts or negative bid states
- Dropping in Dodo Payments or another checkout provider requires only implementing `PaymentProviderAdapter` without altering ranking or schema logic
- Built in file storage and authentication minimize external developer account requirements

**Negative / tradeoffs**:
- Server code runs inside Convex runtime environment, which uses specific JavaScript APIs rather than arbitrary Node.js native bindings
- Stripe webhook signatures must be validated inside Convex HTTP action using Web standard Request APIs rather than Node.js raw streams

**Neutral**:
- Requires configuring local environment variables for both Next.js and Convex deployment (`NEXT_PUBLIC_CONVEX_URL`, `CONVEX_DEPLOYMENT`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`)
- Image handling supports both direct Convex uploads and external URL links

## Follow-up

- [ ] Run next architectural decision for core domain data model and ranking schema (`0002-core-domain-data-model-and-ranking-system.md`)
- [ ] Incorporate `convex` community skill rules and conventions into root `AGENTS.md` before implementation begins
- [ ] Configure Stripe webhook endpoint in Stripe developer dashboard pointing to the Convex deployment site HTTP route (`/stripe/webhook`)
