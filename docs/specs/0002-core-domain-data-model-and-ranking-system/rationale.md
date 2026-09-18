# Rationale: 0002. Core domain data model and ranking engine

## Context

The core value proposition of BidRank is an unambiguous, real time pay to rank board. If two products share identical bid values, ambiguity arises over which product deserves the higher position and what minimum amount a challenger must pay to claim the spot.

Furthermore, visitors expect to explore products not only across all time, but also by what is trending today or this week. Calculating time window aggregations on demand by scanning historical payment records for hundreds of products creates high query latency and redundant database read operations.

## Options considered

### Option 1: Indexed compound queries with unique bid enforcement and cron based window counters (Chosen)

Enforces strict bid uniqueness at the mutation layer, disallowing any duplicate currentBid among active products. Maintains dedicated `dailyBid` and `weeklyBid` counters on the `products` table, updated atomically on bid mutations and reset at midnight UTC by scheduled Convex crons.

**Pros**:
- Eliminates ranking ties entirely (each rank is held by exactly one distinct bid value)
- Instant read queries for all leaderboard views without running aggregation reductions on read
- Minimal query computation and bandwidth cost for subscribers

**Cons**:
- Requires scheduled cron maintenance to reset rolling counters
- Rejection of identical bids requires founders to pay at least $1 more if someone matches their desired number

### Option 2: Allow duplicate bids with timestamp tie breaking and on demand range queries

Allows identical bid amounts, using the earliest `lastBidAt` timestamp to resolve ties. Time window leaderboards query the `bidEvents` table on read to aggregate totals.

**Pros**:
- No cron jobs required for counter resets
- Allows multiple founders to bid the exact same nominal amount

**Cons**:
- On demand time window aggregations require expensive range scans and grouping inside read queries
- Harder for users to intuit why another product ranks higher when both numbers appear identical in the UI

## Rationale

Strict unique bid validation creates the clearest competitive dynamics for an auction leaderboard (basis: auction design and deterministic ordering). When founders see that every dollar amount corresponds to a single rank, outbidding becomes intuitive: pay $1 more than the product ahead of you to take their rank.

Storing `dailyBid` and `weeklyBid` directly on the product document keeps read performance sub second and subscription payloads lightweight (basis: materialized counters for high read workloads). Convex native cron functions handle daily and weekly counter maintenance reliably with zero external server infrastructure.

## References

**Project sources**:
- `bidrank.md`: Bidding system rules, ranking requirements, and leaderboard time tabs
- `docs/specs/0001-foundational-architecture-and-stack/`: foundational architecture spec

**Practices & standards**:
- Materialized counters for read heavy real time dashboards
- Strict server side invariants for financial domain models
- Immutable event logs for state transition auditing
