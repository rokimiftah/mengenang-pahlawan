// src/components/heroes/HeroDetail.tsx
/** biome-ignore-all lint/suspicious/noExplicitAny: <> */

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useAction, useMutation, useQuery } from "convex/react";
import { useLocation, useRoute } from "wouter";
import { navigate } from "wouter/use-browser-location";

import { api } from "@convex/_generated/api";
import { Anchor, Breadcrumbs, Button } from "@mantine/core";

type HeroDoc = {
	slug: string;
	name: string;
	portraitUrl?: string | null;
	era?: string;
	titles?: string[];
	birth?: { date?: string | null; place?: string | null };
	death?: { date?: string | null; place?: string | null };
	recognition?: { basis?: string | null; date?: string | null };
	education?: string[];
	legacy?: string[];
	biography?: { summary?: string; highlights?: string[] };
	summary?: string;
	raw?: any;
};

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
type ChatMsg = { role: "user" | "assistant"; content: string };

const FALLBACK = "https://images.unsplash.com/photo-1542051841857-5f90071e7989";

function fmtDate(d?: string | null) {
	if (!d) return "—";
	const date = new Date(d);
	if (Number.isNaN(date.getTime())) return d;
	return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(date);
}

function SoftRedBadge({ children }: { children: React.ReactNode }) {
	return (
		<span className="inline-flex items-center rounded-md bg-rose-600/85 px-2.5 py-1 text-xs font-semibold text-white ring-1 ring-rose-700/30">
			{children}
		</span>
	);
}
function AliasBadge({ text }: { text: string }) {
	return (
		<span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200">
			{text}
		</span>
	);
}

function Choice({
	option,
	selected,
	correct,
	locked,
	onPick,
}: {
	option: QuizOption;
	selected: boolean;
	correct: boolean;
	locked: boolean;
	onPick: (id: string) => void;
}) {
	const base =
		"w-full text-left rounded-lg border px-3 py-2 text-sm transition cursor-pointer text-neutral-600";
	const normal = "bg-white border-zinc-200 hover:bg-zinc-50 active:bg-zinc-100";
	const sel = "bg-yellow-100 border-yellow-300";
	const ok = "bg-green-100 border-green-300";
	const bad = "bg-rose-100 border-rose-300";

	let cls = `${base} ${normal}`;
	if (locked) {
		if (correct) cls = `${base} ${ok}`;
		else if (selected && !correct) cls = `${base} ${bad}`;
	} else if (selected) {
		cls = `${base} ${sel}`;
	}

	return (
		<button
			type="button"
			className={cls}
			onClick={() => onPick(option.id)}
			disabled={locked}
			aria-pressed={selected}
		>
			{option.text}
		</button>
	);
}

function RecommendPanel({
	slug,
	onClose,
}: {
	slug: string;
	onClose: () => void;
}) {
	const recommend = useAction(api.agent.recommendHeroes as any);

	const [loading, setLoading] = useState(true);
	const [recs, setRecs] = useState<any[]>([]);

	useEffect(() => {
		let active = true;
		(async () => {
			setLoading(true);
			try {
				let recent: string[] = [];
				try {
					recent = JSON.parse(localStorage.getItem("recent-slugs") || "[]");
				} catch {}
				const resp = await recommend({
					currentSlug: slug,
					recentSlugs: recent,
					limit: 6,
				} as any);
				if (!active) return;
				setRecs((resp as any)?.recs ?? []);
			} finally {
				if (active) setLoading(false);
			}
		})();
		return () => {
			active = false;
		};
	}, [recommend, slug]);

	return (
		<div className="flex h-[560px] max-h-[85vh] w-[720px] max-w-[95vw] flex-col overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/10">
			<div className="flex items-center justify-between gap-3 border-b px-4 py-3">
				<h3 className="text-base font-semibold text-zinc-900">
					Disarankan untukmu
				</h3>
				<button
					type="button"
					onClick={onClose}
					className="cursor-pointer rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
				>
					Tutup
				</button>
			</div>

			<div className="min-h-0 flex-1 overflow-y-auto p-4">
				{loading && (
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
						{Array.from({ length: 6 }).map((_, i) => (
							<div key={i} className="rounded-lg border border-zinc-200 p-3">
								<div className="mb-2 h-28 w-full animate-pulse rounded bg-zinc-200" />
								<div className="h-4 w-2/3 animate-pulse rounded bg-zinc-200" />
							</div>
						))}
					</div>
				)}

				{!loading && recs.length === 0 && (
					<div className="rounded border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
						Tidak ada rekomendasi untuk saat ini.
					</div>
				)}

				{!loading && recs.length > 0 && (
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
						{recs.map((h: any) => (
							<button
								key={h.slug}
								type="button"
								onClick={() => {
									navigate(`/dashboard/hero/${h.slug}`);
									onClose();
								}}
								className="group cursor-pointer overflow-hidden rounded-lg border border-zinc-200 p-3 text-left transition hover:border-zinc-300 hover:bg-zinc-50 active:bg-zinc-100"
							>
								<div className="mb-2 aspect-[4/3] w-full overflow-hidden rounded-md bg-zinc-100">
									{h.portraitUrl ? (
										<img
											src={h.portraitUrl}
											alt={h.name}
											className="h-full w-full object-cover transition group-hover:scale-[1.02]"
										/>
									) : (
										<div className="h-full w-full" />
									)}
								</div>
								<div className="line-clamp-1 text-sm font-semibold text-zinc-900">
									{h.name}
								</div>
								{h.era && <div className="text-xs text-zinc-500">{h.era}</div>}
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

function ChatRoleplayPanel({
	slug,
	name,
	onClose,
}: {
	slug: string;
	name: string;
	onClose: () => void;
}) {
	const ask = useAction(api.agent.chatAsHero as any);
	const [msgs, setMsgs] = useState<ChatMsg[]>([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const listRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		setMsgs([
			{
				role: "assistant" as const,
				content: `Ini simulasi edukatif berdasarkan sumber yang ada.\n[Fakta] — Silakan ajukan pertanyaan tentang perjuangan ${name}.\n[Interpretasi] — Aku akan menjawab dengan gaya naratif, namun tetap membedakan fakta dan interpretasi.`,
			},
		]);
	}, [name]);

	useEffect(() => {
		const el = listRef.current;
		if (!el) return;

		const behavior: ScrollBehavior = loading
			? "auto"
			: msgs.length > 1
				? "smooth"
				: "auto";

		el.scrollTo({ top: el.scrollHeight, behavior });
	}, [msgs.length, loading]);

	async function send() {
		const q = input.trim();
		if (!q || loading) return;

		setInput("");
		setLoading(true);

		setMsgs((prev) => [...prev, { role: "user" as const, content: q }]);

		try {
			const payloadHistory: ChatMsg[] = [
				...msgs,
				{ role: "user" as const, content: q },
			];

			const res = await ask({
				slug,
				message: q,
				history: payloadHistory,
			} as any);

			setMsgs((prev) => [
				...prev,
				{ role: "assistant" as const, content: (res as any).reply },
			]);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="flex h-[640px] max-h-[85vh] w-[720px] max-w-[95vw] flex-col overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/10">
			<div className="flex items-center justify-between gap-3 border-b px-4 py-3">
				<h3 className="text-base font-semibold text-zinc-900">
					Ngobrol dengan {name}
				</h3>
				<button
					type="button"
					onClick={onClose}
					className="cursor-pointer rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
				>
					Tutup
				</button>
			</div>

			<div
				ref={listRef}
				className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4"
			>
				{msgs.map((m, i) => (
					<div
						key={i}
						className={[
							"max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
							m.role === "assistant"
								? "self-start bg-zinc-50 text-zinc-800 ring-1 ring-zinc-200"
								: "self-end bg-yellow-100 text-zinc-900 ring-1 ring-yellow-200",
						].join(" ")}
						style={{
							alignSelf: m.role === "assistant" ? "flex-start" : "flex-end",
						}}
					>
						{m.content}
					</div>
				))}
				{loading && (
					<div className="max-w-[85%] self-start rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-500 ring-1 ring-zinc-200">
						Mengetik…
					</div>
				)}
			</div>

			<div className="flex items-end gap-2 border-t p-3">
				<textarea
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder={`Tanya sesuatu pada ${name}…`}
					rows={2}
					className="min-h-[44px] flex-1 resize-y rounded-md border border-zinc-300 bg-white p-2 text-sm text-zinc-900 caret-yellow-500 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-yellow-300"
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							send();
						}
					}}
				/>
				<button
					type="button"
					onClick={send}
					disabled={loading || !input.trim()}
					className="h-[44px] cursor-pointer rounded-md bg-yellow-400 px-4 text-sm font-medium text-black hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
				>
					Kirim
				</button>
			</div>
		</div>
	);
}

function QuizPanel({ slug, onClose }: { slug: string; onClose: () => void }) {
	const generate = useAction(api.ai.generateAiQuiz);
	const saveAttempt = useMutation(api.quizzes.recordAttempt);

	const [loading, setLoading] = useState(false);
	const [quiz, setQuiz] = useState<QuizPayload | null>(null);
	const [idx, setIdx] = useState(0);
	const [picked, setPicked] = useState<Record<string, string>>({});
	const [locked, setLocked] = useState(false);
	const [done, setDone] = useState(false);

	const [award, setAward] = useState<null | {
		awardedPoints: number;
		practice: boolean;
		breakdown: Record<string, number>;
		isPerfect: boolean;
		dailyRemaining: number;
	}>(null);

	useEffect(() => {
		let active = true;
		(async () => {
			setLoading(true);
			try {
				const q = (await generate({ slug, num: 5 })) as QuizPayload;
				if (active) setQuiz(q);
			} finally {
				if (active) setLoading(false);
			}
		})();
		return () => {
			active = false;
		};
	}, [generate, slug]);

	const q = quiz?.questions[idx];
	const total = quiz?.questions.length ?? 0;

	const correctCount = useMemo(() => {
		if (!quiz) return 0;
		return quiz.questions.reduce((acc, qq) => {
			const sel = picked[qq.id];
			return acc + (sel && sel === qq.answerId ? 1 : 0);
		}, 0);
	}, [picked, quiz]);

	function pick(optId: string) {
		if (!q || locked) return;
		setPicked((ps) => ({ ...ps, [q.id]: optId }));
		setLocked(true);
	}

	async function next() {
		if (!quiz || !q) return;
		if (idx < total - 1) {
			setIdx((i) => i + 1);
			setLocked(false);
		} else {
			setDone(true);
			try {
				const res = (await saveAttempt({
					slug,
					total,
					correct: correctCount,
				})) as any;
				setAward({
					awardedPoints: res.awardedPoints,
					practice: res.practice,
					breakdown: res.breakdown ?? {},
					isPerfect: res.isPerfect,
					dailyRemaining: res.dailyRemaining,
				});
			} catch {
				// ignore
			}
		}
	}

	function restart() {
		setLoading(true);
		setQuiz(null);
		setIdx(0);
		setPicked({});
		setLocked(false);
		setDone(false);
		generate({ slug, num: 5 }).then((q: any) => {
			setQuiz(q as QuizPayload);
			setLoading(false);
		});
	}

	return (
		<div className="flex h-[560px] max-h-[85vh] w-[640px] max-w-[95vw] flex-col overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/10">
			<div className="flex items-center gap-3 border-b px-4 py-3">
				<h3 className="text-base font-semibold text-zinc-900">Kuis Pahlawan</h3>
			</div>

			<div className="min-h-0 flex-1 overflow-y-auto p-4">
				{loading && (
					<div className="space-y-3">
						<div className="h-5 w-3/4 animate-pulse rounded bg-zinc-200" />
						<div className="h-9 w-full animate-pulse rounded bg-zinc-200" />
						<div className="h-9 w-full animate-pulse rounded bg-zinc-200" />
						<div className="h-9 w-full animate-pulse rounded bg-zinc-200" />
					</div>
				)}

				{!loading && quiz && !done && q && (
					<div className="space-y-4">
						<div className="text-xs font-medium text-zinc-500">
							Soal {idx + 1} / {total}
						</div>
						<h4 className="text-base font-semibold text-zinc-900">
							{q.prompt}
						</h4>

						<div className="space-y-2">
							{q.options.map((op) => (
								<Choice
									key={op.id}
									option={op}
									selected={picked[q.id] === op.id}
									correct={op.id === q.answerId}
									locked={locked}
									onPick={pick}
								/>
							))}
						</div>

						{locked && q.explanation && (
							<div className="rounded-md bg-zinc-50 px-3 py-2 text-xs text-zinc-600 ring-1 ring-zinc-200">
								{q.explanation}
							</div>
						)}
					</div>
				)}

				{!loading && quiz && done && (
					<div className="space-y-4 text-center">
						<div className="text-3xl font-bold text-zinc-900">
							Skor: {correctCount}/{total}
						</div>
						<div className="text-sm text-zinc-600">
							{correctCount === total
								? "Sempurna! 🎉"
								: correctCount >= Math.ceil(total * 0.7)
									? "Bagus! 💪"
									: "Terus berlatih! ✨"}
						</div>

						{award && (
							<div className="mx-auto w-full max-w-md rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900 ring-1 ring-amber-200">
								{award.practice ? (
									<div>
										Mode latihan — tidak ada poin (kuota harian/hero sudah
										terpakai).
									</div>
								) : (
									<div className="space-y-1">
										<div>
											+{award.awardedPoints} poin{" "}
											{award.isPerfect && "(Perfect!)"}
										</div>
										<div className="text-xs text-amber-800/80">
											Rincian:{" "}
											{Object.entries(award.breakdown)
												.map(([k, v]) => `${k} ${v}`)
												.join(", ")}
										</div>
										<div className="text-xs text-amber-800/80">
											Sisa kuis berbobot hari ini: {award.dailyRemaining}
										</div>
									</div>
								)}
							</div>
						)}

						<div className="mx-auto w-full max-w-md rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-900 ring-1 ring-blue-200">
							Ringkasan hasil kuis telah{" "}
							<span className="font-semibold">dikirim ke email</span> Anda.
							<span className="mt-1 block text-xs text-blue-800/80">
								Jika belum terlihat, periksa folder Spam/Promosi.
							</span>
						</div>
					</div>
				)}
			</div>

			{!loading && quiz && !done && (
				<div className="flex items-center justify-end gap-2 border-t px-4 py-3">
					<button
						type="button"
						onClick={onClose}
						className="cursor-pointer rounded-md border border-zinc-200 px-6 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 active:bg-zinc-100"
					>
						Batal
					</button>
					<Button
						className="cursor-pointer bg-yellow-400 text-black hover:bg-yellow-300 disabled:cursor-not-allowed"
						onClick={next}
						disabled={!quiz.questions[idx] || !picked[quiz.questions[idx].id]}
					>
						{idx < quiz.questions.length - 1 ? "Lanjut" : "Selesai"}
					</Button>
				</div>
			)}

			{!loading && quiz && done && (
				<div className="flex items-center justify-center gap-2 border-t px-4 py-3">
					<button
						type="button"
						onClick={onClose}
						className="cursor-pointer rounded-md border border-zinc-200 px-8 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 active:bg-zinc-100"
					>
						Batal
					</button>
					<Button
						className="cursor-pointer bg-yellow-400 text-black hover:bg-yellow-300"
						onClick={restart}
					>
						Coba Lagi
					</Button>
				</div>
			)}
		</div>
	);
}

function QuizModal({
	open,
	onClose,
	children,
}: {
	open: boolean;
	onClose: () => void;
	children: React.ReactNode;
}) {
	useEffect(() => {
		if (!open) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = prev;
		};
	}, [open]);

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open, onClose]);

	if (!open) return null;

	return createPortal(
		<div role="dialog" aria-modal="true" className="fixed inset-0 z-[100]">
			<div
				className="fixed inset-0 bg-black/65 backdrop-blur-sm"
				onClick={onClose}
			/>
			<div className="fixed inset-0 flex items-center justify-center p-4">
				<div onClick={(e) => e.stopPropagation()}>{children}</div>
			</div>
		</div>,
		document.body,
	);
}

export function HeroDetail() {
	const [, _navigate] = useLocation();
	const [, params] = useRoute<{ slug: string }>("/dashboard/hero/:slug");
	const [chatOpen, setChatOpen] = useState(false);

	const hero = useQuery(
		api.heroes.getBySlug,
		params?.slug ? { slug: params.slug } : "skip",
	) as HeroDoc | null | undefined;

	const images = useMemo(() => {
		const arr: string[] = [];
		if (hero?.portraitUrl) arr.push(hero.portraitUrl);
		const fromRaw = hero?.raw?.images;
		if (Array.isArray(fromRaw)) {
			for (const url of fromRaw) if (url) arr.push(url);
		}
		return arr.length ? arr : [FALLBACK];
	}, [hero]);

	const scrollerRef = useRef<HTMLDivElement | null>(null);
	const [idx, setIdx] = useState(0);

	useEffect(() => {
		const el = scrollerRef.current;
		if (!el) return;
		const onScroll = () => {
			const i = Math.round(el.scrollLeft / el.clientWidth);
			setIdx(Math.max(0, Math.min(images.length - 1, i)));
		};
		el.addEventListener("scroll", onScroll, { passive: true });
		return () => el.removeEventListener("scroll", onScroll);
	}, [images.length]);

	const goTo = (i: number) => {
		const el = scrollerRef.current;
		if (!el) return;
		const target = Math.max(0, Math.min(images.length - 1, i));
		el.scrollTo({ left: target * el.clientWidth, behavior: "smooth" });
	};

	const bioSummary: string | undefined =
		hero?.biography?.summary ?? hero?.raw?.biography?.summary ?? hero?.summary;

	const bioHighlights: string[] =
		hero?.biography?.highlights ?? hero?.raw?.biography?.highlights ?? [];

	const [studentView, setStudentView] = useState<string | null>(null);
	const simplify = useAction(api.ai.simplifySummary);

	const [quizOpen, setQuizOpen] = useState(false);

	useEffect(() => {
		if (!hero?.slug) return;
		try {
			const key = "recent-slugs";
			const cur = JSON.parse(localStorage.getItem(key) || "[]") as string[];
			const next = [hero.slug, ...cur.filter((s) => s !== hero.slug)].slice(
				0,
				10,
			);
			localStorage.setItem(key, JSON.stringify(next));
		} catch {}
	}, [hero?.slug]);

	const [recsOpen, setRecsOpen] = useState(false);

	useEffect(() => {
		if (!hero?.slug) return;
		try {
			const key = "recent-slugs";
			const cur = JSON.parse(localStorage.getItem(key) || "[]") as string[];
			const next = [hero.slug, ...cur.filter((s) => s !== hero.slug)].slice(
				0,
				10,
			);
			localStorage.setItem(key, JSON.stringify(next));
		} catch {}
	}, [hero?.slug]);

	if (hero === undefined) {
		return (
			<div className="grid h-full w-full grid-cols-1 gap-4 md:grid-cols-5">
				<div className="col-span-1 h-64 animate-pulse rounded-2xl bg-zinc-800/50 md:col-span-2 md:h-auto" />
				<div className="col-span-1 h-full rounded-2xl bg-white p-4 md:col-span-3">
					<div className="mb-3 h-7 w-2/3 animate-pulse rounded bg-zinc-200" />
					<div className="mb-2 h-4 w-1/2 animate-pulse rounded bg-zinc-200" />
					<div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-zinc-200" />
					<div className="mb-2 h-4 w-5/6 animate-pulse rounded bg-zinc-200" />
				</div>
			</div>
		);
	}

	if (!hero) {
		return (
			<div className="grid h-full w-full place-items-center">
				<div className="rounded-lg bg-white px-4 py-3 text-zinc-700 shadow">
					Data pahlawan tidak ditemukan.
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="mb-4 flex items-center">
				<Breadcrumbs>
					<Anchor
						href="/dashboard"
						onClick={(e) => {
							e.preventDefault();
							navigate("/dashboard");
						}}
						className="text-neutral-400 no-underline"
					>
						Dashboard
					</Anchor>
					<span className="text-neutral-400">
						{hero?.name ?? "Detail Pahlawan"}
					</span>
				</Breadcrumbs>
			</div>
			<div className="grid h-full min-h-0 w-full grid-cols-1 gap-4 md:grid-cols-5">
				<div className="min-h[260px] relative col-span-1 overflow-hidden rounded-2xl ring-1 ring-black/10 md:col-span-2 md:h-full md:min-h-0">
					<div
						ref={scrollerRef}
						className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth [scrollbar-width:none]"
						style={{ WebkitOverflowScrolling: "touch" }}
					>
						{images.map((src, i) => (
							<div
								key={i}
								className="relative h-full w-full shrink-0 snap-center"
								style={{ minWidth: "100%" }}
							>
								<img
									src={src}
									alt={`${hero.name} ${i + 1}`}
									className="absolute inset-0 block h-full w-full object-cover"
									loading={i === 0 ? "eager" : "lazy"}
								/>
							</div>
						))}
					</div>

					<button
						type="button"
						onClick={() => goTo(idx - 1)}
						disabled={idx === 0}
						aria-label="Foto sebelumnya"
						className={[
							"absolute top-1/2 left-2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full",
							"bg-black/60 text-white shadow-md backdrop-blur transition",
							idx === 0
								? "cursor-not-allowed opacity-30"
								: "cursor-pointer hover:bg-black/70",
						].join(" ")}
					>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
							<path
								d="M15 18l-6-6 6-6"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
					<button
						type="button"
						onClick={() => goTo(idx + 1)}
						disabled={idx === images.length - 1}
						aria-label="Foto berikutnya"
						className={[
							"absolute top-1/2 right-2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full",
							"bg-black/60 text-white shadow-md backdrop-blur transition",
							idx === images.length - 1
								? "cursor-not-allowed opacity-30"
								: "cursor-pointer hover:bg-black/70",
						].join(" ")}
					>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
							<path
								d="M9 6l6 6-6 6"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>

					<div className="absolute right-0 bottom-3 left-0 flex items-center justify-center gap-2">
						{images.map((_, i) => (
							<button
								key={i}
								type="button"
								onClick={() => goTo(i)}
								className={[
									"h-2 w-2 rounded-full transition",
									i === idx
										? "bg-white shadow"
										: "bg-white/50 hover:bg-white/80",
									"cursor-pointer",
								].join(" ")}
								aria-label={`Gambar ${i + 1}`}
							/>
						))}
					</div>
				</div>
				<div className="relative col-span-1 flex min-h-0 flex-col rounded-2xl bg-white p-4 md:col-span-3">
					<div className="mb-2 flex items-start justify-between gap-3">
						<h2 className="text-xl font-semibold text-zinc-900">{hero.name}</h2>
						<div className="flex items-center gap-2">
							<Button
								size="sm"
								variant="default"
								onClick={async () => {
									const res = await simplify({
										text: bioSummary ?? "",
										maxSentences: 3,
									} as any);
									setStudentView((res as any)?.summary || null);
								}}
							>
								Ringkas (Pelajar)
							</Button>
							<Button
								size="sm"
								variant="default"
								onClick={() => setRecsOpen(true)}
							>
								Disarankan untukmu
							</Button>
							<Button
								size="sm"
								onClick={() => setQuizOpen(true)}
								className="cursor-pointer bg-yellow-400 text-black hover:bg-yellow-300"
							>
								Mulai Kuis
							</Button>
						</div>
					</div>

					<div className="mb-4 flex flex-wrap gap-2">
						{(hero.titles ?? []).map((t) => (
							<SoftRedBadge key={t}>{t}</SoftRedBadge>
						))}
						{Array.isArray(hero.raw?.aliases) &&
							hero.raw.aliases.length > 0 && (
								<AliasBadge text={`Alias: ${hero.raw.aliases.join(", ")}`} />
							)}
					</div>

					<section className="mb-4">
						<h3 className="mb-2 text-sm font-semibold tracking-wide text-zinc-500 uppercase">
							Biografi Singkat
						</h3>
						{studentView ? (
							<div className="space-y-2">
								<p className="text-zinc-700">{studentView}</p>
								<div className="text-xs text-zinc-500">
									Tampilan pelajar — diringkas oleh AI.
									<button
										type="button"
										className="ml-2 cursor-pointer underline"
										onClick={() => setStudentView(null)}
									>
										Tampilkan versi asli
									</button>
								</div>
							</div>
						) : (
							<p className="text-zinc-700">{bioSummary ?? "—"}</p>
						)}
					</section>

					<section className="mb-4">
						<h3 className="mb-2 text-sm font-semibold tracking-wide text-zinc-500 uppercase">
							Sorotan Perjuangan
						</h3>
						{bioHighlights.length ? (
							<ul className="list-disc space-y-1 pl-5 text-zinc-700">
								{bioHighlights.map((h: string, i: number) => (
									<li key={i}>{h}</li>
								))}
							</ul>
						) : (
							<p className="text-zinc-500">—</p>
						)}
					</section>

					<div className="min-h-0 flex-1 overflow-y-auto pr-1">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<section>
								<h3 className="mb-2 text-sm font-semibold tracking-wide text-zinc-500 uppercase">
									Kelahiran
								</h3>
								<div className="text-zinc-700">
									<div>{fmtDate(hero.birth?.date)}</div>
									<div className="text-zinc-500">
										{hero.birth?.place ?? "—"}
									</div>
								</div>
							</section>

							<section>
								<h3 className="mb-2 text-sm font-semibold tracking-wide text-zinc-500 uppercase">
									Wafat
								</h3>
								<div className="text-zinc-700">
									<div>{fmtDate(hero.death?.date)}</div>
									<div className="text-zinc-500">
										{hero.death?.place ?? "—"}
									</div>
								</div>
							</section>

							<section className="sm:col-span-2">
								<h3 className="mb-2 text-sm font-semibold tracking-wide text-zinc-500 uppercase">
									Pengakuan
								</h3>
								<div className="text-zinc-700">
									<div>{hero.recognition?.basis ?? "—"}</div>
									<div className="text-zinc-500">
										{fmtDate(hero.recognition?.date)}
									</div>
								</div>
							</section>

							<section className="sm:col-span-2">
								<h3 className="mb-2 text-sm font-semibold tracking-wide text-zinc-500 uppercase">
									Pendidikan
								</h3>
								{hero.education?.length ? (
									<ul className="list-disc space-y-1 pl-5 text-zinc-700">
										{hero.education.map((e, i) => (
											<li key={i}>{e}</li>
										))}
									</ul>
								) : (
									<p className="text-zinc-500">—</p>
								)}
							</section>

							<section className="sm:col-span-2">
								<h3 className="mb-2 text-sm font-semibold tracking-wide text-zinc-500 uppercase">
									Warisan
								</h3>
								{hero.legacy?.length ? (
									<ul className="list-disc space-y-1 pl-5 text-zinc-700">
										{hero.legacy.map((e, i) => (
											<li key={i}>{e}</li>
										))}
									</ul>
								) : (
									<p className="text-zinc-500">—</p>
								)}
							</section>
						</div>
					</div>
					<button
						type="button"
						aria-label={`Ngobrol dengan ${hero.name}`}
						onClick={() => setChatOpen(true)}
						className="absolute right-4 bottom-4 z-20 flex h-12 cursor-pointer items-center gap-2 rounded-full bg-yellow-400 px-4 text-black shadow-lg ring-1 ring-black/10 transition hover:bg-yellow-300"
					>
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							aria-hidden="true"
						>
							<path
								d="M21 12a8 8 0 1 0-3.1 6.3L21 21l-1.3-3.1A7.96 7.96 0 0 0 21 12Z"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
						<span className="text-sm font-medium">
							Yuk ngobrol dengan {hero.name}
						</span>
					</button>
				</div>
				<QuizModal open={quizOpen} onClose={() => setQuizOpen(false)}>
					<QuizPanel slug={hero.slug} onClose={() => setQuizOpen(false)} />
				</QuizModal>
				<QuizModal open={recsOpen} onClose={() => setRecsOpen(false)}>
					<RecommendPanel slug={hero.slug} onClose={() => setRecsOpen(false)} />
				</QuizModal>
				<QuizModal open={chatOpen} onClose={() => setChatOpen(false)}>
					<ChatRoleplayPanel
						slug={hero.slug}
						name={hero.name}
						onClose={() => setChatOpen(false)}
					/>
				</QuizModal>
			</div>
		</>
	);
}
