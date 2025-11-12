// convex/lib/llm.ts
/** biome-ignore-all lint/suspicious/noExplicitAny: <> */

import OpenAI from "openai";

export async function llm(prompt: string, temperature: number): Promise<string> {
  const openai = new OpenAI({
    apiKey: process.env.LLM_API_KEY,
    baseURL: process.env.LLM_API_URL,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.LLM_MODEL as string,
      messages: [{ role: "user", content: prompt }],
      temperature,
    });
    return completion.choices?.[0]?.message?.content ?? "";
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      console.error(`OpenAI API Error: Status ${error.status}, Message: ${error.message}`);
      throw new Error(`Failed to generate completion due to API error: ${error.message}`);
    } else {
      console.error("An unexpected error occurred:", error);
      throw new Error("An unexpected error occurred while generating completion.");
    }
  }
}
