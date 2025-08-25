// src/components/auth/ui/UserInfo.tsx

import { useQuery } from "convex/react";

import { api } from "@convex/_generated/api";
import { Avatar, Group, Text } from "@mantine/core";

import { SignOut } from "./SignOut";

export function UserInfo() {
	const user = useQuery(api.users.getCurrentUser, {});
	const email = user?.email ?? "";
	const name = user?.name ?? "";
	const image = user?.image;
	const initial = (email || name || "?").slice(0, 1).toUpperCase();

	return (
		<Group justify="end" gap="sm">
			<Group gap="xs">
				<Avatar
					src={image || undefined}
					alt={name || email || "User"}
					radius="xl"
					className="cursor-pointer"
				>
					{!image && initial}
				</Avatar>
				<div className="hidden sm:block">
					<Text size="sm" c="dimmed" className="max-w-[160px] truncate">
						{name || email}
					</Text>
				</div>
			</Group>
			<SignOut />
		</Group>
	);
}
