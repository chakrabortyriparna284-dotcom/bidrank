"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github, Mail, Sparkles } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "signIn" | "signUp";
}

export function AuthModal({ isOpen, onClose, defaultMode = "signIn" }: AuthModalProps) {
  const { signIn } = useAuthActions();
  const [mode, setMode] = useState<"signIn" | "signUp">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("email", email);
      formData.set("password", password);
      formData.set("flow", mode);
      if (mode === "signUp" && name) {
        formData.set("name", name);
      }

      await signIn("password", formData);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to authenticate. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "github" | "google") => {
    setError(null);
    try {
      await signIn(provider);
    } catch (err: any) {
      setError(err?.message || `Failed to sign in with ${provider}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              B
            </div>
            <DialogTitle className="text-xl font-bold">
              {mode === "signIn" ? "Welcome back to BidRank" : "Create your BidRank account"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-zinc-400">
            {mode === "signIn"
              ? "Sign in to manage your SaaS listings, outbid competitors, and track performance."
              : "Join the SaaS ranking arena. List your product and compete for top spotlight."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuthSignIn("github")}
            className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-200"
          >
            <Github className="w-4 h-4 mr-2" />
            GitHub
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuthSignIn("google")}
            className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-200"
          >
            <Mail className="w-4 h-4 mr-2" />
            Google
          </Button>
        </div>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zinc-950 px-2 text-zinc-500">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signUp" && (
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-zinc-300">
                Full Name or Founder Handle
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Developer"
                className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-500"
                required
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-zinc-300">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="founder@example.com"
              className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-zinc-300">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-500"
              required
            />
          </div>

          {error && (
            <div className="p-3 text-xs bg-red-950/40 border border-red-800/60 rounded-md text-red-300">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-semibold"
          >
            {loading ? "Authenticating..." : mode === "signIn" ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <div className="text-center text-xs text-zinc-400 pt-2 border-t border-zinc-900">
          {mode === "signIn" ? (
            <span>
              Don't have an account yet?{" "}
              <button
                type="button"
                onClick={() => setMode("signUp")}
                className="text-emerald-400 hover:underline font-medium"
              >
                Sign up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("signIn")}
                className="text-emerald-400 hover:underline font-medium"
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
