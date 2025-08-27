// src/components/filters/SearchFilterLauncher.tsx
/** biome-ignore-all lint/suspicious/noExplicitAny: <> */

import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";

import { ActionIcon, TextInput } from "@mantine/core";
import { useClickOutside, useDebouncedValue } from "@mantine/hooks";
import { IconSearch, IconX } from "@tabler/icons-react";

export type SearchFilter = { q?: string };

export function SearchFilterLauncher({
	onApply,
}: {
	onApply: (v: SearchFilter) => void;
}) {
	const [mounted, setMounted] = useState(false);
	const [open, setOpen] = useState(false);

	const [q, setQ] = useState("");
	const [dq] = useDebouncedValue(q, 200);
	useEffect(() => onApply({ q: dq || undefined }), [dq, onApply]);

	// ── detect mobile (≤640px)
	const [isMobile, setIsMobile] = useState(false);
	useEffect(() => {
		const mql = window.matchMedia?.("(max-width: 640px)");
		if (!mql) return;
		const apply = () => setIsMobile(mql.matches);
		apply();
		mql.addEventListener("change", apply);
		return () => mql.removeEventListener("change", apply);
	}, []);

	// ── compute header middle Y (for perfect vertical centering)
	const [headerMid, setHeaderMid] = useState<number>(40); // fallback ~40px
	const measureHeader = useCallback(() => {
		const el = document.querySelector("header");
		if (!el) return;
		const r = el.getBoundingClientRect();
		setHeaderMid(r.top + r.height / 2);
	}, []);
	useLayoutEffect(() => {
		measureHeader();
		const onResize = () => measureHeader();
		window.addEventListener("resize", onResize);
		// observe header size changes
		const el = document.querySelector("header");
		const ro =
			el && "ResizeObserver" in window
				? new ResizeObserver(measureHeader)
				: null;
		ro?.observe(el as Element);
		return () => {
			window.removeEventListener("resize", onResize);
			ro?.disconnect();
		};
	}, [measureHeader]);

	// widths
	const [inlineWidth, setInlineWidth] = useState(240);
	const [mobileWidth, setMobileWidth] = useState(260);
	useEffect(() => {
		const calc = () => {
			const vw = window.innerWidth || 1024;
			setInlineWidth(
				vw >= 1024 ? 260 : Math.max(200, Math.min(260, Math.round(vw * 0.35))),
			);
			setMobileWidth(Math.max(220, Math.min(360, Math.round(vw * 0.82))));
		};
		calc();
		window.addEventListener("resize", calc);
		return () => window.removeEventListener("resize", calc);
	}, []);

	const wrapperRef = useClickOutside<HTMLDivElement>(() => {
		if (!mounted) return;
		closeSmooth();
	});

	const inputRef = useRef<HTMLInputElement>(null);
	useEffect(() => {
		if (open && inputRef.current) inputRef.current.focus();
	}, [open]);

	const openSmooth = () => {
		if (mounted) return;
		setMounted(true);
		requestAnimationFrame(() => setOpen(true));
	};
	const closeSmooth = useCallback(() => setOpen(false), []);
	const onTransitionEnd = () => !open && setMounted(false);
	const clearAndClose = () => {
		setQ("");
		closeSmooth();
		onApply({ q: undefined });
	};
	const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) =>
		e.key === "Escape" && closeSmooth();

	const ringClass = useMemo(
		() => (open || q ? "ring-2 ring-[#ed1c24]" : "ring-1 ring-black/10"),
		[open, q],
	);

	return (
		<div ref={wrapperRef} className="relative inline-block">
			{/* icon saat tertutup */}
			{!mounted && (
				<ActionIcon
					size="lg"
					radius="xl"
					variant={q ? "outline" : "default"}
					color={q ? "#ed1c24" : undefined}
					onClick={openSmooth}
					aria-label="Search"
					styles={{ root: { borderColor: q ? "#ed1c24" : undefined } }}
				>
					<IconSearch size={18} />
				</ActionIcon>
			)}

			{/* input */}
			{mounted && (
				<div
					onTransitionEnd={onTransitionEnd}
					className={[
						"flex items-center overflow-hidden rounded-full bg-white shadow-sm transition-all duration-200 ease-out",
						ringClass,
						isMobile
							? // MOBILE: fixed & centered horizontally in the header
								"fixed left-1/2 z-[60] h-10 px-3"
							: "px-3",
					].join(" ")}
					style={
						isMobile
							? {
									top: headerMid, // vertical center of header
									transform: `translate(-50%, -50%)`,
									width: open ? mobileWidth : 0,
									opacity: open ? 1 : 0,
									paddingLeft: open ? 12 : 0,
									paddingRight: open ? 8 : 0,
								}
							: {
									width: open ? inlineWidth : 0,
									height: 36,
									opacity: open ? 1 : 0,
									paddingLeft: open ? 12 : 0,
									paddingRight: open ? 8 : 0,
								}
					}
				>
					<TextInput
						ref={inputRef}
						placeholder="Cari Pahlawan"
						value={q}
						onChange={(e) => setQ(e.currentTarget.value)}
						onKeyDown={onKeyDown}
						variant="unstyled"
						className="flex-1"
						styles={{
							input: {
								color: "black",
								fontSize: isMobile ? "15px" : "14px",
								fontWeight: 400,
								lineHeight: "1.2",
								height: isMobile ? 32 : 28,
								padding: 0,
								"::placeholder": { color: "#666", opacity: 0.85 } as any,
							},
						}}
					/>
					<ActionIcon
						size={isMobile ? "md" : "sm"}
						radius="xl"
						variant="light"
						color="red"
						onClick={clearAndClose}
						aria-label="Tutup"
						title="Tutup"
					>
						<IconX size={isMobile ? 16 : 14} />
					</ActionIcon>
				</div>
			)}
		</div>
	);
}
