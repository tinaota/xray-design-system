import { cn } from "@/lib/utils";
import { CloudOff, Hand, RotateCw, ShieldOff, Timer, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import type { AIErrorVariant } from "./types";

export interface AIErrorStateProps {
  variant?: AIErrorVariant;
  /** Replaces the preset explanation. Keep it actionable. */
  message?: ReactNode;
  /** Rendered only when the variant is one a retry can actually fix. */
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

/*
 * `retryable` is the important field here.
 *
 * A refusal or a content-filter block is a *decision*, not a failure — resending
 * the same prompt produces the same answer. Offering "Try again" there teaches
 * users to hammer the button and makes the product feel broken when it is
 * working as intended. Only transport and capacity problems get a retry.
 */
const variantConfig: Record<
  AIErrorVariant,
  { title: string; message: string; icon: ReactNode; className: string; retryable: boolean }
> = {
  refusal: {
    title: "Request declined",
    message:
      "The assistant declined to answer this request. Rephrasing it, or handling it manually, is the way forward.",
    icon: <Hand className="h-4 w-4 shrink-0" aria-hidden="true" />,
    className: "bg-neutral-container text-neutral-on-container border-neutral-border",
    retryable: false,
  },
  "content-filter": {
    title: "Content blocked",
    message: "The response was withheld by a safety filter. Try a narrower, more specific request.",
    icon: <ShieldOff className="h-4 w-4 shrink-0" aria-hidden="true" />,
    className: "bg-warning-container text-warning-on-container border-warning-border",
    retryable: false,
  },
  timeout: {
    title: "Request timed out",
    message: "The assistant took too long to respond.",
    icon: <Timer className="h-4 w-4 shrink-0" aria-hidden="true" />,
    className: "bg-warning-container text-warning-on-container border-warning-border",
    retryable: true,
  },
  "rate-limit": {
    title: "Too many requests",
    message: "Rate limit reached. Wait a moment before trying again.",
    icon: <Timer className="h-4 w-4 shrink-0" aria-hidden="true" />,
    className: "bg-warning-container text-warning-on-container border-warning-border",
    retryable: true,
  },
  network: {
    title: "Connection lost",
    message:
      "Could not reach the assistant. Your work is unaffected — this will resume when you are back online.",
    icon: <CloudOff className="h-4 w-4 shrink-0" aria-hidden="true" />,
    className: "bg-neutral-container text-neutral-on-container border-neutral-border",
    retryable: true,
  },
  unknown: {
    title: "Something went wrong",
    message: "The assistant could not complete this request.",
    icon: <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />,
    className: "bg-danger-container text-danger-on-container border-danger-border",
    retryable: true,
  },
};

/**
 * Failure and refusal states for AI surfaces.
 *
 * `role="alert"` because this replaces content the user was actively waiting for —
 * unlike `<AIDisclaimer>`, it should interrupt.
 */
export function AIErrorState({
  variant = "unknown",
  message,
  onRetry,
  retryLabel = "Try again",
  className,
}: AIErrorStateProps) {
  const config = variantConfig[variant];
  // A retry handler is honoured only where retrying is meaningful.
  const showRetry = Boolean(onRetry) && config.retryable;

  return (
    <div
      role="alert"
      className={cn("flex items-start gap-2.5 rounded-xl border px-3.5 py-3", config.className, className)}
    >
      {config.icon}

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{config.title}</p>
        <p className="mt-0.5 text-xs leading-relaxed opacity-90">{message ?? config.message}</p>

        {showRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-2.5"
            leadingIcon={<RotateCw className="h-3.5 w-3.5" />}
          >
            {retryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
