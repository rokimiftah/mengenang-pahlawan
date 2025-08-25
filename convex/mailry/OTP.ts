// convex/mailry/OTP.ts

import { customAlphabet } from "nanoid";

import { Email } from "@convex-dev/auth/providers/Email";
import { render } from "@react-email/render";

import { VerificationCodeEmail } from "../../src/components/auth/template/VerificationCodeEmail";
import { sendMailryEmailHTTPAccounts } from "./mailryHttp";

export const OTP = Email({
	id: "otp",
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
			VerificationCodeEmail({
				code: token,
				expires: new Date(expMs),
				minutesUntilExpiry,
			}),
		);

		const text = `
			Terima kasih telah memulai pembuatan akun. Kami ingin memastikan itu benar-benar Anda. Harap masukkan kode verifikasi berikut: ${token}.
			Jangan bagikan kode ini kepada siapa pun. Kode berlaku ${minutesUntilExpiry} menit.
			Jika Anda tidak merasa meminta kode, abaikan email ini.
		`;

		await sendMailryEmailHTTPAccounts({
			to: email,
			subject: "Mengenang Pahlawan: Verifikasi Email Anda",
			html,
			text,
		});
	},
});
