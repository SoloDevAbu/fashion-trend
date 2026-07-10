import type { TrendSummary } from "../trends/trend.types";

export interface DesignPromptInput {
  topColor: string;
  secondColor?: string;
  topPattern: string;
  topStyle: string;
  topNeckType?: string;
  topSleeveType?: string;
  topEmbroidery?: string;
  topOccasion?: string;
}

export class PromptBuilder {
  buildImagePrompt(input: DesignPromptInput): string {
    const {
      topColor,
      secondColor,
      topPattern,
      topStyle,
      topNeckType,
      topSleeveType,
      topEmbroidery,
      topOccasion,
    } = input;

    const colorDesc = secondColor
      ? `${topColor} with ${secondColor} accents`
      : topColor;

    const embroideryDesc =
      !topEmbroidery || topEmbroidery === "none"
        ? "minimal embellishment"
        : `${topEmbroidery} embroidery`;

    return [
      `A professional flat-lay fashion photograph of a premium Indian kurti.`,
      `Style: ${topStyle} cut.`,
      `Color: ${colorDesc}.`,
      `Pattern: ${topPattern} print.`,
      topNeckType ? `Neckline: ${topNeckType}.` : "",
      topSleeveType ? `Sleeves: ${topSleeveType}.` : "",
      `Embellishment: ${embroideryDesc}.`,
      topOccasion ? `Occasion: ${topOccasion} wear.` : "",
      `High-resolution product photography, white background, studio lighting, detailed fabric texture visible.`,
      `Modern ethnic Indian fashion, contemporary design with traditional elements.`,
    ]
      .filter(Boolean)
      .join(" ");
  }

  buildFromTrendSummary(summary: TrendSummary): DesignPromptInput {
    const secondColor = summary.topColors[1]?.value;
    const topNeckType = summary.topNeckTypes[0]?.value;
    const topSleeveType = summary.topSleeveTypes[0]?.value;
    const topEmbroidery = summary.topEmbroidery[0]?.value;
    const topOccasion = summary.topOccasions[0]?.value;
    return {
      topColor: summary.topColors[0]?.value ?? "pink",
      ...(secondColor !== undefined ? { secondColor } : {}),
      topPattern: summary.topPatterns[0]?.value ?? "floral",
      topStyle: summary.topStyles[0]?.value ?? "anarkali",
      ...(topNeckType !== undefined ? { topNeckType } : {}),
      ...(topSleeveType !== undefined ? { topSleeveType } : {}),
      ...(topEmbroidery !== undefined ? { topEmbroidery } : {}),
      ...(topOccasion !== undefined ? { topOccasion } : {}),
    };
  }
}
