# 0007 Rationale: Product Profile Pages and Ranking History

## Context

Each listed SaaS on BidRank needs a canonical destination URL where visitors and potential customers can learn about the software, inspect founders credentials, and verify ranking authenticity. Furthermore, displaying transparent ranking history establishes trust and highlights competitive momentum.

## Options Considered

### Option 1: Dynamic Profile Page with Reactive Convex Subscriptions (Selected)
Build `/product/[slug]` with client side Convex query subscriptions to `products:getBySlug` and `bids:getHistory`.

Pros:
* Always reflects live bids and real time ranking shifts without page refreshes.
* Reuses existing `OutbidDialog` modal for instant outbidding.
* High interactive quality and fast navigation.

Cons:
* Requires client side loading state while resolving initial query.

### Option 2: Pure Server Rendered Static Pages
Generate static pages at build time with incremental static regeneration.

Pros:
* Initial HTML contains content immediately for search engines.

Cons:
* High friction in pay to rank competitive environments where ranks change every minute.
* Stale rank data creates confusion when competitors outbid in real time.

## Decision Outcome

Option 1 is selected because real time accuracy is paramount for a competitive bidding platform.
