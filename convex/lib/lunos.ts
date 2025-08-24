// convex/lib/lunos.ts
/** biome-ignore-all lint/suspicious/noExplicitAny: <> */

import OpenAI from "openai";

export const lunos = new OpenAI({
	apiKey: process.env.LUNOS_API_KEY,
	baseURL: process.env.LUNOS_API_URL,
});

export async function generateText(
	prompt: string,
	temperature = 0.2,
): Promise<string> {
	try {
		const res = await lunos.responses.create({
			model: "openai/gpt-5-nano",
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
			const chat = await lunos.chat.completions.create({
				model: "openai/gpt-5-nano",
				messages: [{ role: "user", content: prompt }],
				temperature,
			});
			return chat.choices?.[0]?.message?.content ?? "";
		}
		throw e;
	}
}
