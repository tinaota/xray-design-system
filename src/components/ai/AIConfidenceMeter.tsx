import { cn } from "@/lib/utils";
import type { AIConfidenceBand } from "./types";

export interface AIConfidenceMeterProps {
  /** Model confidence in the range 0–1. Values outside are clamped. */
  score: number;
  size?: "sm" | "md";
  /** Hide the textual band label, leaving only the bar. Rarely correct. */
  hideLabel?: boolean;
  /** Override the default band cutoffs. */
  thresholds?: { high: number; medium: number };
  className?: string;
}

const DEFAULT_THRESHOLDS = { high: 0.8, medium: 0.5 };

/*
 * Band copy avoids implying calibrated probability.
 *
 * "87% confident" reads as "87% likely to be correct", which is not what a model
 * score means and is actively dangerous when the suggestion is a billing code.
 * Bands plus an explicit instruction keep the claim honest.
 */
const bandConfig: Record<AIConfidenceBand, { label: string; bar: string; text: string; fill: number }> = {
  high: { label: "High confidence", bar: "bg-success", text: "text-success-on-container", fill: 100 },
  medium: { label: "Medium confidence", bar: "bg-warning", text: "text-warning-on-container", fill: 66 },
  low: { label: "Low confidence — verify", bar: "bg-danger", text: "text-danger-on-container", fill: 33 },
};

export function bandForScore(
  score: number,
  thresholds: { high: number; medium: number } = DEFAULT_THRESHOLDS
): AIConfidenceBand {
  if (score >= thresholds.high) return "high";
  if (score >= thresholds.medium) return "medium";
  return "low";
}

/**
 * Three-segment confidence indicator.
 *
 * Renders as an ARIA `meter` so assistive tech reports it as a gauge rather than
 * a decorative bar, with `aria-valuetext` carrying the band wording — a screen
 * reader user hears "Low confidence — verify", not "0.4".
 */
export function AIConfidenceMeter({
  score,
  size = "md",
  hideLabel = false,
  thresholds = DEFAULT_THRESHOLDS,
  className,
}: AIConfidenceMeterProps) {
  // Guard against NaN and out-of-range input rather than rendering a broken bar.
  const safeScore = Number.isFinite(score) ? Math.min(1, Math.max(0, score)) : 0;
  const band = bandForScore(safeScore, thresholds);
  const config = bandConfig[band];
  const filledSegments = band === "high" ? 3 : band === "medium" ? 2 : 1;

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div
        role="meter"
        aria-valuenow={Math.round(safeScore * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={config.label}
        aria-label="Model confidence"
        className="inline-flex items-center gap-0.5"
      >
        {[1, 2, 3].map((segment) => (
          <span
            key={segment}
            className={cn(
              "rounded-full transition-colors",
              size === "sm" ? "h-1 w-3" : "h-1.5 w-4",
              segment <= filledSegments ? config.bar : "bg-outline-variant"
            )}
          />
        ))}
      </div>

      {!hideLabel && (
        <span
          className={cn(
            "font-label font-semibold uppercase tracking-wider",
            size === "sm" ? "text-[10px]" : "text-xs",
            config.text
          )}
        >
          {config.label}
        </span>
      )}
    </div>
  );
}
