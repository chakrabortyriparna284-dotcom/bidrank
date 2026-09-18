# 0004 Verification Plan: Public Leaderboard and Real Time Outbid Experience

## Automated Verification

Run unit and integration tests to verify leaderboard ranking math, gap calculations, and outbid requirements:

```bash
npm run test
```

Specific test cases:
- [x] 1. `tests/leaderboard.test.ts`: Verify top 3 spotlight classification, timeframe filtering logic, and outbid delta calculations (satisfies AC-1, AC-2, AC-3, AC-5).
- [x] 2. `tests/ranking.test.ts`: Verify strict 1 dollar outbid requirement and tie breaking logic (satisfies AC-1, AC-3).

## Build & Conformance Verification

- [x] 1. Production bundle compilation: `npm run build` succeeds with 5/5 static pages optimized.
- [x] 2. Type validation: `npx tsc --noEmit` passes with 0 type errors.

## Manual Verification Checklist

- [x] 1. Visit `/` and observe public leaderboard with reactive stats counter.
- [x] 2. Switch tabs between All Time, Today, and This Week to view timeframe updates.
- [x] 3. Click "Outbid" on competitor to verify dialog displays required minimum bid and dynamic price delta.
- [x] 4. Click "Visit" on any product and verify click tracking redirect through `/go/[productId]`.
