// src/components/heroes/HeroShelf.tsx
/** biome-ignore-all lint/suspicious/noExplicitAny: <> */

import { useEffect, useMemo, useRef, useState } from "react";

import { useQuery } from "convex/react";
import { useLocation } from "wouter";

import { api } from "@convex/_generated/api";
import * as Tabs from "@radix-ui/react-tabs";

import { useFilters } from "../filters/FilterContext";

type Hero = {
	slug: string;
	name: string;
	portraitUrl?: string | null;
	era: string;
};

const FALLBACK = "https://images.unsplash.com/photo-1542051841857-5f90071e7989";
const STORAGE_KEY = "heroShelfState:v1";

const ERA_OPTIONS = [
	"Perang Kolonial",
	"Pergerakan Nasional",
	"Pendudukan Jepang",
	"Revolusi & Orde Lama",
] as const;

function SideArrow({
	dir,
	onClick,
	disabled,
}: {
	dir: "left" | "right";
	onClick: () => void;
	disabled: boolean;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={dir === "left" ? "Sebelumnya" : "Berikutnya"}
			aria-disabled={disabled}
			disabled={disabled}
			className={[
				"h-12 w-12 shrink-0 self-center rounded-full",
				"grid place-items-center bg-black/60 text-white backdrop-blur",
				"shadow-md transition",
				disabled
					? "cursor-not-allowed opacity-30"
					: "cursor-pointer hover:bg-black/70",
			].join(" ")}
		>
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
				{dir === "left" ? (
					<path
						d="M15 18l-6-6 6-6"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				) : (
					<path
						d="M9 6l6 6-6 6"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				)}
			</svg>
		</button>
	);
}

function HeroCard({ hero, onClick }: { hero: Hero; onClick: () => void }) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="group relative block h-full min-h-0 w-full cursor-pointer overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-white/10"
		>
			<img
				src={hero.portraitUrl || FALLBACK}
				alt={hero.name}
				className="absolute inset-0 block h-full w-full object-cover"
				loading="lazy"
			/>
			<div className="pointer-events-none absolute inset-0 ring-2 ring-yellow-400/0 transition group-hover:ring-yellow-400/60" />
			<div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
				<div className="truncate text-left text-xs font-semibold text-white/95 sm:text-sm">
					{hero.name}
				</div>
			</div>
		</button>
	);
}

function readStored() {
	try {
		const raw = sessionStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const obj = JSON.parse(raw);
		return obj && typeof obj === "object" ? obj : null;
	} catch {
		return null;
	}
}
function writeStored(era: string, page: number) {
	try {
		const prev = readStored() || {};
		const pageByEra = { ...(prev.pageByEra || {}), [era]: page };
		sessionStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({ era, pageByEra, v: 1, t: Date.now() }),
		);
	} catch {
		// ignore
	}
}
const clamp = (n: number, min: number, max: number) =>
	Math.max(min, Math.min(max, n));

export function HeroShelf() {
	const [, navigate] = useLocation();
	const { filters } = useFilters();

	const stored = readStored();
	const initialEra = ((): (typeof ERA_OPTIONS)[number] => {
		const e = stored?.era;
		return (ERA_OPTIONS as readonly string[]).includes(e)
			? (e as any)
			: "Perang Kolonial";
	})();
	const [era, setEra] = useState<(typeof ERA_OPTIONS)[number]>(initialEra);

	const heroes = useQuery(api.heroes.list, { q: filters.q, era });

	const COLS = 3;
	const pages = useMemo<Hero[][]>(() => {
		const list = heroes ?? [];
		const out: Hero[][] = [];
		for (let i = 0; i < list.length; i += COLS)
			out.push(list.slice(i, i + COLS));
		return out;
	}, [heroes]);

	const storedPage =
		typeof stored?.pageByEra?.[initialEra] === "number"
			? stored.pageByEra[initialEra]
			: 0;
	const [page, setPage] = useState(storedPage);

	useEffect(() => {
		writeStored(era, page);
	}, [era, page]);

	const prevEraRef = useRef(era);
	useEffect(() => {
		if (prevEraRef.current !== era) {
			prevEraRef.current = era;
			const st = readStored();
			const p =
				typeof st?.pageByEra?.[era] === "number"
					? st.pageByEra[era]
					: 0;
			setPage(p);
		}
	}, [era]);

	const restoredAfterLoadRef = useRef(false);
	useEffect(() => {
		if (restoredAfterLoadRef.current) return;
		if (heroes === undefined) return;
		const st = readStored();
		const saved =
			typeof st?.pageByEra?.[era] === "number" ? st.pageByEra[era] : 0;
		const maxIndex = Math.max(0, pages.length - 1);
		setPage(clamp(saved, 0, maxIndex));
		restoredAfterLoadRef.current = true;
	}, [heroes, era, pages.length]);

	useEffect(() => {
		if (heroes === undefined) return;
		setPage((p) => clamp(p, 0, Math.max(0, pages.length - 1)));
	}, [heroes, pages.length]);

	const canPrev = page > 0;
	const canNext = pages.length > 0 && page < pages.length - 1;

	return (
		<div className="flex h-full min-h-0 w-full flex-col">
			<Tabs.Root
				className="flex h-full min-h-0 w-full flex-col"
				value={era}
				onValueChange={(v) => setEra(v as any)}
			>
				<Tabs.List
					className="inline-flex h-10 shrink-0 items-center justify-center gap-1 self-center rounded-xl bg-zinc-900/60 p-1 ring-1 ring-white/10"
					aria-label="Pilih era"
				>
					{ERA_OPTIONS.map((value) => (
						<Tabs.Trigger
							key={value}
							value={value}
							className={[
								"inline-flex cursor-pointer items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap",
								"text-zinc-300 transition hover:text-white",
								"data-[state=active]:bg-zinc-700/60 data-[state=active]:text-white data-[state=active]:shadow",
								"focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300",
							].join(" ")}
						>
							{value}
						</Tabs.Trigger>
					))}
				</Tabs.List>

				<Tabs.Content
					value={era}
					className="mt-4 min-h-0 flex-1 focus:outline-none"
				>
					<div className="flex h-full min-h-0 w-full items-stretch gap-4">
						<SideArrow
							dir="left"
							onClick={() => setPage((p) => Math.max(0, p - 1))}
							disabled={!canPrev}
						/>

						<div className="h-full min-h-0 flex-1 overflow-hidden">
							<div
								className="flex h-full min-h-0 transition-transform duration-300 ease-out"
								style={{
									transform: `translateX(-${page * 100}%)`,
								}}
							>
								{heroes === undefined && (
									<div className="h-full min-h-0 w-full shrink-0">
										<div
											className="grid h-full min-h-0 w-full grid-cols-3"
											style={{
												gridTemplateRows:
													"minmax(0,1fr)",
												gap: "16px",
											}}
										>
											{Array.from({ length: COLS }).map(
												(_, i) => (
													<div
														key={i}
														className="h-full min-h-0 animate-pulse rounded-2xl bg-zinc-800/70"
													/>
												),
											)}
										</div>
									</div>
								)}

								{heroes !== undefined &&
									(pages.length ? (
										pages.map((group, idx) => (
											<div
												key={idx}
												className="h-full min-h-0 w-full shrink-0"
											>
												<div
													className="grid h-full min-h-0 w-full grid-cols-3"
													style={{
														gridTemplateRows:
															"minmax(0,1fr)",
														gap: "16px",
													}}
												>
													{group.map((h) => (
														<HeroCard
															key={h.slug}
															hero={h}
															onClick={() => {
																writeStored(
																	era,
																	page,
																);
																if (
																	document.startViewTransition
																) {
																	document.startViewTransition(
																		() =>
																			navigate(
																				`/dashboard/hero/${h.slug}`,
																			),
																	);
																} else {
																	navigate(
																		`/dashboard/hero/${h.slug}`,
																	);
																}
															}}
														/>
													))}
													{group.length < COLS &&
														Array.from({
															length:
																COLS -
																group.length,
														}).map((_, i) => (
															<div
																key={`f-${i}`}
																className="invisible h-full min-h-0"
															/>
														))}
												</div>
											</div>
										))
									) : (
										<div className="h-full min-h-0 w-full shrink-0">
											<div
												className="grid h-full min-h-0 w-full grid-cols-3"
												style={{
													gridTemplateRows:
														"minmax(0,1fr)",
													gap: "16px",
												}}
											>
												{Array.from({
													length: COLS,
												}).map((_, i) => (
													<div
														key={i}
														className="grid h-full min-h-0 place-items-center rounded-2xl bg-zinc-800/70 text-zinc-400 ring-1 ring-white/10"
													>
														Tidak ada data
													</div>
												))}
											</div>
										</div>
									))}
							</div>
						</div>

						<SideArrow
							dir="right"
							onClick={() =>
								setPage((p) =>
									Math.min(pages.length - 1, p + 1),
								)
							}
							disabled={!canNext}
						/>
					</div>
				</Tabs.Content>
			</Tabs.Root>
		</div>
	);
}
