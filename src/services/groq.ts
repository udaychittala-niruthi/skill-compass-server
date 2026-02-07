import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Default model to use.
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

// Hardcoded fallback models for CHAT COMPLETIONS ONLY (no audio/whisper models)
const STATIC_FALLBACK_MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "qwen/qwen3-32b",
    "meta-llama/llama-4-maverick-17b-128e-instruct",
    "meta-llama/llama-4-scout-17b-16e-instruct",
    "groq/compound",
    "groq/compound-mini",
    "moonshotai/kimi-k2-instruct-0905",
    "moonshotai/kimi-k2-instruct",
    "allam-2-7b"
    // Excluded: whisper-large-v3-turbo, whisper-large-v3 (audio models, not chat)
    // Excluded: llama-guard, llama-prompt-guard, orpheus (specialized models)
];

export interface GroqCompletionOptions {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    systemPrompt?: string;
}

let cachedModels: string[] = [];
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Fetches available models from Groq API or returns cached/static list.
 */
async function getAvailableModels(): Promise<string[]> {
    const now = Date.now();
    if (cachedModels.length > 0 && now - lastFetchTime < CACHE_TTL_MS) {
        return cachedModels;
    }

    try {
        const list = await groq.models.list();
        const models = list.data.map((m: any) => m.id).filter((id: string) => typeof id === "string");

        if (models.length > 0) {
            cachedModels = models;
            lastFetchTime = now;
            console.log(`Fetched ${models.length} models from Groq API.`);
            return models;
        }
    } catch (error) {
        console.warn("Failed to fetch models from Groq API, using static fallback:", error);
    }

    return STATIC_FALLBACK_MODELS;
}

/**
 * Helper to retry an operation with fallback models on rate limit errors.
 */
async function withModelFallback<T>(
    operation: (model: string) => Promise<T>,
    preferredModel: string = DEFAULT_MODEL
): Promise<T> {
    const availableModels = await getAvailableModels();

    // Ensure preferred model is first, then unique available models (excluding preferred)
    const modelsToTry = [preferredModel, ...availableModels.filter((m) => m !== preferredModel)];

    let lastError: any;

    for (const model of modelsToTry) {
        try {
            return await operation(model);
        } catch (error: any) {
            console.warn(`Groq request failed with model ${model}:`, error.status, error.message);
            lastError = error;

            const isRetryable =
                error?.status === 429 || // Rate limit
                error?.status === 400 || // Bad request (e.g., model doesn't support chat)
                error?.status === 503 || // Service unavailable
                error?.code === "rate_limit_exceeded" ||
                (error?.message && (error.message.includes("429") || error.message.includes("does not support")));

            if (isRetryable) {
                console.log(`Switching to next model due to error (${error?.status || "unknown"})...`);
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
export async function getChatCompletion(prompt: string, options: GroqCompletionOptions = {}): Promise<string> {
    const { temperature = 0.7, max_tokens = 1024, systemPrompt, model: requestedModel } = options;

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
            max_tokens
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
export async function getJsonCompletion<T = any>(prompt: string, options: GroqCompletionOptions = {}): Promise<T> {
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
        { role: "user", content: prompt }
    ];

    return withModelFallback(async (model) => {
        const completion = await groq.chat.completions.create({
            messages,
            model,
            // @ts-ignore
            response_format: { type: "json_object" },
            temperature,
            max_tokens
        });

        const content = completion.choices[0]?.message?.content || "{}";

        try {
            return JSON.parse(content) as T;
        } catch (_parseError) {
            console.error(`Failed to parse JSON response from model ${model}:`, content);
            throw new Error(`Failed to parse JSON response from LLM (${model})`);
        }
    }, requestedModel);
}
