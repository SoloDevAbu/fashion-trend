import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

export const geminiClient = new GoogleGenerativeAI(apiKey);

export const visionModel = geminiClient.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.1,
    maxOutputTokens: 8192,
  },
});

export const textModel = geminiClient.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 2048,
  },
});

export const imageGenModel = geminiClient.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  generationConfig: {
    // @ts-expect-error — responseModalities is supported at runtime but not yet
    // typed in @google/generative-ai v0.24.x
    responseModalities: ["IMAGE", "TEXT"],
  },
});
