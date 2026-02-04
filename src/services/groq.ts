import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Default model to use. Using a versatile model by default.
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export interface GroqCompletionOptions {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    systemPrompt?: string;
}

/**
 * Generates a standard chat completion (string output).
 * @param prompt The user's input prompt.
 * @param options Configuration options.
 * @returns The generated text.
 */
export async function getChatCompletion(
    prompt: string,
    options: GroqCompletionOptions = {}
): Promise<string> {
    const {
        model = DEFAULT_MODEL,
        temperature = 0.7,
        max_tokens = 1024,
        systemPrompt,
    } = options;

    const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [];

    if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
    }

    messages.push({ role: "user", content: prompt });

    try {
        const completion = await groq.chat.completions.create({
            messages,
            model,
            temperature,
            max_tokens,
        });

        return completion.choices[0]?.message?.content || "";
    } catch (error) {
        console.error("Error creating chat completion:", error);
        throw error;
    }
}

/**
 * Generates a JSON output.
 * @param prompt The user's input prompt.
 * @param options Configuration options.
 * @returns The parsed JSON object.
 */
export async function getJsonCompletion<T = any>(
    prompt: string,
    options: GroqCompletionOptions = {}
): Promise<T> {
    const {
        model = DEFAULT_MODEL,
        temperature = 0.5, // Lower temperature for structured output stability
        max_tokens = 2048,
        systemPrompt = "You are a helpful assistant that outputs strictly in JSON format.",
    } = options;

    // Ensure strict JSON instruction in system prompt
    const finalSystemPrompt = systemPrompt.includes("JSON")
        ? systemPrompt
        : `${systemPrompt} Output strictly in JSON format.`;

    const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "system", content: finalSystemPrompt },
        { role: "user", content: prompt },
    ];

    try {
        const completion = await groq.chat.completions.create({
            messages,
            model,
            // @ts-ignore - Groq types might not be perfectly up to date with all params, but this is standard
            response_format: { type: "json_object" },
            temperature,
            max_tokens,
        });

        const content = completion.choices[0]?.message?.content || "{}";

        try {
            return JSON.parse(content) as T;
        } catch (parseError) {
            console.error("Failed to parse JSON response:", content);
            throw new Error("Failed to parse JSON response from LLM");
        }
    } catch (error) {
        console.error("Error creating JSON completion:", error);
        throw error;
    }
}
