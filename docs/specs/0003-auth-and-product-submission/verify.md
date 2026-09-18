# 0003 Verification Plan: User Authentication and SaaS Product Submission System

## Automated Verification

Run unit and integration tests to verify authentication helpers, schema validation, and product submission logic:

```bash
npm run test
```

Specific test cases to execute:
- [x] 1. `tests/auth.test.ts`: Verify user creation, session token resolution, and unauthenticated access rejection (satisfies AC-1, AC-2).
- [x] 2. `tests/submission.test.ts`: Verify product slug generation, uniqueness collision handling, minimum bid enforcement (at least 10 dollars), and initial `awaiting_payment` status assignment (satisfies AC-3, AC-4, AC-5).

## Build & Conformance Verification

- [x] 1. Production bundle compilation: `npm run build` succeeds with 5/5 static pages optimized.
- [x] 2. Type validation: `npx tsc --noEmit` passes with 0 type errors.

## Manual Verification Checklist

- [x] 1. Anonymous user click "List your SaaS" triggers AuthModal (satisfies AC-2).
- [x] 2. User registration and login creates reactive session and displays UserButton (satisfies AC-1).
- [x] 3. SaaS submission form validates required fields, unique slug preview, and minimum 10 dollar bid (satisfies AC-3, AC-5).
- [x] 4. New submissions are created in `awaiting_payment` state and do not appear on public leaderboard until paid (satisfies AC-4).
