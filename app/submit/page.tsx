"use client";

import { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuthModal } from "@/components/auth/auth-modal";
import {
  Trophy,
  Sparkles,
  Upload,
  Link as LinkIcon,
  Globe,
  Twitter,
  Video,
  Flame,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const CATEGORIES = [
  "AI",
  "Developer Tools",
  "Productivity",
  "Marketing",
  "Sales",
  "Design",
  "Finance",
  "Analytics",
  "Consumer",
  "Other",
];

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export default function SubmitPage() {
  const router = useRouter();
  const user = useQuery(api.users.currentUser);
  const leaderboard = useQuery(api.products.getLeaderboard, { timeframe: "all" });

  const createProduct = useMutation(api.products.createProduct);
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signIn" | "signUp">("signIn");

  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [founderName, setFounderName] = useState(user?.name || "");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [logoMode, setLogoMode] = useState<"url" | "upload">("upload");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [initialBid, setInitialBid] = useState<number>(25);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ productId: string; slug: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentSlug = useMemo(() => slugify(name), [name]);

  // Calculate estimated rank
  const estimatedRank = useMemo(() => {
    if (!leaderboard) return 1;
    const sorted = [...leaderboard].sort((a, b) => b.currentBid - a.currentBid);
    const index = sorted.findIndex((p) => initialBid > p.currentBid);
    if (index === -1) {
      return sorted.length + 1;
    }
    return index + 1;
  }, [leaderboard, initialBid]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (initialBid < 10) {
      setError("Initial bid must be at least $10");
      return;
    }

    setSubmitting(true);

    try {
      let logoStorageId = undefined;

      // Handle logo upload if user selected file
      if (logoMode === "upload" && logoFile) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": logoFile.type },
          body: logoFile,
        });
        const { storageId } = await result.json();
        logoStorageId = storageId;
      }

      const res = await createProduct({
        name,
        tagline,
        description,
        category,
        websiteUrl,
        founderName: founderName || user.name || "Founder",
        initialBid: Number(initialBid),
        logoUrl: logoMode === "url" && logoUrl ? logoUrl : undefined,
        logoStorageId,
        twitterUrl: twitterUrl || undefined,
        demoUrl: demoUrl || undefined,
      });

      setSuccessResult(res);
    } catch (err: any) {
      setError(err?.message || "Failed to submit product. Please check your inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  if (user === undefined) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="h-8 w-48 bg-zinc-900 animate-pulse rounded-md mx-auto mb-4" />
        <div className="h-4 w-64 bg-zinc-900 animate-pulse rounded-md mx-auto" />
      </div>
    );
  }

  if (successResult) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <Card className="bg-zinc-900 border-emerald-500/40 shadow-2xl shadow-emerald-500/10">
          <CardHeader className="text-center pb-2">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 mx-auto flex items-center justify-center text-emerald-400 mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-bold text-zinc-100">
              SaaS Submitted Successfully
            </CardTitle>
            <CardDescription className="text-zinc-400 text-sm mt-1">
              Your listing for <span className="text-zinc-200 font-semibold">{name}</span> has been
              created in <Badge variant="secondary" className="bg-zinc-800 text-amber-400 border border-amber-400/30">awaiting payment</Badge> status.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">Target Starting Bid</span>
                <span className="font-bold text-emerald-400 text-lg">${initialBid}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">Estimated Initial Rank</span>
                <span className="font-bold text-zinc-200">#{estimatedRank}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">Public Slug</span>
                <span className="text-zinc-300 font-mono text-xs">/product/{successResult.slug}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold py-6 text-base shadow-lg shadow-emerald-500/20"
                onClick={() => {
                  alert(`In production, this initiates Stripe checkout for $${initialBid}.`);
                }}
              >
                Pay ${initialBid} and Activate Listing
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                className="w-full border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900"
                onClick={() => router.push("/")}
              >
                Back to Leaderboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 mb-3 px-3 py-1 font-medium"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" />
          SaaS Submission Arena
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-100">
          List your SaaS on BidRank
        </h1>
        <p className="text-zinc-400 mt-2 text-base">
          Submit your product, choose your initial bid, and climb to the top of the leaderboard.
        </p>
      </div>

      {!user && (
        <Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur-md mb-8">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-200">Sign in required to submit</h3>
                <p className="text-xs text-zinc-400">
                  Create an account or log in to list and manage your products.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAuthMode("signIn");
                  setAuthModalOpen(true);
                }}
                className="border-zinc-800 bg-zinc-950 text-zinc-200 hover:bg-zinc-900"
              >
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setAuthMode("signUp");
                  setAuthModalOpen(true);
                }}
                className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-semibold"
              >
                Create Account
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Product Overview */}
        <Card className="bg-zinc-900/40 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <span className="flex h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs items-center justify-center font-bold">
                1
              </span>
              Product Overview
            </CardTitle>
            <CardDescription className="text-zinc-400 text-xs">
              Tell the community about what you built.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-zinc-300">
                  SaaS Name <span className="text-emerald-400">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. TaskPulse AI"
                  className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-500"
                  required
                />
                {currentSlug && (
                  <p className="text-[11px] text-zinc-500 font-mono">
                    URL preview: /product/{currentSlug}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-zinc-300">
                  Category <span className="text-emerald-400">*</span>
                </Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tagline" className="text-zinc-300">
                Tagline <span className="text-emerald-400">*</span>
              </Label>
              <Input
                id="tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="One punchy sentence that hooks visitors (max 100 characters)"
                maxLength={100}
                className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-zinc-300">
                Full Description <span className="text-emerald-400">*</span>
              </Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Explain what problem your product solves, key features, and why founders love it..."
                className="w-full p-3 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="founderName" className="text-zinc-300">
                Founder / Maker Name <span className="text-emerald-400">*</span>
              </Label>
              <Input
                id="founderName"
                value={founderName}
                onChange={(e) => setFounderName(e.target.value)}
                placeholder="Your name or handle"
                className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-500"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Media and Links */}
        <Card className="bg-zinc-900/40 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <span className="flex h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs items-center justify-center font-bold">
                2
              </span>
              Links & Media
            </CardTitle>
            <CardDescription className="text-zinc-400 text-xs">
              Add your website link, brand logo, and social handles.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="websiteUrl" className="text-zinc-300">
                Website URL <span className="text-emerald-400">*</span>
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <Input
                  id="websiteUrl"
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourproduct.com"
                  className="pl-9 bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Product Logo</Label>
              <div className="flex gap-2 mb-2">
                <Button
                  type="button"
                  variant={logoMode === "upload" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLogoMode("upload")}
                  className={
                    logoMode === "upload"
                      ? "bg-zinc-800 text-zinc-100"
                      : "border-zinc-800 bg-zinc-950 text-zinc-400"
                  }
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  Upload Image
                </Button>
                <Button
                  type="button"
                  variant={logoMode === "url" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLogoMode("url")}
                  className={
                    logoMode === "url"
                      ? "bg-zinc-800 text-zinc-100"
                      : "border-zinc-800 bg-zinc-950 text-zinc-400"
                  }
                >
                  <LinkIcon className="w-3.5 h-3.5 mr-1.5" />
                  Direct Image URL
                </Button>
              </div>

              {logoMode === "upload" ? (
                <div className="flex items-center gap-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="h-20 w-20 rounded-xl border border-dashed border-zinc-700 bg-zinc-950 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 transition-colors overflow-hidden"
                  >
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-zinc-500 mb-1" />
                        <span className="text-[10px] text-zinc-500">Upload</span>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="text-xs text-zinc-400">
                    <p className="font-medium text-zinc-300">Square PNG, JPG, or SVG</p>
                    <p className="text-zinc-500">Max size 2MB. Recommended 256x256.</p>
                  </div>
                </div>
              ) : (
                <Input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://yourproduct.com/logo.png"
                  className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-500"
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="twitterUrl" className="text-zinc-300">
                  X / Twitter Profile
                </Label>
                <div className="relative">
                  <Twitter className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <Input
                    id="twitterUrl"
                    type="url"
                    value={twitterUrl}
                    onChange={(e) => setTwitterUrl(e.target.value)}
                    placeholder="https://x.com/yourhandle"
                    className="pl-9 bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="demoUrl" className="text-zinc-300">
                  Demo / YouTube Video URL
                </Label>
                <div className="relative">
                  <Video className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <Input
                    id="demoUrl"
                    type="url"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="pl-9 bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Initial Bid Placement */}
        <Card className="bg-zinc-900/40 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <span className="flex h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs items-center justify-center font-bold">
                3
              </span>
              Initial Bid Placement
            </CardTitle>
            <CardDescription className="text-zinc-400 text-xs">
              Every position on BidRank is earned by bidding. Minimum initial bid is $10.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
                    Estimated Starting Rank
                  </span>
                </div>
                <div className="text-2xl font-black text-zinc-100">
                  Position <span className="text-emerald-400">#{estimatedRank}</span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Based on current leaderboard positions.
                </p>
              </div>

              <div className="w-full sm:w-48 space-y-1.5">
                <Label htmlFor="initialBid" className="text-zinc-300 text-xs">
                  Your Initial Bid ($USD)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-400 font-bold">$</span>
                  <Input
                    id="initialBid"
                    type="number"
                    min={10}
                    step={1}
                    value={initialBid}
                    onChange={(e) => setInitialBid(Math.max(10, Number(e.target.value)))}
                    className="pl-8 bg-zinc-900 border-zinc-700 text-zinc-100 font-bold text-lg focus-visible:ring-emerald-500"
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="p-4 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold py-6 text-base shadow-xl shadow-emerald-500/20"
        >
          {submitting ? (
            "Creating SaaS Listing..."
          ) : (
            <>
              <ShieldCheck className="w-5 h-5 mr-2" />
              Submit and Proceed to Checkout (${initialBid})
            </>
          )}
        </Button>
      </form>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </div>
  );
}
