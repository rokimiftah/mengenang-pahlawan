// convex/lib/llm.ts
/** biome-ignore-all lint/suspicious/noExplicitAny: <> */

import OpenAI from "openai";

export const llm = new OpenAI({
	apiKey: process.env.LLM_API_KEY,
	baseURL: process.env.LLM_API_URL,
});

export async function generateText(
	prompt: string,
	temperature = 0.2,
): Promise<string> {
	try {
		const res = await llm.responses.create({
			model: process.env.LLM_MODEL,
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
			const chat = await llm.chat.completions.create({
				model: process.env.LLM_MODEL as string,
				messages: [{ role: "user", content: prompt }],
				temperature,
			});
			return chat.choices?.[0]?.message?.content ?? "";
		}
		throw e;
	}
}
