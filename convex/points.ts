// convex/points.ts

import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { query } from "./_generated/server";

function todayID(): string {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const id = new Date(utc + 7 * 3600 * 1000);
  return id.toISOString().slice(0, 10);
}

export const getSummary = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { total: 0, dailyRemaining: 5 };

    const pts = await ctx.db
      .query("quizPoints")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    const total = pts?.points ?? 0;

    const day = todayID();
    const daily = await ctx.db
      .query("quizDaily")
      .withIndex("by_user_day", (q) => q.eq("userId", userId).eq("day", day))
      .first();

    const scored = daily?.scoredCount ?? 0;
    const dailyRemaining = Math.max(0, 5 - scored);
    return { total, dailyRemaining };
  },
});

export const getAwards = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const all = await ctx.db
      .query("quizAwards")
      .withIndex("by_user_time", (q) => q.eq("userId", userId))
      .collect();

    const recent = all.sort((a, b) => b.createdAt - a.createdAt).slice(0, Math.max(1, Math.min(limit ?? 20, 100)));

    const bySlug = new Map<string, string>();
    for (const a of recent) {
      if (!bySlug.has(a.slug)) {
        const h = await ctx.db
          .query("heroes")
          .withIndex("by_slug", (q) => q.eq("slug", a.slug))
          .first();
        bySlug.set(a.slug, h?.name ?? a.slug);
      }
    }

    return recent.map((r) => ({
      slug: r.slug,
      heroName: bySlug.get(r.slug) ?? r.slug,
      points: r.points,
      practice: r.practice,
      breakdown: r.breakdown ?? {},
      createdAt: r.createdAt,
    }));
  },
});
