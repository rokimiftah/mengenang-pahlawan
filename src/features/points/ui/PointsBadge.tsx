// src/features/points/ui/PointsBadge.tsx

import { useEffect, useRef, useState } from "react";

import { Tooltip } from "@mantine/core";
import clsx from "clsx";

import { PointsApi } from "@features/points";

function compact(n: number) {
	if (n < 1000) return String(n);
	if (n < 1_000_000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "k";
	return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + "M";
}
const nf = new Intl.NumberFormat("id-ID");

export function PointsBadge({ className, onClick }: { className?: string; onClick?: () => void }) {
	const summary = PointsApi.usePointsSummary();
	const loading = summary === undefined;
	const total = summary?.total ?? 0;
	const dailyRemaining = summary?.dailyRemaining ?? 5;

	const prev = useRef(total);
	const [pop, setPop] = useState(false);
	useEffect(() => {
		if (prev.current !== total) {
			setPop(true);
			const t = setTimeout(() => setPop(false), 350);
			prev.current = total;
			return () => clearTimeout(t);
		}
	}, [total]);

	const TooltipBody = (
		<div className="min-w-[220px]">
			<div className="mb-1 flex items-center gap-2">
				<svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4">
					<defs>
						<linearGradient id="coinGrad" x1="0" y1="0" x2="1" y2="1">
							<stop offset="0%" stopColor="#FDE68A" />
							<stop offset="50%" stopColor="#F59E0B" />
							<stop offset="100%" stopColor="#D97706" />
						</linearGradient>
					</defs>
					<circle cx="12" cy="12" r="10" fill="url(#coinGrad)" />
					<circle cx="12" cy="12" r="7" fill="#fff7ed" opacity="0.5" />
					<path d="M9 14h6M9 10h6" stroke="#7c2d12" strokeWidth="1.6" strokeLinecap="round" />
				</svg>
				<div className="text-sm font-bold">Total Poin: {nf.format(total)}</div>
			</div>
			<div className="text-xs text-zinc-200/90">
				Sisa kuis berbobot hari ini: <span className="font-semibold">{dailyRemaining}</span>
			</div>
			<div className="mt-1 text-[11px] text-zinc-300/90">Klik untuk lihat riwayat</div>
		</div>
	);

	return (
		<Tooltip
			label={loading ? "Memuat poin…" : TooltipBody}
			withArrow
			arrowSize={6}
			offset={8}
			position="bottom"
			transitionProps={{ duration: 120 }}
			classNames={{
				tooltip: "z-50 max-w-xs rounded-lg bg-zinc-900 px-3 py-2 text-zinc-50 text-xs shadow-lg ring-1 ring-black/20",
			}}
		>
			<button
				type="button"
				onClick={onClick}
				className={clsx(
					"relative inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5",
					"bg-gradient-to-br from-amber-300/90 via-amber-400/90 to-amber-500/90",
					"shadow-sm ring-1 ring-amber-700/25 dark:ring-amber-900/30",
					"backdrop-blur supports-[backdrop-filter]:backdrop-blur-sm",
					"text-[11px] font-extrabold text-amber-950",
					"badge-shine",
					pop && "badge-pop",
					"cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60",
					className,
				)}
				aria-label="Lihat riwayat poin"
			>
				<svg aria-hidden viewBox="0 0 24 24" className="h-[14px] w-[14px] drop-shadow-sm">
					<defs>
						<linearGradient id="coinGrad" x1="0" y1="0" x2="1" y2="1">
							<stop offset="0%" stopColor="#FDE68A" />
							<stop offset="50%" stopColor="#F59E0B" />
							<stop offset="100%" stopColor="#D97706" />
						</linearGradient>
					</defs>
					<circle cx="12" cy="12" r="10" fill="url(#coinGrad)" />
					<circle cx="12" cy="12" r="7" fill="#fff7ed" opacity="0.5" />
					<path d="M9 14h6M9 10h6" stroke="#7c2d12" strokeWidth="1.6" strokeLinecap="round" />
				</svg>

				<span className={clsx("tracking-wide tabular-nums", pop && "scale-105")}>{loading ? "…" : compact(total)}</span>
				<span
					className={clsx(
						"ml-0.5 rounded bg-black/10 px-1 py-[1px] text-[10px] font-extrabold",
						dailyRemaining === 0 && "bg-black/15",
					)}
					aria-hidden
					title={`Sisa kuis berbobot hari ini: ${dailyRemaining}`}
				>
					{loading ? "…" : dailyRemaining}
				</span>

				<span
					aria-hidden
					className="pointer-events-none absolute inset-0 rounded-full"
					style={{
						mask: "linear-gradient(to bottom, rgba(0,0,0,.8), rgba(0,0,0,0.2))",
						WebkitMask: "linear-gradient(to bottom, rgba(0,0,0,.8), rgba(0,0,0,0.2))",
						background: "radial-gradient(120% 100% at 0% 0%, rgba(255,255,255,.6), rgba(255,255,255,0) 60%)",
					}}
				/>
			</button>
		</Tooltip>
	);
}
