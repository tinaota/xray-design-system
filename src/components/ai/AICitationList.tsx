import { cn } from "@/lib/utils";
import { ExternalLink, FileText } from "lucide-react";
import type { AICitation } from "./types";

export interface AICitationListProps {
  citations: AICitation[];
  /** Dense inline form for use under a chat message. */
  compact?: boolean;
  label?: string;
  className?: string;
}

/**
 * Superscript reference marker for use inside prose.
 *
 * ```tsx
 * Portable surcharge applies<AICitationRef index={1} />.
 * ```
 */
export function AICitationRef({ index, className }: { index: number; className?: string }) {
  return (
    <sup
      className={cn(
        "ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded px-1",
        "bg-ai-surface text-ai-on-surface font-mono text-[10px] font-semibold",
        className
      )}
    >
      {index}
      <span className="sr-only"> (source {index})</span>
    </sup>
  );
}

/** True for links leaving the app, which need safe rel attributes. */
function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

/**
 * Source attribution for AI output.
 *
 * Rendered as an ordered list so the numbering is real document structure that a
 * screen reader can navigate, rather than numbers painted into text. External
 * links carry `rel="noopener noreferrer"` — without `noopener`, the opened page
 * gets a handle to this window via `window.opener`.
 */
export function AICitationList({
  citations,
  compact = false,
  label = "Sources",
  className,
}: AICitationListProps) {
  if (citations.length === 0) return null;

  if (compact) {
    return (
      <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
        <span className="font-label text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
          {label}:
        </span>
        {citations.map((citation, i) => {
          const content = (
            <>
              <span className="font-mono text-[10px]">{i + 1}</span>
              <span className="truncate max-w-[12rem]">{citation.label}</span>
              {citation.href && isExternal(citation.href) && (
                <ExternalLink className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
              )}
            </>
          );

          const chipClass = cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]",
            "border-ai-border bg-ai-surface text-ai-on-surface"
          );

          return citation.href ? (
            <a
              key={citation.id}
              href={citation.href}
              {...(isExternal(citation.href)
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className={cn(
                chipClass,
                "transition-colors hover:bg-ai-border/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ai-accent"
              )}
            >
              {content}
            </a>
          ) : (
            <span key={citation.id} className={chipClass}>
              {content}
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-outline-variant/40 bg-surface-container-lowest", className)}>
      <div className="flex items-center gap-2 border-b border-outline-variant/40 px-4 py-2.5">
        <FileText className="h-3.5 w-3.5 text-on-surface-variant" aria-hidden="true" />
        <h4 className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          {label}
        </h4>
        <span className="ml-auto font-mono text-xs text-on-surface-variant">{citations.length}</span>
      </div>

      <ol className="divide-y divide-outline-variant/20">
        {citations.map((citation, i) => (
          <li key={citation.id} className="flex gap-3 px-4 py-3">
            <span
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded",
                "bg-ai-surface font-mono text-[11px] font-semibold text-ai-on-surface"
              )}
              aria-hidden="true"
            >
              {i + 1}
            </span>

            <div className="min-w-0 flex-1">
              {citation.href ? (
                <a
                  href={citation.href}
                  {...(isExternal(citation.href)
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className={cn(
                    "inline-flex items-center gap-1 text-sm font-semibold text-medical-blue",
                    "hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-medical-blue rounded"
                  )}
                >
                  {citation.label}
                  {isExternal(citation.href) && (
                    <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                  )}
                </a>
              ) : (
                <p className="text-sm font-semibold text-on-surface">{citation.label}</p>
              )}

              {(citation.source || citation.page !== undefined) && (
                <p className="mt-0.5 text-xs text-on-surface-variant">
                  {citation.source}
                  {citation.page !== undefined && (
                    <span className="font-mono"> · p. {citation.page}</span>
                  )}
                </p>
              )}

              {citation.excerpt && (
                <blockquote className="mt-1.5 border-l-2 border-outline-variant pl-2.5 text-xs italic leading-relaxed text-on-surface-variant">
                  {citation.excerpt}
                </blockquote>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
