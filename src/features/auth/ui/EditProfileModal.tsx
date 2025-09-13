// src/features/auth/ui/EditProfileModal.tsx

import { useEffect, useMemo, useRef, useState } from "react";

import { notifications } from "@mantine/notifications";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { IconUpload } from "@tabler/icons-react";
import clsx from "clsx";
import { useMutation, useQuery } from "convex/react";

import { api } from "@convex/_generated/api";

export function EditProfileModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
	const user = useQuery(api.users.getCurrentUser);
	const [name, setName] = useState("");
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const generateUploadUrl = useMutation(api.users.generateUploadUrl);
	const updateUserProfile = useMutation(api.users.updateUserProfile);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (opened && user) {
			setName(user.name ?? "");
			setAvatarFile(null);
		}
	}, [opened, user]);

	const previewUrl = useMemo(() => (avatarFile ? URL.createObjectURL(avatarFile) : null), [avatarFile]);

	useEffect(() => {
		return () => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	}, [previewUrl]);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		if (file.size > 5 * 1024 * 1024) {
			notifications.show({
				title: "Ukuran File Terlalu Besar",
				message: "Ukuran avatar maksimal adalah 5MB.",
				color: "red",
			});
			return;
		}
		setAvatarFile(file);
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!user) return;
		setIsSubmitting(true);

		try {
			let storageId: string | undefined;
			if (avatarFile) {
				const postUrl = await generateUploadUrl();
				const result = await fetch(postUrl, {
					method: "POST",
					headers: { "Content-Type": avatarFile.type },
					body: avatarFile,
				});
				const { storageId: uploadedStorageId } = await result.json();
				storageId = uploadedStorageId;
			}

			await updateUserProfile({
				name: name.trim(),
				...(storageId && { storageId }),
			});

			notifications.show({
				title: "Profil Diperbarui",
				message: "Informasi profil Anda telah berhasil disimpan.",
				color: "green",
			});
			onClose();
		} catch (_error) {
			notifications.show({
				title: "Gagal Memperbarui Profil",
				message: "Terjadi kesalahan saat menyimpan perubahan.",
				color: "red",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const hasChanges = avatarFile !== null || (user && name.trim() !== (user.name ?? ""));
	const isNameValid = name.trim().length > 0;
	const canSubmit = hasChanges && isNameValid && !isSubmitting;

	return (
		<Dialog.Root open={opened} onOpenChange={onClose}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 data-[state=closed]:opacity-0 data-[state=open]:opacity-100" />

				<Dialog.Content
					className={clsx(
						"fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-lg",
						"transition-all duration-300 ease-out",
						"data-[state=open]:scale-100 data-[state=open]:opacity-100",
						"data-[state=closed]:scale-95 data-[state=closed]:opacity-0",
					)}
				>
					<VisuallyHidden.Root asChild>
						<Dialog.Title>Edit Profil</Dialog.Title>
					</VisuallyHidden.Root>
					<VisuallyHidden.Root asChild>
						<Dialog.Description>Perbarui nama dan avatar profil Anda di sini. Klik simpan jika sudah selesai.</Dialog.Description>
					</VisuallyHidden.Root>

					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="flex flex-col items-center gap-4">
							<AvatarPrimitive.Root className="relative inline-flex h-28 w-28 items-center justify-center overflow-hidden rounded-full align-middle select-none">
								<AvatarPrimitive.Image
									src={previewUrl ?? user?.image ?? undefined}
									alt={user?.name ?? ""}
									className="h-full w-full rounded-[inherit] object-cover"
								/>
								<AvatarPrimitive.Fallback
									className="flex h-full w-full items-center justify-center bg-gray-100 text-2xl font-medium text-gray-700"
									delayMs={600}
								>
									{user?.name?.slice(0, 2).toUpperCase() || "AV"}
								</AvatarPrimitive.Fallback>
							</AvatarPrimitive.Root>
							<input
								type="file"
								ref={fileInputRef}
								onChange={handleFileChange}
								accept="image/png,image/jpeg"
								className="hidden"
							/>
							<button
								type="button"
								onClick={() => fileInputRef.current?.click()}
								className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
							>
								<IconUpload size={16} />
								<span>Unggah Avatar</span>
							</button>
						</div>

						<div>
							<label htmlFor="name-input" className="mb-1.5 block text-sm font-medium text-gray-700">
								Nama
							</label>
							<input
								id="name-input"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Nama lengkap Anda"
								className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
							/>
							{!isNameValid && <p className="mt-1 text-xs text-red-600">Nama tidak boleh kosong.</p>}
						</div>

						<div className="flex justify-end gap-4">
							<Dialog.Close asChild>
								<button
									type="button"
									disabled={isSubmitting}
									className="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
								>
									Batal
								</button>
							</Dialog.Close>
							<button
								type="submit"
								disabled={!canSubmit}
								className={clsx(
									"cursor-pointer rounded-md px-4 py-2 text-sm font-medium text-white transition-colors",
									"bg-red-600 hover:bg-red-700",
									"disabled:cursor-not-allowed disabled:bg-red-300",
								)}
							>
								{isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
							</button>
						</div>
					</form>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
