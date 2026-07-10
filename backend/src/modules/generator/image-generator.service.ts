import fs from "fs/promises";
import path from "path";
import { imageGenModel } from "../../lib/gemini";
import { logger } from "../../lib/logger";

const STORAGE_PATH = process.env.STORAGE_PATH ?? "./storage/images";

export interface GeneratedImage {
  localImagePath: string;
  modelUsed: string;
}

export class ImageGeneratorService {
  async generate(prompt: string): Promise<GeneratedImage> {
    logger.info(
      { promptLength: prompt.length },
      "Generating design image via Gemini",
    );

    const result = await imageGenModel.generateContent(prompt);
    const response = result.response;

    // Find the image part in the response
    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData) {
        const { data, mimeType } = part.inlineData;
        const ext = this.mimeToExt(mimeType ?? "image/png");
        const filename = `generated-${Date.now()}.${ext}`;
        const dir = path.join(STORAGE_PATH, "generated");
        await fs.mkdir(dir, { recursive: true });

        const filePath = path.join(dir, filename);
        await fs.writeFile(filePath, Buffer.from(data, "base64"));

        logger.info({ filePath }, "Generated design image saved");
        return {
          localImagePath: filePath,
          modelUsed: "gemini-2.0-flash-preview-image-generation",
        };
      }
    }

    throw new Error("No image data in Gemini response");
  }

  private mimeToExt(mimeType: string): string {
    const map: Record<string, string> = {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/webp": "webp",
    };
    return map[mimeType] ?? "png";
  }
}
