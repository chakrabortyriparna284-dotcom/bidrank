"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/auth-modal";
import { UserButton } from "@/components/auth/user-button";
import { Trophy, Plus, Sparkles } from "lucide-react";

export function Navbar() {
  const user = useQuery(api.users.currentUser);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signIn" | "signUp">("signIn");

  const openAuth = (mode: "signIn" | "signUp") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-[1px] shadow-lg shadow-emerald-500/10">
              <div className="h-full w-full bg-zinc-950 rounded-[11px] flex items-center justify-center">
                <Trophy className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-zinc-100 flex items-center gap-1">
                BidRank
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <Link
              href="/"
              className="hover:text-zinc-100 transition-colors"
            >
              Leaderboard
            </Link>
            <Link
              href="/#categories"
              className="hover:text-zinc-100 transition-colors"
            >
              Categories
            </Link>
            <Link
              href="/#how-it-works"
              className="hover:text-zinc-100 transition-colors"
            >
              How it Works
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user === undefined ? (
            <div className="h-8 w-20 bg-zinc-900 animate-pulse rounded-md" />
          ) : user ? (
            <>
              <Button
                asChild
                className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-semibold shadow-lg shadow-emerald-500/20"
                size="sm"
              >
                <Link href="/submit">
                  <Plus className="w-4 h-4 mr-1.5" />
                  List your SaaS
                </Link>
              </Button>
              <UserButton />
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openAuth("signIn")}
                className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900"
              >
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={() => openAuth("signUp")}
                className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-semibold shadow-lg shadow-emerald-500/20"
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                List your SaaS
              </Button>
            </>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </header>
  );
}
