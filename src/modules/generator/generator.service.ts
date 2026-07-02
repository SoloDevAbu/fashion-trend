import { db, generatedDesigns } from "../../db";
import { eq } from "drizzle-orm";
import { TrendService } from "../trends/trend.service";
import { PromptBuilder } from "./prompt.builder";
import { ImageGeneratorService } from "./image-generator.service";
import { logger } from "../../lib/logger";
import type { GeneratedDesign } from "../../db/schema/generated-designs";

export class GeneratorService {
  private readonly trendService: TrendService;
  private readonly promptBuilder: PromptBuilder;
  private readonly imageGenerator: ImageGeneratorService;

  constructor() {
    this.trendService = new TrendService();
    this.promptBuilder = new PromptBuilder();
    this.imageGenerator = new ImageGeneratorService();
  }

  async generateFromLatestTrend(): Promise<GeneratedDesign> {
    logger.info("Starting design generation from latest trend snapshot");

    const snapshot = await this.trendService.getLatestSnapshot();
    if (!snapshot) {
      throw new Error("No trend snapshot available. Run trend analysis first.");
    }

    const summary = {
      topColors: (snapshot.topColors as any[]) ?? [],
      topPatterns: (snapshot.topPatterns as any[]) ?? [],
      topStyles: (snapshot.topStyles as any[]) ?? [],
      topNeckTypes: (snapshot.topNeckTypes as any[]) ?? [],
      topSleeveTypes: (snapshot.topSleeveTypes as any[]) ?? [],
      topEmbroidery: (snapshot.topEmbroidery as any[]) ?? [],
      topOccasions: (snapshot.topOccasions as any[]) ?? [],
      totalProductsAnalyzed: snapshot.totalProductsAnalyzed,
    };

    const promptInput = this.promptBuilder.buildFromTrendSummary(summary);
    const prompt = this.promptBuilder.buildImagePrompt(promptInput);

    // Insert a pending record first
    const [pending] = await db
      .insert(generatedDesigns)
      .values({
        trendSnapshotId: snapshot.id,
        prompt,
        status: "pending",
        trendInputs: promptInput as any,
      })
      .returning();

    try {
      const generated = await this.imageGenerator.generate(prompt);

      const [completed] = await db
        .update(generatedDesigns)
        .set({
          localImagePath: generated.localImagePath,
          modelUsed: generated.modelUsed,
          status: "completed",
        })
        .where(eq(generatedDesigns.id, pending!.id))
        .returning();

      logger.info({ designId: completed!.id }, "Design generation completed");
      return completed!;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const [failed] = await db
        .update(generatedDesigns)
        .set({ status: "failed", errorMessage })
        .where(eq(generatedDesigns.id, pending!.id))
        .returning();

      logger.error(
        { designId: failed!.id, errorMessage },
        "Design generation failed",
      );
      throw error;
    }
  }

  async getAllDesigns(limit = 20, offset = 0): Promise<GeneratedDesign[]> {
    return db
      .select()
      .from(generatedDesigns)
      .orderBy(generatedDesigns.createdAt)
      .limit(limit)
      .offset(offset);
  }
}
