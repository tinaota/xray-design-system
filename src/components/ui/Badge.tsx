import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

/*
 * Generic label chip.
 *
 * For domain state — order status, priority, sync state, audit state — use the
 * dedicated badges in StatusBadge.tsx instead. They own the canonical mapping,
 * so a status can't end up two different colours in two different screens.
 *
 * Variants below draw on the status tokens rather than raw palette values, which
 * is what lets them re-theme under `.high-contrast`.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 font-label font-semibold uppercase tracking-wider transition-colors whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-surface-container text-on-surface-variant",
        primary: "bg-midnight-navy text-white",
        secondary: "bg-medical-blue text-white",
        outline: "border border-outline-variant text-on-surface-variant",

        // Solid emphasis
        stat: "bg-emergency-red text-white",
        urgent: "bg-warning-amber text-midnight-navy",

        // Tinted, token-backed
        success: "bg-success-container text-success-on-container",
        info: "bg-info-container text-info-on-container",
        warning: "bg-warning-container text-warning-on-container",
        danger: "bg-danger-container text-danger-on-container",
        conflict: "bg-conflict-container text-conflict-on-container",
        neutral: "bg-neutral-container text-neutral-on-container",
      },
      size: {
        sm: "px-1.5 py-0.5 text-[10px] rounded",
        md: "px-2 py-0.5 text-xs rounded-md",
        lg: "px-3 py-1 text-xs rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { badgeVariants };
