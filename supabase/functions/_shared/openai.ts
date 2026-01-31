/**
 * OpenAI Client using AI SDK
 *
 * Simple wrapper around AI SDK for generating text completions.
 */

import { createOpenAI } from "npm:@ai-sdk/openai@1.3.22";
import { generateText } from "npm:ai@4.3.16";

const DEFAULT_MODEL = "gpt-4o";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionResult {
  content: string;
  finishReason: string;
}

/**
 * Create a chat completion using AI SDK.
 * Returns null if API key is missing (graceful degradation).
 */
export async function createChatCompletion(
  messages: ChatMessage[],
  options: { model?: string; temperature?: number; maxTokens?: number } = {}
): Promise<ChatCompletionResult | null> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");

  if (!apiKey) {
    console.warn("OPENAI_API_KEY not set - skipping LLM message generation");
    return null;
  }

  const { model = DEFAULT_MODEL, temperature = 0.7, maxTokens = 256 } = options;

  try {
    const openai = createOpenAI({ apiKey });

    const { text, finishReason } = await generateText({
      model: openai(model),
      messages,
      temperature,
      maxTokens,
    });

    return {
      content: text,
      finishReason: finishReason || "unknown",
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return null;
  }
}
