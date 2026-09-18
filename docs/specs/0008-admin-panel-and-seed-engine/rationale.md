# 0008 Rationale: Admin Panel and Realistic Seed Engine

## Context

A pay to rank marketplace requires administrative oversight to handle suspicious submissions, moderate spam, and inspect revenue performance. Additionally, during staging and initial launch, an empty directory discourages users; seeding 15 high quality SaaS listings establishes an active bidding environment and demonstrates the leaderboard hierarchy.

## Options Considered

### Option 1: Integrated Admin Surface with Server Backed Seed Mutation (Selected)
Provide `/admin` with direct Convex queries for overview stats and a moderation table, alongside a backend mutation `seed:seedProducts` that atomically seeds 15 distinct products.

Pros:
* Immediate live updates as products are toggled or seeded.
* Zero external script setup required; operators can seed directly from the browser with one click.
* Full testability within existing test infrastructure.

Cons:
* In production, the admin route should eventually be gated by role based access controls or authentication checks.

### Option 2: CLI Only Seed Script
Run database seeding via a node command line script that makes Convex HTTP calls.

Pros:
* Excludes seed mutation from client bundle.

Cons:
* Cumbersome for web evaluators and founders testing the UI in browser environments.

## Decision Outcome

Option 1 is selected because it enables effortless demonstration, immediate moderation capability, and direct UI feedback.
