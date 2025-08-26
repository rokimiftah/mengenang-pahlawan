// src/components/auth/ui/UserMenu.tsx

import { useMemo } from "react";

import { useQuery } from "convex/react";
import { useLocation } from "wouter";

import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@convex/_generated/api";
import { Avatar } from "@mantine/core";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export function UserMenu() {
	const { signOut } = useAuthActions();
	const user = useQuery(api.users.getCurrentUser);
	const [, navigate] = useLocation();

	const name = (user?.name ?? "").trim();
	const email = (user?.email ?? "").trim();
	const hasName = !!name;
	const image = typeof user?.image === "string" ? user.image : undefined;

	const initials = useMemo(() => {
		const src = (name || email || "?").trim();
		const parts = src.includes("@")
			? src
					.split("@")[0]
					.split(/[.\s_+-]+/)
					.filter(Boolean)
			: src.split(/\s+/).filter(Boolean);
		const a = parts[0]?.[0] ?? "?";
		const b = parts[1]?.[0] ?? "";
		return (a + b).toUpperCase();
	}, [name, email]);

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				<button
					type="button"
					aria-label="Menu akun"
					className={[
						"inline-grid cursor-pointer place-items-center rounded-full p-[3px]",
						"bg-[linear-gradient(to_bottom,#ed1c24_50%,#ffffff_50%)]",
						"ring-0 outline-none focus:ring-0 focus:outline-none focus-visible:ring-0",
					].join(" ")}
				>
					<Avatar
						src={image}
						radius="xl"
						size={48}
						className="rounded-full bg-white"
						alt={hasName ? name : email || "User"}
						title={hasName ? name : email}
					>
						{!image ? initials : null}
					</Avatar>
				</button>
			</DropdownMenu.Trigger>

			<DropdownMenu.Portal>
				<DropdownMenu.Content
					align="end"
					sideOffset={10}
					className={[
						"z-[1000]",
						"min-w-[220px] rounded-md border border-zinc-200 bg-white p-1 shadow-md",
						"dark:border-zinc-800 dark:bg-zinc-900",
						"data-[side=bottom]:animate-in data-[side=bottom]:fade-in-0 data-[side=bottom]:zoom-in-95 will-change-[opacity,transform]",
					].join(" ")}
				>
					<div className="px-2 pt-1 pb-1.5">
						{hasName ? (
							<>
								<div
									className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100"
									title={name}
								>
									{name}
								</div>
								{email && (
									<div
										className="truncate text-xs text-zinc-500 dark:text-zinc-400"
										title={email}
									>
										{email}
									</div>
								)}
							</>
						) : (
							<div
								className="truncate text-sm text-zinc-700 dark:text-zinc-200"
								title={email}
							>
								{email || "Pengguna"}
							</div>
						)}
					</div>

					<DropdownMenu.Separator className="my-1 h-px bg-zinc-200 dark:bg-zinc-800" />

					<DropdownMenu.Item
						onSelect={(e) => {
							e.preventDefault();
							(async () => {
								try {
									await signOut();
								} finally {
									navigate("/pahlawan", { replace: true });
								}
							})();
						}}
						className={[
							"relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none",
							"text-zinc-700 hover:bg-zinc-100 focus:bg-zinc-100",
							"dark:text-zinc-200 dark:hover:bg-zinc-800 dark:focus:bg-zinc-800",
						].join(" ")}
					>
						Keluar
					</DropdownMenu.Item>

					<DropdownMenu.Arrow className="fill-white dark:fill-zinc-900" />
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
}
