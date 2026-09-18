# 0005 Verification Plan: Stripe Checkout Integration and Payment Fulfillment

## Automated Verification

Run unit and integration tests to verify Stripe payment creation, bid delta calculation, and webhook fulfillment:

```bash
npm run test
```

Specific test cases:
- [x] 1. `tests/payments.test.ts`: Verify checkout session price calculation, ownership validation, and idempotent webhook fulfillment (satisfies AC-1, AC-2, AC-5).
- [x] 2. `tests/ranking.test.ts`: Verify outbid delta and tie breaking consistency (satisfies AC-1, AC-4).

## Build & Conformance Verification

- [x] 1. Production bundle compilation: `npm run build` succeeds with 5/5 static pages optimized.
- [x] 2. Type validation: `npx tsc --noEmit` passes with 0 type errors.

## Manual Verification Checklist

- [x] 1. Submit SaaS listing and click "Pay and Activate Listing" to trigger checkout session.
- [x] 2. Verify Stripe checkout session creates with product metadata.
- [x] 3. Trigger webhook event and verify product status updates to `active` with updated ranks on the homepage.
