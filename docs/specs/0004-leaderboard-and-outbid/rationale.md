# 0004 Rationale: Public Leaderboard and Real Time Outbid Experience

## Context

The public leaderboard is the primary engagement surface of BidRank. Founders pay to climb to the top, and visitors browse listings to discover innovative SaaS products.

To create an exciting, competitive experience, the leaderboard must visually distinguish the top three products, display competitive lead indicators, and provide an effortless outbid modal where founders can calculate exactly what they need to pay to claim a higher rank.

## Options considered

### Option 1: Reactive Convex Subscriptions with Incremental Delta Calculation

Use Convex reactive queries on the frontend so any successful bid instantly updates ranks across all client browsers without manual polling. The outbid dialog calculates server validated deltas so founders only pay the difference.

**Pros**:
- Instant realtime updates with zero manual refresh or polling loops.
- Game-like competitive dynamics with dynamic gap indicators.
- Server enforced payment math ensures client cannot forge prices.

**Cons**:
- Requires handling socket reconnections gracefully in edge networks.

### Option 2: Polling REST API with Full Bid Price Payments

Poll standard REST endpoints every 10 seconds and require founders to pay the entire bid amount anew on every outbid.

**Pros**:
- Simpler HTTP client implementation.

**Cons**:
- Punishes founders by forcing duplicate payments for ranks already held.
- Polling creates server load and noticeable lag between bid placement and UI refresh.

## Rationale

Option 1 creates the authentic Outbid style mechanic that makes BidRank appealing to indie hackers and SaaS founders. It gives founders fair credit for amounts previously paid, ensuring they only pay the incremental delta to overtake a competitor.
