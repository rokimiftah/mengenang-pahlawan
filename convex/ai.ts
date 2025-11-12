// convex/ai.ts
/** biome-ignore-all lint/suspicious/noExplicitAny: <> */

import { v } from "convex/values";

import { api } from "./_generated/api";
import { action } from "./_generated/server";
import { llm } from "./llm";

type QuizOption = { id: string; text: string };
type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuizOption[];
  answerId: string;
  explanation?: string;
};
type QuizPayload = {
  hero: { slug: string; name: string };
  questions: QuizQuestion[];
};

type DbHeroLike = {
  slug: string;
  name: string;
  summary?: string;
  raw?: { biography?: { summary?: string; highlights?: string[] } };
  biography?: { summary?: string; highlights?: string[] };
};

export const simplifySummary = action({
  args: { text: v.string(), maxSentences: v.optional(v.number()) },
  handler: async (_, { text, maxSentences = 3 }): Promise<{ summary: string }> => {
    const prompt = `
			Ringkas teks berikut menjadi ${maxSentences} kalimat, bahasa sederhana (level SMP), tanpa menambah fakta baru:\n\n${text}
		`;
    const out = await llm(prompt, 0.2);
    return { summary: String(out).trim() };
  },
});

export const generateAiQuiz = action({
  args: { slug: v.string(), num: v.optional(v.number()) },
  handler: async (ctx, { slug, num = 5 }): Promise<QuizPayload> => {
    const hero = (await ctx.runQuery(api.heroes.getBySlug, {
      slug,
    })) as unknown as DbHeroLike | null;
    if (!hero) throw new Error("Hero not found");

    const summary = hero.biography?.summary ?? hero.raw?.biography?.summary ?? hero.summary ?? "";
    const highlights = hero.biography?.highlights ?? hero.raw?.biography?.highlights ?? [];

    const prompt = `
			Anda adalah seorang guru sejarah yang kreatif. Buat ${num} soal pilihan ganda (A/B/C) yang bervariasi dan menarik tentang pahlawan "${hero.name}".
			Setiap kali Anda membuat soal, usahakan untuk menggunakan gaya dan jenis pertanyaan yang berbeda.

			Gunakan materi berikut sebagai sumber utama:
			- Ringkasan: ${summary}
			- Sorotan Penting: ${highlights.join(", ")}

			Jenis pertanyaan yang bisa dibuat:
			1.  **Faktual**: Tentang tanggal, tempat, atau peristiwa spesifik.
			2.  **Konseptual**: Tentang peran, gagasan, atau dampak perjuangan.
			3.  **Kutipan/Alias**: Jika ada, tanyakan tentang makna julukan atau kutipan terkenal.
			4.  **Sebab-Akibat**: Mengapa suatu peristiwa terjadi atau apa dampaknya.

			Pastikan pilihan jawaban pengecoh (distraktor) masuk akal namun salah.

			Kembalikan dalam format JSON yang ketat seperti ini, tanpa teks tambahan:
			{"questions":[{"prompt":"...","choices":["A ...","B ...","C ..."],"answerIndex":0,"explanation":"Penjelasan singkat mengapa jawaban ini benar..."}]}
		`.trim();

    const text = await llm(prompt, 0.7);

    let parsed: any = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      const m = text.match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
    }

    let qs: any[] = Array.isArray(parsed?.questions) ? parsed.questions : [];
    if (!qs.length) {
      qs = [
        {
          prompt: `Apa fakta utama tentang ${hero.name}?`,
          choices: ["Perjuangan", "Kelahiran", "Wafat"],
          answerIndex: 0,
        },
      ];
    }

    const questions: QuizQuestion[] = qs.slice(0, num).map((q: any, i: number) => {
      const choices: string[] = Array.isArray(q?.choices) ? q.choices.map((c: any) => String(c)).slice(0, 3) : ["A", "B", "C"];
      const ans = typeof q?.answerIndex === "number" ? Math.max(0, Math.min(choices.length - 1, q.answerIndex)) : 0;
      return {
        id: `q${i + 1}`,
        prompt: String(q?.prompt ?? `Pertanyaan ${i + 1}`),
        options: choices.map((t: string, j: number) => ({
          id: `q${i + 1}_c${j}`,
          text: t,
        })),
        answerId: `q${i + 1}_c${ans}`,
        explanation: q?.explanation ? String(q.explanation) : undefined,
      };
    });

    return { hero: { slug: hero.slug, name: hero.name }, questions };
  },
});
