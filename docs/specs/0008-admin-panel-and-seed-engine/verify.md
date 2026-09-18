# 0008 Verification Plan: Admin Panel and Realistic Seed Engine

## Automated Verification

Run unit tests verifying seed uniqueness, platform metric aggregation, and status toggle behavior:

```bash
npm run test
```

Specific test cases:
1. `tests/admin.test.ts`: Verify all 15 seeded products have unique bids, non empty slugs, valid categories, and status toggle logic flips `active` to `suspended`.

## Manual Verification

1. Start development server using `npm run dev`.
2. Navigate to `/admin`.
3. Verify overview cards render Gross Platform Revenue, Active SaaS, Suspended SaaS, and Total Clicks.
4. Click "Seed 15 Realistic SaaS Products" and verify toast notification confirms successful database populating.
5. Inspect the moderation table to confirm all 15 products appear with their ranks and bids.
6. Click "Suspend" on any product; verify its badge turns yellow with "Suspended" label and it is excluded from `/`.
7. Click "Reactivate" and verify it returns to active standing.
