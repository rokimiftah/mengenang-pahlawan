// convex/otp.ts

import { customAlphabet } from "nanoid";
import { Resend as ResendAPI } from "resend";

import { Email } from "@convex-dev/auth/providers/Email";

import { PasswordResetEmail } from "../src/components/auth/templates/PasswordResetEmail";
import { VerificationEmail } from "../src/components/auth/templates/VerificationEmail";

export const otpVerificationEmail = Email({
	id: "otp-verification-email",
	apiKey: process.env.MAIL_API_KEY,
	maxAge: 10 * 60, // 10 minutes
	async generateVerificationToken() {
		const nanoid = customAlphabet("0123456789", 6);
		const token = nanoid();
		return token;
	},
	async sendVerificationRequest({
		identifier: email,
		provider,
		token,
		expires,
	}) {
		const expMs =
			typeof expires === "number"
				? expires < 1e12
					? expires * 1000
					: expires
				: +expires;

		const minutesUntilExpiry = Math.max(
			0,
			Math.ceil((expMs - Date.now()) / 60000),
		);
		const resend = new ResendAPI(provider.apiKey);
		const { error } = await resend.emails.send({
			from: "Mengenang Pahlawan <accounts@mengenangpahlawan.web.id>",
			to: [email],
			subject: "Verifikasi Email Anda",
			react: VerificationEmail({
				code: token,
				expires,
				minutesUntilExpiry,
			}),
		});
		if (error) {
			throw new Error(`Could not send email: ${error.message}`);
		}
	},
});

export const otpPasswordReset = Email({
	id: "otp-password-reset",
	apiKey: process.env.MAIL_API_KEY,
	async generateVerificationToken() {
		const nanoid = customAlphabet("0123456789", 6);
		const token = nanoid();
		return token;
	},
	async sendVerificationRequest({
		identifier: email,
		provider,
		token,
		expires,
	}) {
		const expMs =
			typeof expires === "number"
				? expires < 1e12
					? expires * 1000
					: expires
				: +expires;

		const minutesUntilExpiry = Math.max(
			0,
			Math.ceil((expMs - Date.now()) / 60000),
		);
		const resend = new ResendAPI(provider.apiKey);
		const { error } = await resend.emails.send({
			from: "Mengenang Pahlawan <accounts@mengenangpahlawan.web.id>",
			to: [email],
			subject: "Reset Kata Sandi",
			react: PasswordResetEmail({
				code: token,
				expires,
				minutesUntilExpiry,
			}),
		});
		if (error) {
			throw new Error(`Could not send email: ${error.message}`);
		}
	},
});
