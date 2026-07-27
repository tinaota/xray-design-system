"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarStatus = "online" | "offline" | "busy" | "away";

export interface AvatarProps {
  src?: string;
  /** Describes the person. Leave empty only when the name is adjacent in the UI. */
  alt?: string;
  initials?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  className?: string;
}

const sizeMap: Record<AvatarSize, string> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

const statusMap: Record<AvatarStatus, { className: string; label: string }> = {
  online: { className: "bg-success", label: "Online" },
  offline: { className: "bg-slate-gray", label: "Offline" },
  busy: { className: "bg-emergency-red", label: "Busy" },
  away: { className: "bg-warning-amber", label: "Away" },
};

const statusSizeMap: Record<AvatarSize, string> = {
  xs: "h-1.5 w-1.5",
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
  lg: "h-3 w-3",
  xl: "h-3.5 w-3.5",
};

export function Avatar({ src, alt, initials, size = "md", status, className }: AvatarProps) {
  /*
   * Track load failure so a dead URL falls back to initials. Without this a
   * broken src renders the browser's broken-image glyph, which looks like a bug
   * in the app — and avatar URLs are exactly the kind of thing that 404s once
   * profile images move.
   */
  const [failed, setFailed] = useState(false);

  // A new src deserves a fresh attempt.
  useEffect(() => setFailed(false), [src]);

  const showImage = Boolean(src) && !failed;

  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      <div
        className={cn(
          "rounded-full overflow-hidden bg-midnight-navy text-white flex items-center justify-center font-semibold font-label",
          sizeMap[size]
        )}
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt ?? ""}
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span aria-hidden={!alt}>{initials ?? "?"}</span>
        )}
        {/* Initials alone don't identify a person to a screen reader. */}
        {!showImage && alt && <span className="sr-only">{alt}</span>}
      </div>

      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-surface-container-lowest",
            statusSizeMap[size],
            statusMap[status].className
          )}
          // The dot is meaningful, so give it a text equivalent rather than
          // leaving the state visible only to sighted users.
          role="img"
          aria-label={statusMap[status].label}
        >
          <span className="sr-only">{statusMap[status].label}</span>
        </span>
      )}
    </div>
  );
}
