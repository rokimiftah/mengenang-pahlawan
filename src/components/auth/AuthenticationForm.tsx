// src/components/auth/AuthenticationForm.tsx

import { useCallback, useState } from "react";

import { ConvexReactClient } from "convex/react";
import { ConvexError } from "convex/values";
import isEmail from "validator/lib/isEmail";

import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@convex/_generated/api";
import {
	Anchor,
	Button,
	Center,
	Divider,
	Group,
	Paper,
	PasswordInput,
	Text,
	TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useToggle } from "@mantine/hooks";

import { ErrorModalAuth } from "./ui/ErrorModalAuth";
import { GitHubButton } from "./ui/GitHubButton";
import { PasswordStrength } from "./ui/PasswordStrength";

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

export function AuthenticationForm() {
	const { signIn } = useAuthActions();
	const [type, toggle] = useToggle<
		"signIn" | "signUp" | "verify" | "forgot" | "reset"
	>(["signIn", "signUp", "verify", "forgot", "reset"]);
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
					if (!/[a-z]/.test(value))
						return "Kata sandi harus mengandung huruf kecil";
					if (!/[A-Z]/.test(value))
						return "Kata sandi harus mengandung huruf besar";
					if (!/[$&+,:;=?@#|'<>.^*()%!-]/.test(value))
						return "Kata sandi harus mengandung simbol khusus";
				}
				if (type === "signIn" && value.length === 0) {
					return "Kata sandi tidak boleh kosong";
				}
				return null;
			},
			confirmPassword: (value, values) =>
				type === "signUp" && value !== values.password
					? "Konfirmasi kata sandi tidak sama"
					: null,
			code: (value) =>
				(type === "verify" || type === "reset") && value.length !== 6
					? "Kode verifikasi harus 6 digit"
					: null,
			newPassword: (value) => {
				if (type === "reset") {
					if (value.length === 0) return "Kata sandi baru tidak boleh kosong";
					if (value.length < 6) return "Kata sandi baru minimal 6 karakter";
					if (!/[0-9]/.test(value))
						return "Kata sandi baru harus mengandung angka";
					if (!/[a-z]/.test(value))
						return "Kata sandi baru harus mengandung huruf kecil";
					if (!/[A-Z]/.test(value))
						return "Kata sandi baru harus mengandung huruf besar";
					if (!/[$&+,:;=?@#|'<>.^*()%!-]/.test(value))
						return "Kata sandi baru harus mengandung simbol khusus";
				}
				return null;
			},
		},
	});

	const handleGitHubLogin = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			await signIn("github", { redirectTo: "/pahlawan" });
		} catch (error: unknown) {
			const errorMessage =
				error instanceof ConvexError
					? (error.data as { message: string }).message ||
						"Gagal masuk dengan GitHub"
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
			const normalizedEmail = values.email.trim().toLowerCase();
			formData.set("email", normalizedEmail);

			try {
				if (type === "signIn" || type === "signUp" || type === "forgot") {
					const userExists = await convex.query(api.users.checkUserExists, {
						email: normalizedEmail,
					});

					if (type === "signIn" && !userExists) {
						setIsLoading(false);
						setError("Email atau kata sandi tidak valid");
						return;
					}

					if (type === "signIn" && userExists) {
						const providers = await convex.query(api.users.checkUserProvider, {
							email: normalizedEmail,
						});
						if (
							providers?.includes("github") &&
							!providers.includes("password")
						) {
							setIsLoading(false);
							setError("Email ini terdaftar melalui GitHub");
							return;
						}
					}

					if (type === "forgot" && userExists) {
						const providers = await convex.query(api.users.checkUserProvider, {
							email: normalizedEmail,
						});
						if (
							providers?.includes("github") &&
							!providers.includes("password")
						) {
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
					const isVerified = await convex.query(
						api.users.getUserVerificationStatus,
						{
							email: normalizedEmail,
						},
					);
					if (!isVerified) {
						setEmail(normalizedEmail);
						toggle("verify");
						setError(
							"Email belum terverifikasi. Silakan verifikasi email Anda",
						);
						setIsLoading(false);
						return;
					}
				} else if (type === "signUp" && !result.signingIn) {
					setEmail(normalizedEmail);
					toggle("verify");
				} else if (type === "forgot" && !result.signingIn) {
					setEmail(normalizedEmail);
					toggle("reset");
				} else if (type === "verify" && !result.signingIn) {
					try {
						await convex.mutation(api.users.verifyEmail, {
							email: normalizedEmail,
							code: values.code,
						});
						toggle("signIn");
					} catch (verifyError: unknown) {
						const errorMessage =
							verifyError instanceof ConvexError
								? (verifyError.data as { message: string }).message ||
									"Gagal verifikasi email"
								: "Gagal verifikasi email";
						setError(errorMessage);
						setIsLoading(false);
						return;
					}
				} else if (type === "reset" && !result.signingIn) {
					toggle("signIn");
				}
			} catch (error: unknown) {
				let errorMessage: string;
				if (error instanceof ConvexError) {
					const errorData = error.data as { message: string };
					if (
						type === "signIn" &&
						(errorData.message === "Invalid credentials" ||
							errorData.message.includes("Invalid password"))
					) {
						errorMessage = "Email atau kata sandi tidak valid";
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
							? "Email atau kata sandi tidak valid"
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
		[signIn, type, toggle],
	);

	const toggleType = useCallback(
		(newType: "signIn" | "signUp" | "forgot") => {
			toggle(newType);
			form.reset();
			setError(null);
			setEmail(null);
		},
		[form, toggle],
	);

	return (
		<Center h="100dvh">
			<Paper
				radius="md"
				p="xl"
				withBorder
				className="w-full max-w-md"
				aria-labelledby="auth-title"
				bg="dark"
			>
				<Text id="auth-title" size="md" fw={700} ta="center" mb="xl">
					Mengenang Pahlawan
				</Text>

				{(type === "signIn" || type === "signUp") && (
					<>
						<Group grow mb="md" mt="md">
							<GitHubButton
								radius="xl"
								onClick={handleGitHubLogin}
								disabled={isLoading}
							>
								GitHub
							</GitHubButton>
						</Group>
						<Divider
							label="Atau lanjutkan dengan email"
							labelPosition="center"
							mt="xl"
							mb="lg"
						/>
					</>
				)}

				<form
					onSubmit={form.onSubmit(handleFormSubmit)}
					aria-disabled={isLoading}
				>
					<fieldset disabled={isLoading}>
						{(type === "signIn" || type === "signUp" || type === "forgot") && (
							<>
								<Group mb="5">
									<Text size="sm" fw={500}>
										Email <span className="text-red-500">*</span>
									</Text>
								</Group>
								<TextInput
									placeholder="nama@domain.com"
									radius="md"
									aria-label="Alamat email"
									{...form.getInputProps("email")}
								/>
							</>
						)}

						{(type === "verify" || type === "reset") && email && (
							<>
								<Text ta="center" mb="xl">
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
									{...form.getInputProps("code")}
								/>
							</>
						)}

						{type === "signIn" && (
							<>
								<Group justify="space-between" mb="5" mt="25">
									<Text size="sm" fw={500}>
										Kata Sandi <span className="text-red-500">*</span>
									</Text>
									<Anchor
										href="#"
										fz="xs"
										fw={500}
										onClick={(event) => {
											event.preventDefault();
											toggleType("forgot");
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
									{...form.getInputProps("password")}
								/>
							</>
						)}

						{type === "signUp" && (
							<>
								<Group mb="5" mt="25">
									<Text size="sm" fw={500}>
										Kata Sandi <span className="text-red-500">*</span>
									</Text>
								</Group>
								<PasswordInput
									placeholder="••••••"
									radius="md"
									aria-label="Kata sandi"
									{...form.getInputProps("password")}
								/>
								<Group mb="5" mt="25">
									<Text size="sm" fw={500}>
										Konfirmasi Kata Sandi{" "}
										<span className="text-red-500">*</span>
									</Text>
								</Group>
								<PasswordInput
									placeholder="••••••"
									radius="md"
									aria-label="Konfirmasi kata sandi"
									{...form.getInputProps("confirmPassword")}
								/>
								<PasswordStrength password={form.values.password} />
							</>
						)}

						{type === "reset" && (
							<>
								<Group mb="5" mt="25">
									<Text size="sm" fw={500}>
										Kata Sandi Baru <span className="text-red-500">*</span>
									</Text>
								</Group>
								<PasswordInput
									placeholder="••••••"
									radius="md"
									aria-label="Kata sandi baru"
									{...form.getInputProps("newPassword")}
								/>
								<PasswordStrength password={form.values.newPassword} />
							</>
						)}

						<ErrorModalAuth error={error} onClose={() => setError(null)} />

						<Group justify="space-between" mt="xl">
							<Anchor
								component="button"
								type="button"
								size="xs"
								underline="hover"
								c="#a3a3a3"
								onClick={() =>
									toggleType(
										type === "signIn"
											? "signUp"
											: type === "signUp"
												? "signIn"
												: "signIn",
									)
								}
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
								className="w-32 bg-[#f5d90a] text-[#111110] transition-all duration-200 hover:bg-[#f5d90ae6]"
							>
								{type === "signIn"
									? "Masuk"
									: type === "signUp"
										? "Daftar"
										: type === "forgot"
											? "Kirim Kode"
											: "Lanjutkan"}
							</Button>
						</Group>
					</fieldset>
				</form>
			</Paper>
		</Center>
	);
}
