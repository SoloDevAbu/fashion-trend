import fs from "fs/promises";
import path from "path";
import axios from "axios";
import { visionModel } from "../../lib/gemini";
import { logger } from "../../lib/logger";
import { ATTRIBUTE_EXTRACTION_PROMPT } from "./prompts/attribute.prompt";
import type { FashionAttributes } from "../trends/trend.types";

export class VisionService {
  async analyzeImage(imageSource: string): Promise<FashionAttributes | null> {
    try {
      const { mimeType, data } = await this.loadImage(imageSource);

      const result = await visionModel.generateContent([
        ATTRIBUTE_EXTRACTION_PROMPT,
        {
          inlineData: { mimeType, data },
        },
      ]);

      const text = result.response.text().trim();
      return this.parseResponse(text);
    } catch (error) {
      logger.error({ imageSource, error }, "Vision analysis failed");
      return null;
    }
  }

  private async loadImage(
    source: string,
  ): Promise<{ mimeType: string; data: string }> {
    // Local file path
    if (!source.startsWith("http")) {
      const buffer = await fs.readFile(source);
      const ext = path.extname(source).toLowerCase().replace(".", "");
      const mimeType = this.getMimeType(ext);
      return { mimeType, data: buffer.toString("base64") };
    }

    // Remote URL - download temporarily
    const response = await axios.get(source, {
      responseType: "arraybuffer",
      timeout: 15000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const contentType =
      (response.headers["content-type"] as string) || "image/jpeg";
    const mimeType = (contentType.split(";")[0] ?? "image/jpeg").trim();
    const data = Buffer.from(response.data).toString("base64");
    return { mimeType, data };
  }

  private getMimeType(ext: string): string {
    const map: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
    };
    return map[ext] ?? "image/jpeg";
  }

  private parseResponse(text: string): FashionAttributes | null {
    try {
      // Strip any accidental markdown fences
      const cleaned = text
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();

      const parsed = JSON.parse(cleaned);

      return {
        primaryColor: parsed.primaryColor ?? undefined,
        secondaryColor: parsed.secondaryColor ?? undefined,
        pattern: parsed.pattern ?? undefined,
        style: parsed.style ?? undefined,
        neckType: parsed.neckType ?? undefined,
        sleeveType: parsed.sleeveType ?? undefined,
        fabric: parsed.fabric ?? undefined,
        embroidery: parsed.embroidery ?? undefined,
        occasion: parsed.occasion ?? undefined,
        length: parsed.length ?? undefined,
        confidence: parsed.confidence ?? "medium",
      };
    } catch (error) {
      logger.warn({ text, error }, "Failed to parse Gemini response as JSON");
      return null;
    }
  }
}
