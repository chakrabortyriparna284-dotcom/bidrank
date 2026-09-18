# Verify: Core domain data model and ranking engine · spec 0002 · updated 2026-09-18
_Steps derived from spec 0002 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual
- [ ] Inspect leaderboard queries → `products:getLeaderboard` accepts `"all"`, `"today"`, `"week"` timeframe filters and returns correctly sorted products
- [ ] Test unique bid validation → Attempting to submit a bid equal to an existing product's currentBid returns an error and requires at least target + $1

## Commands
- [ ] `npx tsc --noEmit` → TypeScript checks clean with all schema fields and function signatures typed
- [ ] `npm run build` → Next.js build succeeds with updated Convex schema bindings

## Acceptance-criteria coverage
- AC-1 covered by `getLeaderboard` query and compound index
- AC-2 covered by `validateOutbid` query in `convex/bids.ts`
- AC-3 covered by status filter query in `convex/products.ts`
- AC-4 covered by cron handlers in `convex/crons.ts`
- AC-5 covered by `bidEvents` insert in `convex/payments.ts`
