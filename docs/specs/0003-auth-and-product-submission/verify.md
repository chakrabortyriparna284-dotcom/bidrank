# 0003 Verification Plan: User Authentication and SaaS Product Submission System

## Automated Verification

Run unit and integration tests to verify authentication helpers, schema validation, and product submission logic:

```bash
npm run test
```

Specific test cases to execute:
1. `tests/auth.test.ts`: Verify user creation, session token resolution, and unauthenticated access rejection.
2. `tests/submission.test.ts`: Verify product slug generation, uniqueness collision handling, minimum bid enforcement (at least 10 dollars), and initial `awaiting_payment` status assignment.

## Manual Verification

1. Start development server with `npm run dev`.
2. Visit `/` as an anonymous user and click "List your SaaS".
3. Verify that the auth dialog or sign in page opens immediately.
4. Sign up with a new email and password.
5. Fill out the SaaS submission form with name, description, category, logo, and a 25 dollar initial bid.
6. Verify that the submission mutation creates the product with `awaiting_payment` status and redirects to the payment step.
7. Verify that the unactivated product does not appear on the public homepage leaderboard.
