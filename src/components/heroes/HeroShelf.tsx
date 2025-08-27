// src/components/heroes/HeroShelf.tsx
/** biome-ignore-all lint/suspicious/noExplicitAny: <> */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

function calcCols(width: number) {
	// Mobile <768 => 1; Tablet 768–1023 => 2; Desktop >=1024 => 3
	if (width < 768) return 1;
	if (width < 1024) return 2;
	return 3;
}

function SideArrow({
	dir,
	onClick,
	disabled,
	className,
}: {
	dir: "left" | "right";
	onClick: () => void;
	disabled: boolean;
	className?: string;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={dir === "left" ? "Sebelumnya" : "Berikutnya"}
			aria-disabled={disabled}
			disabled={disabled}
			className={[
				"grid h-12 w-12 place-items-center rounded-full",
				"bg-black/60 text-white shadow-md backdrop-blur transition",
				disabled
					? "cursor-not-allowed opacity-30"
					: "cursor-pointer hover:bg-black/70",
				className || "",
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
			data-hero-card
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
	} catch {}
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

	// responsive cols
	const [cols, setCols] = useState<number>(() =>
		calcCols(typeof window !== "undefined" ? window.innerWidth : 1024),
	);
	useEffect(() => {
		const onResize = () => {
			const next = calcCols(window.innerWidth);
			setCols((prev) => (prev === next ? prev : next));
		};
		onResize();
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, []);

	const heroes = useQuery(api.heroes.list, { q: filters.q, era });

	const pages = useMemo<Hero[][]>(() => {
		const list = heroes ?? [];
		const out: Hero[][] = [];
		const step = Math.max(1, cols);
		for (let i = 0; i < list.length; i += step)
			out.push(list.slice(i, i + step));
		return out;
	}, [heroes, cols]);

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
				typeof st?.pageByEra?.[era] === "number" ? st.pageByEra[era] : 0;
			setPage(p);
		}
	}, [era]);

	useEffect(() => {
		if (heroes === undefined) return;
		setPage((p) => clamp(p, 0, Math.max(0, pages.length - 1)));
	}, [heroes, pages.length]);

	const canPrev = page > 0;
	const canNext = pages.length > 0 && page < pages.length - 1;

	const viewportRef = useRef<HTMLDivElement>(null);
	const trackRef = useRef<HTMLDivElement>(null);

	const draggingRef = useRef(false);
	const startXRef = useRef(0);
	const startYRef = useRef(0);
	const startTargetRef = useRef<EventTarget | null>(null);
	const startTimeRef = useRef(0);
	const startPageRef = useRef(0);
	const lastDXRef = useRef(0);
	const animEnabledRef = useRef(true);

	const calcTranslatePct = useCallback((p: number, dxPx: number) => {
		const vp = viewportRef.current;
		const vw = vp?.clientWidth || 1;
		const base = p * 100;
		const deltaPct = (dxPx / vw) * 100;
		return base - deltaPct;
	}, []);

	const setTrackTransform = useCallback(
		(pageLike: number, dxPx = 0, withTransition = true) => {
			const el = trackRef.current;
			if (!el) return;

			if (withTransition !== animEnabledRef.current) {
				animEnabledRef.current = withTransition;
				el.style.transition = withTransition
					? "transform 300ms ease-out"
					: "none";
			}
			const pct = calcTranslatePct(pageLike, dxPx);
			el.style.transform = `translateX(-${pct}%)`;
		},
		[calcTranslatePct],
	);

	useEffect(() => {
		setTrackTransform(page, 0, true);
	}, [page, setTrackTransform]);

	useEffect(() => {
		const el = trackRef.current;
		if (el) el.style.transition = "transform 300ms ease-out";
	}, []);

	const onPointerDown = (e: React.PointerEvent) => {
		if (pages.length <= 1) return;
		draggingRef.current = true;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		startXRef.current = e.clientX;
		startYRef.current = e.clientY;
		startTargetRef.current = e.target;
		startTimeRef.current = performance.now();
		startPageRef.current = page;
		lastDXRef.current = 0;
		setTrackTransform(page, 0, false);
	};

	const onPointerMove = (e: React.PointerEvent) => {
		if (!draggingRef.current) return;
		const dx = e.clientX - startXRef.current;
		lastDXRef.current = dx;
		setTrackTransform(startPageRef.current, dx, false);
	};

	const onPointerUp = (e: React.PointerEvent) => {
		if (!draggingRef.current) return;
		draggingRef.current = false;
		(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);

		const vp = viewportRef.current;
		const vw = vp?.clientWidth || 1;
		const dx = lastDXRef.current;
		const dy = e.clientY - startYRef.current;
		const dist = Math.hypot(dx, dy);
		const duration = performance.now() - startTimeRef.current;
		const TAP_DIST = 6;
		const TAP_TIME = 350;

		if (dist <= TAP_DIST && duration <= TAP_TIME) {
			const startEl = startTargetRef.current as HTMLElement | null;
			if (startEl) {
				const clickable = startEl.closest("[data-hero-card],button,a");
				if (clickable) {
					setTrackTransform(page, 0, true);
					(clickable as HTMLElement).click();
					return;
				}
			}
		}

		const threshold = vw * 0.2;
		let next = startPageRef.current;

		if (dx <= -threshold && canNext)
			next = Math.min(pages.length - 1, startPageRef.current + 1);
		else if (dx >= threshold && canPrev)
			next = Math.max(0, startPageRef.current - 1);

		setTrackTransform(next, 0, true);
		if (next !== page) setPage(next);
	};

	const wheelLastTsRef = useRef(0);
	const onWheel = (e: React.WheelEvent) => {
		if (pages.length <= 1) return;
		const now = performance.now();
		const COOLDOWN_MS = 140;
		if (now - wheelLastTsRef.current < COOLDOWN_MS) return;

		const unit =
			e.deltaMode === 1
				? 16
				: e.deltaMode === 2
					? viewportRef.current?.clientHeight || 800
					: 1;
		const dx = e.deltaX * unit;
		const dy = e.deltaY * unit;
		const d = Math.abs(dx) > Math.abs(dy) ? dx : dy;

		const THRESHOLD_PX = 30;
		if (Math.abs(d) < THRESHOLD_PX) return;

		if (d > 0 && canNext) {
			setPage((p) => Math.min(pages.length - 1, p + 1));
			wheelLastTsRef.current = now;
		} else if (d < 0 && canPrev) {
			setPage((p) => Math.max(0, p - 1));
			wheelLastTsRef.current = now;
		}
	};

	return (
		<div className="flex h-full min-h-0 w-full flex-col">
			<Tabs.Root
				className="flex h-full min-h-0 w-full flex-col"
				value={era}
				onValueChange={(v) => setEra(v as any)}
			>
				{/* Tabs.List: responsive (scrollable on mobile, centered on sm+) */}
				<Tabs.List
					className={[
						"flex h-10 items-center gap-1 rounded-xl bg-zinc-900/60 p-1 ring-1 ring-white/10",
						"w-full max-w-full overflow-x-auto sm:w-auto sm:max-w-none sm:self-center sm:overflow-visible",
						// hide scrollbars cross-browser:
						"[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
						"justify-start sm:justify-center",
						"px-2 sm:px-1",
					].join(" ")}
					aria-label="Pilih era"
				>
					{ERA_OPTIONS.map((value) => (
						<Tabs.Trigger
							key={value}
							value={value}
							className={[
								"inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap",
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
					{/* parent retains gap-4 per layout; image area still fills since child is full-width */}
					<div className="flex h-full min-h-0 w-full items-stretch gap-4">
						{/* RELATIVE WRAPPER so arrows can overlay above the images */}
						<div className="relative h-full min-h-0 w-full flex-1">
							{/* viewport */}
							<div
								ref={viewportRef}
								className="h-full min-h-0 w-full overflow-hidden select-none"
								onWheel={onWheel}
								onPointerDown={onPointerDown}
								onPointerMove={onPointerMove}
								onPointerUp={onPointerUp}
								style={{ touchAction: "pan-y" }}
							>
								<div
									ref={trackRef}
									className="flex h-full min-h-0"
									style={{ transform: `translateX(-${page * 100}%)` }}
								>
									{heroes === undefined && (
										<div className="h-full min-h-0 w-full shrink-0">
											<div
												className="grid h-full min-h-0 w-full"
												style={{
													gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
													gridTemplateRows: "minmax(0,1fr)",
													gap: "16px",
												}}
											>
												{Array.from({ length: cols }).map((_, i) => (
													<div
														key={i}
														className="h-full min-h-0 animate-pulse rounded-2xl bg-zinc-800/70"
													/>
												))}
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
														className="grid h-full min-h-0 w-full"
														style={{
															gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
															gridTemplateRows: "minmax(0,1fr)",
															gap: "16px",
														}}
													>
														{group.map((h) => (
															<HeroCard
																key={h.slug}
																hero={h}
																onClick={() => {
																	writeStored(era, page);
																	if (document.startViewTransition) {
																		document.startViewTransition(() =>
																			navigate(`/pahlawan/${h.slug}`),
																		);
																	} else {
																		navigate(`/pahlawan/${h.slug}`);
																	}
																}}
															/>
														))}
														{group.length < cols &&
															Array.from({ length: cols - group.length }).map(
																(_, i) => (
																	<div
																		key={`f-${i}`}
																		className="invisible h-full min-h-0"
																	/>
																),
															)}
													</div>
												</div>
											))
										) : (
											<div className="h-full min-h-0 w-full shrink-0">
												<div
													className="grid h-full min-h-0 w-full"
													style={{
														gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
														gridTemplateRows: "minmax(0,1fr)",
														gap: "16px",
													}}
												>
													{Array.from({ length: cols }).map((_, i) => (
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

							{/* OVERLAY ARROWS (z-index di atas gambar) */}
							<div className="pointer-events-none absolute inset-y-0 left-2 z-20 flex items-center">
								<SideArrow
									dir="left"
									onClick={() => setPage((p) => Math.max(0, p - 1))}
									disabled={!canPrev}
									className="pointer-events-auto"
								/>
							</div>
							<div className="pointer-events-none absolute inset-y-0 right-2 z-20 flex items-center">
								<SideArrow
									dir="right"
									onClick={() =>
										setPage((p) => Math.min(pages.length - 1, p + 1))
									}
									disabled={!canNext}
									className="pointer-events-auto"
								/>
							</div>
						</div>
					</div>
				</Tabs.Content>
			</Tabs.Root>
		</div>
	);
}
