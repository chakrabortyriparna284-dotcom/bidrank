import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Flame, Trophy, Zap, Shield, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-8 mx-auto max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/20 text-primary font-bold border border-primary/30">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
              BidRank
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="#leaderboard" className="hover:text-foreground transition-colors">
              Leaderboard
            </Link>
            <Link href="#how-it-works" className="hover:text-foreground transition-colors">
              How It Works
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/signin">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="bg-primary hover:bg-primary/90 font-semibold gap-1.5 shadow-lg shadow-primary/20">
                <Sparkles className="w-4 h-4" /> List Your SaaS
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24 border-b border-border/40">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(34,197,94,0.15),rgba(255,255,255,0))]" />
          <div className="container px-4 sm:px-8 mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 border border-primary/20 text-primary mb-6">
              <Flame className="w-3.5 h-3.5" /> Pay your way to the top
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-tight sm:leading-none">
              The SaaS Leaderboard Where Founders Compete for Attention
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-normal">
              Bid higher, rank higher, get discovered. Pay only the difference to outbid competitors in real time.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-base font-semibold px-8 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20">
                  List Your SaaS <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="#leaderboard" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base">
                  View Leaderboard
                </Button>
              </Link>
            </div>

            {/* Live Stats Preview */}
            <div className="mt-16 grid grid-cols-3 gap-4 max-w-2xl mx-auto p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur">
              <div className="p-3">
                <div className="text-2xl sm:text-3xl font-bold text-primary font-mono">$0</div>
                <div className="text-xs text-muted-foreground uppercase font-medium mt-1">Total Bids Placed</div>
              </div>
              <div className="p-3 border-x border-border/60">
                <div className="text-2xl sm:text-3xl font-bold text-foreground font-mono">0</div>
                <div className="text-xs text-muted-foreground uppercase font-medium mt-1">Listed Products</div>
              </div>
              <div className="p-3">
                <div className="text-2xl sm:text-3xl font-bold text-foreground font-mono">0</div>
                <div className="text-xs text-muted-foreground uppercase font-medium mt-1">Founder Clicks</div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-16 container px-4 sm:px-8 mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">How BidRank Works</h2>
            <p className="text-muted-foreground text-sm mt-2">Transparent, competitive, real time promotion for SaaS founders</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-border/60 bg-card/40 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-semibold text-lg">List Your Product</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Submit your SaaS details and place an initial bid of at least $10 to claim a spot on the board.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border/60 bg-card/40 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-semibold text-lg">Pay the Difference</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To move past rank #2 or take the #1 throne, pay only the difference between your current bid and your new bid.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border/60 bg-card/40 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-semibold text-lg">Realtime Visibility</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Rankings update instantly across all active visitors via Convex subscriptions as soon as payment settles.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 text-center text-sm text-muted-foreground bg-card/20">
        <div className="container px-4 mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 BidRank. Pay to rank SaaS directory.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
