// convex/heroes.ts
/** biome-ignore-all lint/suspicious/noExplicitAny: <> */

import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

function toDDMMYYYY(input?: string): string | undefined {
	if (!input) return undefined;
	const m = /^(\d{4})[-/](\d{2})[-/](\d{2})$/.exec(input);
	if (m) {
		const [, y, mm, dd] = m;
		return `${dd}-${mm}-${y}`;
	}
	const d = new Date(input);
	if (!Number.isNaN(d.getTime())) {
		const dd = String(d.getDate()).padStart(2, "0");
		const mm = String(d.getMonth() + 1).padStart(2, "0");
		const yy = d.getFullYear();
		return `${dd}-${mm}-${yy}`;
	}
	return input;
}

const s = (x: any): string | undefined =>
	typeof x === "string" && x.trim() ? x.trim() : undefined;

const arrS = (xs: any): string[] | undefined =>
	Array.isArray(xs) ? (xs.map(s).filter(Boolean) as string[]) : undefined;

const bd = (o: any): { date?: string; place?: string } | undefined => {
	const date = toDDMMYYYY(s(o?.date));
	const place = s(o?.place);
	return date || place
		? { ...(date ? { date } : {}), ...(place ? { place } : {}) }
		: undefined;
};

const recObj = (o: any): { basis: string; date?: string } | undefined => {
	const basis = s(o?.basis);
	const date = toDDMMYYYY(s(o?.date));
	return basis ? { basis, ...(date ? { date } : {}) } : undefined;
};

const slugify = (name: string) =>
	name
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "")
		.trim()
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");

const inferEra = (birthDate?: string) => {
	const year = birthDate ? Number(String(birthDate).slice(0, 4)) : NaN;
	if (!Number.isFinite(year)) return "Pergerakan Nasional";
	if (year < 1900) return "Perang Kolonial";
	if (year < 1942) return "Pergerakan Nasional";
	if (year < 1945) return "Pendudukan Jepang";
	if (year < 1966) return "Revolusi & Orde Lama";
	return "Sesudah 1966";
};

const buildSlides = (name: string, summary?: string, highlights?: string[]) => {
	const slides: { id: string; title: string; content: string }[] = [];
	if (summary?.trim()) {
		slides.push({
			id: "ringkasan",
			title: `Siapa ${name}?`,
			content: summary.trim(),
		});
	}
	(highlights ?? []).forEach((h, i) => {
		const hh = s(h);
		if (hh)
			slides.push({
				id: `hl-${i + 1}`,
				title: `Fakta ${i + 1}`,
				content: hh,
			});
	});
	if (slides.length === 0) {
		slides.push({
			id: "ringkasan",
			title: `Tentang ${name}`,
			content: `Profil singkat ${name}.`,
		});
	}
	return slides.slice(0, 6);
};

export const importFromJson = mutation({
	args: {
		json: v.string(),
		overwrite: v.optional(v.boolean()),
		portraitFallback: v.optional(v.string()),
	},
	handler: async (ctx, { json, overwrite, portraitFallback }) => {
		const arr = JSON.parse(json);
		if (!Array.isArray(arr)) throw new Error("JSON harus berupa array");

		let upserted = 0;
		for (const raw of arr) {
			const name: string = raw?.name ?? raw?.nama ?? "";
			if (!name) continue;

			const slug = slugify(name);
			const summary = s(raw?.biography?.summary);
			const highlights: string[] | undefined = arrS(raw?.biography?.highlights);
			const era = inferEra(s(raw?.birth?.date));
			const slides = buildSlides(name, summary, highlights);

			const recognition = recObj(raw?.recognition);
			const sources = recognition
				? [
						`${recognition.basis}${recognition.date ? ` (${recognition.date})` : ""}`,
					]
				: ["Sumber internal JSON"];

			const existing = await ctx.db
				.query("heroes")
				.withIndex("by_slug", (q) => q.eq("slug", slug))
				.first();

			const doc = {
				slug,
				name,
				era,
				summary: summary ?? name,
				slides,
				sources,
				portraitUrl: s(raw?.portraitUrl) ?? s(portraitFallback),
				titles: arrS(raw?.titles),
				birth: bd(raw?.birth),
				death: bd(raw?.death),
				education: arrS(raw?.education),
				legacy: arrS(raw?.legacy),
				recognition,
				raw,
			};

			if (existing) {
				if (overwrite) {
					await ctx.db.patch(existing._id, doc);
					upserted++;
				}
			} else {
				await ctx.db.insert("heroes", doc);
				upserted++;
			}
		}
		return { upserted };
	},
});

function norm(x: unknown): string {
	return (typeof x === "string" ? x : String(x ?? ""))
		.toLowerCase()
		.normalize("NFKD")
		.replace(/\p{Diacritic}/gu, "")
		.replace(/[^a-z0-9\s]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

export const list = query({
	args: {
		q: v.optional(v.string()),
		era: v.optional(v.string()),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const limit = Math.max(1, Math.min(200, args.limit ?? 60));

		const all = await ctx.db.query("heroes").collect();

		const q = norm(args.q ?? "");
		const tokens = q ? q.split(" ") : [];

		const filtered = all.filter((h: any) => {
			if (args.era && h.era !== args.era) return false;
			if (!tokens.length) return true;

			const combined = norm(
				[h.name, ...(Array.isArray(h?.raw?.aliases) ? h.raw.aliases : [])].join(
					" ",
				),
			);

			return tokens.every((t) => combined.includes(t));
		});

		filtered.sort((a: any, b: any) => {
			return String(a.name || "").localeCompare(String(b.name || ""), "id", {
				sensitivity: "base",
			});
		});

		return filtered.slice(0, limit).map((h: any) => ({
			_id: h._id,
			slug: h.slug,
			name: h.name,
			portraitUrl: h.portraitUrl ?? h.raw?.portraitUrl ?? null,
			era: h.era ?? null,
		}));
	},
});

export const getBySlug = query({
	args: { slug: v.string() },
	handler: async (ctx, { slug }) => {
		const hero = await ctx.db
			.query("heroes")
			.withIndex("by_slug", (q) => q.eq("slug", slug))
			.first();
		return hero ?? null;
	},
});
