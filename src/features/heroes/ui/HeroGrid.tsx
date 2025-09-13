// src/features/heroes/ui/HeroGrid.tsx
/** biome-ignore-all lint/suspicious/noExplicitAny: <> */

import type { CSSProperties } from "react";

import { useEffect, useMemo, useRef, useState } from "react";

import { useLocation } from "wouter";

import { HeroesApi, HeroesModel } from "@features/heroes";

type Hero = {
	slug: string;
	name: string;
	portraitUrl?: string | null;
};

const FALLBACK = "";

function FlagAvatar({ src, alt, size, onClick }: { src?: string | null; alt: string; size: number; onClick: () => void }) {
	const s = Math.max(1, Math.floor(size));
	const style = { "--size": `${s}px` } as CSSProperties;
	return (
		<button type="button" className="flagbtn" style={style} onClick={onClick} aria-label={`Pelajari ${alt}`}>
			<div className="flag-ring">
				<div className="flag-inner">
					<img src={src || FALLBACK} alt={alt} className="h-full w-full object-cover" loading="lazy" />
				</div>
			</div>
		</button>
	);
}

export function HeroGrid() {
	const [, navigate] = useLocation();
	const { filters } = HeroesModel.useFilters();

	const heroes = HeroesApi.useHeroesList({ q: filters.q, era: undefined });

	const containerRef = useRef<HTMLDivElement>(null);
	const [box, setBox] = useState({ w: 0, h: 0 });

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const ro = new ResizeObserver(([entry]) => {
			const r = entry.contentRect;
			setBox({
				w: Math.max(0, Math.floor(r.width)),
				h: Math.max(0, Math.floor(r.height)),
			});
		});
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	const { cols, size, gap } = useMemo(() => {
		const n = heroes?.length ?? 0;
		const W = box.w || 1;
		const H = box.h || 1;

		const GAP = 16;
		const MAX = 168;
		const MIN_REF = 64;

		if (n === 0) return { cols: 1, size: 120, gap: GAP };

		const maxCols = Math.min(n, Math.max(1, Math.floor((W + GAP) / (MIN_REF + GAP))));

		let best = { cols: 1, size: 0 };
		for (let c = 1; c <= maxCols; c++) {
			const rows = Math.ceil(n / c);
			const sW = (W - GAP * (c - 1)) / c;
			const sH = (H - GAP * (rows - 1)) / rows;
			const s = Math.min(sW, sH, MAX);
			if (s > best.size && Number.isFinite(s)) best = { cols: c, size: s };
		}

		if (best.size <= 0 || !Number.isFinite(best.size)) {
			const fallbackSize = Math.min(120, Math.max(72, Math.floor(Math.min(W, H) * 0.3)));
			const fallbackCols = Math.max(1, Math.min(n || 1, Math.floor((W + GAP) / (fallbackSize + GAP))));
			return { cols: fallbackCols, size: fallbackSize, gap: GAP };
		}

		return { cols: best.cols, size: Math.floor(best.size), gap: GAP };
	}, [box.w, box.h, heroes?.length]);

	if (heroes === undefined) return <div className="text-zinc-400">Memuat…</div>;
	if (!heroes.length) return <div className="text-zinc-400">Belum ada data pahlawan.</div>;

	return (
		<div ref={containerRef} className="h-full w-full">
			<div
				className="grid place-content-start"
				style={{
					gridTemplateColumns: `repeat(${cols}, ${size}px)`,
					gap: `${gap}px`,
				}}
			>
				{heroes.map((h: Hero) => (
					<FlagAvatar
						key={h.slug}
						src={h.portraitUrl}
						alt={h.name}
						size={size}
						onClick={() => {
							if (document.startViewTransition) {
								document.startViewTransition(() => navigate(`/pahlawan/${h.slug}`));
							} else {
								navigate(`/pahlawan/${h.slug}`);
							}
						}}
					/>
				))}
			</div>
		</div>
	);
}
