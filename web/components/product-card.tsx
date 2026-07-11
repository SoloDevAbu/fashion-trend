import React from "react";
import { Star, ExternalLink, TrendingUp } from "lucide-react";
import type { TrendingProductItem } from "@/lib/api";

interface ProductCardProps {
  item: TrendingProductItem;
}

function formatRatingCount(count?: number | null): string {
  if (!count) return "";
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

export function ProductCard({ item }: ProductCardProps) {
  const imageUrl = item.cloudinaryUrl || item.imageUrl || "";
  const rankColor =
    item.rank === 1
      ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold shadow-lg shadow-amber-500/30"
      : item.rank === 2
        ? "bg-gradient-to-r from-slate-300 to-slate-400 text-black font-bold"
        : item.rank === 3
          ? "bg-gradient-to-r from-amber-700 to-amber-600 text-white font-bold"
          : "bg-slate-800/80 text-slate-300 border border-slate-700 font-medium";

  const isMyntra = item.source === "myntra";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10">
      {/* Top badges */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <span
          className={`flex h-7 items-center justify-center rounded-full px-3 text-xs tracking-wide ${rankColor}`}
        >
          #{item.rank} TRENDING
        </span>
      </div>

      <div className="absolute top-3 right-3 z-10">
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest backdrop-blur-md ${
            isMyntra
              ? "bg-pink-500/20 text-pink-300 border border-pink-500/30"
              : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
          }`}
        >
          {item.source}
        </span>
      </div>

      {/* Image Container (3:4 aspect ratio) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-950">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.title || "Fashion product"}
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
            No Image
          </div>
        )}

        {/* Myntra style Rating Badge bottom-left of image overlay */}
        {item.rating && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
            <span>{item.rating}</span>
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {item.ratingCount && (
              <>
                <span className="text-white/40">|</span>
                <span className="text-slate-300">
                  {formatRatingCount(item.ratingCount)}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
              Popularity Score
            </span>
            <span className="flex items-center gap-1 rounded-md bg-purple-500/10 px-2 py-0.5 font-mono text-xs font-bold text-purple-300 border border-purple-500/20">
              <TrendingUp className="h-3 w-3 text-purple-400" />
              {Number(item.score).toFixed(2)}
            </span>
          </div>

          <h3
            className="mt-2 line-clamp-2 text-sm font-medium text-slate-200 group-hover:text-white"
            title={item.title}
          >
            {item.title || "Untitled Product"}
          </h3>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3">
          <div>
            <span className="text-xs text-slate-400">Price</span>
            <div className="text-base font-bold text-white">
              {item.price ? `₹${item.price}` : "Check Price"}
            </div>
          </div>

          {item.productUrl && (
            <a
              href={item.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-purple-600 hover:text-white"
            >
              <span>Buy Now</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
