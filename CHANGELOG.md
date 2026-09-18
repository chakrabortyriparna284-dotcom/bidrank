# Changelog

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-09-19

### Added
* Next.js 15 App Router architecture with TypeScript, Tailwind CSS, and Lucide icons (see spec 0001).
* Convex reactive backend with schema validation, indexes, and rolling timeframe window counters (see spec 0002).
* Unique bid requirement and strict outbid rules with tie breaking by earliest bid timestamp (see spec 0002).
* User authentication with session persistence and SaaS product submission flow with asset upload support (see spec 0003).
* Public leaderboard with real time subscriptions, top three spotlight podium styling, timeframe filters, and competitor gap tags (see spec 0004).
* Interactive outbid dialog calculating precise price deltas to claim any rank (see spec 0004).
* Stripe Checkout session creation action and verified webhook fulfillment handlers (see spec 0005).
* Founder dashboard on `/dashboard` with aggregated metrics for total listings, lifetime spent, total clicks, and best leaderboard rank (see spec 0006).
* SaaS product management dialog for instant metadata and website updates (see spec 0006).
* Dedicated public product profile pages on `/product/[slug]` with interactive outbid triggers and historical ranking timeline (see spec 0007).
* Outbound click tracking route on `/go/[productId]` for referral attribution (see spec 0007).
* Operator administration console on `/admin` with gross revenue tracking and listing moderation (see spec 0008).
* Development database seed engine with fifteen realistic SaaS products spanning AI, Developer Tools, Analytics, and Productivity (see spec 0008).
* Comprehensive automated test suite with thirty seven unit and integration tests across eight test files (see spec 0001 through 0008).
