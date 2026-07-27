"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { StatCard } from "@/components/ui/StatCard";
import { Avatar } from "@/components/ui/Avatar";
import { Toast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { OrderStatusBadge, PriorityBadge, SyncStatusBadge } from "@/components/ui/StatusBadge";
import { KPICard } from "@/components/ui/KPICard";
import { Sidebar } from "@/components/layout/Sidebar";
import { OrderCard } from "@/components/domain/OrderCard";
import { TechnicianCard } from "@/components/domain/TechnicianCard";
import { CPTCodeBadge, ICD10Badge } from "@/components/domain/CPTCodeBadge";
import { LiveMap } from "@/components/domain/LiveMap";
import { OrderDetailSheet } from "@/components/domain/OrderDetailSheet";
import { ComplianceAuditTable } from "@/components/domain/ComplianceAuditTable";
import { RoleSelector } from "@/components/onboarding/RoleSelector";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { CredentialUpload } from "@/components/onboarding/CredentialUpload";
import { FacilityRevenueBar } from "@/components/charts/FacilityRevenueBar";
import { ServiceSplitDonut } from "@/components/charts/ServiceSplitDonut";
import { RevenueAreaChart } from "@/components/charts/RevenueAreaChart";
import { DailyJobVolumeChart } from "@/components/charts/DailyJobVolumeChart";
import { ProcedureDistributionDonut } from "@/components/charts/ProcedureDistributionDonut";
import { RealtimeCounterCard } from "@/components/charts/RealtimeCounterCard";
import { CodeScrubberWidget } from "@/components/charts/CodeScrubberWidget";
import { ResponseTimeCard } from "@/components/charts/ResponseTimeCard";
import { MapDensityCard } from "@/components/charts/MapDensityCard";
import type { Order, Role } from "@/lib/utils";
import {
  Activity, DollarSign, Users, TrendingUp, Search,
  Palette, Layers, LayoutDashboard, BarChart3, Map, Puzzle, Sparkles, BookOpen,
} from "lucide-react";
import { DocsPanel } from "./_docs/DocsPanel";
import {
  AIStreamingText, AIThread, AIPromptInput, AISuggestionCard,
  AIConfidenceMeter, AICitationList, AIDisclaimer, AIErrorState,
} from "@/components/ai";
import type { AIMessage, AISuggestionStatus } from "@/components/ai";
import { CPTCodeBadge as CPTBadgeForAI } from "@/components/domain/CPTCodeBadge";

// ── Demo data ──────────────────────────────────────────────────────────────────
const DEMO_MARKERS = [
  { id: "s1", lng: -112.095, lat: 33.462, type: "order" as const,      label: "STAT — Chen",  priority: "stat"   as const, details: "Chest X-Ray · Sunrise Care",  status: "Pending" },
  { id: "s2", lng: -112.058, lat: 33.441, type: "order" as const,      label: "URGENT — Doe", priority: "urgent" as const, details: "Hip AP/Lat · Valley Rehab",    status: "En Route" },
  { id: "t1", lng: -112.074, lat: 33.455, type: "technician" as const, label: "Unit 04",                                   details: "T. Parker · 2 active",          status: "Online" },
  { id: "t2", lng: -112.040, lat: 33.430, type: "technician" as const, label: "Unit 07",                                   details: "A. Lopez · 1 active",           status: "Online" },
  { id: "h1", lng: -112.074, lat: 33.484, type: "hub" as const,        label: "HQ Hub",                                    details: "Main dispatch hub",             status: "Active" },
];

const DEMO_ORDER: Order = {
  id: "ORD-001",
  patientName: "Margaret Chen",
  facilityName: "Sunrise Care Center",
  address: "4820 N. Central Ave, Phoenix AZ",
  procedure: "Chest X-Ray (2-view)",
  cptCode: "71046",
  priority: "stat",
  status: "assigned",
  scheduledTime: "Now",
  distance: "1.2 mi",
  phone: "(555) 234-5678",
  assignedTech: "T. Parker",
};

const ALL_ROLES: Role[] = ["dispatcher", "technician", "billing", "client"];

// ── AI demo data ───────────────────────────────────────────────────────────────
const AI_DEMO_RESPONSE =
  "Based on the order record, this is a two-view chest X-ray performed at the " +
  "patient's bedside. That supports CPT 71046, and because the study was acquired " +
  "with portable equipment, R0070 applies as a transport surcharge. The order is " +
  "missing a primary ICD-10 diagnosis, which will reject on first submission.";

const AI_DEMO_CITATIONS = [
  {
    id: "c1",
    label: "CMS Portable X-Ray Supplier Standards",
    source: "42 CFR §486.100",
    page: "4",
    excerpt: "Transportation of equipment to the patient's location is billable under R0070.",
    href: "https://www.ecfr.gov",
  },
  {
    id: "c2",
    label: "CPT 71046 — Radiologic examination, chest; 2 views",
    source: "AMA CPT Professional Edition",
    page: "412",
  },
];

const AI_DEMO_THREAD: AIMessage[] = [
  {
    id: "m1",
    role: "user",
    content: "Why did claim INV-2041 get flagged?",
    timestamp: "10:42 AM",
  },
  {
    id: "m2",
    role: "assistant",
    content:
      "INV-2041 is missing a primary ICD-10 diagnosis. CPT 71046 requires one, so the payer will reject it on first submission.",
    timestamp: "10:42 AM",
    status: "complete",
    citations: [AI_DEMO_CITATIONS[1]],
  },
  {
    id: "m3",
    role: "user",
    content: "What should it be?",
    timestamp: "10:43 AM",
  },
  {
    id: "m4",
    role: "assistant",
    content:
      "The order notes pneumonia, which maps to J18.9 (pneumonia, unspecified organism). Confirm against the referring physician's documentation before applying it — the note is not a signed diagnosis.",
    timestamp: "10:43 AM",
    status: "complete",
  },
  {
    id: "m5",
    role: "system",
    content: "Claim re-queued for scrubbing",
    timestamp: "10:44 AM",
  },
  {
    id: "m6",
    role: "user",
    content: "Are there other claims from Sunrise Care with the same problem?",
    timestamp: "10:45 AM",
  },
  {
    id: "m7",
    role: "assistant",
    content:
      "Four other Sunrise Care claims from this week are missing a primary diagnosis: INV-2044, INV-2051, INV-2058, and INV-2063. Together they represent $1,240 in at-risk revenue.",
    timestamp: "10:45 AM",
    status: "complete",
  },
];

// ── SectionHeader helper ───────────────────────────────────────────────────────
function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-outline-variant/40 pb-2 mb-6">
      <span className="text-medical-blue">{icon}</span>
      <h3 className="text-headline-md font-bold text-midnight-navy">{title}</h3>
    </div>
  );
}

// ── Gallery ────────────────────────────────────────────────────────────────────
export default function ComponentGallery() {
  const [headerRole, setHeaderRole]   = useState<Role>("dispatcher");
  const [selectedRole, setSelectedRole] = useState<Role | undefined>();
  const [modalOpen, setModalOpen]     = useState(false);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  // ── AI demo state ──
  // Fakes a token stream so the caret, deferred announcement, and thread
  // autoscroll are all observable without wiring a real model.
  const [streamed, setStreamed]       = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [prompt, setPrompt]           = useState("");
  const [suggestionStatus, setSuggestionStatus] = useState<AISuggestionStatus>("pending");
  const streamTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopStream = useCallback(() => {
    if (streamTimer.current) clearInterval(streamTimer.current);
    streamTimer.current = null;
    setIsStreaming(false);
  }, []);

  const startStream = useCallback(() => {
    stopStream();
    setStreamed("");
    setIsStreaming(true);
    const words = AI_DEMO_RESPONSE.split(" ");
    let i = 0;
    streamTimer.current = setInterval(() => {
      i += 1;
      setStreamed(words.slice(0, i).join(" "));
      if (i >= words.length) stopStream();
    }, 55);
  }, [stopStream]);

  // Don't leave an interval running against an unmounted component.
  useEffect(() => stopStream, [stopStream]);

  return (
    <div className="min-h-screen bg-ghost-white">

      {/* ── Sticky brand header ── */}
      <header className="sticky top-0 z-50 bg-midnight-navy border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-14 flex items-center justify-between">
          <span className="text-white font-black tracking-tighter text-lg">X-Ray Design System</span>
          <span className="text-white/40 text-xs font-label font-semibold uppercase tracking-wider hidden sm:block">
            Next.js 15 · Tailwind · Leaflet + ECharts
          </span>
        </div>
      </header>

      {/* ── Tabbed gallery ── */}
      <Tabs defaultValue="foundation">

        {/* ── Horizontal tab bar ── */}
        <div className="sticky top-14 z-40 bg-white border-b border-outline-variant/40 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <TabsList className="h-auto p-0 bg-transparent border-none gap-0 overflow-x-auto flex">
              {[
                { value: "foundation", label: "Foundation",  icon: <Palette className="h-4 w-4" /> },
                { value: "primitives", label: "Primitives",  icon: <Layers className="h-4 w-4" /> },
                { value: "domain",     label: "Domain",      icon: <Puzzle className="h-4 w-4" /> },
                { value: "charts",     label: "Charts & Map",icon: <BarChart3 className="h-4 w-4" /> },
                { value: "layout",     label: "Layout",      icon: <LayoutDashboard className="h-4 w-4" /> },
                { value: "onboarding", label: "Onboarding",  icon: <Users className="h-4 w-4" /> },
                { value: "ai",         label: "AI",          icon: <Sparkles className="h-4 w-4" /> },
                { value: "docs",       label: "Docs",        icon: <BookOpen className="h-4 w-4" /> },
              ].map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-1.5 px-5 py-4 text-sm font-medium rounded-none border-b-2 border-transparent
                    text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50 transition-colors whitespace-nowrap
                    data-[state=active]:border-medical-blue data-[state=active]:text-medical-blue data-[state=active]:bg-transparent"
                >
                  {tab.icon}
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        {/* ── Content wrapper ── */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">

          {/* ════════════════════════════════
              TAB 1 — FOUNDATION
          ════════════════════════════════ */}
          <TabsContent value="foundation" className="space-y-14 mt-0">

            {/* Color Tokens */}
            <section>
              <SectionHeader icon={<Palette className="h-5 w-5" />} title="Brand Colors" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { name: "Midnight Navy", hex: "#0F172A", cls: "bg-midnight-navy" },
                  { name: "Medical Blue",  hex: "#3B82F6", cls: "bg-medical-blue" },
                  { name: "Emergency Red", hex: "#EF4444", cls: "bg-emergency-red" },
                  { name: "Warning Amber", hex: "#F59E0B", cls: "bg-warning-amber" },
                  { name: "Ghost White",   hex: "#F8FAFC", cls: "bg-ghost-white border border-outline-variant" },
                  { name: "Slate Gray",    hex: "#475569", cls: "bg-slate-gray" },
                ].map((c) => (
                  <div key={c.name}>
                    <div className={`h-20 rounded-xl ${c.cls} shadow-card`} />
                    <p className="text-xs font-semibold text-on-surface mt-2">{c.name}</p>
                    <p className="code-mono text-xs text-on-surface-variant">{c.hex}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Surface Scale */}
            <section>
              <SectionHeader icon={<Palette className="h-5 w-5" />} title="Surface Scale" />
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {[
                  { name: "Lowest",   cls: "bg-surface-container-lowest border border-outline-variant/40" },
                  { name: "Low",      cls: "bg-surface-container-low" },
                  { name: "Default",  cls: "bg-surface-container" },
                  { name: "High",     cls: "bg-surface-container-high" },
                  { name: "Highest",  cls: "bg-surface-container-highest" },
                  { name: "Surface",  cls: "bg-surface" },
                  { name: "Dim",      cls: "bg-surface-dim" },
                ].map((c) => (
                  <div key={c.name}>
                    <div className={`h-14 rounded-lg ${c.cls} shadow-card`} />
                    <p className="text-xs font-medium text-on-surface-variant mt-1.5 text-center">{c.name}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Typography */}
            <section>
              <SectionHeader icon={<Layers className="h-5 w-5" />} title="Typography Scale" />
              <Card>
                <CardContent className="space-y-6 py-7">
                  <div>
                    <p className="text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant mb-1">Headline LG · Inter 700 · 2rem</p>
                    <p className="text-headline-lg font-bold text-on-surface">Dispatch Command Center</p>
                  </div>
                  <div>
                    <p className="text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant mb-1">Headline MD · Inter 600 · 1.5rem</p>
                    <p className="text-headline-md font-semibold text-on-surface">Revenue Dashboard</p>
                  </div>
                  <div>
                    <p className="text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant mb-1">Body LG · Inter 400 · 1rem</p>
                    <p className="text-body-lg text-on-surface">Patient John Doe — Chest X-Ray (2-view)</p>
                  </div>
                  <div>
                    <p className="text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant mb-1">Body SM · Inter 400 · 0.875rem</p>
                    <p className="text-body-sm text-on-surface-variant">Scheduled for 14:30 · Valley View Rehab · 3.5 mi away</p>
                  </div>
                  <div>
                    <p className="text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant mb-1">Data Mono · JetBrains Mono 500 · 0.875rem</p>
                    <p className="code-mono text-on-surface">CPT 71046 · ICD-10 J18.9 · R0070 · $340.00</p>
                  </div>
                  <div>
                    <p className="text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant mb-1">Label Caps · Space Grotesk 600 · 0.75rem</p>
                    <p className="font-label text-label-caps font-semibold uppercase tracking-wider text-on-surface-variant">Status · Zone · Priority · Fleet</p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Shadows */}
            <section>
              <SectionHeader icon={<Layers className="h-5 w-5" />} title="Elevation / Shadows" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "shadow-card",    cls: "shadow-card",    desc: "0 2px 4px · List items" },
                  { label: "shadow-card-md", cls: "shadow-card-md", desc: "0 4px 8px · Interactive cards" },
                  { label: "shadow-card-lg", cls: "shadow-card-lg", desc: "0 8px 24px · Modals, popovers" },
                  { label: "shadow-sidebar", cls: "shadow-sidebar", desc: "2px 0 8px · Sidebar edge" },
                ].map((s) => (
                  <div key={s.label} className={`bg-white rounded-xl p-5 ${s.cls}`}>
                    <p className="font-mono text-xs font-semibold text-on-surface">{s.label}</p>
                    <p className="text-xs text-on-surface-variant mt-1">{s.desc}</p>
                  </div>
                ))}
              </div>
            </section>

          </TabsContent>

          {/* ════════════════════════════════
              TAB 2 — PRIMITIVES
          ════════════════════════════════ */}
          <TabsContent value="primitives" className="space-y-14 mt-0">

            {/* Buttons */}
            <section>
              <SectionHeader icon={<Layers className="h-5 w-5" />} title="Buttons" />
              <Card>
                <CardContent className="flex flex-wrap gap-3 py-6">
                  <Button variant="primary">Primary Action</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                  <Button variant="warning">Warning</Button>
                  <Button variant="stat">STAT Dispatch</Button>
                  <Button variant="primary" loading>Loading…</Button>
                  <Button variant="primary" disabled>Disabled</Button>
                </CardContent>
                <CardContent className="flex flex-wrap gap-3 pt-0 pb-6 border-t border-outline-variant/20">
                  <Button variant="primary" size="sm">SM</Button>
                  <Button variant="primary" size="md">MD</Button>
                  <Button variant="primary" size="lg">LG</Button>
                  <Button variant="primary" size="xl">XL — 48px Touch Target</Button>
                </CardContent>
              </Card>
            </section>

            {/* Badges & Status */}
            <section>
              <SectionHeader icon={<Activity className="h-5 w-5" />} title="Badges & Status" />
              <Card>
                <CardContent className="space-y-5 py-6">
                  <div>
                    <p className="text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant mb-3">Priority</p>
                    <div className="flex flex-wrap gap-2">
                      <PriorityBadge priority="stat" animate />
                      <PriorityBadge priority="urgent" />
                      <PriorityBadge priority="routine" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant mb-3">Order Status</p>
                    <div className="flex flex-wrap gap-2">
                      <OrderStatusBadge status="pending" />
                      <OrderStatusBadge status="assigned" />
                      <OrderStatusBadge status="en-route" />
                      <OrderStatusBadge status="in-progress" />
                      <OrderStatusBadge status="complete" />
                      <OrderStatusBadge status="billed" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant mb-3">Sync Status</p>
                    <div className="flex flex-wrap gap-2">
                      <SyncStatusBadge status="synced" />
                      <SyncStatusBadge status="pending" />
                      <SyncStatusBadge status="conflict" />
                      <SyncStatusBadge status="offline" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant mb-3">Generic Badges</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="default">Default</Badge>
                      <Badge variant="primary">Primary</Badge>
                      <Badge variant="secondary">Secondary</Badge>
                      <Badge variant="success">Success</Badge>
                      <Badge variant="stat">STAT</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Avatars */}
            <section>
              <SectionHeader icon={<Users className="h-5 w-5" />} title="Avatars" />
              <Card>
                <CardContent className="flex items-end gap-5 flex-wrap py-6">
                  <div className="flex flex-col items-center gap-2">
                    <Avatar initials="JD" size="xs" status="online" />
                    <span className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant">XS</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Avatar initials="SM" size="sm" status="busy" />
                    <span className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant">SM</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Avatar initials="RK" size="md" status="away" />
                    <span className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant">MD</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Avatar initials="TP" size="lg" status="offline" />
                    <span className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant">LG</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Avatar initials="AL" size="xl" />
                    <span className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant">XL</span>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Form Inputs */}
            <section>
              <SectionHeader icon={<Layers className="h-5 w-5" />} title="Form Inputs" />
              <Card>
                <CardContent className="grid sm:grid-cols-2 gap-5 py-6">
                  <Input label="Patient Name" placeholder="John Doe" />
                  <Input label="Facility ID" placeholder="FAC-00123" leadingIcon={<Search className="h-4 w-4" />} />
                  <Input label="CPT Code" placeholder="71046" hint="Enter the primary procedure code" className="font-mono" />
                  <Input label="ICD-10 Code" placeholder="J18.9" error="Code not found in payer database" />
                </CardContent>
              </Card>
            </section>

            {/* Stat Cards */}
            <section>
              <SectionHeader icon={<TrendingUp className="h-5 w-5" />} title="Stat Cards" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Active Orders" value={24} trend={12} trendLabel="vs yesterday"
                  icon={<Activity className="h-5 w-5 text-medical-blue" />} iconBg="bg-medical-blue/10" />
                <StatCard label="Revenue Today" value="$14,820" trend={8} trendLabel="vs avg"
                  icon={<DollarSign className="h-5 w-5 text-green-600" />} iconBg="bg-green-50" />
                <StatCard label="Field Units" value={7} unit="/ 10 online" trend={-1} trendLabel="vs norm"
                  icon={<Users className="h-5 w-5 text-midnight-navy" />} iconBg="bg-slate-100" />
                <StatCard label="Completion Rate" value="96%" trend={2} trendLabel="vs last week"
                  icon={<TrendingUp className="h-5 w-5 text-warning-amber" />} iconBg="bg-amber-50" />
              </div>
            </section>

            {/* KPI Cards */}
            <section>
              <SectionHeader icon={<DollarSign className="h-5 w-5" />} title="KPI Cards" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard label="Total Billed (MTD)" value="$1,248,590.00"
                  subtext="+12.4% vs last month" subIntent="positive" subIcon="trending_up" />
                <KPICard label="Outstanding Claims" value="$342,120.50" valueColor="text-emergency-red"
                  subtext="Avg. age: 14.2 days" subIntent="neutral" subIcon="clock" />
                <KPICard label="Reimbursement Time" value="18.5 Days" valueColor="text-medical-blue"
                  subtext="-2.1 days improvement" subIntent="info" subIcon="speed" />
                <KPICard label="Clean Claim Rate" value="94.2%"
                  subtext="3 audits flagged today" subIntent="warning" subIcon="warning" />
              </div>
            </section>

            {/* Modal */}
            <section>
              <SectionHeader icon={<Layers className="h-5 w-5" />} title="Modal" />
              <Card>
                <CardContent className="py-6 flex items-center gap-4">
                  <Button variant="primary" onClick={() => setModalOpen(true)}>Open Modal Demo</Button>
                  <span className="text-sm text-on-surface-variant">Sizes: sm / md / lg / xl · Escape key closes</span>
                </CardContent>
              </Card>
              <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Confirm Assignment"
                description="You are about to assign Unit 04 to STAT order ORD-001 for Margaret Chen at Sunrise Care Center."
                size="sm"
              >
                <div className="flex gap-3 justify-end pt-2">
                  <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                  <Button variant="stat" onClick={() => setModalOpen(false)}>Confirm STAT</Button>
                </div>
              </Modal>
            </section>

            {/* Toasts */}
            <section>
              <SectionHeader icon={<Activity className="h-5 w-5" />} title="Notifications / Toasts" />
              <div className="grid sm:grid-cols-2 gap-4">
                <Toast variant="success" title="Order Complete" description="Chest X-Ray for John Doe — billed $340.00" />
                <Toast variant="warning" title="Sync Pending" description="3 procedure logs queued for upload" />
                <Toast variant="error" title="CPT Mismatch" description="Code 71046 requires ICD-10 primary diagnosis" />
                <Toast variant="info" title="STAT Order Incoming" description="Priority dispatch — 0.8 mi from Unit 04" />
              </div>
            </section>

          </TabsContent>

          {/* ════════════════════════════════
              TAB 3 — DOMAIN
          ════════════════════════════════ */}
          <TabsContent value="domain" className="space-y-14 mt-0">

            {/* Order Cards */}
            <section>
              <SectionHeader icon={<Puzzle className="h-5 w-5" />} title="Order Cards" />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <OrderCard order={{ id: "ORD-001", patientName: "Margaret Chen", facilityName: "Sunrise Care Center",
                  address: "1.2 mi", procedure: "Chest X-Ray (2-view)", cptCode: "71046",
                  priority: "stat", status: "pending", scheduledTime: "Now", distance: "1.2 mi", phone: "(555) 234-5678" }} />
                <OrderCard order={{ id: "ORD-002", patientName: "Robert Martinez", facilityName: "Valley View Rehab",
                  address: "3.5 mi", procedure: "Hip X-Ray (AP/Lateral)", cptCode: "73520",
                  priority: "urgent", status: "en-route", scheduledTime: "2:30 PM", distance: "3.5 mi", assignedTech: "T. Parker" }} />
                <OrderCard order={{ id: "ORD-003", patientName: "Dorothy Wilson", facilityName: "Meadowbrook Nursing",
                  address: "6.1 mi", procedure: "Knee X-Ray (3-view)", cptCode: "73564",
                  priority: "routine", status: "complete", scheduledTime: "1:00 PM", distance: "6.1 mi", assignedTech: "A. Lopez" }} />
              </div>
            </section>

            {/* Order Detail Sheet */}
            <section>
              <SectionHeader icon={<Puzzle className="h-5 w-5" />} title="Order Detail Sheet" />
              <Card>
                <CardContent className="py-6 flex items-center gap-4">
                  <Button variant="stat" onClick={() => setDetailOrder(DEMO_ORDER)}>Open STAT Order Sheet</Button>
                  <span className="text-sm text-on-surface-variant">Bottom sheet · backdrop + Escape key close · status-aware actions</span>
                </CardContent>
              </Card>
              <OrderDetailSheet
                order={detailOrder}
                onClose={() => setDetailOrder(null)}
              />
            </section>

            {/* Technician Cards */}
            <section>
              <SectionHeader icon={<Users className="h-5 w-5" />} title="Technician Cards" />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <TechnicianCard tech={{ id: "T1", name: "Tomás Parker", initials: "TP", licenseNumber: "LIC-AZ-7821",
                  zone: "North District", activeOrders: 2, completedToday: 5, syncStatus: "synced",
                  batteryLevel: 78, lastSeen: "2 min ago", credentialExpiry: "Dec 2026", online: true }} />
                <TechnicianCard tech={{ id: "T2", name: "Aisha Lopez", initials: "AL", licenseNumber: "LIC-AZ-5532",
                  zone: "South District", activeOrders: 1, completedToday: 7, syncStatus: "offline",
                  batteryLevel: 12, lastSeen: "18 min ago", online: false }} />
                <TechnicianCard tech={{ id: "T3", name: "James Okafor", initials: "JO", licenseNumber: "LIC-AZ-9103",
                  zone: "East District", activeOrders: 0, completedToday: 9, syncStatus: "pending",
                  batteryLevel: 54, lastSeen: "5 min ago", credentialExpiry: "Mar 2025", online: true }} />
              </div>
            </section>

            {/* Clinical Code Badges */}
            <section>
              <SectionHeader icon={<Activity className="h-5 w-5" />} title="Clinical Code Badges" />
              <Card>
                <CardContent className="flex flex-wrap gap-3 py-6">
                  <CPTCodeBadge code="71046" description="Chest X-Ray, 2-view" />
                  <CPTCodeBadge code="71045" description="Chest X-Ray, 1-view" modifier="26" />
                  <CPTCodeBadge code="R0070" description="Portable Equipment" flagged />
                  <ICD10Badge code="J18.9" description="Pneumonia, unspecified" primary />
                  <ICD10Badge code="Z87.891" description="Personal history — nicotine" />
                </CardContent>
              </Card>
            </section>

            {/* Compliance Audit Table */}
            <section>
              <SectionHeader icon={<Activity className="h-5 w-5" />} title="Compliance Audit Table" />
              <ComplianceAuditTable />
            </section>

          </TabsContent>

          {/* ════════════════════════════════
              TAB 4 — CHARTS & MAP
          ════════════════════════════════ */}
          <TabsContent value="charts" className="space-y-14 mt-0">

            {/* Live Fleet Map */}
            <section>
              <SectionHeader icon={<Map className="h-5 w-5" />} title="Live Fleet Map" />
              <p className="text-sm text-on-surface-variant mb-4 -mt-4">
                Leaflet + CARTO Voyager tiles · STAT pulse markers · click markers for info overlay
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-widget-gap">
                <LiveMap
                  markers={DEMO_MARKERS}
                  center={[-112.074, 33.448]}
                  zoom={12}
                  height="h-96"
                  className="lg:col-span-8"
                />
                <div className="lg:col-span-4 flex flex-col gap-4">
                  <div className="bg-white p-5 rounded-xl border border-outline-variant/30 shadow-sm flex-1">
                    <h4 className="font-label text-label-caps font-semibold text-midnight-navy mb-4 pb-2 border-b border-outline-variant/30 uppercase tracking-wider">
                      Marker Taxonomy
                    </h4>
                    <div className="space-y-4">
                      {[
                        { icon: "person",         bg: "bg-medical-blue",   label: "Technician Unit",  sub: "Dynamic positioning, real-time GPS", round: true },
                        { icon: "priority_high",  bg: "bg-emergency-red",  label: "STAT Order",       sub: "Pulsing priority indicator, <30m SLA", round: true },
                        { icon: "local_hospital", bg: "bg-midnight-navy",  label: "Anchor Facility",  sub: "Fixed drop-off/pick-up coordinates",  round: false },
                      ].map((m) => (
                        <div key={m.label} className="flex items-center gap-4">
                          <div className={`w-10 h-10 ${m.round ? "rounded-full" : "rounded-lg"} ${m.bg} flex items-center justify-center text-white shrink-0`}>
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{m.icon}</span>
                          </div>
                          <div>
                            <p className="font-label text-label-caps text-[11px] text-midnight-navy font-semibold">{m.label}</p>
                            <p className="text-[10px] text-slate-gray mt-0.5">{m.sub}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-midnight-navy p-5 rounded-xl border border-slate-gray/30 shadow-md">
                    <h4 className="font-label text-label-caps font-semibold text-ghost-white mb-2 uppercase tracking-wider">Network Health</h4>
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-3xl font-bold text-medical-blue leading-none">98.4%</span>
                        <p className="text-[10px] text-slate-gray uppercase font-label tracking-wider mt-1">Fleet Connectivity</p>
                      </div>
                      <div className="flex gap-1 h-12 items-end">
                        {[4, 6, 10, 8, 12].map((h, i) => (
                          <div key={i} className={i < 2 ? "bg-medical-blue/30 w-2" : "bg-medical-blue w-2"} style={{ height: `${h * 4}px` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Chart Standards */}
            <section>
              <SectionHeader icon={<BarChart3 className="h-5 w-5" />} title="Chart Standards" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-widget-gap">
                <RevenueAreaChart />
                <DailyJobVolumeChart />
                <ProcedureDistributionDonut />
              </div>
            </section>

            {/* Dashboard Widgets */}
            <section>
              <SectionHeader icon={<BarChart3 className="h-5 w-5" />} title="Dashboard Widgets" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-widget-gap">
                <RealtimeCounterCard />
                <CodeScrubberWidget />
                <ResponseTimeCard />
                <MapDensityCard />
              </div>
            </section>

            {/* Revenue Charts */}
            <section>
              <SectionHeader icon={<TrendingUp className="h-5 w-5" />} title="Revenue Charts" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-widget-gap">
                <FacilityRevenueBar className="lg:col-span-2" />
                <ServiceSplitDonut />
              </div>
            </section>

          </TabsContent>

          {/* ════════════════════════════════
              TAB 5 — LAYOUT
          ════════════════════════════════ */}
          <TabsContent value="layout" className="space-y-14 mt-0">

            {/* Sidebar */}
            <section>
              <SectionHeader icon={<LayoutDashboard className="h-5 w-5" />} title="Sidebar Navigation" />
              <p className="text-sm text-on-surface-variant mb-4 -mt-4">
                Role-aware sidebar — 4 roles · border-r-4 active state · onLogout prop for sign out button
              </p>
              <div className="flex gap-2 mb-4">
                {ALL_ROLES.map((r) => (
                  <Button
                    key={r}
                    variant={headerRole === r ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setHeaderRole(r)}
                    className="capitalize"
                  >
                    {r}
                  </Button>
                ))}
              </div>
              <div className="flex gap-0 rounded-2xl overflow-hidden border border-outline-variant/40 shadow-card-lg h-[540px]">
                <Sidebar
                  role={headerRole}
                  activeHref={`/${headerRole}`}
                  userName="Tina Osei"
                  userInitials="TO"
                  onLogout={() => alert("Sign out clicked (demo)")}
                />
                <div className="flex-1 bg-ghost-white flex items-center justify-center text-on-surface-variant text-sm">
                  ← Switch roles above to preview each sidebar
                </div>
              </div>
            </section>

            {/* NavShell */}
            <section>
              <SectionHeader icon={<LayoutDashboard className="h-5 w-5" />} title="NavShell — Production Layout" />
              <p className="text-sm text-on-surface-variant mb-4 -mt-4">
                Composes <code className="code-mono text-xs bg-surface-container px-1 rounded">Sidebar</code> + <code className="code-mono text-xs bg-surface-container px-1 rounded">TopNav</code> with <code className="code-mono text-xs bg-surface-container px-1 rounded">useRouter</code> integration. Used on all dispatcher/billing pages in production.
              </p>
              <div className="rounded-xl overflow-hidden border border-outline-variant/40 shadow-card-lg" style={{ height: 420 }}>
                <div className="transform origin-top-left w-full h-full overflow-hidden">
                  <div className="grid" style={{ gridTemplateColumns: "256px 1fr", height: "100%" }}>
                    <Sidebar role="dispatcher" activeHref="/dispatcher" userName="Tina Osei" userInitials="TO" />
                    <div className="flex flex-col bg-ghost-white overflow-hidden">
                      <div className="h-14 bg-white border-b border-outline-variant/40 flex items-center px-6 gap-3 shrink-0">
                        <div>
                          <p className="text-sm font-semibold text-on-surface">Fleet Overview</p>
                          <p className="text-xs text-on-surface-variant">Live dispatch view</p>
                        </div>
                      </div>
                      <div className="flex-1 p-6 flex items-center justify-center text-on-surface-variant text-sm">
                        Page content goes here via <code className="code-mono text-xs bg-surface-container px-1 rounded ml-1">children</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
                <div className="bg-surface-container rounded-xl p-4">
                  <p className="font-semibold text-on-surface mb-1">NavShell props</p>
                  <code className="code-mono text-xs text-on-surface-variant block">role · title · subtitle · syncStatus · notificationCount · userName · userInitials · children · className</code>
                </div>
                <div className="bg-surface-container rounded-xl p-4">
                  <p className="font-semibold text-on-surface mb-1">ClientShell (mobile)</p>
                  <p className="text-xs text-on-surface-variant">Bottom navigation + sticky top bar for Patient/Client role. Uses rose-500 active state.</p>
                </div>
              </div>
            </section>

          </TabsContent>

          {/* ════════════════════════════════
              TAB 6 — ONBOARDING
          ════════════════════════════════ */}
          <TabsContent value="onboarding" className="space-y-14 mt-0">

            {/* Role Selector */}
            <section>
              <SectionHeader icon={<Users className="h-5 w-5" />} title="Role Selector" />
              <RoleSelector selected={selectedRole} onSelect={setSelectedRole} />
              {selectedRole && (
                <p className="mt-4 text-sm text-on-surface-variant">
                  Selected: <span className="font-semibold text-on-surface capitalize">{selectedRole}</span>
                </p>
              )}
            </section>

            {/* Step Indicator */}
            <section>
              <SectionHeader icon={<Activity className="h-5 w-5" />} title="Step Indicator" />
              <Card>
                <CardContent className="py-6">
                  <StepIndicator currentStep={2} steps={[
                    { label: "Account Creation",      description: "Secure HIPAA-compliant profile" },
                    { label: "Facility Verification", description: "Link your Facility ID" },
                    { label: "Role Selection",        description: "Dispatcher, Technician, or Billing" },
                    { label: "Device Setup",          description: "PWA install or desktop routing" },
                  ]} />
                </CardContent>
              </Card>
            </section>

            {/* Credential Upload */}
            <section>
              <SectionHeader icon={<Activity className="h-5 w-5" />} title="Credential Upload" />
              <div className="max-w-sm">
                <CredentialUpload label="Radiologic Technologist License" required />
              </div>
            </section>

          </TabsContent>

          {/* ════════════════════════════════
              TAB 7 — AI
          ════════════════════════════════ */}
          <TabsContent value="ai" className="space-y-14 mt-0">

            {/* Streaming */}
            <section>
              <SectionHeader icon={<Sparkles className="h-5 w-5" />} title="Streaming Output" />
              <Card>
                <CardContent className="py-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={startStream} disabled={isStreaming}>
                      Start stream
                    </Button>
                    <Button size="sm" variant="outline" onClick={stopStream} disabled={!isStreaming}>
                      Stop
                    </Button>
                    <span className="text-xs text-on-surface-variant">
                      Caret blinks while streaming; screen readers are told once on completion, not per token.
                    </span>
                  </div>

                  <div className="rounded-xl border border-ai-border bg-ai-surface p-4 min-h-24">
                    <AIStreamingText
                      text={streamed}
                      isStreaming={isStreaming}
                      pending={isStreaming && streamed.length === 0}
                    />
                  </div>

                  <AIDisclaimer variant="review-required" />
                </CardContent>
              </Card>
            </section>

            {/* Thread + prompt */}
            <section>
              <SectionHeader icon={<Sparkles className="h-5 w-5" />} title="Thread & Prompt Input" />
              <Card>
                <CardContent className="py-6 space-y-3">
                  <AIThread
                    messages={AI_DEMO_THREAD}
                    maxHeight="20rem"
                    showTimestamps
                    className="rounded-xl border border-outline-variant/40 bg-surface-container-low"
                  />
                  <AIPromptInput
                    value={prompt}
                    onChange={setPrompt}
                    onSubmit={() => setPrompt("")}
                    onStop={stopStream}
                    isStreaming={isStreaming}
                    maxLength={500}
                    hint="Enter to send · Shift+Enter for a new line"
                  />
                </CardContent>
              </Card>
            </section>

            {/* Suggestion + confidence */}
            <section>
              <SectionHeader icon={<Sparkles className="h-5 w-5" />} title="Suggestions & Confidence" />
              <div className="grid gap-widget-gap lg:grid-cols-2">
                <AISuggestionCard
                  title="Suggested coding"
                  confidence={0.91}
                  status={suggestionStatus}
                  onAccept={() => setSuggestionStatus("accepted")}
                  onReject={() => setSuggestionStatus("rejected")}
                  acceptLabel="Apply codes"
                  rationale={
                    <>
                      Two-view bedside chest study. <strong>R0070</strong> applies because the
                      study used portable equipment. No primary diagnosis is on the order, which
                      is the flag reason.
                    </>
                  }
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <CPTBadgeForAI code="71046" description="Chest X-Ray 2-View" />
                    <CPTBadgeForAI code="R0070" description="Portable transport" />
                  </div>
                </AISuggestionCard>

                <Card>
                  <CardContent className="py-6 space-y-4">
                    <p className="text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">
                      Confidence bands
                    </p>
                    {[0.94, 0.66, 0.28].map((score) => (
                      <div key={score} className="flex items-center justify-between gap-4">
                        <span className="font-mono text-xs text-on-surface-variant">
                          score {score}
                        </span>
                        <AIConfidenceMeter score={score} />
                      </div>
                    ))}
                    <p className="text-xs leading-relaxed text-on-surface-variant">
                      Bands, not percentages — a raw &ldquo;91%&rdquo; reads as probability of
                      correctness, which a model score is not.
                    </p>
                    {suggestionStatus !== "pending" && (
                      <Button size="sm" variant="ghost" onClick={() => setSuggestionStatus("pending")}>
                        Reset suggestion
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Citations */}
            <section>
              <SectionHeader icon={<Sparkles className="h-5 w-5" />} title="Citations" />
              <AICitationList citations={AI_DEMO_CITATIONS} />
            </section>

            {/* Errors & disclaimers */}
            <section>
              <SectionHeader icon={<Sparkles className="h-5 w-5" />} title="Refusals, Errors & Disclaimers" />
              <div className="grid gap-widget-gap lg:grid-cols-2">
                {/* No retry offered — resending a refused prompt returns the same answer. */}
                <AIErrorState variant="refusal" onRetry={() => {}} />
                <AIErrorState variant="rate-limit" onRetry={() => {}} />
                <AIErrorState variant="network" onRetry={() => {}} />
                <AIErrorState variant="unknown" onRetry={() => {}} />
              </div>
              <div className="mt-4 space-y-2">
                <AIDisclaimer variant="not-diagnostic" />
                <AIDisclaimer variant="review-required" />
                <AIDisclaimer variant="generated" />
              </div>
            </section>

          </TabsContent>

          {/* ════════════════════════════════
              TAB 8 — DOCS
          ════════════════════════════════ */}
          <TabsContent value="docs" className="mt-0">
            <DocsPanel />
          </TabsContent>

        </div>
      </Tabs>

      {/* Footer */}
      <footer className="mt-16 bg-midnight-navy px-8 py-6 text-center">
        <p className="text-white/40 text-xs font-label font-semibold uppercase tracking-wider">
          X-Ray Logistics Design System · Next.js 15 · Tailwind CSS · Leaflet + ECharts
        </p>
        <p className="text-white/20 text-xs mt-1 code-mono">
          4 roles · 50+ components · 6 categories
        </p>
      </footer>
    </div>
  );
}
