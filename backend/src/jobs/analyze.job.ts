import { ProductService } from "../modules/products/product.service";
import { VisionService } from "../modules/vision/vision.service";
import { AttributeRepository } from "../modules/trends/attribute.repository";
import { logger } from "../lib/logger";

const BATCH_SIZE = 20;
const DELAY_BETWEEN_CALLS_MS = 1500; // Rate limiting for Gemini API

export async function runAnalyzeJob(): Promise<void> {
  logger.info("=== ANALYZE JOB STARTED ===");
  const start = Date.now();

  const productService = new ProductService();
  const visionService = new VisionService();
  const attributeRepo = new AttributeRepository();

  let analyzed = 0;
  let failed = 0;

  try {
    const products = await productService.getUnanalyzedProducts(BATCH_SIZE);

    if (products.length === 0) {
      logger.info("No unanalyzed products found");
      return;
    }

    logger.info({ count: products.length }, "Starting vision analysis batch");

    for (const product of products) {
      try {
        const imageSource = product.imageUrl;
        const attributes = await visionService.analyzeImage(imageSource);

        if (attributes) {
          await attributeRepo.insert({
            productId: product.id,
            primaryColor: attributes.primaryColor,
            secondaryColor: attributes.secondaryColor,
            pattern: attributes.pattern,
            style: attributes.style,
            neckType: attributes.neckType,
            sleeveType: attributes.sleeveType,
            fabric: attributes.fabric,
            embroidery: attributes.embroidery,
            occasion: attributes.occasion,
            length: attributes.length,
            confidence: attributes.confidence,
            rawResponse: JSON.stringify(attributes),
          });

          await productService.markAnalyzed(product.id);
          analyzed++;
          logger.debug(
            { productId: product.id },
            "Product analyzed successfully",
          );
        } else {
          failed++;
          logger.warn(
            { productId: product.id },
            "Vision analysis returned null",
          );
        }
      } catch (error) {
        failed++;
        logger.error(
          { productId: product.id, error },
          "Failed to analyze product",
        );
      }

      // Rate-limit Gemini API calls
      await new Promise((resolve) =>
        setTimeout(resolve, DELAY_BETWEEN_CALLS_MS),
      );
    }

    logger.info(
      { analyzed, failed, durationMs: Date.now() - start },
      "=== ANALYZE JOB COMPLETED ===",
    );
  } catch (error) {
    logger.error(
      { error, durationMs: Date.now() - start },
      "=== ANALYZE JOB FAILED ===",
    );
    throw error;
  }
}
