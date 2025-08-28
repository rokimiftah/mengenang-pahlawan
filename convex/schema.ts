// convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
	...authTables,

	users: defineTable({
		name: v.optional(v.string()),
		image: v.optional(v.string()),
		email: v.optional(v.string()),
		emailVerificationTime: v.optional(v.number()),
		linkedProviders: v.optional(v.array(v.string())),
		storageId: v.optional(v.string()),
	}).index("email", ["email"]),

	heroes: defineTable({
		slug: v.string(),
		name: v.string(),
		portraitUrl: v.optional(v.string()),
		era: v.string(),
		summary: v.string(),
		slides: v.array(
			v.object({
				id: v.string(),
				title: v.string(),
				content: v.string(),
			}),
		),
		sources: v.array(v.string()),
		titles: v.optional(v.array(v.string())),
		birth: v.optional(
			v.object({
				date: v.optional(v.string()),
				place: v.optional(v.string()),
			}),
		),
		death: v.optional(
			v.object({
				date: v.optional(v.string()),
				place: v.optional(v.string()),
			}),
		),
		education: v.optional(v.array(v.string())),
		legacy: v.optional(v.array(v.string())),
		recognition: v.optional(
			v.object({
				basis: v.string(),
				date: v.optional(v.string()),
			}),
		),
		raw: v.optional(v.any()),
	}).index("by_slug", ["slug"]),

	quizAttempts: defineTable({
		userId: v.id("users"),
		slug: v.string(),
		total: v.number(),
		correct: v.number(),
		createdAt: v.number(),
	}).index("by_user_slug_time", ["userId", "slug", "createdAt"]),

	quizPoints: defineTable({
		userId: v.id("users"),
		points: v.number(),
		updatedAt: v.number(),
	}).index("by_user", ["userId"]),

	quizDaily: defineTable({
		userId: v.id("users"),
		day: v.string(),
		scoredCount: v.number(),
		heroSlugs: v.array(v.string()),
		perfectToday: v.boolean(),
	}).index("by_user_day", ["userId", "day"]),

	quizAwards: defineTable({
		userId: v.id("users"),
		slug: v.string(),
		points: v.number(),
		breakdown: v.optional(v.any()),
		practice: v.boolean(),
		createdAt: v.number(),
	}).index("by_user_time", ["userId", "createdAt"]),
});
