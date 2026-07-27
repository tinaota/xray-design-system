/*
 * Public entry point for the X-Ray design system.
 *
 * Import from `@/components`, not from individual file paths — the paths are an
 * implementation detail and may move. Anything not exported here is internal.
 */

// ── Base UI ──
export { Button, buttonVariants } from "./ui/Button";
export type { ButtonProps } from "./ui/Button";

export { Badge, badgeVariants } from "./ui/Badge";
export type { BadgeProps } from "./ui/Badge";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./ui/Card";
export type { CardProps, CardTitleProps } from "./ui/Card";

export { Input } from "./ui/Input";
export type { InputProps } from "./ui/Input";

export { Select } from "./ui/Select";
export type { SelectProps, SelectOption } from "./ui/Select";

// Field plumbing — for building new form controls that match Input/Select a11y.
export { useFieldIds, FieldLabel, FieldMessage } from "./ui/Field";
export type { FieldIds, FieldIdsOptions } from "./ui/Field";

export { Modal } from "./ui/Modal";
export type { ModalProps } from "./ui/Modal";

export { Toast, ToastContainer, ToastProvider, useToast } from "./ui/Toast";
export type {
  ToastVariant,
  ToastProps,
  ToastOptions,
  ToastRecord,
  ToastProviderProps,
} from "./ui/Toast";

export { Avatar } from "./ui/Avatar";
export type { AvatarProps, AvatarSize, AvatarStatus } from "./ui/Avatar";

export { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/Tabs";
export type { TabsProps } from "./ui/Tabs";

export { StatCard } from "./ui/StatCard";
export { KPICard } from "./ui/KPICard";

export { DataTable } from "./ui/DataTable";
export type { Column, DataTableProps, SortDirection } from "./ui/DataTable";

export {
  OrderStatusBadge,
  PriorityBadge,
  SyncStatusBadge,
  AuditStatusBadge,
} from "./ui/StatusBadge";
export type {
  OrderStatusBadgeProps,
  PriorityBadgeProps,
  SyncStatusBadgeProps,
  AuditStatusBadgeProps,
} from "./ui/StatusBadge";

// ── Layout ──
export { Sidebar } from "./layout/Sidebar";
export { TopNav } from "./layout/TopNav";
export { AppHeader } from "./layout/AppHeader";
export { PageLayout } from "./layout/PageLayout";
export { NavShell } from "./layout/NavShell";
export { ClientShell } from "./layout/ClientShell";

// ── Domain ──
export { OrderCard } from "./domain/OrderCard";
export { TechnicianCard } from "./domain/TechnicianCard";
export { InvoiceRow } from "./domain/InvoiceRow";
export { CPTCodeBadge, ICD10Badge } from "./domain/CPTCodeBadge";
export { MapWidget } from "./domain/MapWidget";
export type { MapMarker } from "./domain/MapWidget";
export { LiveMap } from "./domain/LiveMap";
export type { LiveMapMarker, LiveMapProps } from "./domain/LiveMap";
export { LiveMapLeaflet } from "./domain/LiveMapLeaflet";
export { OrderDetailSheet } from "./domain/OrderDetailSheet";
export { ComplianceAuditTable } from "./domain/ComplianceAuditTable";

// ── Charts ──
export * from "./charts";

// ── AI ──
// Presentational primitives only: no data fetching, no model calls.
export * from "./ai";

// ── Onboarding ──
export { RoleSelector } from "./onboarding/RoleSelector";
export { StepIndicator } from "./onboarding/StepIndicator";
export { CredentialUpload } from "./onboarding/CredentialUpload";

// ── Utilities / types ──
export { cn } from "@/lib/utils";
export { Slot } from "@/lib/slot";
export type { SlotProps } from "@/lib/slot";
export type {
  Role,
  Priority,
  OrderStatus,
  SyncStatus,
  AuditStatus,
  Order,
  Technician,
  Invoice,
  Facility,
  AuditEntry,
} from "@/lib/utils";
