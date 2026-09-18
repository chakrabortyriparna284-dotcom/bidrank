import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { slugify } from "./products";

export interface SeedProductDef {
  name: string;
  category: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  currentBid: number;
  dailyBid: number;
  weeklyBid: number;
  totalClicks: number;
  founderName?: string;
  twitterUrl?: string;
  demoUrl?: string;
  logoUrl?: string;
}

export const SEED_PRODUCTS: SeedProductDef[] = [
  {
    name: "OmniFlow AI",
    category: "AI",
    tagline: "Autonomous multi-agent orchestration for enterprise workflows",
    description: "OmniFlow coordinates specialized AI agents that execute complex business processes, code generation, and research workflows with zero human intervention.",
    websiteUrl: "https://omniflow.ai",
    currentBid: 12500,
    dailyBid: 1500,
    weeklyBid: 4200,
    totalClicks: 2840,
    twitterUrl: "https://twitter.com/omniflow_ai",
    demoUrl: "https://demo.omniflow.ai",
  },
  {
    name: "VaporCode",
    category: "Developer Tools",
    tagline: "Instant cloud development environments with sub-second boot times",
    description: "Zero latency web based IDE environments with pre-configured dev containers, automated dependency provisioning, and collaborative terminal sessions.",
    websiteUrl: "https://vaporcode.dev",
    currentBid: 9200,
    dailyBid: 850,
    weeklyBid: 3100,
    totalClicks: 2180,
    twitterUrl: "https://twitter.com/vaporcode_dev",
  },
  {
    name: "DataPulse",
    category: "Analytics",
    tagline: "Real time event streaming analytics and automated cohort insights",
    description: "Modern product analytics engine delivering sub-second queries on billions of events without complex SQL modeling or data warehousing overhead.",
    websiteUrl: "https://datapulse.io",
    currentBid: 7800,
    dailyBid: 600,
    weeklyBid: 2400,
    totalClicks: 1750,
    demoUrl: "https://app.datapulse.io/demo",
  },
  {
    name: "TypeLoom",
    category: "Productivity",
    tagline: "AI collaborative workspace transforming messy thoughts into documents",
    description: "Write, structure, and format executive briefs, specs, and knowledge bases effortlessly with predictive text structuring and markdown export.",
    websiteUrl: "https://typeloom.app",
    currentBid: 6400,
    dailyBid: 450,
    weeklyBid: 1900,
    totalClicks: 1520,
    twitterUrl: "https://twitter.com/typeloom",
  },
  {
    name: "HyperQueue",
    category: "Developer Tools",
    tagline: "Distributed background job processing built for serverless runtimes",
    description: "Fault tolerant task queues with built in cron scheduling, automatic retries, concurrency limits, and webhook fanout for Next.js and serverless stacks.",
    websiteUrl: "https://hyperqueue.dev",
    currentBid: 5100,
    dailyBid: 400,
    weeklyBid: 1600,
    totalClicks: 1290,
  },
  {
    name: "PromptMatrix",
    category: "AI",
    tagline: "Automated prompt evaluation, regression testing, and cost optimization",
    description: "Benchmark your system prompts across GPT-4o, Claude 3.5, and Gemini with automated regression scoring, latency metrics, and token cost tracking.",
    websiteUrl: "https://promptmatrix.ai",
    currentBid: 4250,
    dailyBid: 320,
    weeklyBid: 1250,
    totalClicks: 1140,
    twitterUrl: "https://twitter.com/promptmatrix",
  },
  {
    name: "VectorCraft",
    category: "AI",
    tagline: "Managed vector search and hybrid indexing for production RAG",
    description: "Ultra fast embedding indexer supporting hybrid BM25 and vector queries, metadata filtering, and automatic semantic document chunking.",
    websiteUrl: "https://vectorcraft.io",
    currentBid: 3600,
    dailyBid: 250,
    weeklyBid: 950,
    totalClicks: 980,
  },
  {
    name: "CloudGuard",
    category: "Developer Tools",
    tagline: "Continuous cloud posture security and automated compliance monitoring",
    description: "Scan AWS, GCP, and Azure workloads against SOC2 and ISO27001 standards with auto remediation pull requests and real time drift detection.",
    websiteUrl: "https://cloudguard.security",
    currentBid: 2950,
    dailyBid: 200,
    weeklyBid: 800,
    totalClicks: 840,
  },
  {
    name: "KubePilot",
    category: "Developer Tools",
    tagline: "Autonomous Kubernetes optimization and cluster cost reduction",
    description: "Automatically right-size pod memory and CPU limits, spot instance scheduling, and storage allocations to cut cluster bills by over 40 percent.",
    websiteUrl: "https://kubepilot.io",
    currentBid: 2400,
    dailyBid: 180,
    weeklyBid: 650,
    totalClicks: 710,
    demoUrl: "https://kubepilot.io/live-preview",
  },
  {
    name: "EchoMetric",
    category: "Analytics",
    tagline: "Lightweight, privacy first web analytics without cookies or tracking",
    description: "GDPR compliant website metrics tracking pageviews, referral sources, and conversion funnels with a tiny 1KB script and zero cookies.",
    websiteUrl: "https://echometric.co",
    currentBid: 1900,
    dailyBid: 150,
    weeklyBid: 520,
    totalClicks: 620,
    twitterUrl: "https://twitter.com/echometric",
  },
  {
    name: "SyncBase",
    category: "Developer Tools",
    tagline: "Local first sync engine for reactive offline capable applications",
    description: "Seamless synchronization between SQLite on the client and Postgres in the cloud with automatic conflict resolution and end to end encryption.",
    websiteUrl: "https://syncbase.tech",
    currentBid: 1450,
    dailyBid: 100,
    weeklyBid: 410,
    totalClicks: 510,
  },
  {
    name: "ApexForm",
    category: "Productivity",
    tagline: "Conversational forms and surveys that boost completion rates by 3x",
    description: "Build beautiful interactive multi step forms with conditional logic, payment collection, and direct CRM sync in minutes.",
    websiteUrl: "https://apexform.app",
    currentBid: 1100,
    dailyBid: 80,
    weeklyBid: 300,
    totalClicks: 430,
    demoUrl: "https://apexform.app/sample",
  },
  {
    name: "PixelSprint",
    category: "Design",
    tagline: "Vector asset generation and design system automation for engineering teams",
    description: "Generate production ready SVG icons, responsive illustrations, and color tokens directly integrated into your React component libraries.",
    websiteUrl: "https://pixelsprint.design",
    currentBid: 850,
    dailyBid: 50,
    weeklyBid: 220,
    totalClicks: 320,
  },
  {
    name: "QueryCraft",
    category: "Developer Tools",
    tagline: "Natural language to high performance SQL translator and schema visualizer",
    description: "Ask questions in plain English and receive optimized SQL queries tailored to your schema with explain plan analysis and safety checks.",
    websiteUrl: "https://querycraft.dev",
    currentBid: 500,
    dailyBid: 30,
    weeklyBid: 140,
    totalClicks: 260,
    twitterUrl: "https://twitter.com/querycraft",
  },
  {
    name: "LogStream",
    category: "Developer Tools",
    tagline: "Zero friction edge logging and instant live tailing for serverless apps",
    description: "Capture, search, and live tail serverless function logs with zero configuration, instant structured parsing, and alerting webhooks.",
    websiteUrl: "https://logstream.sh",
    currentBid: 250,
    dailyBid: 15,
    weeklyBid: 80,
    totalClicks: 180,
  },
];

export const seedProducts = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if products already exist
    const existingProducts = await ctx.db.query("products").collect();
    if (existingProducts.length > 0) {
      return {
        seededCount: 0,
        message: `Database already contains ${existingProducts.length} listings. Skipping seed to prevent duplicate bids.`,
      };
    }

    // Find or create a default system/demo user
    let user = await ctx.db.query("users").first();
    if (!user) {
      const userId = await ctx.db.insert("users", {
        name: "BidRank Founder Network",
        email: "demo@bidrank.lol",
      });
      user = await ctx.db.get(userId);
    }

    const now = Date.now();
    let seededCount = 0;

    for (let i = 0; i < SEED_PRODUCTS.length; i++) {
      const item = SEED_PRODUCTS[i];
      const slug = slugify(item.name);
      const createdAt = now - (SEED_PRODUCTS.length - i) * 86400000; // staggered over past 15 days

      const productId = await ctx.db.insert("products", {
        userId: user!._id,
        name: item.name,
        slug,
        founderName: item.founderName || "Verified Founder",
        tagline: item.tagline,
        description: item.description,
        category: item.category,
        websiteUrl: item.websiteUrl,
        twitterUrl: item.twitterUrl,
        demoUrl: item.demoUrl,
        currentBid: item.currentBid,
        dailyBid: item.dailyBid,
        weeklyBid: item.weeklyBid,
        lifetimeAmountPaid: item.currentBid,
        totalClicks: item.totalClicks,
        lastBidAt: createdAt + 3600000,
        status: "active",
        createdAt,
        updatedAt: now,
      });

      // Insert initial bid event history so public timeline has rich data
      const initialBid = Math.max(50, Math.round(item.currentBid * 0.6));
      await ctx.db.insert("bidEvents", {
        productId,
        previousRank: undefined,
        newRank: i + 3,
        previousBid: 0,
        newBid: initialBid,
        createdAt: createdAt,
      });

      // Insert second bid event showing climb to current rank
      await ctx.db.insert("bidEvents", {
        productId,
        previousRank: i + 3,
        newRank: i + 1,
        previousBid: initialBid,
        newBid: item.currentBid,
        createdAt: createdAt + 3600000,
      });

      seededCount++;
    }

    return {
      seededCount,
      message: `Successfully seeded ${seededCount} realistic SaaS listings with unique bids and historical timelines.`,
    };
  },
});
