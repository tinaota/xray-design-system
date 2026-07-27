"use client";

import { cn } from "@/lib/utils";
import { Check, ChevronDown, Sparkles, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { AIConfidenceMeter } from "./AIConfidenceMeter";
import type { AISuggestionStatus } from "./types";

export interface AISuggestionCardProps {
  title: string;
  /** The suggestion itself — text, a code badge, a diff, whatever fits. */
  children: ReactNode;
  /** Confidence in 0–1. Omit when the caller has no meaningful score. */
  confidence?: number;
  /** Why the model suggested this. Collapsed by default. */
  rationale?: ReactNode;
  status?: AISuggestionStatus;
  onAccept?: () => void;
  onReject?: () => void;
  acceptLabel?: string;
  rejectLabel?: string;
  /** Blocks both actions, e.g. while the accept request is in flight. */
  disabled?: boolean;
  /** Shown while an action is being applied. */
  busy?: boolean;
  className?: string;
}

const resolvedConfig: Record<
  Exclude<AISuggestionStatus, "pending">,
  { label: string; className: string; icon: ReactNode }
> = {
  accepted: {
    label: "Accepted",
    className: "bg-success-container text-success-on-container border-success-border",
    icon: <Check className="h-3.5 w-3.5" aria-hidden="true" />,
  },
  rejected: {
    label: "Dismissed",
    className: "bg-neutral-container text-neutral-on-container border-neutral-border",
    icon: <X className="h-3.5 w-3.5" aria-hidden="true" />,
  },
};

/**
 * A single AI suggestion with an explicit accept/reject decision.
 *
 * The design rule this component enforces: **a suggestion never applies itself.**
 * There is no "auto-accept above N% confidence" affordance and no default-checked
 * state, because in this domain an unreviewed suggestion becoming a submitted
 * CPT code is a compliance problem, not a convenience win. Confidence is shown to
 * inform the human decision, never to replace it.
 *
 * Once resolved, the actions are replaced by a status chip so the record of who
 * decided what stays visible rather than the card silently vanishing.
 */
export function AISuggestionCard({
  title,
  children,
  confidence,
  rationale,
  status = "pending",
  onAccept,
  onReject,
  acceptLabel = "Accept",
  rejectLabel = "Dismiss",
  disabled = false,
  busy = false,
  className,
}: AISuggestionCardProps) {
  const [showRationale, setShowRationale] = useState(false);
  const isResolved = status !== "pending";
  const resolved = isResolved ? resolvedConfig[status] : null;

  return (
    <div
      className={cn(
        "rounded-xl border bg-ai-surface border-ai-border",
        // Resolved suggestions recede but stay legible — they are an audit trail.
        isResolved && "opacity-75",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 px-4 pt-3.5 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="h-4 w-4 shrink-0 text-ai-accent" aria-hidden="true" />
          <h4 className="text-xs font-semibold font-label uppercase tracking-wider text-ai-on-surface truncate">
            {title}
          </h4>
        </div>

        {resolved ? (
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5",
              "font-label text-[10px] font-semibold uppercase tracking-wider",
              resolved.className
            )}
          >
            {resolved.icon}
            {resolved.label}
          </span>
        ) : (
          confidence !== undefined && <AIConfidenceMeter score={confidence} size="sm" />
        )}
      </div>

      <div className="px-4 pb-3 text-sm text-on-surface">{children}</div>

      {rationale && (
        <div className="px-4 pb-3">
          <button
            type="button"
            onClick={() => setShowRationale((v) => !v)}
            aria-expanded={showRationale}
            className={cn(
              "inline-flex items-center gap-1 rounded text-xs font-semibold text-ai-accent",
              "hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ai-accent"
            )}
          >
            <ChevronDown
              className={cn("h-3.5 w-3.5 transition-transform", showRationale && "rotate-180")}
              aria-hidden="true"
            />
            {showRationale ? "Hide reasoning" : "Why this suggestion?"}
          </button>
          {showRationale && (
            <div className="mt-2 rounded-lg border border-ai-border/60 bg-surface-container-lowest p-3 text-xs leading-relaxed text-on-surface-variant">
              {rationale}
            </div>
          )}
        </div>
      )}

      {!isResolved && (onAccept || onReject) && (
        <div className="flex items-center justify-end gap-2 border-t border-ai-border/60 px-4 py-2.5">
          {onReject && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReject}
              disabled={disabled || busy}
              leadingIcon={<X className="h-3.5 w-3.5" />}
            >
              {rejectLabel}
            </Button>
          )}
          {onAccept && (
            <Button
              variant="primary"
              size="sm"
              onClick={onAccept}
              disabled={disabled}
              loading={busy}
              leadingIcon={<Check className="h-3.5 w-3.5" />}
            >
              {acceptLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
