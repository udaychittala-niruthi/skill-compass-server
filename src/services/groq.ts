import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Default model to use.
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

// Fallback models in order of preference
const FALLBACK_MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768",
    "gemma2-9b-it"
];

export interface GroqCompletionOptions {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    systemPrompt?: string;
}

/**
 * Helper to retry an operation with fallback models on rate limit errors.
 */
async function withModelFallback<T>(
    operation: (model: string) => Promise<T>,
    preferredModel: string = DEFAULT_MODEL
): Promise<T> {
    const modelsToTry = [
        preferredModel,
        ...FALLBACK_MODELS.filter(m => m !== preferredModel)
    ];

    let lastError: any;

    for (const model of modelsToTry) {
        try {
            return await operation(model);
        } catch (error: any) {
            console.warn(`Groq request failed with model ${model}:`, error.message);
            lastError = error;

            const isRateLimit = error?.status === 429 || error?.code === 'rate_limit_exceeded' || (error?.message && error.message.includes('429'));

            if (isRateLimit) {
                console.log(`Switching to next model due to rate limit...`);
                continue; // Try next model
            }

            throw error; // Rethrow non-retryable errors
        }
    }

    throw lastError;
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
        temperature = 0.7,
        max_tokens = 1024,
        systemPrompt,
        model: requestedModel
    } = options;

    const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [];

    if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
    }

    messages.push({ role: "user", content: prompt });

    return withModelFallback(async (model) => {
        const completion = await groq.chat.completions.create({
            messages,
            model,
            temperature,
            max_tokens,
        });

        return completion.choices[0]?.message?.content || "";
    }, requestedModel);
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
        temperature = 0.5, // Lower temperature for structured output stability
        max_tokens = 2048,
        systemPrompt = "You are a helpful assistant that outputs strictly in JSON format.",
        model: requestedModel
    } = options;

    // Ensure strict JSON instruction in system prompt
    const finalSystemPrompt = systemPrompt.includes("JSON")
        ? systemPrompt
        : `${systemPrompt} Output strictly in JSON format.`;

    const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "system", content: finalSystemPrompt },
        { role: "user", content: prompt },
    ];

    return withModelFallback(async (model) => {
        const completion = await groq.chat.completions.create({
            messages,
            model,
            // @ts-ignore
            response_format: { type: "json_object" },
            temperature,
            max_tokens,
        });

        const content = completion.choices[0]?.message?.content || "{}";

        try {
            return JSON.parse(content) as T;
        } catch (parseError) {
            console.error(`Failed to parse JSON response from model ${model}:`, content);
            throw new Error(`Failed to parse JSON response from LLM (${model})`);
        }
    }, requestedModel);
}
