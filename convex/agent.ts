// convex/agent.ts
/** biome-ignore-all lint/suspicious/noExplicitAny: <> */

import { v } from "convex/values";

import { api } from "./_generated/api";
import { action } from "./_generated/server";
import { generateTextUnli } from "./lib/unli";

type HeroLite = {
	slug: string;
	name: string;
	portraitUrl?: string | null;
	era?: string | null;
	titles?: string[] | null;
};

type ChatMsg = { role: "user" | "assistant"; content: string };

function safeJson<T>(s: string, fallback: T): T {
	try {
		const m = s.match(/\{[\s\S]*\}/);
		return JSON.parse(m ? m[0] : s);
	} catch {
		return fallback;
	}
}

export const recommendHeroes = action({
	args: {
		currentSlug: v.string(),
		recentSlugs: v.optional(v.array(v.string())),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, { currentSlug, recentSlugs = [], limit = 3 }) => {
		const all = (await ctx.runQuery(api.heroes.list as any, {
			limit: 200,
		})) as any[];
		const candidates: HeroLite[] = (all ?? [])
			.filter((h) => h?.slug && h.slug !== currentSlug)
			.map((h) => ({
				slug: String(h.slug),
				name: String(h.name),
				portraitUrl: h.portraitUrl ?? null,
				era: h.era ?? null,
				titles: Array.isArray(h.titles) ? h.titles : [],
			}));

		if (!candidates.length) return { recs: [] as HeroLite[] };

		const lines = candidates
			.map(
				(h) =>
					`${h.slug} | ${h.name} | ${h.era ?? ""} | ${(h.titles ?? []).slice(0, 2).join(", ")}`,
			)
			.join("\n");

		const prompt = `
            Kamu adalah kurator sejarah. Pilih ${limit} rekomendasi pahlawan
            untuk user yang sedang melihat "${currentSlug}".
            Pertimbangkan kemiripan era/tema/relasi, dan variasi yang menarik.
            Riwayat user (terbaru duluan): ${recentSlugs.join(", ") || "(kosong)"}.

            Daftar kandidat:
            ${lines}

            Kembalikan JSON ketat:
            {"slugs":["slug1","slug2","slug3"]}
                `.trim();

		const out = await generateTextUnli(prompt, 0.2);

		let picks: string[] = [];
		try {
			const j = JSON.parse(out);
			if (Array.isArray(j?.slugs))
				picks = j.slugs.map((s: any) => String(s));
		} catch {
			const m = out.match(/\{[\s\S]*\}/);
			if (m) {
				try {
					const j = JSON.parse(m[0]);
					if (Array.isArray(j?.slugs))
						picks = j.slugs.map((s: any) => String(s));
				} catch {
					// ignore
				}
			}
		}

		if (!picks.length) {
			picks = candidates.slice(0, limit).map((h) => h.slug);
		}

		const pickSet = new Set(picks);
		const recs = candidates
			.filter((h) => pickSet.has(h.slug))
			.slice(0, limit);

		return { recs };
	},
});

export const chatAsHero = action({
	args: {
		slug: v.string(),
		message: v.string(),
		history: v.optional(
			v.array(v.object({ role: v.string(), content: v.string() })),
		),
	},
	handler: async (
		ctx,
		{ slug, message, history = [] },
	): Promise<{ reply: string }> => {
		const hero = (await ctx.runQuery(api.heroes.getBySlug, {
			slug,
		})) as any;
		if (!hero) throw new Error("Hero not found");

		const summary = hero?.biography?.summary ?? hero?.summary ?? "";
		const highlights = (hero?.biography?.highlights ?? []).join("; ");

		const q = (message ?? "").trim();
		if (!q) {
			return {
				reply: "Ini simulasi edukatif berdasarkan sumber yang ada.\n[Fakta] — Pertanyaan kosong.\n[Interpretasi] — Silakan ajukan pertanyaan terkait pahlawan ini.",
			};
		}

		const judgePrompt = `
            Tentukan apakah pertanyaan pengguna RELEVAN dengan pahlawan berikut.
            Balas JSON ketat:
            {"relevant": true|false, "reason": "singkat"}

            [PAHLAWAN]
            Nama: ${hero.name}
            Ringkasan: ${summary}
            Sorotan: ${highlights}

            [PERTANYAAN]
            ${q}

            Kriteria relevan:
            - tentang kehidupan, perjuangan, era, karya, pengaruh, atau fakta terkait ${hero.name}.
            - banding/relasi dengan tokoh/sejarah yang masih terkait konteks ${hero.name} juga relevan.
            Tidak relevan: matematika umum, coding, topik pop culture modern, tokoh lain tanpa kaitan, hal di luar sejarah ${hero.name}.
            `.trim();

		const judgeOut = await generateTextUnli(judgePrompt, 0);
		const judge = safeJson<{ relevant?: boolean; reason?: string }>(
			judgeOut,
			{ relevant: true },
		);
		if (!judge.relevant) {
			return {
				reply:
					`Ini simulasi edukatif berdasarkan sumber yang ada.\n` +
					`[Fakta] — Pertanyaan di luar topik pahlawan ${hero.name}.\n` +
					`[Interpretasi] — Mohon fokus pada hal-hal terkait ${hero.name} (kehidupan, perjuangan, era, atau dampaknya).`,
			};
		}

		const transcript = (history as ChatMsg[])
			.slice(-8)
			.map(
				(m) =>
					`${m.role === "user" ? "User" : "Pahlawan"}: ${m.content}`,
			)
			.join("\n");

		const prompt = `
            Kamu mensimulasikan tokoh "${hero.name}" untuk tujuan edukatif.
            SELALU mulai jawaban dengan: "Ini simulasi edukatif berdasarkan sumber yang ada."
            Bicara orang pertama (aku/saya) ala era tokoh.
            JANGAN menambah fakta baru di luar data yang diberikan.
            Pisahkan dua bagian di jawaban:
            [Fakta] — poin singkat dari data.
            [Interpretasi] — gaya bahasa/emosi/penghayatan (jelas sebagai interpretasi).

            [DATA]
            Ringkasan: ${summary}
            Sorotan: ${highlights}

            [TRANSKRIP SEBELUMNYA]
            ${transcript || "(belum ada percakapan)"}

            [PERTANYAAN PENGGUNA]
            ${q}

            Batas 4-6 kalimat. Bahasa Indonesia sopan & mudah dipahami.
            `.trim();

		const reply = (await generateTextUnli(prompt, 0.7)).trim();
		return {
			reply:
				reply ||
				`Ini simulasi edukatif berdasarkan sumber yang ada.\n[Fakta] — Informasi tidak tersedia di koleksi kami.\n[Interpretasi] — Saya tidak ingin berspekulasi di luar data.`,
		};
	},
});
