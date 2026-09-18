# Verify: Stack and architecture foundation · spec 0001 · updated 2026-09-18
_Steps derived from spec 0001 architectural decisions. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual
- [ ] Visit `/` → Landing page renders hero, live stats preview, navigation, and how it works section with dark theme styling
- [ ] Inspect payment adapter contract → `PaymentProviderAdapter` interface defined in `convex/lib/payments/types.ts` and implemented in `convex/lib/payments/stripe.ts`

## Commands
- [ ] `npx tsc --noEmit` → TypeScript checks clean with zero type errors across Next.js and Convex
- [ ] `npm run build` → Next.js builds and generates production routes with zero build errors

## Acceptance-criteria coverage
- Foundational architecture and type integrity covered by `npx tsc --noEmit`
- Next.js App Router and Tailwind styling covered by `npm run build`
- Payment adapter contract covered by provider abstraction in `convex/lib/payments/`
