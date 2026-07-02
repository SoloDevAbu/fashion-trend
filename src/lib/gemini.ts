import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

export const geminiClient = new GoogleGenerativeAI(apiKey);

// Vision model for image analysis
export const visionModel = geminiClient.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.1, // Low temperature for consistent structured output
    maxOutputTokens: 1024,
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
export const imageGenModel = geminiClient.getGenerativeModel({
  model: "gemini-2.0-flash-preview-image-generation",
});
