// convex/auth.ts
/** biome-ignore-all lint/suspicious/noExplicitAny: <> */

import type { MutationCtx } from "./_generated/server";

import { ConvexError } from "convex/values";
import { z } from "zod";

import GitHub from "@auth/core/providers/github";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

import { OTP } from "./mailry/OTP";
import { OTPPasswordReset } from "./mailry/OTPPasswordReset";

const PasswordSchema = z
	.string()
	.min(6, "Password must be at least 6 characters long")
	.regex(/[0-9]/, "Password must include a number")
	.regex(/[a-z]/, "Password must include a lowercase letter")
	.regex(/[A-Z]/, "Password must include an uppercase letter")
	.regex(/[$&+,:;=?@#|'<>.^*()%!-]/, "Password must include a special symbol");

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
	providers: [
		GitHub({
			allowDangerousEmailAccountLinking: true,
			profile: (params) => {
				if (typeof params.email !== "string") {
					throw new ConvexError("Email is required");
				}
				if (typeof params.id !== "string" && typeof params.id !== "number") {
					throw new ConvexError("GitHub user ID is required");
				}
				const normalizedEmail = params.email.toLowerCase().trim();
				const { error, data } = z
					.object({
						email: z.string().email("Invalid email address"),
					})
					.safeParse({ email: normalizedEmail });
				if (error) throw new ConvexError(error.issues[0].message);

				const raw: any = params;
				const image: string | undefined =
					typeof raw.avatar_url === "string"
						? raw.avatar_url
						: typeof raw.picture === "string"
							? raw.picture
							: undefined;

				const name: string | undefined =
					typeof raw.name === "string" && raw.name.trim()
						? raw.name
						: typeof raw.login === "string"
							? raw.login
							: undefined;

				return {
					id: String(params.id),
					email: data.email,
					...(image ? { image } : {}),
					...(name ? { name } : {}),
				};
			},
		}),
		Password({
			id: "password",
			verify: OTP,
			reset: OTPPasswordReset,
			profile: (params) => {
				if (typeof params.email !== "string") {
					throw new ConvexError("Email is required");
				}
				const normalizedEmail = params.email.toLowerCase().trim();
				const { error, data } = z
					.object({
						email: z.string().email("Invalid email address"),
					})
					.safeParse({ email: normalizedEmail });
				if (error) {
					throw new ConvexError(error.issues[0].message);
				}
				return { id: data.email, email: data.email };
			},
			validatePasswordRequirements: (password: string) => {
				const result = PasswordSchema.safeParse(password);
				if (!result.success) {
					throw new ConvexError(result.error.issues[0].message);
				}
			},
		}),
	],
	callbacks: {
		async createOrUpdateUser(ctx: MutationCtx, args: any) {
			const normalizedEmail = args.profile.email.toLowerCase().trim();
			const provider = args.type === "oauth" ? "github" : "password";

			const existingUser = await ctx.db
				.query("users")
				.withIndex("email", (q) => q.eq("email", normalizedEmail))
				.first();

			const image: string | undefined =
				typeof args.profile.image === "string" ? args.profile.image : undefined;
			const name: string | undefined =
				typeof args.profile.name === "string" && args.profile.name.trim()
					? args.profile.name.trim()
					: undefined;

			if (existingUser) {
				const currentProviders = existingUser.linkedProviders || [];
				const updates: any = {};

				if (!currentProviders.includes(provider)) {
					updates.linkedProviders = [...currentProviders, provider];
				}
				if (args.type === "oauth" && !existingUser.emailVerificationTime) {
					updates.emailVerificationTime = Date.now();
				}
				if (image && image !== existingUser.image) updates.image = image;
				if (name && name !== existingUser.name) updates.name = name;

				if (Object.keys(updates).length > 0) {
					await ctx.db.patch(existingUser._id, updates);
				}
				return existingUser._id;
			}

			const userId = await ctx.db.insert("users", {
				email: normalizedEmail,
				emailVerificationTime: args.type === "oauth" ? Date.now() : undefined,
				linkedProviders: [provider],
				...(image ? { image } : {}),
				...(name ? { name } : {}),
			});

			return userId;
		},
	},
});
