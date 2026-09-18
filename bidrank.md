Build a complete full-stack SaaS called **BidRank**, inspired by the pay-to-rank mechanic of Outbid.lol.

The core concept is extremely simple:

Founders submit their SaaS/product to the platform. Products are displayed on a public leaderboard. The product that has paid the highest amount appears at the top. Any founder can pay more than another product's current bid to move above them.

Build this as a polished MVP suitable for a production SaaS demo.

## Tech Stack

Use:

* Next.js latest version with App Router
* TypeScript
* Tailwind CSS
* shadcn/ui
* Convex for:

  * database
  * queries
  * mutations
  * actions
  * realtime subscriptions
* Convex authentication or a clean auth solution compatible with Convex
* Stripe Checkout for payments
* Lucide icons
* Vercel-compatible frontend deployment

Keep the architecture simple and clean.

Do not over-engineer the application.

---

# Core User Flow

A visitor lands on the homepage and sees a public leaderboard of SaaS products.

Each product shows:

* rank
* logo
* SaaS name
* short description
* category
* website URL
* founder/user
* current bid
* number of clicks
* button to visit the product
* button to outbid the product

Ranking should be determined primarily by the product's current bid.

Highest bid = Rank #1.

Example:

1. Product A — $500
2. Product B — $350
3. Product C — $200
4. Product D — $100

If Product D pays $401, it should move above Product B and become Rank #2.

The leaderboard should update automatically in realtime using Convex subscriptions.

---

# Authentication

Users should be able to:

* Sign up
* Sign in
* Sign out
* View their account
* Manage their submitted SaaS products

Anonymous users can browse the leaderboard but cannot submit or bid.

If an anonymous user clicks "List your SaaS" or "Outbid", redirect them to authentication first.

---

# SaaS Submission

Logged-in users should be able to submit a SaaS.

Create a form containing:

* SaaS name
* website URL
* logo URL or image
* tagline
* description
* category
* founder name
* X/Twitter URL
* optional demo URL

Suggested categories:

* AI
* Developer Tools
* Productivity
* Marketing
* Sales
* Design
* Finance
* Analytics
* Consumer
* Other

After entering their SaaS information, ask them to place their initial bid.

Example:

"How much would you like to bid for your initial position?"

Show:

Current minimum bid: $10

Input:
$ __________

CTA:

"List my SaaS"

Do not publish the SaaS as an active ranked listing until payment succeeds.

---

# Bidding System

This is the most important part of the app.

Every product should have a currentBid.

Users should be able to increase the bid on products they own.

They should NOT pay the entire bid amount again.

They should only pay the difference.

Example:

Current bid: $250

User wants new bid: $400

Amount charged:

$150

Store both:

* lifetimeAmountPaid
* currentBid

After payment succeeds:

currentBid = newBid

lifetimeAmountPaid += amountPaid

Then automatically recalculate the leaderboard.

---

# Outbid Experience

On every leaderboard item, add an "Outbid" button.

When clicked, show a dialog.

Example:

Current bid:
$500

Minimum bid required:
$501

Your bid:
[$________]

If the user does not own a SaaS yet, let them select one of their SaaS products or create one.

Show a useful calculation:

Current bid: $200
New bid: $550
You pay today: $350
Estimated new rank: #1

CTA:

"Pay $350 and move to #1"

Do not trust any price or amount calculated by the frontend.

All payment calculations must be validated server-side.

---

# Payment Flow

Use Stripe Checkout.

Flow:

1. User chooses new bid.
2. Frontend calls a Convex action.
3. Backend validates:

   * authenticated user
   * product ownership
   * current bid
   * requested new bid
   * amount due
4. Backend creates a Stripe Checkout Session.
5. User completes checkout.
6. Stripe webhook confirms payment.
7. Backend creates a payment record.
8. Product bid is updated.
9. Leaderboard automatically updates.

Never change leaderboard ranking based purely on a frontend success redirect.

Only update bids after receiving verified payment confirmation.

Design the payments implementation so Stripe can later be replaced with Dodo Payments without rewriting the ranking logic.

---

# Homepage

Create a visually polished homepage.

Top navigation:

BidRank logo

Links:

* Leaderboard
* Categories
* How it Works
* Sign In

CTA:

"List Your SaaS"

Hero:

"Pay your way to the top."

Subtitle:

"The SaaS leaderboard where founders compete for attention. Bid higher, rank higher, get discovered."

Buttons:

"List your SaaS"

"View leaderboard"

Add a small live stat section:

$XX,XXX total bids
XXX products
XX,XXX clicks

These values should come from Convex.

---

# Leaderboard

Below the hero, show the main leaderboard.

Tabs:

* All Time
* Today
* This Week
* New

For the MVP, implement All Time properly.

Structure the data model so Daily and Weekly leaderboards can be added.

Leaderboard cards should feel competitive and slightly game-like.

Top 3 products should visually stand out.

Show:

#1
Logo
Product
Tagline

$12,500 bid

Visit

Outbid

Add small text such as:

"🔥 $500 ahead of #2"

or:

"$51 required to take this position"

where appropriate.

---

# Realtime Updates

Convex should be used heavily for realtime UI.

When someone successfully places a higher bid:

* rankings should change automatically
* users currently viewing the page should see the changes without refreshing
* bid amounts should update
* rankings should update
* revenue/stat counters should update

Do not implement manual polling.

Use Convex reactive queries.

---

# Product Page

Each product should have a public profile page:

/product/[slug]

Show:

* logo
* SaaS name
* tagline
* full description
* website
* category
* founder
* current rank
* current bid
* total amount spent
* total clicks
* date listed
* X profile

Include:

Visit website

Outbid

Add a ranking history section.

Example:

Started at #26
Moved to #8
Moved to #2
Currently #3

Store bid events so this history can later be visualized.

---

# Click Tracking

When users click "Visit Website":

Do not link directly.

Use something like:

/go/[productId]

This endpoint should:

1. record a click
2. optionally store basic metadata
3. redirect the visitor to the SaaS website

Do not store sensitive personal information.

Track:

* productId
* timestamp
* referrer if available

Show click counts publicly.

---

# User Dashboard

Create:

/dashboard

Dashboard should show:

Overview cards:

* Total SaaS products
* Total bids spent
* Total clicks received
* Best current rank

Then show the user's SaaS products.

Each product card should show:

* name
* current rank
* current bid
* clicks
* total spent
* Edit
* Increase Bid
* View Public Page

Add CTA:

"+ Add another SaaS"

---

# Database Design

Create Convex tables similar to:

users

* name
* email
* image
* createdAt

products

* userId
* name
* slug
* websiteUrl
* logoUrl
* tagline
* description
* category
* twitterUrl
* demoUrl
* currentBid
* lifetimeAmountPaid
* status
* createdAt
* updatedAt

bids

* productId
* userId
* previousBid
* newBid
* amountPaid
* paymentId
* status
* createdAt

payments

* userId
* productId
* provider
* providerPaymentId
* amount
* currency
* status
* type
* createdAt

clicks

* productId
* timestamp
* referrer

bidEvents

* productId
* previousRank
* newRank
* previousBid
* newBid
* createdAt

Use Convex indexes wherever appropriate.

Do not make the client download thousands of records just to sort them locally.

Ranking logic should live on the backend/query layer.

---

# Ranking Rules

Ranking should primarily be:

currentBid descending.

For identical bids, use:

earliest time reaching that bid wins.

Never rely on JavaScript array ordering for deterministic ranking.

Store appropriate timestamps to resolve ties.

Products must have an ACTIVE status to appear on the leaderboard.

Possible statuses:

* draft
* awaiting_payment
* active
* suspended
* archived

---

# Admin Dashboard

Create a simple protected:

/admin

Admin can:

* see all products
* see all users
* see payments
* suspend products
* restore products
* manually review inappropriate listings
* see total revenue
* see total bids
* see total clicks

Admin privileges must be checked server-side.

Do not rely only on hiding the UI.

---

# Seed Data

Create realistic development seed data.

At least 15 SaaS products.

Example categories:

AI
Developer Tools
Marketing
Productivity
Design

Generate different bids such as:

$12,500
$8,100
$5,250
$3,900
$2,100
$1,500
$900
$500
$300
$150

This should make the application immediately look populated during development.

---

# Design Direction

Make the design playful, competitive, modern, and startup-focused.

Think:

* Product Hunt
* indie hacker aesthetics
* SaaS leaderboard
* auction
* game mechanics

But DO NOT copy Outbid's visual design, branding, logos, copy, or assets.

Create an original visual identity.

Use:

* strong typography
* large bid numbers
* clear leaderboard ranking
* subtle animations
* polished hover states
* responsive cards
* clean spacing
* dark mode

Make mobile responsiveness excellent.

---

# Important Engineering Requirements

Use TypeScript everywhere.

Use proper loading states.

Use toast notifications.

Use optimistic UI only when safe.

Payments must NEVER use optimistic bid updates.

Create reusable components.

Keep server/business logic separate from UI components.

Validate all inputs.

Protect Convex mutations.

Verify product ownership server-side.

Never accept payment amount directly from the client as authoritative.

Prevent negative bids.

Prevent lowering an existing bid.

Minimum initial bid = $10.

New bids must be at least $1 higher than the target ranking amount.

Prevent duplicate payment processing using provider payment IDs.

Make webhook handling idempotent.

---

# Suggested Folder / Code Organization

Use a clean structure for:

components/
components/leaderboard/
components/products/
components/dashboard/
components/bidding/
components/payments/

app/
app/dashboard/
app/product/[slug]/
app/categories/
app/admin/
app/api/

convex/
convex/schema.ts
convex/products.ts
convex/bids.ts
convex/payments.ts
convex/clicks.ts
convex/admin.ts

Keep functions relatively small and easy to understand.

---

# MVP Priority

Build in this order:

1. Project setup
2. Convex schema
3. Authentication
4. Public leaderboard
5. Product submission
6. Dashboard
7. Ranking system
8. Bid dialog
9. Stripe Checkout
10. Stripe webhook verification
11. Realtime rank changes
12. Click tracking
13. Product profile pages
14. Admin panel
15. Final UI polish

After each major feature, make sure the app runs correctly before moving to the next one.

Do not create placeholder implementations for core functionality.

The final result should be a working SaaS MVP where I can:

1. create an account
2. submit a SaaS
3. pay to activate the listing
4. see the SaaS on the leaderboard
5. increase its bid
6. outbid another SaaS
7. immediately see the ranking change
8. track clicks
9. manage listings through my dashboard

Start by analyzing these requirements, creating the Convex schema and application architecture, and then implement the application step by step. 
