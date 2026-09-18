import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "reset-daily-bids",
  { hourUTC: 0, minuteUTC: 0 },
  internal.maintenance.resetDailyBids
);

crons.weekly(
  "reset-weekly-bids",
  { dayOfWeek: "monday", hourUTC: 0, minuteUTC: 0 },
  internal.maintenance.resetWeeklyBids
);

export default crons;
