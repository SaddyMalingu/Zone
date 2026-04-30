import type { ContentFeedItem } from "@/types";
import Image from "next/image";

interface ContentCardProps {
  item: ContentFeedItem;
}

export default function ContentCard({ item }: ContentCardProps) {
  const isNew = item.isNew;

  return (
    <div
      className={`
        group relative rounded-xl overflow-hidden border border-zone-border
        bg-zone-surface transition-all duration-300
        hover:border-zone-accent hover:shadow-lg hover:shadow-zone-accent/20
        ${isNew ? "animate-fade-in-up ring-2 ring-zone-glow" : ""}
      `}
      style={{ animationDuration: isNew ? '0.7s' : undefined }}
    >
      {/* Media */}
      <div className="relative aspect-square bg-zone-bg">
        {item.type === "image" ? (
          item.url.startsWith("data:") ? (
            // Base64 image from HuggingFace
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.url}
              alt={item.prompt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <Image
              src={item.url}
              alt={item.prompt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            />
          )
        ) : (
          <video
            src={item.url}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zone-bg/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Type badge */}
        <div className="absolute top-2 right-2">
          <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-zone-bg/80 border border-zone-border text-zone-muted backdrop-blur-sm">
            {item.type}
          </span>
        </div>

        {/* New badge */}
        {isNew && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-zone-glow text-white animate-pulse-slow">
              NEW
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <p className="text-zone-text text-xs leading-relaxed line-clamp-2 font-mono">
          {item.prompt}
        </p>

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded text-xs bg-zone-border text-zone-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-zone-muted text-xs">{item.provider}</span>
          <span className="text-zone-muted text-xs">
            {new Date(item.createdAt).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}
