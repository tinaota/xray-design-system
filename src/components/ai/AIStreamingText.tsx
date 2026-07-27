"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export interface AIStreamingTextProps {
  /**
   * The text accumulated so far. This component renders what it is given — the
   * caller owns the stream. It does not simulate typing, because a fake reveal
   * desynchronises from the real token arrival and makes stalls invisible.
   */
  text: string;
  /** True while more tokens are expected. Drives the caret and `aria-busy`. */
  isStreaming?: boolean;
  /** Shown before the first token arrives. */
  pending?: boolean;
  /**
   * Announced to screen readers once streaming completes. Set to null to stay
   * silent when a parent already announces the result.
   */
  completionAnnouncement?: string | null;
  className?: string;
}

/** Three-dot "working" indicator for the gap before the first token. */
function PendingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1" aria-hidden="true">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-1.5 w-1.5 rounded-full bg-ai-accent animate-pulse"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

/**
 * Renders streaming model output with a caret.
 *
 * The announcement strategy is the non-obvious part. Wrapping streaming text in
 * `aria-live` re-announces the whole buffer on every token, which makes a screen
 * reader unusable — it stutters continuously and never finishes a sentence. So
 * the visible text is *not* a live region: it is marked `aria-busy` while
 * streaming, and a separate polite region announces once, on completion.
 */
export function AIStreamingText({
  text,
  isStreaming = false,
  pending = false,
  completionAnnouncement = "Response complete.",
  className,
}: AIStreamingTextProps) {
  const [announcement, setAnnouncement] = useState("");
  const wasStreaming = useRef(isStreaming);

  useEffect(() => {
    // Fire only on the streaming -> settled transition.
    if (wasStreaming.current && !isStreaming && text.length > 0 && completionAnnouncement) {
      setAnnouncement(completionAnnouncement);
      // Clear so a subsequent identical announcement is re-read.
      const timer = setTimeout(() => setAnnouncement(""), 1000);
      wasStreaming.current = isStreaming;
      return () => clearTimeout(timer);
    }
    wasStreaming.current = isStreaming;
  }, [isStreaming, text.length, completionAnnouncement]);

  const showPending = pending && text.length === 0;

  return (
    <>
      <div
        aria-busy={isStreaming || undefined}
        className={cn("text-sm leading-relaxed text-on-surface whitespace-pre-wrap", className)}
      >
        {showPending ? (
          <PendingDots />
        ) : (
          <>
            {text}
            {isStreaming && (
              <span
                // Inline caret. `align-middle` keeps it on the text baseline
                // rather than riding above descenders.
                className="ml-0.5 inline-block h-4 w-[2px] align-middle bg-ai-accent animate-caret-blink"
                aria-hidden="true"
              />
            )}
          </>
        )}
      </div>

      {/* Announced once when the response settles, not per token. */}
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </>
  );
}
