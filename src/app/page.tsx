"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { StatCard } from "@/components/ui/StatCard";
import { Avatar } from "@/components/ui/Avatar";
import { Toast } from "@/components/ui/Toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { OrderStatusBadge, PriorityBadge, SyncStatusBadge } from "@/components/ui/StatusBadge";
import { Sidebar } from "@/components/layout/Sidebar";
import { OrderCard } from "@/components/domain/OrderCard";
import { TechnicianCard } from "@/components/domain/TechnicianCard";
import { CPTCodeBadge, ICD10Badge } from "@/components/domain/CPTCodeBadge";
import dynamic from "next/dynamic";
const LiveMap = dynamic(() => import("@/components/domain/LiveMap").then(m => m.LiveMap), { ssr: false });
import { RoleSelector } from "@/components/onboarding/RoleSelector";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { FacilityRevenueBar } from "@/components/charts/FacilityRevenueBar";
import { ServiceSplitDonut } from "@/components/charts/ServiceSplitDonut";
import { RevenueAreaChart } from "@/components/charts/RevenueAreaChart";
import { DailyJobVolumeChart } from "@/components/charts/DailyJobVolumeChart";
import { ProcedureDistributionDonut } from "@/components/charts/ProcedureDistributionDonut";
import { RealtimeCounterCard } from "@/components/charts/RealtimeCounterCard";
import { CodeScrubberWidget } from "@/components/charts/CodeScrubberWidget";
import { ResponseTimeCard } from "@/components/charts/ResponseTimeCard";
import { MapDensityCard } from "@/components/charts/MapDensityCard";
import { ComplianceAuditTable } from "@/components/domain/ComplianceAuditTable";
import { KPICard } from "@/components/ui/KPICard";
import type { Role } from "@/lib/utils";
import { Activity, DollarSign, Users, TrendingUp, Search } from "lucide-react";

const DEMO_MARKERS = [
  { id: "s1", lng: -112.095, lat: 33.462, type: "order" as const,      label: "STAT — Chen",  priority: "stat"    as const, details: "Chest X-Ray · Sunrise Care", status: "Pending" },
  { id: "s2", lng: -112.058, lat: 33.441, type: "order" as const,      label: "URGENT — Doe", priority: "urgent"  as const, details: "Hip AP/Lat · Valley Rehab",   status: "En Route" },
  { id: "t1", lng: -112.074, lat: 33.455, type: "technician" as const, label: "Unit 04",                                    details: "T. Parker · 2 active",         status: "Online" },
  { id: "t2", lng: -112.040, lat: 33.430, type: "technician" as const, label: "Unit 07",                                    details: "A. Lopez · 1 active",          status: "Online" },
  { id: "h1", lng: -112.074, lat: 33.484, type: "hub" as const,        label: "HQ Hub",                                     details: "Main dispatch hub",            status: "Active" },
];

export default function ComponentGallery() {
  const [headerRole, setHeaderRole] = useState<Role>("dispatcher");
  const [selectedRole, setSelectedRole] = useState<Role | undefined>();

  return (
    <div className="min-h-screen bg-ghost-white">

      {/* ── PAGE HEADER ── */}
      <header className="sticky top-0 z-50 bg-midnight-navy border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-14 flex items-center">
          <span className="text-white font-black tracking-tighter text-lg">Design System</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-20">

        {/* ═══════════════════════════════════════
            SECTION: SIDEBAR
        ═══════════════════════════════════════ */}
        <section>
          <h2 className="text-headline-md font-bold text-on-surface mb-2">Sidebar Navigation</h2>
          <p className="text-sm text-on-surface-variant mb-6">Role-aware sidebar — matching wireframe (border-r-4 active state)</p>
          <div className="flex gap-0 rounded-2xl overflow-hidden border border-outline-variant/40 shadow-card-lg h-[520px]">
            <Sidebar role={headerRole} activeHref={`/${headerRole}`} userName="Tina Osei" userInitials="TO" />
            <div className="flex-1 bg-ghost-white flex flex-col">
              <div className="p-6 border-b border-outline-variant/40 bg-surface-container-lowest flex items-center gap-4">
                <div className="flex gap-2">
                  {(["dispatcher", "technician", "billing"] as Role[]).map((r) => (
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
              </div>
              <div className="flex-1 flex items-center justify-center text-on-surface-variant text-sm">
                ← Select a role to see the sidebar change
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            SECTION: DATAVIZ & LIVE MAP STANDARDS
        ═══════════════════════════════════════ */}
        <section className="space-y-12">
          <div>
            <h2 className="text-headline-md font-bold text-on-surface mb-1">DataViz & Live Map Standards</h2>
            <p className="text-sm text-on-surface-variant">
              Design specification and visual standard library for the Billing and Fleet Orchestration modules.
            </p>
          </div>

          {/* ── Chart Standards ── */}
          <div>
            <div className="flex items-center gap-2 border-b border-outline-variant/40 pb-2 mb-6">
              <Activity className="h-5 w-5 text-medical-blue" />
              <h3 className="text-headline-md font-bold text-midnight-navy">Chart Standards</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-widget-gap">
              <RevenueAreaChart />
              <DailyJobVolumeChart />
              <ProcedureDistributionDonut />
            </div>
          </div>

          {/* ── Live Map Elements ── */}
          <div>
            <div className="flex items-center gap-2 border-b border-outline-variant/40 pb-2 mb-6">
              <TrendingUp className="h-5 w-5 text-medical-blue" />
              <h3 className="text-headline-md font-bold text-midnight-navy">Live Map Elements</h3>
            </div>
            <p className="text-sm text-on-surface-variant mb-4">
              Mapbox GL JS · dark-v11 style · STAT pulse markers · 50m geofencing ready.
              Set <code className="code-mono text-xs bg-surface-container px-1 rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code> for live rendering.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-widget-gap">
              <LiveMap
                markers={DEMO_MARKERS}
                center={[-112.074, 33.448]}
                zoom={12}
                height="h-96"
                className="lg:col-span-8"
              />
              {/* Marker Taxonomy + Network Health */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="bg-white p-5 rounded-xl border border-outline-variant/30 shadow-sm flex-1">
                  <h4 className="font-label text-label-caps font-semibold text-midnight-navy mb-4 pb-2 border-b border-outline-variant/30 uppercase tracking-wider">
                    Marker Taxonomy
                  </h4>
                  <div className="space-y-4">
                    {[
                      { icon: "person", bg: "bg-medical-blue", label: "Technician Unit", sub: "Dynamic positioning, real-time GPS" },
                      { icon: "priority_high", bg: "bg-emergency-red", label: "STAT Order", sub: "Pulsing priority indicator, <30m SLA" },
                      { icon: "local_hospital", bg: "bg-midnight-navy", label: "Anchor Facility", sub: "Fixed drop-off/pick-up coordinates", square: true },
                    ].map((m) => (
                      <div key={m.label} className="flex items-center gap-4">
                        <div className={`w-10 h-10 ${m.square ? "rounded-lg" : "rounded-full"} ${m.bg} flex items-center justify-center text-white shrink-0`}>
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

                {/* Network Health */}
                <div className="bg-midnight-navy p-5 rounded-xl border border-slate-gray/30 shadow-md">
                  <h4 className="font-label text-label-caps font-semibold text-ghost-white mb-2 uppercase tracking-wider">Network Health</h4>
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-3xl font-bold text-medical-blue leading-none">98.4%</span>
                      <p className="text-[10px] text-slate-gray uppercase font-label tracking-wider mt-1">Fleet Connectivity</p>
                    </div>
                    <div className="flex gap-1 h-12 items-end">
                      {[4, 6, 10, 8, 12].map((h, i) => (
                        <div
                          key={i}
                          className={i < 2 ? "bg-medical-blue/30 w-2" : "bg-medical-blue w-2"}
                          style={{ height: `${h * 4}px` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Dashboard Widgets ── */}
          <div>
            <div className="flex items-center gap-2 border-b border-outline-variant/40 pb-2 mb-6">
              <Users className="h-5 w-5 text-medical-blue" />
              <h3 className="text-headline-md font-bold text-midnight-navy">Dashboard Widgets</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-widget-gap">
              <RealtimeCounterCard />
              <CodeScrubberWidget />
              <ResponseTimeCard />
              <MapDensityCard />
            </div>
          </div>

          {/* ── KPI Cards ── */}
          <div>
            <div className="flex items-center gap-2 border-b border-outline-variant/40 pb-2 mb-6">
              <DollarSign className="h-5 w-5 text-medical-blue" />
              <h3 className="text-headline-md font-bold text-midnight-navy">KPI Cards — Billing Manager</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-widget-gap">
              <KPICard label="Total Billed (MTD)" value="$1,248,590.00"
                subtext="+12.4% vs last month" subIntent="positive" subIcon="trending_up" />
              <KPICard label="Outstanding Claims" value="$342,120.50" valueColor="text-emergency-red"
                subtext="Avg. age: 14.2 days" subIntent="neutral" subIcon="clock" />
              <KPICard label="Reimbursement Time" value="18.5 Days" valueColor="text-medical-blue"
                subtext="-2.1 days improvement" subIntent="info" subIcon="speed" />
              <KPICard label="Clean Claim Rate" value="94.2%"
                subtext="3 audits flagged today" subIntent="warning" subIcon="warning" />
            </div>
          </div>

          {/* ── Revenue Charts ── */}
          <div>
            <div className="flex items-center gap-2 border-b border-outline-variant/40 pb-2 mb-6">
              <TrendingUp className="h-5 w-5 text-medical-blue" />
              <h3 className="text-headline-md font-bold text-midnight-navy">Revenue Charts</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-widget-gap">
              <FacilityRevenueBar className="lg:col-span-2" />
              <ServiceSplitDonut />
            </div>
          </div>

          {/* ── Compliance Audit Table ── */}
          <div>
            <div className="flex items-center gap-2 border-b border-outline-variant/40 pb-2 mb-6">
              <Activity className="h-5 w-5 text-medical-blue" />
              <h3 className="text-headline-md font-bold text-midnight-navy">Compliance Audit Table</h3>
            </div>
            <ComplianceAuditTable />
          </div>
        </section>

        {/* ═══════════════════════════════════════
            SECTION: STAT CARDS
        ═══════════════════════════════════════ */}
        <section>
          <h2 className="text-headline-md font-bold text-on-surface mb-6">Stat Cards</h2>
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

        {/* ═══════════════════════════════════════
            SECTION: COLOR TOKENS
        ═══════════════════════════════════════ */}
        <section>
          <h2 className="text-headline-md font-bold text-on-surface mb-6">Color Tokens</h2>
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

        {/* ═══════════════════════════════════════
            SECTION: TYPOGRAPHY
        ═══════════════════════════════════════ */}
        <section>
          <h2 className="text-headline-md font-bold text-on-surface mb-6">Typography</h2>
          <Card>
            <CardContent className="space-y-5 py-6">
              <div><p className="text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant mb-1">Headline LG — Inter 700</p>
                <p className="text-headline-lg font-bold text-on-surface">Dispatch Command Center</p></div>
              <div><p className="text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant mb-1">Headline MD — Inter 600</p>
                <p className="text-headline-md font-semibold text-on-surface">Revenue Dashboard</p></div>
              <div><p className="text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant mb-1">Body LG — Inter 400</p>
                <p className="text-body-lg text-on-surface">Patient John Doe — Chest X-Ray (2-view)</p></div>
              <div><p className="text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant mb-1">Data Mono — JetBrains Mono 500</p>
                <p className="code-mono text-on-surface">CPT 71046 · ICD-10 J18.9 · R0070 · $340.00</p></div>
              <div><p className="text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant mb-1">Label Caps — Space Grotesk 600</p>
                <p className="font-label text-label-caps font-semibold uppercase tracking-wider text-on-surface-variant">Status · Zone · Priority · Fleet</p></div>
            </CardContent>
          </Card>
        </section>

        {/* ═══════════════════════════════════════
            SECTION: BUTTONS
        ═══════════════════════════════════════ */}
        <section>
          <h2 className="text-headline-md font-bold text-on-surface mb-6">Buttons</h2>
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

        {/* ═══════════════════════════════════════
            SECTION: BADGES & STATUS
        ═══════════════════════════════════════ */}
        <section>
          <h2 className="text-headline-md font-bold text-on-surface mb-6">Badges & Status</h2>
          <Card>
            <CardContent className="space-y-4 py-6">
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
            </CardContent>
          </Card>
        </section>

        {/* ═══════════════════════════════════════
            SECTION: ORDER CARDS
        ═══════════════════════════════════════ */}
        <section>
          <h2 className="text-headline-md font-bold text-on-surface mb-6">Order Cards</h2>
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

        {/* ═══════════════════════════════════════
            SECTION: TECHNICIAN CARDS
        ═══════════════════════════════════════ */}
        <section>
          <h2 className="text-headline-md font-bold text-on-surface mb-6">Technician Cards</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <TechnicianCard tech={{ id: "T1", name: "Tomás Parker", initials: "TP", licenseNumber: "LIC-AZ-7821",
              zone: "North District", activeOrders: 2, completedToday: 5, syncStatus: "synced",
              batteryLevel: 78, lastSeen: "2 min ago", credentialExpiry: "Dec 2026", online: true }} />
            <TechnicianCard tech={{ id: "T2", name: "Aisha Lopez", initials: "AL", licenseNumber: "LIC-AZ-5532",
              zone: "South District", activeOrders: 1, completedToday: 7, syncStatus: "offline",
              batteryLevel: 12, lastSeen: "18 min ago", online: false }} />
          </div>
        </section>

        {/* ═══════════════════════════════════════
            SECTION: CLINICAL CODES
        ═══════════════════════════════════════ */}
        <section>
          <h2 className="text-headline-md font-bold text-on-surface mb-6">Clinical Code Badges</h2>
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

        {/* ═══════════════════════════════════════
            SECTION: FORM INPUTS
        ═══════════════════════════════════════ */}
        <section>
          <h2 className="text-headline-md font-bold text-on-surface mb-6">Form Inputs</h2>
          <Card>
            <CardContent className="grid sm:grid-cols-2 gap-5 py-6">
              <Input label="Patient Name" placeholder="John Doe" />
              <Input label="Facility ID" placeholder="FAC-00123" leadingIcon={<Search className="h-4 w-4" />} />
              <Input label="CPT Code" placeholder="71046" hint="Enter the primary procedure code" className="font-mono" />
              <Input label="ICD-10 Code" placeholder="J18.9" error="Code not found in payer database" />
            </CardContent>
          </Card>
        </section>

        {/* ═══════════════════════════════════════
            SECTION: AVATARS
        ═══════════════════════════════════════ */}
        <section>
          <h2 className="text-headline-md font-bold text-on-surface mb-6">Avatars</h2>
          <Card>
            <CardContent className="flex items-end gap-4 flex-wrap py-6">
              <Avatar initials="JD" size="xs" status="online" />
              <Avatar initials="SM" size="sm" status="busy" />
              <Avatar initials="RK" size="md" status="away" />
              <Avatar initials="TP" size="lg" status="offline" />
              <Avatar initials="AL" size="xl" />
            </CardContent>
          </Card>
        </section>

        {/* ═══════════════════════════════════════
            SECTION: TOASTS
        ═══════════════════════════════════════ */}
        <section>
          <h2 className="text-headline-md font-bold text-on-surface mb-6">Notifications / Toasts</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Toast variant="success" title="Order Complete" description="Chest X-Ray for John Doe — billed $340.00" />
            <Toast variant="warning" title="Sync Pending" description="3 procedure logs queued for upload" />
            <Toast variant="error" title="CPT Mismatch" description="Code 71046 requires ICD-10 primary diagnosis" />
            <Toast variant="info" title="STAT Order Incoming" description="Priority dispatch — 0.8 mi from Unit 04" />
          </div>
        </section>

        {/* ═══════════════════════════════════════
            SECTION: ONBOARDING
        ═══════════════════════════════════════ */}
        <section>
          <h2 className="text-headline-md font-bold text-on-surface mb-6">Onboarding — Role Selector</h2>
          <RoleSelector selected={selectedRole} onSelect={setSelectedRole} />
        </section>

        <section>
          <h2 className="text-headline-md font-bold text-on-surface mb-6">Onboarding — Step Indicator</h2>
          <Card>
            <CardContent className="py-6">
              <StepIndicator currentStep={2} steps={[
                { label: "Account Creation",   description: "Secure HIPAA-compliant profile" },
                { label: "Facility Verification", description: "Link your Facility ID" },
                { label: "Role Selection",     description: "Dispatcher, Technician, or Billing" },
                { label: "Device Setup",       description: "PWA install or desktop routing" },
              ]} />
            </CardContent>
          </Card>
        </section>

      </div>

      {/* Footer */}
      <footer className="mt-16 bg-midnight-navy px-8 py-6 text-center">
        <p className="text-white/40 text-xs font-label font-semibold uppercase tracking-wider">
          X-Ray Logistics Design System · Next.js 15 · Tailwind CSS · Mapbox GL
        </p>
        <p className="text-white/20 text-xs mt-1 code-mono">
          Stitch project/793201219583559211 · 32 screens · 3 roles
        </p>
      </footer>
    </div>
  );
}
