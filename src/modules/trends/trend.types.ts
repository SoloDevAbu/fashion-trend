export interface FashionAttributes {
  primaryColor?: string;
  secondaryColor?: string;
  pattern?: string;
  style?: string;
  neckType?: string;
  sleeveType?: string;
  fabric?: string;
  embroidery?: string;
  occasion?: string;
  length?: string;
  confidence?: "high" | "medium" | "low";
}

export interface TrendEntry {
  value: string;
  count: number;
  percentage: number;
}

export interface TrendSummary {
  topColors: TrendEntry[];
  topPatterns: TrendEntry[];
  topStyles: TrendEntry[];
  topNeckTypes: TrendEntry[];
  topSleeveTypes: TrendEntry[];
  topEmbroidery: TrendEntry[];
  topOccasions: TrendEntry[];
  totalProductsAnalyzed: number;
}

export interface TrendSnapshot {
  periodLabel: string;
  summary: TrendSummary;
  generatedAt: Date;
}
