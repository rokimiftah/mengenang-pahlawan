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

	// Simpan posisi
	useEffect(() => {
		writeStored(era, page);
	}, [era, page]);

	// Ganti era -> restore page tersimpan
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

	// Setelah heroes siap -> clamp page agar valid
	useEffect(() => {
		if (heroes === undefined) return;
		setPage((p) => clamp(p, 0, Math.max(0, pages.length - 1)));
	}, [heroes, pages.length]);

	const canPrev = page > 0;
	const canNext = pages.length > 0 && page < pages.length - 1;

	// ---- GESTURE HORIZONTAL (drag + wheel) ----
	const viewportRef = useRef<HTMLDivElement>(null); // pembungkus yang terlihat
	const trackRef = useRef<HTMLDivElement>(null); // elemen yang di-transform

	const draggingRef = useRef(false);
	const startXRef = useRef(0);
	const startYRef = useRef(0);
	const startTargetRef = useRef<EventTarget | null>(null);
	const startTimeRef = useRef(0);
	const startPageRef = useRef(0);
	const lastDXRef = useRef(0);
	const animEnabledRef = useRef(true);

	// Hitung translateX (%) saat dragging
	const calcTranslatePct = useCallback((p: number, dxPx: number) => {
		const vp = viewportRef.current;
		const vw = vp?.clientWidth || 1;
		const base = p * 100; // setiap halaman = 100%
		const deltaPct = (dxPx / vw) * 100;
		return base - deltaPct; // minus karena geser kanan = nilai negatif
	}, []);

	const setTrackTransform = useCallback(
		(pageLike: number, dxPx = 0, withTransition = true) => {
			const el = trackRef.current;
			if (!el) return;
			// toggle transition
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

	// Sinkronkan posisi track tiap kali "page" berubah via panah/restore
	useEffect(() => {
		setTrackTransform(page, 0, true);
	}, [page, setTrackTransform]);

	// Init transition style
	useEffect(() => {
		const el = trackRef.current;
		if (el) el.style.transition = "transform 300ms ease-out";
	}, []);

	// Pointer events (mouse/touch/pen)
	const onPointerDown = (e: React.PointerEvent) => {
		if (pages.length <= 1) return; // tidak ada yang digeser
		draggingRef.current = true;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		startXRef.current = e.clientX;
		startYRef.current = e.clientY;
		startTargetRef.current = e.target;
		startTimeRef.current = performance.now();
		startPageRef.current = page;
		lastDXRef.current = 0;
		setTrackTransform(page, 0, false); // matikan anim selama drag
	};

	const onPointerMove = (e: React.PointerEvent) => {
		if (!draggingRef.current) return;
		const dx = e.clientX - startXRef.current; // + ke kanan, - ke kiri
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
		const TAP_DIST = 6; // px
		const TAP_TIME = 350; // ms
		// Jika tap (bukan drag) → teruskan klik ke tombol/anchor/kartu
		if (dist <= TAP_DIST && duration <= TAP_TIME) {
			const startEl = startTargetRef.current as HTMLElement | null;
			if (startEl) {
				const clickable = startEl.closest("[data-hero-card],button,a");
				if (clickable) {
					// kembalikan posisi track ke halaman aktif (tanpa offset drag)
					setTrackTransform(page, 0, true);
					(clickable as HTMLElement).click();
					return; // jangan proses sebagai drag
				}
			}
		}

		const threshold = vw * 0.2; // 20% layar
		let next = startPageRef.current;

		if (dx <= -threshold && canNext)
			next = Math.min(pages.length - 1, startPageRef.current + 1);
		else if (dx >= threshold && canPrev)
			next = Math.max(0, startPageRef.current - 1);

		setTrackTransform(next, 0, true);
		if (next !== page) setPage(next);
	};

	// Wheel → geser halaman
	const wheelLastTsRef = useRef(0);

	const onWheel = (e: React.WheelEvent) => {
		if (pages.length <= 1) return;

		// Cooldown kecil biar nggak lompat 2–3 halaman sekaligus
		const now = performance.now();
		const COOLDOWN_MS = 140; // kecil = lebih responsif
		if (now - wheelLastTsRef.current < COOLDOWN_MS) return;

		// Normalisasi delta (pixel / line / page)
		const unit =
			e.deltaMode === 1
				? 16 // 1 "line" ≈ 16px
				: e.deltaMode === 2
					? viewportRef.current?.clientHeight || 800 // 1 "page"
					: 1; // pixels
		const dx = e.deltaX * unit;
		const dy = e.deltaY * unit;
		const d = Math.abs(dx) > Math.abs(dy) ? dx : dy; // pakai sumbu dominan

		const THRESHOLD_PX = 30; // 👈 kecil = lebih sensitif (coba 20/15 kalau mau super peka)
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

						{/* VIEWPORT: area terlihat; overflow hidden biar hanya 1 halaman tampil */}
						<div
							ref={viewportRef}
							className="h-full min-h-0 flex-1 overflow-hidden select-none"
							onWheel={onWheel}
							onPointerDown={onPointerDown}
							onPointerMove={onPointerMove}
							onPointerUp={onPointerUp}
							// buat touch lebih mulus (geser horizontal), tapi tetap bisa scroll vertikal kalau ada
							style={{ touchAction: "pan-y" }}
						>
							{/* TRACK: digeser dengan transform (seperti kode aslimu) */}
							<div
								ref={trackRef}
								className="flex h-full min-h-0"
								style={{ transform: `translateX(-${page * 100}%)` }}
							>
								{/* Loading skeleton page */}
								{heroes === undefined && (
									<div className="h-full min-h-0 w-full shrink-0">
										<div
											className="grid h-full min-h-0 w-full grid-cols-3"
											style={{ gridTemplateRows: "minmax(0,1fr)", gap: "16px" }}
										>
											{Array.from({ length: COLS }).map((_, i) => (
												<div
													key={i}
													className="h-full min-h-0 animate-pulse rounded-2xl bg-zinc-800/70"
												/>
											))}
										</div>
									</div>
								)}

								{/* Data pages */}
								{heroes !== undefined &&
									(pages.length ? (
										pages.map((group, idx) => (
											<div key={idx} className="h-full min-h-0 w-full shrink-0">
												<div
													className="grid h-full min-h-0 w-full grid-cols-3"
													style={{
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
													{/* filler agar grid selalu 3 kolom pas */}
													{group.length < COLS &&
														Array.from({ length: COLS - group.length }).map(
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
										// No data page
										<div className="h-full min-h-0 w-full shrink-0">
											<div
												className="grid h-full min-h-0 w-full grid-cols-3"
												style={{
													gridTemplateRows: "minmax(0,1fr)",
													gap: "16px",
												}}
											>
												{Array.from({ length: COLS }).map((_, i) => (
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
							onClick={() => setPage((p) => Math.min(pages.length - 1, p + 1))}
							disabled={!canNext}
						/>
					</div>
				</Tabs.Content>
			</Tabs.Root>
		</div>
	);
}
