// convex/mailry/OTPPasswordReset.ts

import { customAlphabet } from "nanoid";

import { Email } from "@convex-dev/auth/providers/Email";
import { render } from "@react-email/render";

import { PasswordResetEmail } from "../../src/components/auth/template/PasswordResetEmail";
import { sendMailryEmailHTTPAccounts } from "./mailryHttp";

export const OTPPasswordReset = Email({
	id: "otp-password-reset",
	maxAge: 10 * 60,
	async generateVerificationToken() {
		const nanoid = customAlphabet("0123456789", 6);
		return nanoid();
	},
	async sendVerificationRequest({ identifier: email, token, expires }) {
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

		const html = render(
			PasswordResetEmail({
				code: token,
				expires: new Date(expMs),
				minutesUntilExpiry,
			}),
		);

		const text = `
			Hai! Gunakan kode ${token} untuk mengatur ulang kata sandi Anda.
			Kami mengirim email ini karena ada permintaan reset kata sandi di Mengenang Pahlawan untuk alamat ini.
			Jika Anda tidak meminta reset, abaikan email ini. Kode berlaku ${minutesUntilExpiry} menit.
		`;

		await sendMailryEmailHTTPAccounts({
			to: email,
			subject: "Mengenang Pahlawan: Reset Kata Sandi",
			html,
			text,
		});
	},
});
