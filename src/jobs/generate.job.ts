import { GeneratorService } from "../modules/generator/generator.service";
import { logger } from "../lib/logger";

export async function runGenerateJob(): Promise<void> {
  logger.info("=== GENERATE JOB STARTED ===");
  const start = Date.now();

  try {
    const generatorService = new GeneratorService();
    const design = await generatorService.generateFromLatestTrend();

    logger.info(
      {
        designId: design.id,
        status: design.status,
        localImagePath: design.localImagePath,
        durationMs: Date.now() - start,
      },
      "=== GENERATE JOB COMPLETED ===",
    );
  } catch (error) {
    logger.error(
      { error, durationMs: Date.now() - start },
      "=== GENERATE JOB FAILED ===",
    );
    throw error;
  }
}
