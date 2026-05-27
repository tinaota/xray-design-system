// Base UI
export { Button, buttonVariants } from "./ui/Button";
export type { ButtonProps } from "./ui/Button";

export { Badge } from "./ui/Badge";
export type { BadgeProps } from "./ui/Badge";

export { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/Card";

export { Input } from "./ui/Input";
export type { InputProps } from "./ui/Input";

export { Select } from "./ui/Select";
export type { SelectProps } from "./ui/Select";

export { Modal } from "./ui/Modal";

export { Toast, ToastContainer } from "./ui/Toast";
export type { ToastVariant } from "./ui/Toast";

export { Avatar } from "./ui/Avatar";

export { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/Tabs";

export { StatCard } from "./ui/StatCard";

export { KPICard } from "./ui/KPICard";

export { DataTable } from "./ui/DataTable";
export type { Column } from "./ui/DataTable";

export { OrderStatusBadge, PriorityBadge, SyncStatusBadge } from "./ui/StatusBadge";

// Layout
export { Sidebar } from "./layout/Sidebar";
export { TopNav } from "./layout/TopNav";
export { PageLayout } from "./layout/PageLayout";
export { NavShell } from "./layout/NavShell";
export { ClientShell } from "./layout/ClientShell";

// Domain
export { OrderCard } from "./domain/OrderCard";
export { TechnicianCard } from "./domain/TechnicianCard";
export { InvoiceRow } from "./domain/InvoiceRow";
export { CPTCodeBadge, ICD10Badge } from "./domain/CPTCodeBadge";
export { MapWidget } from "./domain/MapWidget";
export type { MapMarker } from "./domain/MapWidget";
export { LiveMap } from "./domain/LiveMap";
export type { LiveMapMarker, LiveMapProps } from "./domain/LiveMap";
export { OrderDetailSheet } from "./domain/OrderDetailSheet";
export { ComplianceAuditTable } from "./domain/ComplianceAuditTable";

// Charts
export { FacilityRevenueBar } from "./charts/FacilityRevenueBar";
export { ServiceSplitDonut } from "./charts/ServiceSplitDonut";
export { RevenueAreaChart } from "./charts/RevenueAreaChart";
export { DailyJobVolumeChart } from "./charts/DailyJobVolumeChart";
export { ProcedureDistributionDonut } from "./charts/ProcedureDistributionDonut";
export { RealtimeCounterCard } from "./charts/RealtimeCounterCard";
export { CodeScrubberWidget } from "./charts/CodeScrubberWidget";
export { ResponseTimeCard } from "./charts/ResponseTimeCard";
export { MapDensityCard } from "./charts/MapDensityCard";

// Onboarding
export { RoleSelector } from "./onboarding/RoleSelector";
export { StepIndicator } from "./onboarding/StepIndicator";
export { CredentialUpload } from "./onboarding/CredentialUpload";

// Utilities / types
export { cn } from "@/lib/utils";
export type {
  Role, Priority, OrderStatus, SyncStatus, AuditStatus,
  Order, Technician, Invoice, Facility, AuditEntry,
} from "@/lib/utils";
