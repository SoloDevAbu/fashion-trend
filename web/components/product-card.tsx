import React from "react"
import { Star, ExternalLink, TrendingUp } from "lucide-react"
import type { TrendingProductItem } from "@/lib/api"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ProductCardProps {
  item: TrendingProductItem
}

function formatRatingCount(count?: number | null): string {
  if (!count) return ""
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}

export function ProductCard({ item }: ProductCardProps) {
  const imageUrl = item.cloudinaryUrl || item.imageUrl || ""
  const rankStyle =
    item.rank === 1
      ? "border-amber-500/50 bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20"
      : item.rank === 2
        ? "border-zinc-300 bg-zinc-200 text-zinc-950 font-bold"
        : item.rank === 3
          ? "border-amber-700 bg-amber-700 text-white font-bold"
          : "border-zinc-700 bg-zinc-900/90 text-zinc-300 font-medium"

  const isMyntra = item.source === "myntra"

  return (
    <Card className="group relative flex flex-col overflow-hidden rounded-2xl border-zinc-800/80 bg-zinc-900/50 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/40">
      {/* Top badges */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <Badge
          className={`flex h-6 items-center justify-center rounded-full px-2.5 text-[11px] tracking-wide ${rankStyle}`}
        >
          #{item.rank} TRENDING
        </Badge>
      </div>

      <div className="absolute top-3 right-3 z-10">
        <Badge
          variant="outline"
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold tracking-widest uppercase backdrop-blur-md ${
            isMyntra
              ? "border-zinc-700 bg-zinc-950/80 text-zinc-200"
              : "border-zinc-700 bg-zinc-950/80 text-zinc-300"
          }`}
        >
          {item.source}
        </Badge>
      </div>

      {/* Image Container (3:4 aspect ratio) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-950">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.title || "Fashion product"}
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">
            No Image Available
          </div>
        )}

        {/* Rating Overlay Badge */}
        {item.rating && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-950/85 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
            <span>{item.rating}</span>
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {item.ratingCount && (
              <>
                <span className="text-white/30">|</span>
                <span className="text-zinc-300">
                  {formatRatingCount(item.ratingCount)}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content Area */}
      <CardContent className="flex flex-1 flex-col justify-between p-4 pt-3">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
              Popularity Score
            </span>
            <Badge
              variant="secondary"
              className="flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-800/80 px-2 py-0.5 font-mono text-xs font-bold text-amber-400"
            >
              <TrendingUp className="h-3 w-3 text-amber-400" />
              {Number(item.score).toFixed(2)}
            </Badge>
          </div>

          <h3
            className="mt-2.5 line-clamp-2 text-sm font-medium text-zinc-200 group-hover:text-white"
            title={item.title}
          >
            {item.title || "Untitled Product"}
          </h3>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-zinc-800/80 p-4 pt-3">
        <div>
          <span className="text-[10px] tracking-wider text-zinc-400 uppercase">
            Price
          </span>
          <div className="text-base font-bold text-white">
            {item.price ? `₹${item.price}` : "Check Price"}
          </div>
        </div>

        {item.productUrl && (
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl border-zinc-700 bg-zinc-800/80 text-xs font-semibold text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-700 hover:text-white"
          >
            <a
              href={item.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5"
            >
              <span>Buy Now</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
