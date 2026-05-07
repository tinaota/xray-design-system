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
export type { } from "./ui/KPICard";

export { DataTable } from "./ui/DataTable";
export type { Column } from "./ui/DataTable";

export { OrderStatusBadge, PriorityBadge, SyncStatusBadge } from "./ui/StatusBadge";

// Layout
export { Sidebar } from "./layout/Sidebar";
export { TopNav } from "./layout/TopNav";
export { PageLayout } from "./layout/PageLayout";

// Domain
export { OrderCard } from "./domain/OrderCard";
export type { Order } from "./domain/OrderCard";

export { TechnicianCard } from "./domain/TechnicianCard";
export type { Technician } from "./domain/TechnicianCard";

export { InvoiceRow } from "./domain/InvoiceRow";
export type { Invoice } from "./domain/InvoiceRow";

export { CPTCodeBadge, ICD10Badge } from "./domain/CPTCodeBadge";

export { MapWidget } from "./domain/MapWidget";
export type { MapMarker } from "./domain/MapWidget";

export { ComplianceAuditTable } from "./domain/ComplianceAuditTable";

// DataViz & Live Map — wireframe-accurate chart components
export { FacilityRevenueBar } from "./charts/FacilityRevenueBar";
export { ServiceSplitDonut } from "./charts/ServiceSplitDonut";

// Onboarding
export { RoleSelector } from "./onboarding/RoleSelector";
export { StepIndicator } from "./onboarding/StepIndicator";
export { CredentialUpload } from "./onboarding/CredentialUpload";

// Utilities / types
export { cn } from "@/lib/utils";
export type { Role, Priority, OrderStatus, SyncStatus } from "@/lib/utils";
