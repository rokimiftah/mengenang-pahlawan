// convex/lib/unli.ts
/** biome-ignore-all lint/suspicious/noExplicitAny: <> */

import OpenAI from "openai";

export const unli = new OpenAI({
	apiKey: process.env.UNLI_API_KEY,
	baseURL: process.env.UNLI_API_URL,
});

export async function generateTextUnli(
	prompt: string,
	temperature = 0.2,
): Promise<string> {
	try {
		const res = await unli.responses.create({
			model: "auto",
			input: prompt,
			temperature,
		} as any);
		return (
			(res as any).output_text ??
			(res as any).output?.[0]?.content?.[0]?.text ??
			(res as any).choices?.[0]?.message?.content ??
			""
		);
	} catch (e: any) {
		if (e?.status === 400 || e?.status === 404) {
			const chat = await unli.chat.completions.create({
				model: "auto",
				messages: [{ role: "user", content: prompt }],
				temperature,
			});
			return chat.choices?.[0]?.message?.content ?? "";
		}
		throw e;
	}
}
