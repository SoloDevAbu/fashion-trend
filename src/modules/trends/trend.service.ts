import { eq, desc } from "drizzle-orm";
import { db, productAttributes, trendSnapshots } from "../../db";
import { logger } from "../../lib/logger";
import type { TrendEntry, TrendSummary } from "./trend.types";
import type { TrendSnapshot as DBTrendSnapshot } from "../../db/schema/trend-snapshots";

export class TrendService {
  async generateTrendSnapshot(): Promise<DBTrendSnapshot> {
    logger.info("Generating trend snapshot from product attributes");

    // Fetch all attributes
    const allAttributes = await db.select().from(productAttributes);

    if (allAttributes.length === 0) {
      throw new Error(
        "No product attributes found. Run vision analysis first.",
      );
    }

    const summary = this.aggregateAttributes(allAttributes);
    const periodLabel = this.getPeriodLabel();

    const [snapshot] = await db
      .insert(trendSnapshots)
      .values({
        periodLabel,
        totalProductsAnalyzed: summary.totalProductsAnalyzed,
        topColors: summary.topColors,
        topPatterns: summary.topPatterns,
        topStyles: summary.topStyles,
        topNeckTypes: summary.topNeckTypes,
        topSleeveTypes: summary.topSleeveTypes,
        topEmbroidery: summary.topEmbroidery,
        topOccasions: summary.topOccasions,
        summary: this.buildTextSummary(summary),
      })
      .returning();

    logger.info(
      { snapshotId: snapshot!.id, periodLabel },
      "Trend snapshot created",
    );
    return snapshot!;
  }

  async getLatestSnapshot(): Promise<DBTrendSnapshot | undefined> {
    const [snapshot] = await db
      .select()
      .from(trendSnapshots)
      .orderBy(desc(trendSnapshots.createdAt))
      .limit(1);
    return snapshot;
  }

  async getAllSnapshots(limit = 10): Promise<DBTrendSnapshot[]> {
    return db
      .select()
      .from(trendSnapshots)
      .orderBy(desc(trendSnapshots.createdAt))
      .limit(limit);
  }

  private aggregateAttributes(
    attributes: (typeof productAttributes.$inferSelect)[],
  ): TrendSummary {
    const total = attributes.length;

    return {
      totalProductsAnalyzed: total,
      topColors: this.topN(
        attributes.map((a) => a.primaryColor).filter(Boolean) as string[],
        total,
      ),
      topPatterns: this.topN(
        attributes.map((a) => a.pattern).filter(Boolean) as string[],
        total,
      ),
      topStyles: this.topN(
        attributes.map((a) => a.style).filter(Boolean) as string[],
        total,
      ),
      topNeckTypes: this.topN(
        attributes.map((a) => a.neckType).filter(Boolean) as string[],
        total,
      ),
      topSleeveTypes: this.topN(
        attributes.map((a) => a.sleeveType).filter(Boolean) as string[],
        total,
      ),
      topEmbroidery: this.topN(
        attributes.map((a) => a.embroidery).filter(Boolean) as string[],
        total,
      ),
      topOccasions: this.topN(
        attributes.map((a) => a.occasion).filter(Boolean) as string[],
        total,
      ),
    };
  }

  private topN(values: string[], total: number, n = 5): TrendEntry[] {
    const freq: Record<string, number> = {};
    for (const v of values) {
      const normalized = v.toLowerCase().trim();
      freq[normalized] = (freq[normalized] ?? 0) + 1;
    }

    return Object.entries(freq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, n)
      .map(([value, count]) => ({
        value,
        count,
        percentage: Math.round((count / total) * 100),
      }));
  }

  private getPeriodLabel(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const week = Math.ceil(now.getDate() / 7);
    return `${year}-${month}-W${week}`;
  }

  private buildTextSummary(summary: TrendSummary): string {
    const topColor = summary.topColors[0]?.value ?? "N/A";
    const topPattern = summary.topPatterns[0]?.value ?? "N/A";
    const topStyle = summary.topStyles[0]?.value ?? "N/A";
    const topEmbroidery = summary.topEmbroidery[0]?.value ?? "N/A";
    const topOccasion = summary.topOccasions[0]?.value ?? "N/A";

    return (
      `Trend Report (${summary.totalProductsAnalyzed} products analyzed): ` +
      `The dominant color this period is ${topColor}. ` +
      `${topPattern} patterns lead the market. ` +
      `${topStyle} style kurtis are most popular. ` +
      `${topEmbroidery} embroidery is trending. ` +
      `Most designs target ${topOccasion} occasions.`
    );
  }
}
