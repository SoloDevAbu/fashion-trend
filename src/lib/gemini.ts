import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

export const geminiClient = new GoogleGenerativeAI(apiKey);

// Vision model for image analysis
// maxOutputTokens raised to 8192: gemini-2.5-flash uses internal thinking tokens,
// so the effective output budget is much smaller than the raw limit.
// 1024 was causing JSON responses to be truncated mid-object.
export const visionModel = geminiClient.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.1, // Low temperature for consistent structured output
    maxOutputTokens: 8192,
  },
});

// Text model for trend summaries and prompts
export const textModel = geminiClient.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 2048,
  },
});

// Image generation model
// gemini-2.0-flash-preview-image-generation was deprecated/removed (404).
// Use gemini-2.0-flash-exp with IMAGE responseModality instead.
export const imageGenModel = geminiClient.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  generationConfig: {
    // @ts-expect-error — responseModalities is supported at runtime but not yet
    // typed in @google/generative-ai v0.24.x
    responseModalities: ["IMAGE", "TEXT"],
  },
});
