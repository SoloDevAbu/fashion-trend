import cron from "node-cron";
import { logger } from "../../../lib/logger";
import type { CrawlerService } from "../crawler/crawler.service";

export class ScrapeScheduler {
  private readonly tasks: ReturnType<typeof cron.schedule>[] = [];

  constructor(private readonly crawlerService: CrawlerService) {}

  start(): void {
    const schedules = [{ expression: "0 8 * * *", label: "daily-08:00" }];

    for (const s of schedules) {
      const task = cron.schedule(s.expression, async () => {
        logger.info({ schedule: s.label }, "Scheduled scrape triggered");
        try {
          const stats = await this.crawlerService.runAll();
          logger.info({ stats }, "Scheduled scrape completed");
        } catch (err) {
          logger.error({ error: String(err) }, "Scheduled scrape failed");
        }
      });

      this.tasks.push(task);
      logger.info(
        { schedule: s.label, cron: s.expression },
        "Scrape job scheduled",
      );
    }
  }

  stop(): void {
    this.tasks.forEach((t) => t.stop());
    logger.info("All scrape schedules stopped");
  }
}
