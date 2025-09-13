// src/features/auth/ui/AuthenticationForm.tsx
/** biome-ignore-all lint/suspicious/noExplicitAny: <> */

import { useCallback, useEffect, useRef, useState } from "react";

import { useAuthActions } from "@convex-dev/auth/react";
import { Anchor, Button, Center, Divider, Group, Paper, PasswordInput, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useToggle } from "@mantine/hooks";
import { ConvexReactClient } from "convex/react";
import { ConvexError } from "convex/values";
import isEmail from "validator/lib/isEmail";
import { useLocation } from "wouter";

import { api } from "@convex/_generated/api";

import { ErrorModalAuth } from "./ErrorModalAuth";
import { GitHubButton } from "./GitHubButton";
import { PasswordStrength } from "./PasswordStrength";

const convex = new ConvexReactClient(import.meta.env.PUBLIC_CONVEX_URL, {
	logger: false,
});

interface AuthFormValues {
	email: string;
	password: string;
	confirmPassword: string;
	code: string;
	newPassword: string;
}

export function AuthenticationForm({
	initialType,
	initialEmail,
}: {
	initialType?: "signIn" | "signUp" | "verify" | "forgot" | "reset";
	initialEmail?: string;
}) {
	const [, navigate] = useLocation();
	const { signIn } = useAuthActions();
	const [type, toggle] = useToggle<"signIn" | "signUp" | "verify" | "forgot" | "reset">([
		"signIn",
		"signUp",
		"verify",
		"forgot",
		"reset",
	]);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [email, setEmail] = useState<string | null>(null);

	const form = useForm<AuthFormValues>({
		initialValues: {
			email: "",
			password: "",
			confirmPassword: "",
			code: "",
			newPassword: "",
		},
		validate: {
			email: (value) => (isEmail(value) ? null : "Alamat email tidak valid"),
			password: (value) => {
				if (type === "signUp") {
					if (value.length < 6) return "Kata sandi minimal 6 karakter";
					if (!/[0-9]/.test(value)) return "Kata sandi harus mengandung angka";
					if (!/[a-z]/.test(value)) return "Kata sandi harus mengandung huruf kecil";
					if (!/[A-Z]/.test(value)) return "Kata sandi harus mengandung huruf besar";
					if (!/[$&+,:;=?@#|'<>.^*()%!-]/.test(value)) return "Kata sandi harus mengandung simbol khusus";
				}
				if (type === "signIn" && value.length === 0) {
					return "Kata sandi tidak boleh kosong";
				}
				return null;
			},
			confirmPassword: (value, values) =>
				type === "signUp" && value !== values.password ? "Konfirmasi kata sandi tidak sama" : null,
			code: (value) => ((type === "verify" || type === "reset") && value.length !== 6 ? "Kode verifikasi harus 6 digit" : null),
			newPassword: (value) => {
				if (type === "reset") {
					if (value.length === 0) return "Kata sandi baru tidak boleh kosong";
					if (value.length < 6) return "Kata sandi baru minimal 6 karakter";
					if (!/[0-9]/.test(value)) return "Kata sandi baru harus mengandung angka";
					if (!/[a-z]/.test(value)) return "Kata sandi baru harus mengandung huruf kecil";
					if (!/[A-Z]/.test(value)) return "Kata sandi baru harus mengandung huruf besar";
					if (!/[$&+,:;=?@#|'<>.^*()%!-]/.test(value)) return "Kata sandi baru harus mengandung simbol khusus";
				}
				return null;
			},
		},
	});

	// Apply initial route intent (optional) once on mount
	const initRef = useRef(false);
	useEffect(() => {
		if (initRef.current) return;
		initRef.current = true;
		if (initialType) toggle(initialType as any);
		if (initialEmail) {
			setEmail(initialEmail);
			// keep form value in sync for backend flows that read from formData
			form.setFieldValue("email", initialEmail);
		}
	}, [initialType, initialEmail, toggle, form]);

	const handleGitHubLogin = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			await signIn("github", { redirectTo: "/pahlawan" });
		} catch (error: unknown) {
			const errorMessage =
				error instanceof ConvexError
					? (error.data as { message: string }).message || "Gagal masuk dengan GitHub"
					: "Gagal masuk dengan GitHub";
			setError(errorMessage);
			setIsLoading(false);
		}
	}, [signIn]);

	const handleFormSubmit = useCallback(
		async (values: AuthFormValues) => {
			setIsLoading(true);
			setError(null);
			const formData = new FormData();
			const effectiveEmail = (values.email?.trim() || email || "").toLowerCase();
			const normalizedEmail = effectiveEmail;
			formData.set("email", normalizedEmail);

			try {
				if (type === "signIn" || type === "signUp" || type === "forgot") {
					const userExists = await convex.query(api.users.checkUserExists, {
						email: normalizedEmail,
					});

					if (type === "signIn" && !userExists) {
						setIsLoading(false);
						setError("Email atau kata sandi salah");
						return;
					}

					if (type === "signIn" && userExists) {
						const providers = await convex.query(api.users.checkUserProvider, {
							email: normalizedEmail,
						});
						if (providers?.includes("github") && !providers.includes("password")) {
							setIsLoading(false);
							setError("Email ini terdaftar melalui GitHub");
							return;
						}
					}

					if (type === "forgot" && userExists) {
						const providers = await convex.query(api.users.checkUserProvider, {
							email: normalizedEmail,
						});
						if (providers?.includes("github") && !providers.includes("password")) {
							setIsLoading(false);
							setError("Email ini terdaftar melalui GitHub");
							return;
						}
					}

					if (type === "signUp" && userExists) {
						setIsLoading(false);
						setError("Email ini sudah terdaftar");
						return;
					}

					if (type === "forgot" && !userExists) {
						setIsLoading(false);
						setError("Tidak ada pengguna terdaftar dengan email ini");
						return;
					}
				}

				if (type === "signIn") {
					formData.set("flow", "signIn");
					formData.set("password", values.password);
				} else if (type === "signUp") {
					formData.set("flow", "signUp");
					formData.set("password", values.password);
				} else if (type === "verify") {
					formData.set("flow", "email-verification");
					formData.set("code", values.code);
				} else if (type === "forgot") {
					formData.set("flow", "reset");
				} else if (type === "reset") {
					formData.set("flow", "reset-verification");
					formData.set("code", values.code);
					formData.set("newPassword", values.newPassword);
				}

				const result = await signIn("password", formData);

				if (type === "signIn" && !result.signingIn) {
					const isVerified = await convex.query(api.users.getUserVerificationStatus, {
						email: normalizedEmail,
					});
					if (!isVerified) {
						navigate(`/verify-email?email=${encodeURIComponent(normalizedEmail)}`);
						setIsLoading(false);
						return;
					}
				} else if (type === "signUp" && !result.signingIn) {
					navigate(`/verify-email?email=${encodeURIComponent(normalizedEmail)}`);
				} else if (type === "forgot" && !result.signingIn) {
					navigate(`/reset-password?email=${encodeURIComponent(normalizedEmail)}`);
				} else if (type === "verify" && !result.signingIn) {
					try {
						await convex.mutation(api.users.verifyEmail, {
							email: normalizedEmail,
							code: values.code,
						});
						navigate("/login");
					} catch (verifyError: unknown) {
						const errorMessage =
							verifyError instanceof ConvexError
								? (verifyError.data as { message: string }).message || "Gagal verifikasi email"
								: "Gagal verifikasi email";
						setError(errorMessage);
						setIsLoading(false);
						return;
					}
				} else if (type === "reset" && !result.signingIn) {
					navigate("/login");
				}
			} catch (error: unknown) {
				let errorMessage: string;
				if (error instanceof ConvexError) {
					const errorData = error.data as { message: string };
					if (
						type === "signIn" &&
						(errorData.message === "Invalid credentials" || errorData.message.includes("Invalid password"))
					) {
						errorMessage = "Email atau kata sandi salah";
					} else {
						errorMessage =
							errorData.message ||
							(type === "verify"
								? "Kode verifikasi tidak valid atau sudah kedaluwarsa"
								: type === "reset"
									? "Kode pemulihan tidak valid atau sudah kedaluwarsa"
									: "Terjadi kesalahan yang tidak terduga");
					}
				} else {
					errorMessage =
						type === "signIn"
							? "Email atau kata sandi salah"
							: type === "verify"
								? "Kode verifikasi tidak valid atau sudah kedaluwarsa"
								: type === "reset"
									? "Kode pemulihan tidak valid atau sudah kedaluwarsa"
									: "Terjadi kesalahan yang tidak terduga";
				}
				setError(errorMessage);
			} finally {
				setIsLoading(false);
			}
		},
		[signIn, type, navigate, email],
	);

	return (
		<Center className="min-h-dvh px-4 py-6 sm:py-8">
			<Paper
				radius="lg"
				withBorder
				className="w-full max-w-[26rem] p-4 sm:max-w-sm sm:p-6 md:max-w-md md:p-8"
				aria-labelledby="auth-title"
				bg="dark"
			>
				<Text id="auth-title" size="lg" fw={700} ta="center" className="mb-6 sm:mb-8">
					Mengenang Pahlawan
				</Text>

				{(type === "signIn" || type === "signUp") && (
					<>
						<Group grow className="mt-6 mb-0 sm:mt-7">
							<GitHubButton radius="xl" onClick={handleGitHubLogin} disabled={isLoading}>
								GitHub
							</GitHubButton>
						</Group>
						<Divider label="Atau lanjutkan dengan email" labelPosition="center" className="my-6 sm:my-7" />
					</>
				)}

				<form onSubmit={form.onSubmit(handleFormSubmit)} aria-disabled={isLoading}>
					<fieldset disabled={isLoading}>
						{(type === "signIn" || type === "signUp" || type === "forgot") && (
							<div>
								<Group mb="5">
									<Text size="sm" fw={500}>
										Email <span className="text-red-500">*</span>
									</Text>
								</Group>
								<TextInput
									placeholder="nama@domain.com"
									radius="md"
									aria-label="Alamat email"
									autoComplete="email"
									size="md"
									{...form.getInputProps("email")}
								/>
							</div>
						)}

						{(type === "verify" || type === "reset") && email && (
							<div className={["mt-6 sm:mt-7", type === "reset" ? "mb-6 sm:mb-7" : ""].join(" ")}>
								<Text ta="center" className="mb-8 sm:mb-10">
									Kode verifikasi telah dikirim ke {email}.
								</Text>
								<Group mb="5">
									<Text size="sm" fw={500}>
										Kode Verifikasi <span className="text-red-500">*</span>
									</Text>
								</Group>
								<TextInput
									placeholder="Masukkan 6 digit kode"
									radius="md"
									aria-label="Kode verifikasi"
									inputMode="numeric"
									maxLength={6}
									size="md"
									{...form.getInputProps("code")}
								/>
							</div>
						)}

						{type === "signIn" && (
							<div className="mt-6 sm:mt-7">
								<Group mb="5" justify="space-between" className="items-center">
									<Text size="sm" fw={500}>
										Kata Sandi <span className="text-red-500">*</span>
									</Text>
									<Anchor
										href="/forgot-password"
										fz="xs"
										fw={500}
										onClick={(e) => {
											e.preventDefault();
											navigate("/forgot-password");
										}}
										underline="hover"
									>
										Lupa kata sandi?
									</Anchor>
								</Group>
								<PasswordInput
									placeholder="••••••"
									radius="md"
									aria-label="Kata sandi"
									autoComplete="current-password"
									size="md"
									{...form.getInputProps("password")}
								/>
							</div>
						)}

						{type === "signUp" && (
							<>
								<Group mb="5" className="mt-6 sm:mt-7">
									<Text size="sm" fw={500}>
										Kata Sandi <span className="text-red-500">*</span>
									</Text>
								</Group>
								<PasswordInput
									placeholder="••••••"
									radius="md"
									aria-label="Kata sandi"
									autoComplete="new-password"
									size="md"
									{...form.getInputProps("password")}
								/>
								<Group mb="5" className="mt-6 sm:mt-7">
									<Text size="sm" fw={500}>
										Konfirmasi Kata Sandi <span className="text-red-500">*</span>
									</Text>
								</Group>
								<PasswordInput
									placeholder="••••••"
									radius="md"
									aria-label="Konfirmasi kata sandi"
									autoComplete="new-password"
									size="md"
									{...form.getInputProps("confirmPassword")}
								/>
								<PasswordStrength password={form.values.password} />
							</>
						)}

						{type === "reset" && (
							<>
								<Group mb="5" className="mt-6 sm:mt-7">
									<Text size="sm" fw={500}>
										Kata Sandi Baru <span className="text-red-500">*</span>
									</Text>
								</Group>
								<PasswordInput
									placeholder="••••••"
									radius="md"
									aria-label="Kata sandi baru"
									autoComplete="new-password"
									size="md"
									{...form.getInputProps("newPassword")}
								/>
								<PasswordStrength password={form.values.newPassword} />
							</>
						)}

						<ErrorModalAuth error={error} onClose={() => setError(null)} />

						<Group className="mt-8 flex w-full flex-col-reverse gap-3 sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
							<Anchor
								component="button"
								type="button"
								size="xs"
								underline="hover"
								c="#a3a3a3"
								onClick={() => {
									if (type === "signIn") navigate("/register");
									else navigate("/login");
								}}
								className="text-center sm:text-left"
							>
								{type === "signIn"
									? "Belum punya akun? Daftar"
									: type === "signUp"
										? "Sudah punya akun? Masuk"
										: "Kembali ke Masuk"}
							</Anchor>

							<Button
								type="submit"
								radius="xl"
								loading={isLoading}
								loaderProps={{ color: "#000000" }}
								className="w-full bg-[#f5d90a] text-[#111110] transition-all duration-200 hover:bg-[#f5d90ae6] sm:w-36"
							>
								{type === "signIn" ? "Masuk" : type === "signUp" ? "Daftar" : type === "forgot" ? "Kirim Kode" : "Lanjutkan"}
							</Button>
						</Group>
					</fieldset>
				</form>
			</Paper>
		</Center>
	);
}
