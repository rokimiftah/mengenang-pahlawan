// convex/mailry/mailryHttp.ts

export async function sendMailryEmailHTTPAccounts(params: {
	to: string;
	subject: string;
	html: string | Promise<string>;
	text?: string;
	attachments?: string[];
}) {
	const html = await params.html;
	const resp = await fetch("https://api.mailry.co/ext/inbox/send", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${process.env.MAILRY_API_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			emailId: process.env.MAILRY_EMAIL_ID_ACCOUNTS,
			to: params.to,
			subject: params.subject,
			htmlBody: html,
			plainBody: params.text ?? "",
			attachments: params.attachments ?? [],
		}),
	});

	if (!resp.ok) {
		const body = await resp.text();
		throw new Error(`Mailry API failed: ${resp.status} ${body}`);
	}
	try {
		return await resp.json();
	} catch {
		return null;
	}
}

export async function sendMailryEmailHTTPNotifications(params: {
	to: string;
	subject: string;
	html: string | Promise<string>;
	text?: string;
	attachments?: string[];
}) {
	const html = await params.html;
	const resp = await fetch("https://api.mailry.co/ext/inbox/send", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${process.env.MAILRY_API_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			emailId: process.env.MAILRY_EMAIL_ID_NOTIFICATIONS,
			to: params.to,
			subject: params.subject,
			htmlBody: html,
			plainBody: params.text ?? "",
			attachments: params.attachments ?? [],
		}),
	});

	if (!resp.ok) {
		const body = await resp.text();
		throw new Error(`Mailry API failed: ${resp.status} ${body}`);
	}
	try {
		return await resp.json();
	} catch {
		return null;
	}
}
