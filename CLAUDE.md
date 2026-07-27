# Mobile X-Ray Logistics Platform — Development Guide

> This file is Claude Code's primary reference for building the Mobile X-Ray Logistics Platform.
> Read this before touching any file. Update it as decisions are made.

---

## Project Overview

A full-stack, role-based mobile X-ray logistics platform for dispatching portable X-ray technicians to healthcare facilities, managing field operations, and processing medical billing/revenue. Three distinct user roles, each with their own dashboard and workflow.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 3 · ECharts · Mapbox GL · Supabase

**Design System Repo:** `C:\Users\tinao\.gemini\antigravity\scratch\xray-design-system`
**GitHub:** https://github.com/tinaota/xray-design-system
**Dev Server:** `npm run dev` → http://localhost:3000

---

## Wireframe Reference

> **TODO:** Google Stitch MCP was not connected at time of writing.
> Once reconnected via claude.ai → Settings → Integrations, run:
> `get high-fidelity wireframes from Mobile X-Ray Logistics stitch file`
> and paste the screen specs into this section for each role below.

Screen specs should be added per role under:
- `## Role: Dispatcher` → Dispatcher screens
- `## Role: Technician` → Technician/Field screens
- `## Role: Billing Manager` → Billing screens

---

## Architecture

```
src/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx            # Root layout (fonts, metadata)
│   ├── page.tsx              # Component gallery / design system demo
│   ├── (dispatcher)/         # Dispatcher role pages [TO BUILD]
│   ├── (technician)/         # Technician role pages [TO BUILD]
│   └── (billing)/            # Billing role pages [TO BUILD]
├── components/
│   ├── ui/                   # Primitive UI components
│   ├── layout/               # Shell components (Sidebar, AppHeader, PageLayout, TopNav)
│   ├── charts/               # Data visualization components
│   ├── domain/               # Business-logic components
│   └── onboarding/           # Onboarding flow components
└── lib/
    └── utils.ts              # Core types, cn() utility
```

### Route Structure

```
/                             # Landing / role selector
/onboarding                   # Onboarding flow (role + credential)

/dispatcher                   # Dispatcher dashboard (fleet overview)
/dispatcher/orders            # Order queue & assignment
/dispatcher/fleet             # Technician fleet management
/dispatcher/intake            # Facility management
/dispatcher/reports           # Analytics & reports

/technician                   # Technician field view (active order)
/technician/manifest          # Daily manifest / order list
/technician/equipment         # Equipment checklist
/technician/offline           # Offline sync log

/billing                      # Billing dashboard (revenue overview)
/billing/invoices             # Invoice list & detail
/billing/ledger               # Ledger / transaction history
/billing/scrubbing            # Compliance & code scrubbing
/billing/audit                # Audit log
/billing/reports              # Revenue reports
```

---

## Core Domain Types

All types live in [src/lib/utils.ts](src/lib/utils.ts). Never redefine them elsewhere.

```typescript
type Role = "dispatcher" | "technician" | "billing" | "client"
type Priority = "stat" | "urgent" | "routine"
type OrderStatus = "pending" | "assigned" | "en-route" | "in-progress" | "complete" | "billed"
type SyncStatus = "synced" | "pending" | "conflict" | "offline"
type AuditStatus = "verified" | "flagged" | "pending"

interface Order {
  id: string
  patientName: string
  facilityName: string
  address: string
  procedure: string          // e.g. "Chest X-Ray 2-View"
  cptCode: string            // e.g. "71046"
  priority: Priority
  status: OrderStatus
  scheduledTime: string
  distance?: string
  assignedTech?: string
  phone?: string
  reportStatus?: "pending" | "dictated" | "signed" | "delivered"
}

interface Technician {
  id: string
  name: string
  initials: string
  licenseNumber: string      // Monospace display
  zone: string               // e.g. "North District"
  activeOrders: number
  completedToday: number
  syncStatus: SyncStatus
  batteryLevel?: number      // 0-100
  lastSeen?: string
  credentialExpiry?: string
  online: boolean
  hourlyRate?: number        // Fully-loaded hourly rate (USD)
}

interface Invoice {
  id: string
  patientName: string
  facilityName: string
  serviceDate: string
  cptCode: string
  icd10Code: string
  urgencyFactor: number      // Multiplier (1.0, 1.5, 2.0)
  baseFee: number
  r0070Fee: number           // Portable equipment surcharge
  mileageFee: number
  totalAmount: number
  status: OrderStatus
  hasFlag?: boolean
  flagReason?: string
}

interface Facility {
  id: string
  name: string
  address: string
  phone: string
  contactName: string
  activeOrderCount: number
}

interface AuditEntry {
  id: string
  invoiceId: string
  patientName: string
  facilityName: string
  cptCode: string
  status: AuditStatus
  revenueImpact: number      // positive = recovered, negative = written off
  reviewedAt?: string
  reviewer?: string
  notes?: string
}
```

---

## Design System

### Token architecture

Colors are **CSS variables holding RGB channel triplets**, declared in
[src/app/globals.css](src/app/globals.css) and referenced from
[tailwind.config.ts](tailwind.config.ts) as `rgb(var(--color-x) / <alpha-value>)`.

Two consequences worth knowing before you touch color:

1. **Theming is a variable override.** `.high-contrast` re-points the tokens and
   every Tailwind utility follows — no component changes. (Colors used to be
   literal hex in the config, which is why `highContrast` silently did nothing.)
2. **The `<alpha-value>` placeholder is required.** It's what keeps
   `border-outline-variant/40` working. A variable holding a hex string breaks
   every opacity modifier in the codebase.

To add a color: define the triplet in `globals.css`, then reference it in
`tailwind.config.ts`. Never inline a hex value in a component.

| Token | Hex | Usage |
|-------|-----|-------|
| `midnight-navy` | `#0F172A` | App shell, headers, dark surfaces |
| `medical-blue` | `#3B82F6` | Primary actions, links, routine orders |
| `emergency-red` | `#EF4444` | STAT orders, critical alerts, errors |
| `warning-amber` | `#F59E0B` | Urgent orders, warnings |
| `ghost-white` | `#F8FAFC` | Page background |
| `slate-gray` | `#475569` | Secondary text, disabled states |
| `surface` | `#fcf8fa` | Card surfaces |
| `on-surface` | `#1b1b1d` | Primary text |
| `outline-variant` | `#c6c6cd` | Card borders, dividers |

### Status tokens

Use these for any state tint instead of a raw Tailwind palette color. Each group
provides `DEFAULT` (solid), `-container` (tint), `-on-container` (text on tint),
and `-border`:

```
success  complete  info  transit  warning  conflict  danger  neutral
```

```tsx
// Yes — themes correctly, survives high-contrast
<span className="bg-success-container text-success-on-container border-success-border" />

// No — off-palette, and stays pale-on-pale in high-contrast mode
<span className="bg-green-100 text-green-800" />
```

### Priority Color System

```
STAT    → emergency-red (#EF4444)  + pulse-stat animation
URGENT  → warning-amber (#F59E0B)
ROUTINE → medical-blue  (#3B82F6)
```

Always use `<PriorityBadge priority={order.priority} />` — never hardcode colors.

### Typography Classes

```
headline-lg   → font-headline text-3xl font-bold       (page titles)
headline-md   → font-headline text-2xl font-semibold   (section headers)
body-lg       → font-body text-base                    (body copy)
body-sm       → font-body text-sm                      (captions, meta)
data-mono     → font-mono text-sm font-medium          (CPT codes, IDs, amounts)
label-caps    → font-label text-xs font-semibold uppercase tracking-wider
```

CPT codes, license numbers, invoice IDs, dollar amounts → always `font-mono`.

### Spacing & Touch Targets

- Minimum touch target: `h-11` (44px), preferred `h-12` (48px) on field screens
- Apply the `.touch-target` utility only to bare interactive elements — never in a
  component's base classes, where its `min-height` overrides every size variant
- Card padding: `p-5` or `p-6`
- Widget gap: `gap-widget-gap` (1.25rem)
- Gutter: `gap-gutter` (1rem)

### Shadows

```
shadow-card     → subtle lift (list items)
shadow-card-md  → medium lift (interactive cards)
shadow-card-lg  → high lift (modals, popovers)
```

---

## Component Catalog

### Layout Shell

Use `<PageLayout>` for every page. It composes Sidebar + TopNav + main content.

```tsx
<PageLayout role="dispatcher" title="Fleet Overview" subtitle="Live dispatch view" syncStatus="synced">
  {/* page content */}
</PageLayout>
```

**Props:** `role`, `title`, `subtitle`, `children`, `syncStatus`, `highContrast`

The Sidebar is role-aware — nav items change per role automatically. Never build custom nav outside PageLayout.

### UI Primitives (`src/components/ui/`)

Import everything from `@/components` — the barrel is the public API. Individual
file paths are an implementation detail.

> **Live reference:** `npm run dev` → the **Docs** tab at http://localhost:3000.
> It has searchable prop tables, live token swatches, the pitfall list, and the
> accessibility contract. Source of truth is
> [src/app/_docs/catalog.ts](src/app/_docs/catalog.ts) — when you change a
> component's props, update that file in the same commit.

| Component | Key Props | Notes |
|-----------|-----------|-------|
| `Button` | `variant`, `size`, `loading`, `asChild`, `leadingIcon`, `trailingIcon`, `fullWidth` | Sizes: `sm`(36px) `md`(44px) `lg`(48px) `xl`(56px) `icon` `icon-sm` `icon-lg`. Defaults `type="button"` |
| `Card` + `CardHeader` + `CardTitle` + `CardDescription` + `CardContent` + `CardFooter` | `clip`, `interactive`; `CardTitle` takes `as` | Composition pattern. `clip` is opt-in — see note below |
| `Badge` | `variant`, `size` | Generic chips only. For domain state use the StatusBadge family |
| `Avatar` | `src`, `alt`, `initials`, `size`, `status` | Falls back to initials if `src` fails to load |
| `Input` | `label`, `error`, `hint`, `leadingIcon`, `trailingIcon`, `mono`, `interactiveTrailing` | h-11. `error` sets `aria-invalid` + `aria-describedby` |
| `Select` | `label`, `error`, `hint`, `options`, `placeholder` | `options` items accept `disabled` |
| `Modal` | `open` (or `isOpen`), `onClose`, `title`, `description`, `footer`, `size`, `closeOnBackdropClick`, `closeOnEscape`, `hideCloseButton` | Portaled, focus-trapped, restores focus, locks body scroll. Sizes: sm/md/lg/xl/full |
| `Tabs` + `TabsList` + `TabsTrigger` + `TabsContent` | `defaultValue` \| `value`+`onValueChange`, `orientation`; `TabsContent` takes `forceMount` | Full ARIA tabs pattern: arrows, Home/End, roving tabindex |
| `DataTable` | `columns`, `data`, `keyExtractor`, `onRowClick`, `maxHeight`, `caption`, `initialSort` | Sortable columns, keyboard-operable rows. `stickyHeader` **requires `maxHeight`** |
| `Toast` + `ToastContainer` + `ToastProvider` + `useToast` | `variant`, `title`, `description`, `duration`, `action` | Prefer `useToast()`; the provider owns the queue and timers |
| `KPICard` | `label`, `value`, `subtext`, `subIntent` | Intents: neutral/positive/negative/info/warning |
| `StatCard` | `label`, `value`, `unit`, `trend`, `icon` | Loading skeleton state built in |
| `StatusBadge` | `status`, `size` | `OrderStatusBadge` / `PriorityBadge` / `SyncStatusBadge` / `AuditStatusBadge` |
| `useFieldIds` + `FieldLabel` + `FieldMessage` | — | Build new form controls with matching a11y wiring |

**Gotchas that will cost you an afternoon:**

- **`Card` does not clip by default.** `clip` is opt-in because
  `overflow-hidden` silently breaks anything painting outside the card — a
  `<DataTable stickyHeader>`, a dropdown, a tooltip. Only enable it for
  full-bleed media.
- **Never add `.touch-target` to a component's base classes.** It sets
  `min-height: 48px`, which overrides `height` and flattens every size variant.
  It's for bare interactive elements with no size scale of their own.
- **`Button size="sm"` is 36px** — below field-touch guidance, intended for dense
  desktop UI. Use `lg`/`xl` on technician screens.

**Toasts** — mount the provider once near the app root, then:

```tsx
const { toast } = useToast();
toast({ variant: "error", title: "Sync failed", description: "3 orders queued." });
```

**Buttons as links** — use `asChild` rather than copying `buttonVariants()`:

```tsx
<Button asChild variant="outline">
  <Link href="/dispatcher/orders">View queue</Link>
</Button>
```

### Domain Components (`src/components/domain/`)

| Component | Usage |
|-----------|-------|
| `OrderCard` | Dispatcher order queue, technician manifest. Props: `order`, `onAssign`, `onView`, `compact` |
| `TechnicianCard` | Fleet management. Props: `tech`, `onSelect` |
| `CPTCodeBadge` | Inline CPT display. Props: `code`, `modifier`, `description`, `flagged` |
| `ICD10Badge` | Inline ICD-10 display. Props: `code`, `description`, `isPrimary` |
| `InvoiceRow` | Billing table rows. Props: `invoice`, `onClick`, `selected` |
| `ComplianceAuditTable` | Billing compliance view. Self-contained with pagination |
| `LiveMap` | Mapbox dark map with STAT/tech/hub markers. Env: `NEXT_PUBLIC_MAPBOX_TOKEN` |
| `MapWidget` | Fallback map placeholder when no Mapbox token |

### Chart Components (`src/components/charts/`)

All ECharts components use `dynamic()` with `{ ssr: false }` — never import them in SSR contexts.

| Component | Type | Role |
|-----------|------|------|
| `RevenueAreaChart` | Area (SVG) | Billing dashboard |
| `DailyJobVolumeChart` | Stacked bar (SVG) | Dispatcher dashboard |
| `ProcedureDistributionDonut` | Donut (SVG, small) | Dispatcher/Billing |
| `ServiceSplitDonut` | Donut (SVG, large) | Dispatcher overview |
| `FacilityRevenueBar` | Horizontal bar (SVG) | Billing by facility |
| `OrderBarChart` | Grouped bar (ECharts) | Dispatcher timeline |
| `RevenueLineChart` | Line + area (ECharts) | Billing WoW trend |
| `CPTDonutChart` | Donut (ECharts) | Billing procedure mix |
| `CollectionGauge` | Gauge (ECharts) | Billing KPI |
| `TechnicianActivityChart` | Stacked bar (ECharts) | Dispatcher fleet activity |
| `RealtimeCounterCard` | Metric + spark | Dispatcher live stats |
| `CodeScrubberWidget` | Code list + fix actions | Billing compliance |
| `ResponseTimeCard` | Metric + spark line | Dispatcher SLA |
| `MapDensityCard` | Network health metric | Dispatcher system view |

### Onboarding Components (`src/components/onboarding/`)

| Component | Usage |
|-----------|-------|
| `RoleSelector` | Step 1: Choose dispatcher/technician/billing |
| `CredentialUpload` | Step 2: Upload license/credential (PDF/JPG/PNG, 10MB max) |
| `StepIndicator` | Multi-step progress bar |

### AI Components (`src/components/ai/`)

Domain-neutral primitives for AI surfaces. **Every one is presentational** — it
takes the state it renders as props and never fetches, streams, or calls a model.
The caller owns transport, exactly as elsewhere in the design system.

| Component | Key Props | Notes |
|-----------|-----------|-------|
| `AIStreamingText` | `text`, `isStreaming`, `pending`, `completionAnnouncement` | Renders caller-supplied tokens + caret. Announces once on completion, not per token |
| `AIThread` | `messages`, `maxHeight`, `showTimestamps`, `renderMessage`, `emptyState` | `role="log"`. Autoscrolls **only** when already at the bottom |
| `AIPromptInput` | `value`, `onChange`, `onSubmit`, `onStop`, `isStreaming`, `maxLength`, `maxRows`, `actions` | Auto-grows. Enter sends, Shift+Enter newlines, IME-safe. Send becomes Stop while streaming |
| `AISuggestionCard` | `title`, `confidence`, `rationale`, `status`, `onAccept`, `onReject`, `busy` | Requires an explicit human decision. Shows resolved state as an audit trail |
| `AIConfidenceMeter` | `score` (0–1), `size`, `thresholds` | ARIA `meter`. Renders bands, never a raw percentage |
| `AICitationList` + `AICitationRef` | `citations`, `compact` | Ordered list; external links get `rel="noopener noreferrer"` |
| `AIDisclaimer` | `variant`, `message` | Presets: `review-required`, `not-diagnostic`, `generated` |
| `AIErrorState` | `variant`, `message`, `onRetry` | Distinguishes refusal from failure; retry only where it helps |

**Non-negotiables in this layer.** These are safety properties, not preferences:

- **No suggestion applies itself.** There is no auto-accept threshold, anywhere.
  An unreviewed suggestion becoming a submitted CPT code is a compliance
  incident, not a saved click. `AISuggestionCard` always requires accept/reject.
- **Confidence is banded, never a percentage.** "91% confident" reads as
  probability of correctness, which a model score is not. Use
  `AIConfidenceMeter`; don't print the raw number next to it.
- **Pair generated output with a disclaimer.** `review-required` for anything
  that can reach a claim or patient record; `not-diagnostic` for anything
  touching image interpretation.
- **Never announce streaming text token-by-token.** Wrapping a stream in
  `aria-live` re-reads the whole buffer on every token and makes a screen reader
  useless. The pattern here: mark the region `aria-busy` while streaming and
  announce once when it settles. `AIThread` relies on the same mechanism, so when
  composing `AIStreamingText` inside a thread pass `completionAnnouncement={null}`
  to avoid a double announcement.

```tsx
const [text, setText] = useState("");
const [streaming, setStreaming] = useState(false);

<AIStreamingText text={text} isStreaming={streaming} pending={streaming && !text} />
<AIDisclaimer variant="review-required" />

<AISuggestionCard
  title="Suggested coding"
  confidence={0.91}
  rationale="Portable equipment, so R0070 applies."
  onAccept={applyCodes}
  onReject={dismiss}
>
  <CPTCodeBadge code="71046" description="Chest X-Ray 2-View" />
</AISuggestionCard>
```

AI surface tokens: `ai-accent`, `ai-surface`, `ai-border`, `ai-on-surface`,
`ai-user-surface`. Assistant output is tinted differently from user input so
generated content is never mistaken for a clinician's own entry.

---

## Role: Dispatcher

**Identity:** RAD-COMMAND — Fleet orchestration and order assignment

**Primary workflows:**
1. View incoming orders (STAT escalation at top)
2. Assign orders to available technicians
3. Monitor field units on live map
4. Manage facility relationships
5. Review daily analytics

**Key screens:**

### `/dispatcher` — Fleet Dashboard
- KPI row: Active Orders, Technicians Online, Avg Response Time, Completion Rate
- `<LiveMap>` — full width, showing all active techs + open orders
- Order queue split: STAT (emergency-red, pulsing) → Urgent → Routine
- `<DailyJobVolumeChart>` — orders by hour
- `<TechnicianActivityChart>` — tech utilization

### `/dispatcher/orders` — Order Queue
- Filter bar: All / STAT / Urgent / Routine / status filters
- `<DataTable>` or `<OrderCard>` list (compact mode)
- Assign modal: select technician by zone proximity
- STAT orders: `pulse-stat` animation, emergency-red border

### `/dispatcher/fleet` — Fleet Management
- `<TechnicianCard>` grid — online/offline status, battery, sync
- Zone map overlay
- Click tech → detail drawer (orders, route, credentials)

### `/dispatcher/intake` — Facility Management
- Facility list with active order count
- Add/edit facility form
- Contact and address management

### `/dispatcher/reports` — Analytics
- Date range picker
- `<RevenueAreaChart>`, `<OrderBarChart>`, `<FacilityRevenueBar>`
- Export to PDF/CSV

---

## Role: Technician

**Identity:** RAD-FIELD — Field execution and clinical procedures

**Primary workflows:**
1. View assigned orders for the day
2. Accept and navigate to order location
3. Complete procedure and capture documentation
4. Sync data when back online

**Offline-first requirement:** Technician screens must function without network. Use service worker + IndexedDB for order cache. Sync status shown via `<SyncStatusBadge>`.

**Key screens:**

### `/technician` — Active Order View
- Current order hero card (patient, facility, address, procedure)
- `<PriorityBadge>` prominent
- Action buttons: Navigate, Start Procedure, Mark Complete
- Battery + sync status in header
- Next order preview

### `/technician/manifest` — Daily Manifest
- Ordered list of today's assignments (time-sorted)
- `<OrderCard compact>` per order
- Status progression: pending → assigned → en-route → in-progress → complete
- Tap to expand order detail

### `/technician/equipment` — Equipment Checklist
- Pre-shift equipment verification list
- Checkbox items with sign-off
- Equipment ID (monospace) + last calibration date

### `/technician/offline` — Offline Sync Log
- `<SyncStatusBadge>` per record
- Conflict resolution UI (show field vs server value, choose one)
- "Sync All" button
- Pending upload count badge in tab

---

## Role: Billing Manager

**Identity:** REVENUE COMMAND — Revenue lifecycle and compliance

**Primary workflows:**
1. Review invoices for completed orders
2. Run CPT code compliance scrubbing
3. Audit flagged claims
4. Track revenue KPIs

**Key screens:**

### `/billing` — Revenue Dashboard
- KPI row: Total Revenue, Collection Rate, Clean Claim Rate, Avg Invoice Value
- `<CollectionGauge>` — collection rate vs target
- `<RevenueLineChart>` — WoW revenue trend
- `<CPTDonutChart>` — procedure mix
- `<CodeScrubberWidget>` — recent scrub alerts

### `/billing/invoices` — Invoice List
- `<DataTable>` with `<InvoiceRow>` rows
- Filter: status, date range, facility, CPT code
- Flagged invoices: warning icon, `hasFlag` prop
- Click → invoice detail modal

### `/billing/scrubbing` — Code Scrubbing
- `<CodeScrubberWidget>` — full view
- Run scrub on date range
- Fix / auto-correct / escalate per code
- Reconcile All action

### `/billing/audit` — Compliance Audit
- `<ComplianceAuditTable>` — verified / flagged / pending
- Revenue impact column (± dollar amounts)
- Filter by facility, CPT code, status
- Export audit report

### `/billing/reports` — Revenue Reports
- `<FacilityRevenueBar>` by facility
- `<RevenueAreaChart>` monthly trend
- `<ProcedureDistributionDonut>` procedure mix
- Date range, facility, and CPT code filters
- Download CSV / PDF

---

## Environment Variables

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=    # Mapbox GL JS public token (required for LiveMap)
NEXT_PUBLIC_SUPABASE_URL=    # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Supabase anon key
```

Without `NEXT_PUBLIC_MAPBOX_TOKEN`, `<LiveMap>` falls back to `<MapWidget>` placeholder automatically.

---

## Development Rules

### Do
- Use `<PageLayout role={role}>` on every page
- Import domain types from `src/lib/utils.ts` — never redefine
- Use `cn()` from `src/lib/utils.ts` for conditional class merging
- Use `font-mono` for all CPT codes, ICD-10 codes, invoice IDs, license numbers, dollar amounts
- Use `<PriorityBadge>`, `<OrderStatusBadge>`, `<SyncStatusBadge>`, `<AuditStatusBadge>` — never hardcode status colors
- Use the status tokens (`bg-success-container`, `text-conflict-on-container`, …) for any state tint
- Import from `@/components`, not from individual component file paths
- Wrap ECharts charts in `dynamic(() => import(...), { ssr: false })`
- Maintain 48px minimum touch targets on field/technician screens
- STAT orders must always show `pulse-stat` animation and `emergency-red` color
- Wire form errors through `error` on `Input`/`Select` so `aria-invalid` is set for you
- Give `DataTable` a `caption`, and a `maxHeight` whenever you set `stickyHeader`

### Don't
- Don't create new color values outside `globals.css` + `tailwind.config.ts`
- Don't use raw Tailwind palette colors (`bg-green-100`) for state — they can't re-theme
- Don't add `.touch-target` to a component's base classes — its `min-height` overrides every size variant
- Don't turn on `Card`'s `clip` unless the child needs clipping — it breaks sticky headers and popovers
- Don't hand-roll toast state — use `ToastProvider` + `useToast()`
- Don't style a link with `buttonVariants()` by hand — use `<Button asChild>`
- Don't build custom nav or sidebar — use `<Sidebar>` which is already role-aware
- Don't import ECharts with SSR — use dynamic import only
- Don't skip `SyncStatus` display on technician screens
- Don't hardcode facility or CPT data — fetch from Supabase
- Don't use `px-*` values outside the token scale for layout spacing

### File Naming
```
pages:      app/(role)/page-name/page.tsx
components: PascalCase.tsx
hooks:      use-hook-name.ts
utils:      kebab-case.ts
```

---

## Supabase Schema (To Build)

Tables needed:

```sql
orders          -- Core order records
technicians     -- Technician profiles + credentials
facilities      -- Healthcare facility directory
invoices        -- Billing records (linked to orders)
audit_log       -- Compliance audit trail
sync_queue      -- Offline sync pending items
```

Use Supabase Realtime for:
- Live order assignment (dispatcher sees instant updates)
- Technician location / status (fleet map)
- Invoice status changes (billing dashboard)

---

## Offline Strategy (Technician Role)

1. On login, prefetch today's manifest → IndexedDB
2. All order mutations write to IndexedDB first, queue to `sync_queue`
3. `SyncStatus` reflects local queue state
4. On reconnect, flush `sync_queue` → Supabase
5. Conflicts: surface in `/technician/offline`, require manual resolution
6. Service worker caches: app shell, manifest data, map tiles

---

## Medical Billing Notes

- **CPT Codes** identify procedures (e.g. 71046 = Chest X-Ray 2-View)
- **ICD-10 Codes** identify diagnoses (e.g. J18.9 = Pneumonia)
- **R0070** = portable X-ray equipment surcharge (always add to mobile orders)
- **Urgency Factor**: STAT = 2.0×, Urgent = 1.5×, Routine = 1.0× applied to base fee
- **Clean Claim Rate** = invoices accepted on first submission / total invoices
- **Collection Rate** = amount collected / amount billed

Always display CPT and ICD-10 codes in `font-mono`. Flag any invoice missing ICD-10.
