# 0007 Verification Plan: Product Profile Pages and Ranking History

## Automated Verification

Run unit tests verifying slug lookups and timeline computations:

```bash
npm run test
```

Specific test cases:
1. `tests/profile.test.ts`: Verify timeline sorting, delta computations, and public profile metrics formatting.

## Manual Verification

1. Start development server using `npm run dev`.
2. Navigate to a product profile URL like `/product/typeflow`.
3. Verify product header displays logo, name, category badge, and active status.
4. Verify metric cards show accurate rank, current bid, clicks, and lifetime investment.
5. Verify outbound website link opens the product URL.
6. Verify ranking history timeline lists past bid events in chronological order.
7. Click "Outbid This SaaS" and verify the `OutbidDialog` opens with the target SaaS selected.
