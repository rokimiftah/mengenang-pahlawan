// convex/quizzes.ts
/** biome-ignore-all lint/style/noNonNullAssertion: <> */
/** biome-ignore-all lint/suspicious/noExplicitAny: <> */

import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { Resend as ResendAPI } from "resend";

import QuizResultEmail from "../src/features/points/templates/QuizResultEmail";
import { internal } from "./_generated/api";
import { internalAction, mutation } from "./_generated/server";

type Option = { id: string; text: string };
type Question = {
  id: string;
  prompt: string;
  options: Option[];
  answerId: string;
  explanation?: string;
};

const ERAS = ["Perang Kolonial", "Pergerakan Nasional", "Pendudukan Jepang", "Revolusi & Orde Lama", "Sesudah 1966"] as const;

const fmtDDMMYYYY = (input?: string | null): string | undefined => {
  if (!input) return undefined;
  if (/^\d{2}-\d{2}-\d{4}$/.test(input)) return input;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
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
};

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const s = (x: any) => (typeof x === "string" ? x.trim() : "");
const yearOf = (val?: string | null) => {
  if (!val) return undefined;
  const m = val.match(/(\d{4})/);
  if (m) {
    const y = Number(m[1]);
    return Number.isFinite(y) ? y : undefined;
  }
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? undefined : d.getFullYear();
};
const opt = (text: string): Option => ({ id: cryptoRandomId(), text });

function cryptoRandomId() {
  return Math.random().toString(36).slice(2, 10);
}

async function decoyBank(ctx: any, exceptSlug: string) {
  const all = await ctx.db.query("heroes").collect();
  const others = all.filter((h: any) => h.slug !== exceptSlug);
  return {
    birthPlaces: others.map((h: any) => h?.birth?.place).filter(Boolean) as string[],
    eras: ERAS.slice(),
    recognitions: others.map((h: any) => h?.recognition?.basis).filter(Boolean) as string[],
    highlights: others
      .flatMap((h: any) => h?.raw?.biography?.highlights ?? h?.biography?.highlights ?? [])
      .filter(Boolean) as string[],
  };
}

function buildQuestions(hero: any, bank: Awaited<ReturnType<typeof decoyBank>>): Question[] {
  const out: Question[] = [];
  const name = hero.name as string;

  const by = yearOf(hero?.birth?.date);
  if (by) {
    const d1 = by + 1;
    const d2 = by - 2;
    const options = shuffle([opt(String(by)), opt(String(d1)), opt(String(d2))]);
    out.push({
      id: cryptoRandomId(),
      prompt: `Tahun berapa ${name} lahir?`,
      options,
      answerId: options.find((o) => o.text === String(by))!.id,
      explanation: hero?.birth?.date ? `Tanggal lahir: ${fmtDDMMYYYY(hero.birth.date)}` : undefined,
    });
  }

  const bp = s(hero?.birth?.place);
  if (bp) {
    const decoys = shuffle(bank.birthPlaces.filter((p) => p !== bp)).slice(0, 2);
    const options = shuffle([opt(bp), ...decoys.map(opt)]);
    if (options.length === 3) {
      out.push({
        id: cryptoRandomId(),
        prompt: `Di mana ${name} lahir?`,
        options,
        answerId: options.find((o) => o.text === bp)!.id,
      });
    }
  }

  const era = s(hero?.era);
  if (era) {
    const others = shuffle(bank.eras.filter((e) => e !== era)).slice(0, 2);
    const options = shuffle([opt(era), ...others.map(opt)]);
    out.push({
      id: cryptoRandomId(),
      prompt: `Era perjuangan yang paling tepat untuk ${name}?`,
      options,
      answerId: options.find((o) => o.text === era)!.id,
    });
  }

  const basis = s(hero?.recognition?.basis);
  if (basis) {
    const decoys = shuffle(bank.recognitions.filter((b) => b !== basis)).slice(0, 2);
    const options = shuffle([opt(basis), ...decoys.map(opt)]);
    if (options.length === 3) {
      out.push({
        id: cryptoRandomId(),
        prompt: `Dasar penetapan gelar pahlawan ${name}?`,
        options,
        answerId: options.find((o) => o.text === basis)!.id,
        explanation: hero?.recognition?.date ? `Tanggal Keppres: ${fmtDDMMYYYY(hero.recognition.date)}` : undefined,
      });
    }
  }

  const hl = (hero?.biography?.highlights ?? hero?.raw?.biography?.highlights ?? []) as string[];
  if (hl.length > 0) {
    const truth = s(hl[0]);
    if (truth) {
      const decoys = shuffle(bank.highlights.filter((h) => h !== truth)).slice(0, 2);
      const options = shuffle([opt(truth), ...decoys.map(opt)]);
      out.push({
        id: cryptoRandomId(),
        prompt: `Manakah pernyataan yang benar tentang ${name}?`,
        options,
        answerId: options.find((o) => o.text === truth)!.id,
      });
    }
  }

  return out;
}

export const generateForHero = mutation({
  args: { slug: v.string(), num: v.optional(v.number()) },
  handler: async (ctx, { slug, num }) => {
    const hero = await ctx.db
      .query("heroes")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (!hero) throw new Error("Hero tidak ditemukan");

    const bank = await decoyBank(ctx, slug);
    const questions = buildQuestions(hero, bank);
    const take = Math.max(1, Math.min(questions.length, num ?? 5));
    const finalQs = shuffle(questions).slice(0, take);

    return {
      hero: { slug: hero.slug, name: hero.name },
      questions: finalQs,
    };
  },
});

function todaySG(): string {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const sg = new Date(utc + 8 * 3600 * 1000);
  return sg.toISOString().slice(0, 10);
}

const DAILY_CAP = 5;

export const recordAttempt = mutation({
  args: {
    slug: v.string(),
    total: v.number(),
    correct: v.number(),
  },
  handler: async (ctx, { slug, total, correct }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Harus login untuk menyimpan hasil kuis");

    await ctx.db.insert("quizAttempts", {
      userId,
      slug,
      total,
      correct,
      createdAt: Date.now(),
    });

    const day = todaySG();
    let daily = await ctx.db
      .query("quizDaily")
      .withIndex("by_user_day", (q) => q.eq("userId", userId).eq("day", day))
      .first();

    if (!daily) {
      const id = await ctx.db.insert("quizDaily", {
        userId,
        day,
        scoredCount: 0,
        heroSlugs: [],
        perfectToday: false,
      });
      daily = await ctx.db.get(id);
    }

    const alreadyHeroToday = daily!.heroSlugs.includes(slug);
    const reachedDailyCap = daily!.scoredCount >= DAILY_CAP;

    let awarded = 0;
    const breakdown: Record<string, number> = {};
    const isPerfect = correct === total;

    if (!alreadyHeroToday && !reachedDailyCap) {
      const base = 10 * correct;
      awarded += base;
      breakdown.base = base;

      if (isPerfect) {
        awarded += 10;
        breakdown.perfect = 10;
      }

      awarded += 3;
      breakdown.firstTry = 3;

      const pts = await ctx.db
        .query("quizPoints")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

      if (!pts) {
        await ctx.db.insert("quizPoints", {
          userId,
          points: awarded,
          updatedAt: Date.now(),
        });
      } else {
        await ctx.db.patch(pts._id, {
          points: pts.points + awarded,
          updatedAt: Date.now(),
        });
      }

      const nextSlugs = daily!.heroSlugs.includes(slug) ? daily!.heroSlugs : [...daily!.heroSlugs, slug];

      await ctx.db.patch(daily!._id, {
        scoredCount: daily!.scoredCount + 1,
        heroSlugs: nextSlugs,
        perfectToday: daily!.perfectToday || isPerfect,
      });
    }

    const scoredNow = !alreadyHeroToday && !reachedDailyCap ? 1 : 0;
    const dailyRemaining = Math.max(0, DAILY_CAP - (daily!.scoredCount + scoredNow));

    await ctx.db.insert("quizAwards", {
      userId,
      slug,
      points: awarded,
      practice: alreadyHeroToday || reachedDailyCap,
      breakdown,
      createdAt: Date.now(),
    });

    try {
      const user = await ctx.db.get(userId);
      const email = (user as any)?.email as string | undefined;
      const userName: string | null = ((user as any)?.name as string) ?? null;

      if (email) {
        const hero = await ctx.db
          .query("heroes")
          .withIndex("by_slug", (q) => q.eq("slug", slug))
          .first();
        const heroName = hero?.name ?? slug;

        await ctx.scheduler.runAfter(0, internal.quizzes._sendQuizResultEmail, {
          email,
          userName: userName ?? undefined,
          heroName,
          total,
          correct,
          awarded,
          practice: alreadyHeroToday || reachedDailyCap,
          breakdown,
        });
      }
    } catch {
      // ignore
    }

    return {
      ok: true,
      awardedPoints: awarded,
      practice: alreadyHeroToday || reachedDailyCap,
      breakdown,
      isPerfect,
      dailyRemaining,
    };
  },
});

export const _sendQuizResultEmail = internalAction({
  args: {
    email: v.string(),
    userName: v.optional(v.string()),
    heroName: v.string(),
    total: v.number(),
    correct: v.number(),
    awarded: v.number(),
    practice: v.boolean(),
    breakdown: v.any(),
  },
  handler: async (_ctx, args) => {
    const { email, userName, heroName, total, correct, awarded, practice, breakdown } = args;

    const subject = `Hasil Kuis Mengenang Pahlawan: ${heroName}`;

    const text = [
      `Hai${userName ? ` ${userName}` : ""},`,
      `Hasil kuis Anda untuk tokoh ${heroName}:`,
      `Skor: ${correct}/${total}`,
      practice
        ? `Mode latihan — tidak ada poin diberikan.`
        : `Poin: +${awarded}${
            breakdown && Object.keys(breakdown).length
              ? ` (Rincian: ${Object.entries(breakdown)
                  .map(([k, v]) => `${k} ${v}`)
                  .join(", ")})`
              : ""
          }`,
      `Waktu: ${new Date().toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Jakarta",
      })}`,
      `Terus semangat belajar!`,
    ].join("\n");

    const resend = new ResendAPI(process.env.MAIL_API_KEY);
    const sentAtText = new Date().toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Jakarta",
    });

    const { error } = await resend.emails.send({
      from: "Mengenang Pahlawan <notifications@mengenangpahlawan.web.id>",
      to: [email],
      subject,
      react: QuizResultEmail({
        userName: userName ?? undefined,
        heroName,
        total,
        correct,
        awarded,
        practice,
        breakdown: (breakdown ?? {}) as Record<string, number>,
        sentAtText,
      }),
      text,
    });

    if (error) {
      throw new Error(`Could not send email: ${error.message}`);
    }
  },
});
