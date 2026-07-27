import { cn } from "@/lib/utils";
import type { AuditStatus, OrderStatus, Priority, SyncStatus } from "@/lib/utils";

/*
 * Canonical status badges. Always render state through these rather than
 * building a coloured span at the call site — that is what keeps STAT the same
 * red everywhere.
 *
 * Colours come from the status tokens in globals.css (`success-container`,
 * `transit-container`, …) rather than raw Tailwind palette values. The previous
 * `bg-green-100 text-green-800` style broke the project's own "no colour values
 * outside the config" rule and, more practically, could not re-theme under
 * `.high-contrast` — badges stayed pale-on-pale in the field view.
 */

type BadgeSize = "sm" | "md" | "lg";

const sizeClass: Record<BadgeSize, string> = {
  sm: "text-[10px] px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
  lg: "text-sm px-4 py-1.5",
};

const baseClass =
  "inline-flex items-center gap-1.5 font-label font-semibold uppercase tracking-wider border rounded-full whitespace-nowrap";

export interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: BadgeSize;
  className?: string;
}

const orderStatusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-warning-container text-warning-on-container border-warning-border",
  },
  assigned: {
    label: "Assigned",
    className: "bg-info-container text-info-on-container border-info-border",
  },
  "en-route": {
    label: "En Route",
    className: "bg-transit-container text-transit-on-container border-transit-border",
  },
  "in-progress": {
    label: "In Progress",
    className: "bg-success-container text-success-on-container border-success-border",
  },
  complete: {
    label: "Complete",
    className: "bg-complete-container text-complete-on-container border-complete-border",
  },
  billed: {
    label: "Billed",
    className: "bg-neutral-container text-neutral-on-container border-neutral-border",
  },
};

export function OrderStatusBadge({ status, size = "md", className }: OrderStatusBadgeProps) {
  const config = orderStatusConfig[status];
  return (
    <span className={cn(baseClass, sizeClass[size], config.className, className)}>
      {config.label}
    </span>
  );
}

export interface PriorityBadgeProps {
  priority: Priority;
  size?: BadgeSize;
  /** Pulses the dot on STAT orders. Ignored for other priorities. */
  animate?: boolean;
  className?: string;
}

const priorityConfig: Record<Priority, { label: string; className: string; dot: string }> = {
  stat: {
    label: "STAT",
    className: "bg-emergency-red text-white border-emergency-red",
    dot: "bg-white",
  },
  urgent: {
    label: "URGENT",
    className: "bg-warning-amber text-midnight-navy border-warning-amber",
    dot: "bg-midnight-navy",
  },
  routine: {
    label: "ROUTINE",
    className: "bg-neutral-container text-neutral-on-container border-neutral-border",
    dot: "bg-neutral-on-container",
  },
};

export function PriorityBadge({ priority, size = "md", animate, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  const showAnimate = animate && priority === "stat";

  return (
    <span
      className={cn(
        baseClass,
        "font-bold tracking-widest",
        sizeClass[size],
        config.className,
        className
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.dot, showAnimate && "animate-pulse")}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}

export interface SyncStatusBadgeProps {
  status: SyncStatus;
  size?: BadgeSize;
  className?: string;
}

const syncConfig: Record<SyncStatus, { label: string; className: string; dot: string }> = {
  synced: {
    label: "Synced",
    className: "bg-success-container text-success-on-container border-success-border",
    dot: "bg-success",
  },
  pending: {
    label: "Syncing",
    className: "bg-info-container text-info-on-container border-info-border",
    dot: "bg-info animate-pulse",
  },
  conflict: {
    label: "Conflict",
    className: "bg-conflict-container text-conflict-on-container border-conflict-border",
    dot: "bg-conflict",
  },
  offline: {
    label: "Offline",
    className: "bg-neutral-container text-neutral-on-container border-neutral-border",
    dot: "bg-neutral",
  },
};

export function SyncStatusBadge({ status, size = "sm", className }: SyncStatusBadgeProps) {
  const config = syncConfig[status];
  return (
    <span className={cn(baseClass, sizeClass[size], config.className, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.dot)} aria-hidden="true" />
      {config.label}
    </span>
  );
}

export interface AuditStatusBadgeProps {
  status: AuditStatus;
  size?: BadgeSize;
  className?: string;
}

const auditConfig: Record<AuditStatus, { label: string; className: string }> = {
  verified: {
    label: "Verified",
    className: "bg-success-container text-success-on-container border-success-border",
  },
  flagged: {
    label: "Flagged",
    className: "bg-danger-container text-danger-on-container border-danger-border",
  },
  pending: {
    label: "Pending",
    className: "bg-warning-container text-warning-on-container border-warning-border",
  },
};

/** Compliance audit state. Pairs with `AuditEntry.status`. */
export function AuditStatusBadge({ status, size = "md", className }: AuditStatusBadgeProps) {
  const config = auditConfig[status];
  return (
    <span className={cn(baseClass, sizeClass[size], config.className, className)}>
      {config.label}
    </span>
  );
}
