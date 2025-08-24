// src/components/filters/SearchFilterLauncher.tsx
/** biome-ignore-all lint/suspicious/noExplicitAny: <> */

import { useCallback, useEffect, useRef, useState } from "react";

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

	useEffect(() => {
		onApply({ q: dq || undefined });
	}, [dq, onApply]);

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

	const closeSmooth = useCallback(() => {
		setOpen(false);
	}, []);

	const onTransitionEnd = () => {
		if (!open) setMounted(false);
	};

	const clearAndClose = () => {
		setQ("");
		closeSmooth();
		onApply({ q: undefined });
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Escape") closeSmooth();
	};

	return (
		<div ref={wrapperRef} className="relative">
			{!mounted && (
				<ActionIcon
					size="lg"
					radius="xl"
					variant={q ? "outline" : "default"}
					color={q ? "#ed1c24" : undefined}
					onClick={openSmooth}
					aria-label="Search"
				>
					<IconSearch size={18} />
				</ActionIcon>
			)}

			{mounted && (
				<div
					onTransitionEnd={onTransitionEnd}
					className="flex items-center overflow-hidden rounded-full bg-white px-3 shadow-sm transition-all duration-200 ease-out"
					style={{
						width: open ? 240 : 0,
						height: 36,
						opacity: open ? 1 : 0,
						paddingLeft: open ? 12 : 0,
						paddingRight: open ? 8 : 0,
					}}
				>
					<TextInput
						ref={inputRef}
						placeholder="Cari Pahlawan"
						value={q}
						onChange={(e) => setQ(e.currentTarget.value)}
						onKeyDown={onKeyDown}
						variant="unstyled"
						styles={{
							root: {
								flex: 1,
							},
							input: {
								color: "black",
								fontSize: "14px",
								fontWeight: 400,
								"::placeholder": {
									color: "#666",
									opacity: 0.8,
								},
							},
						}}
					/>
					<ActionIcon
						size="sm"
						radius="xl"
						variant="light"
						color="red"
						onClick={clearAndClose}
						aria-label="Tutup"
						title="Tutup"
					>
						<IconX size={14} />
					</ActionIcon>
				</div>
			)}
		</div>
	);
}
