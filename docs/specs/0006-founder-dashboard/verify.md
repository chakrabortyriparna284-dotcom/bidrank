# 0006 Verification Plan: Founder Dashboard and SaaS Product Management

## Automated Verification

Run unit and integration tests to verify dashboard metrics aggregation and product update validation:

```bash
npm run test
```

Specific test cases:
1. `tests/dashboard.test.ts`: Verify metric card aggregations (total products, total spent, clicks, best rank) and product ownership checks.

## Manual Verification

1. Start development server with `npm run dev`.
2. Navigate to `/dashboard` as an authenticated founder.
3. Verify overview metric cards show accurate lifetime numbers.
4. Verify product cards display correct status badges (`active`, `awaiting_payment`).
5. Click "Increase Bid" on a product card and verify OutbidDialog opens with the product selected.
6. Click "Edit" and update the product tagline; verify update saves and renders immediately.
