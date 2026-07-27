/*
 * Component reference data.
 *
 * Kept as data rather than hand-written JSX so the docs tab stays maintainable as
 * the library grows — adding a component means adding an entry, not authoring a
 * new section. Prop tables are transcribed from the actual interfaces; when you
 * change a component's props, update its entry here in the same commit.
 *
 * This folder is prefixed with `_` so Next.js does not treat it as a route, and
 * it is deliberately NOT exported from `@/components` — documentation UI is not
 * part of the design system's public API.
 */

export type DocCategory = "Primitive" | "AI" | "Layout" | "Domain" | "Chart" | "Onboarding";

export const CATEGORIES: DocCategory[] = [
  "Primitive",
  "AI",
  "Layout",
  "Domain",
  "Chart",
  "Onboarding",
];

export interface PropDoc {
  name: string;
  type: string;
  default?: string;
  required?: boolean;
  description: string;
}

export interface ComponentDoc {
  name: string;
  category: DocCategory;
  summary: string;
  /** Marked "use client" — cannot be rendered in a server component. */
  clientOnly?: boolean;
  props?: PropDoc[];
  example?: string;
  /** A trap specific to this component. Surfaced prominently in the UI. */
  pitfall?: string;
}

export const COMPONENTS: ComponentDoc[] = [
  // ── Primitives ──────────────────────────────────────────────────────────────
  {
    name: "Button",
    category: "Primitive",
    clientOnly: true,
    summary: "Primary interactive control. Seven visual variants, seven sizes.",
    pitfall:
      "Never add the `.touch-target` utility to this component's base classes. It sets min-height:48px, which overrides `height` and silently flattens every size variant — that bug made the `size` prop a no-op for a while.",
    props: [
      { name: "variant", type: '"primary" | "secondary" | "outline" | "ghost" | "danger" | "warning" | "stat"', default: '"primary"', description: "Visual emphasis. `stat` is reserved for STAT dispatch actions." },
      { name: "size", type: '"sm" | "md" | "lg" | "xl" | "icon" | "icon-sm" | "icon-lg"', default: '"md"', description: "sm=36px, md=44px, lg=48px, xl=56px. Use lg/xl on technician screens." },
      { name: "loading", type: "boolean", default: "false", description: "Shows a spinner, disables the button, sets aria-busy." },
      { name: "loadingLabel", type: "string", default: '"Loading"', description: "Announced only when there is no visible label (icon-only buttons)." },
      { name: "leadingIcon", type: "ReactNode", description: "Icon before the label. Replaced by the spinner while loading." },
      { name: "trailingIcon", type: "ReactNode", description: "Icon after the label." },
      { name: "fullWidth", type: "boolean", description: "Stretches to the container width." },
      { name: "asChild", type: "boolean", default: "false", description: "Render the child element with this styling instead of a <button>. Use for links." },
    ],
    example: `// A link that looks like a button — don't copy buttonVariants() by hand
<Button asChild variant="outline">
  <Link href="/dispatcher/orders">View queue</Link>
</Button>

<Button variant="stat" size="xl" loading={dispatching}>
  Dispatch STAT
</Button>`,
  },
  {
    name: "Card",
    category: "Primitive",
    summary: "Surface container. Compose with Header / Title / Description / Content / Footer.",
    pitfall:
      "`clip` is off by default. Turning it on applies overflow-hidden, which clips anything painting outside the card — a <DataTable stickyHeader>, a dropdown, a tooltip, a popover. Only enable it for full-bleed media.",
    props: [
      { name: "clip", type: "boolean", default: "false", description: "Clip children to the rounded corners. See the pitfall above." },
      { name: "interactive", type: "boolean", default: "false", description: "Adds hover elevation. Use on cards that are themselves clickable." },
      { name: "as (CardTitle)", type: '"h2" | "h3" | "h4" | "h5"', default: '"h3"', description: "Heading level. Pick the one that fits the page outline — screen readers navigate by heading structure." },
    ],
    example: `<Card>
  <CardHeader>
    <CardTitle as="h2">Fleet Status</CardTitle>
  </CardHeader>
  <CardContent>{children}</CardContent>
  <CardFooter>
    <Button size="sm">Refresh</Button>
  </CardFooter>
</Card>`,
  },
  {
    name: "Input",
    category: "Primitive",
    clientOnly: true,
    summary: "Labelled text field with validation wiring.",
    props: [
      { name: "label", type: "string", description: "Visible label, associated via a generated id." },
      { name: "error", type: "string", description: "Sets aria-invalid and aria-describedby, and renders the message as a live region." },
      { name: "hint", type: "string", description: "Helper text. Hidden while `error` is set." },
      { name: "leadingIcon", type: "ReactNode", description: "Decorative icon inside the field." },
      { name: "trailingIcon", type: "ReactNode", description: "Trailing adornment." },
      { name: "interactiveTrailing", type: "boolean", default: "false", description: "Set when the trailing slot holds a button so it can receive clicks." },
      { name: "mono", type: "boolean", default: "false", description: "Tabular mono for CPT codes, license numbers, IDs, amounts." },
    ],
    example: `<Input
  label="CPT Code"
  mono
  error={errors.cpt}
  hint="5 digits, e.g. 71046"
/>`,
  },
  {
    name: "Select",
    category: "Primitive",
    clientOnly: true,
    summary: "Native select with the same label and validation contract as Input.",
    props: [
      { name: "options", type: "SelectOption[]", required: true, description: "{ value, label, disabled? }" },
      { name: "placeholder", type: "string", description: "Rendered as a first option, disabled when the field is required." },
      { name: "label / error / hint", type: "string", description: "Same behaviour as Input." },
    ],
  },
  {
    name: "Modal",
    category: "Primitive",
    clientOnly: true,
    summary:
      "Accessible dialog: portaled to body, focus-trapped, restores focus on close, locks body scroll.",
    pitfall:
      "Escape and backdrop clicks both close by default. For destructive confirmations set closeOnBackdropClick={false} so the decision has to be deliberate.",
    props: [
      { name: "open", type: "boolean", description: "Visibility. `isOpen` is accepted as an alias." },
      { name: "onClose", type: "() => void", required: true, description: "Called on Escape, backdrop click, and the close button." },
      { name: "title", type: "string", description: "Wired as aria-labelledby. Without it the dialog falls back to aria-label." },
      { name: "description", type: "string", description: "Wired as aria-describedby." },
      { name: "footer", type: "ReactNode", description: "Action bar below the scrolling body." },
      { name: "size", type: '"sm" | "md" | "lg" | "xl" | "full"', default: '"md"', description: "Panel width." },
      { name: "closeOnBackdropClick", type: "boolean", default: "true", description: "See the pitfall." },
      { name: "closeOnEscape", type: "boolean", default: "true", description: "Disable only with a very good reason." },
      { name: "hideCloseButton", type: "boolean", default: "false", description: "Pair with an explicit footer action." },
    ],
    example: `<Modal
  open={open}
  onClose={close}
  title="Reassign order"
  description="ORD-001 · Margaret Chen"
  footer={<><Button variant="ghost" onClick={close}>Cancel</Button><Button onClick={save}>Reassign</Button></>}
>
  <TechnicianPicker />
</Modal>`,
  },
  {
    name: "Tabs",
    category: "Primitive",
    clientOnly: true,
    summary:
      "Full WAI-ARIA tabs pattern: arrow keys, Home/End, roving tabindex, trigger↔panel wiring.",
    props: [
      { name: "defaultValue", type: "string", description: "Initial tab, uncontrolled." },
      { name: "value / onValueChange", type: "string / (v) => void", description: "Controlled mode — use for URL-synced tabs." },
      { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Also switches which arrow keys navigate." },
      { name: "forceMount (TabsContent)", type: "boolean", default: "false", description: "Keep a hidden panel mounted to preserve form state, a chart instance, or scroll position." },
    ],
    example: `<Tabs value={tab} onValueChange={setTab}>
  <TabsList aria-label="Order views">
    <TabsTrigger value="queue">Queue</TabsTrigger>
    <TabsTrigger value="map">Map</TabsTrigger>
  </TabsList>
  <TabsContent value="queue">…</TabsContent>
  <TabsContent value="map" forceMount>…</TabsContent>
</Tabs>`,
  },
  {
    name: "DataTable",
    category: "Primitive",
    clientOnly: true,
    summary: "Generic typed table with sortable columns and keyboard-operable rows.",
    pitfall:
      "`stickyHeader` requires `maxHeight`. A sticky <thead> has nothing to stick to without a vertically scrolling container — it silently did nothing before. Dev builds warn when you forget.",
    props: [
      { name: "columns", type: "Column<T>[]", required: true, description: "{ key, header, render?, mono?, align?, sortable?, sortValue? }" },
      { name: "data", type: "T[]", required: true, description: "Rows. Never mutated — sorting copies first." },
      { name: "keyExtractor", type: "(row: T) => string", required: true, description: "Stable React key per row." },
      { name: "onRowClick", type: "(row: T) => void", description: "Makes rows focusable and Enter/Space-activatable." },
      { name: "maxHeight", type: "string", description: 'e.g. "24rem". Required with stickyHeader.' },
      { name: "caption", type: "string", description: "Describes the table for screen readers. Strongly recommended." },
      { name: "showCaption", type: "boolean", default: "false", description: "Render the caption visibly instead of sr-only." },
      { name: "initialSort", type: "{ key, direction }", description: "Starting sort state." },
      { name: "loading / skeletonRows", type: "boolean / number", description: "Skeleton rows while data loads." },
    ],
    example: `<DataTable
  caption="Open invoices by facility"
  columns={[
    { key: "id", header: "Invoice", mono: true, sortable: true },
    { key: "totalAmount", header: "Total", mono: true, align: "right",
      sortable: true, sortValue: (r) => r.totalAmount,
      render: (r) => \`$\${r.totalAmount.toFixed(2)}\` },
  ]}
  data={invoices}
  keyExtractor={(r) => r.id}
  stickyHeader
  maxHeight="24rem"
/>`,
  },
  {
    name: "Toast",
    category: "Primitive",
    clientOnly: true,
    summary:
      "Notification system. Mount ToastProvider once near the root, then call useToast().",
    pitfall:
      "Don't hand-roll toast state. The provider owns the queue, the timers, overflow trimming, and cleanup on unmount — reimplementing that per feature is where the leaks come from.",
    props: [
      { name: "toast(options)", type: "(o: ToastOptions) => string", description: "Queues a toast, returns its id. { variant, title, description?, duration?, action? }" },
      { name: "dismiss / dismissAll", type: "(id) => void / () => void", description: "Manual dismissal." },
      { name: "duration (Provider)", type: "number", default: "5000", description: "Errors get 1.6× this. Pass duration:0 on a toast to keep it until dismissed." },
      { name: "max (Provider)", type: "number", default: "4", description: "Oldest beyond this are dropped so the stack can't cover the UI." },
    ],
    example: `// app/layout.tsx
<ToastProvider><>{children}</></ToastProvider>

// anywhere below
const { toast } = useToast();
toast({ variant: "error", title: "Sync failed", description: "3 orders queued." });`,
  },
  {
    name: "Avatar",
    category: "Primitive",
    clientOnly: true,
    summary: "Person avatar with initials fallback and a status dot.",
    pitfall:
      "A broken `src` falls back to initials automatically. Still pass `alt` — initials alone don't identify a person to a screen reader.",
    props: [
      { name: "src / alt", type: "string", description: "Image and its text equivalent." },
      { name: "initials", type: "string", description: "Fallback when there is no image or it fails to load." },
      { name: "size", type: '"xs" | "sm" | "md" | "lg" | "xl"', default: '"md"', description: "24 → 64px." },
      { name: "status", type: '"online" | "offline" | "busy" | "away"', description: "Status dot, exposed with a text label." },
    ],
  },
  {
    name: "StatusBadge family",
    category: "Primitive",
    summary:
      "OrderStatusBadge · PriorityBadge · SyncStatusBadge · AuditStatusBadge — the canonical state indicators.",
    pitfall:
      "Always render domain state through these, never a hand-coloured span. They are the single source of truth that keeps STAT the same red on every screen.",
    props: [
      { name: "status / priority", type: "OrderStatus | Priority | SyncStatus | AuditStatus", required: true, description: "The state to render." },
      { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Badge scale." },
      { name: "animate (PriorityBadge)", type: "boolean", description: "Pulses the dot. Only applies to STAT." },
    ],
    example: `<PriorityBadge priority={order.priority} animate />
<OrderStatusBadge status={order.status} size="sm" />
<SyncStatusBadge status={tech.syncStatus} />`,
  },
  {
    name: "Badge",
    category: "Primitive",
    summary: "Generic label chip. For domain state use the StatusBadge family instead.",
    props: [
      { name: "variant", type: '"default" | "primary" | "secondary" | "outline" | "stat" | "urgent" | "success" | "info" | "warning" | "danger" | "conflict" | "neutral"', default: '"default"', description: "Token-backed tints re-theme under high-contrast." },
      { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Chip scale." },
    ],
  },
  {
    name: "KPICard / StatCard",
    category: "Primitive",
    summary: "Metric tiles. KPICard for headline figures, StatCard for value + trend + icon.",
    props: [
      { name: "label / value", type: "string", required: true, description: "Metric name and figure." },
      { name: "subtext / subIntent (KPI)", type: 'string / "neutral" | "positive" | "negative" | "info" | "warning"', description: "Supporting line and its colour intent." },
      { name: "trend / trendLabel (Stat)", type: "number / string", description: "Signed percentage; sign picks the icon and colour." },
      { name: "loading (Stat)", type: "boolean", description: "Skeleton state." },
    ],
  },
  {
    name: "Field helpers",
    category: "Primitive",
    clientOnly: true,
    summary:
      "useFieldIds · FieldLabel · FieldMessage — build new form controls with the same a11y wiring as Input and Select.",
    pitfall:
      "Never derive a DOM id from label text. Two fields labelled \"Facility\" produce duplicate ids, and clicking the second label focuses the first field. useFieldIds uses React's useId.",
    example: `const { fieldId, errorId, hintId, describedBy } = useFieldIds({ id, error, hint });

<FieldLabel htmlFor={fieldId} required>{label}</FieldLabel>
<textarea id={fieldId} aria-invalid={error ? true : undefined} aria-describedby={describedBy} />
<FieldMessage error={error} hint={hint} errorId={errorId} hintId={hintId} />`,
  },

  // ── AI ──────────────────────────────────────────────────────────────────────
  {
    name: "AIStreamingText",
    category: "AI",
    clientOnly: true,
    summary: "Renders caller-supplied tokens with a blinking caret.",
    pitfall:
      "This component is deliberately NOT an aria-live region. Wrapping a stream in aria-live re-announces the whole buffer on every token, so a screen reader stutters continuously and never finishes a sentence. It marks the region aria-busy while streaming and announces once on completion.",
    props: [
      { name: "text", type: "string", required: true, description: "Accumulated text so far. The caller owns the stream; this does not simulate typing." },
      { name: "isStreaming", type: "boolean", default: "false", description: "Drives the caret and aria-busy." },
      { name: "pending", type: "boolean", default: "false", description: "Shows working dots before the first token." },
      { name: "completionAnnouncement", type: "string | null", default: '"Response complete."', description: "Pass null inside AIThread — the log already announces." },
    ],
    example: `<AIStreamingText
  text={text}
  isStreaming={streaming}
  pending={streaming && !text}
/>`,
  },
  {
    name: "AIThread",
    category: "AI",
    clientOnly: true,
    summary: "Scrolling message log with role=log and stick-to-bottom autoscroll.",
    pitfall:
      "Autoscroll fires only when the reader is already near the bottom. If they have scrolled up to check an earlier answer, incoming tokens must not drag them back down — a \"Jump to latest\" affordance appears instead.",
    props: [
      { name: "messages", type: "AIMessage[]", required: true, description: "{ id, role, content, timestamp?, status?, citations? }" },
      { name: "maxHeight", type: "string", description: 'e.g. "20rem". Without it the thread grows and the page scrolls instead.' },
      { name: "showTimestamps", type: "boolean", default: "false", description: "Render message times." },
      { name: "renderMessage", type: "(m: AIMessage) => ReactNode", description: "Take full control of message rendering." },
      { name: "emptyState", type: "ReactNode", description: "Shown when there are no messages." },
      { name: "label", type: "string", default: '"Conversation"', description: "Names the log for screen reader navigation." },
    ],
  },
  {
    name: "AIPromptInput",
    category: "AI",
    clientOnly: true,
    summary: "Auto-growing composer. Enter sends, Shift+Enter newlines, IME-safe.",
    pitfall:
      "The send button becomes Stop while streaming rather than sitting disabled — always give users a way to interrupt a long generation.",
    props: [
      { name: "value / onChange", type: "string / (v) => void", required: true, description: "Controlled value." },
      { name: "onSubmit", type: "() => void", required: true, description: "Blank and whitespace-only submits are ignored for you." },
      { name: "onStop", type: "() => void", description: "Shown as Stop while isStreaming. Omit to hide stopping." },
      { name: "isStreaming", type: "boolean", default: "false", description: "Swaps send for stop." },
      { name: "maxLength / maxRows", type: "number / number", default: "— / 8", description: "Character counter; rows before scrolling." },
      { name: "actions", type: "ReactNode", description: "Extra controls beside send (model picker, attach)." },
    ],
  },
  {
    name: "AISuggestionCard",
    category: "AI",
    clientOnly: true,
    summary: "A single AI suggestion requiring an explicit accept or reject.",
    pitfall:
      "There is no auto-accept threshold and there never should be. An unreviewed suggestion becoming a submitted CPT code is a compliance incident, not a saved click. Resolved cards stay visible as an audit trail rather than disappearing.",
    props: [
      { name: "title", type: "string", required: true, description: "What is being suggested." },
      { name: "children", type: "ReactNode", required: true, description: "The suggestion itself — text, code badges, a diff." },
      { name: "confidence", type: "number", description: "0–1. Rendered as a band, never a percentage." },
      { name: "rationale", type: "ReactNode", description: "Why the model suggested this. Collapsed by default." },
      { name: "status", type: '"pending" | "accepted" | "rejected"', default: '"pending"', description: "Resolved states replace the actions with a status chip." },
      { name: "onAccept / onReject", type: "() => void", description: "Both required for a real decision." },
      { name: "busy", type: "boolean", description: "While the accept request is in flight." },
    ],
  },
  {
    name: "AIConfidenceMeter",
    category: "AI",
    summary: "Three-segment confidence indicator rendered as an ARIA meter.",
    pitfall:
      'Bands, not percentages. "91% confident" reads as probability of correctness, which a model score is not. Do not print the raw number beside it.',
    props: [
      { name: "score", type: "number", required: true, description: "0–1. NaN and out-of-range values are clamped." },
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "Meter scale." },
      { name: "hideLabel", type: "boolean", default: "false", description: "Rarely correct — the wording is the point." },
      { name: "thresholds", type: "{ high, medium }", default: "{ high: 0.8, medium: 0.5 }", description: "Band cutoffs." },
    ],
  },
  {
    name: "AICitationList",
    category: "AI",
    summary: "Source attribution. Full list, or `compact` chips under a message.",
    props: [
      { name: "citations", type: "AICitation[]", required: true, description: "{ id, label, source?, excerpt?, href?, page? }" },
      { name: "compact", type: "boolean", default: "false", description: "Dense inline chips for use under a chat message." },
      { name: "AICitationRef", type: "{ index }", description: "Superscript marker for use inside prose." },
    ],
  },
  {
    name: "AIDisclaimer",
    category: "AI",
    summary: "Standing notice attached to AI output.",
    pitfall:
      "Pair `review-required` with anything that can reach a claim or patient record, and `not-diagnostic` with anything touching image interpretation. Rendered as a plain <p>, not a live region — it is persistent context, not an interruption.",
    props: [
      { name: "variant", type: '"review-required" | "not-diagnostic" | "generated" | "custom"', default: '"generated"', description: "Preset copy, reviewed once and reused." },
      { name: "message", type: "ReactNode", description: "Required for custom; overrides preset copy otherwise." },
    ],
  },
  {
    name: "AIErrorState",
    category: "AI",
    summary: "Failure and refusal states.",
    pitfall:
      "A refusal is a decision, not a bug — resending the same prompt returns the same answer. `onRetry` is honoured only for variants a retry can actually fix (timeout, rate-limit, network, unknown); refusal and content-filter suppress it even if you pass a handler.",
    props: [
      { name: "variant", type: '"refusal" | "content-filter" | "timeout" | "rate-limit" | "network" | "unknown"', default: '"unknown"', description: "Picks copy, icon, colour, and whether retry is offered." },
      { name: "onRetry", type: "() => void", description: "Rendered only for retryable variants." },
    ],
  },

  // ── Layout ──────────────────────────────────────────────────────────────────
  {
    name: "PageLayout",
    category: "Layout",
    summary: "Standard page shell: role-aware Sidebar + TopNav + main. Use on every page.",
    pitfall:
      "Never build custom nav alongside this — Sidebar is already role-aware and changes its items per role automatically.",
    props: [
      { name: "role", type: "Role", required: true, description: '"dispatcher" | "technician" | "billing" | "client"' },
      { name: "title / subtitle", type: "string", description: "Rendered in TopNav." },
      { name: "activeHref", type: "string", description: "Highlights the current nav item." },
      { name: "syncStatus", type: "SyncStatus", description: "Shows a SyncStatusBadge. Required on technician screens." },
      { name: "notificationCount", type: "number", description: "Badge count in TopNav." },
      { name: "highContrast", type: "boolean", description: "Field/sunlight mode. Re-themes every token beneath it." },
    ],
    example: `<PageLayout
  role="technician"
  title="Active Order"
  syncStatus={syncStatus}
  highContrast={fieldMode}
>
  {children}
</PageLayout>`,
  },
  {
    name: "Sidebar / TopNav / AppHeader / NavShell / ClientShell",
    category: "Layout",
    summary:
      "Shell pieces composed by PageLayout. AppHeader is a horizontal alternative; ClientShell is the trimmed client-role shell.",
    props: [
      { name: "role", type: "Role", required: true, description: "Drives which nav items render." },
      { name: "activeHref", type: "string", description: "Current route highlight." },
      { name: "onNavigate", type: "(href: string) => void", description: "Intercept navigation instead of using a link." },
      { name: "systemHealth (AppHeader)", type: '"optimal" | "degraded" | "offline"', description: "System status indicator." },
    ],
  },

  // ── Domain ──────────────────────────────────────────────────────────────────
  {
    name: "OrderCard",
    category: "Domain",
    summary: "Order summary for the dispatcher queue and technician manifest.",
    props: [
      { name: "order", type: "Order", required: true, description: "The order record." },
      { name: "onAssign / onView", type: "(order: Order) => void", description: "Footer actions." },
      { name: "compact", type: "boolean", description: "Dense variant for long lists." },
    ],
  },
  {
    name: "TechnicianCard",
    category: "Domain",
    summary: "Fleet card showing online state, battery, sync, and credentials.",
    pitfall: "The prop is `tech`, not `technician`.",
    props: [
      { name: "tech", type: "Technician", required: true, description: "The technician record." },
      { name: "onSelect", type: "(tech: Technician) => void", description: "Opens the detail drawer." },
    ],
  },
  {
    name: "InvoiceRow",
    category: "Domain",
    summary: "Billing table row.",
    pitfall: "The handler is `onClick`, not `onSelect`.",
    props: [
      { name: "invoice", type: "Invoice", required: true, description: "The invoice record." },
      { name: "onClick", type: "(invoice: Invoice) => void", description: "Row activation." },
      { name: "selected", type: "boolean", description: "Selected styling." },
    ],
  },
  {
    name: "CPTCodeBadge / ICD10Badge",
    category: "Domain",
    summary: "Inline medical code display, always monospace.",
    props: [
      { name: "code", type: "string", required: true, description: "e.g. 71046 or J18.9" },
      { name: "description", type: "string", description: "Human-readable procedure or diagnosis." },
      { name: "modifier", type: "string", description: "CPT modifier." },
      { name: "flagged", type: "boolean", description: "Compliance flag styling." },
      { name: "primary (ICD10)", type: "boolean", description: "Marks the primary diagnosis." },
    ],
  },
  {
    name: "LiveMap / MapWidget / LiveMapLeaflet",
    category: "Domain",
    summary:
      "Leaflet map with STAT, technician, and hub markers. Falls back to MapWidget without a Mapbox token.",
    props: [
      { name: "markers", type: "LiveMapMarker[]", description: "{ id, lng, lat, type, label, priority?, details?, status? }" },
      { name: "center / zoom", type: "[number, number] / number", description: "Initial viewport." },
      { name: "height", type: "string", description: "CSS height for the map container." },
      { name: "showLegend", type: "boolean", description: "Render the marker legend." },
      { name: "onMarkerClick / selectedMarkerId", type: "(m) => void / string", description: "Selection handling." },
    ],
  },
  {
    name: "OrderDetailSheet / ComplianceAuditTable",
    category: "Domain",
    summary: "Order detail drawer, and the self-contained billing compliance table.",
    props: [
      { name: "order", type: "Order | null", description: "Null closes the sheet." },
      { name: "onClose", type: "() => void", required: true, description: "Dismiss the sheet." },
      { name: "onStartProcedure / onMarkComplete", type: "(order: Order) => void", description: "Technician actions." },
      { name: "rows / total (AuditTable)", type: "AuditRow[] / number", description: "Audit data and total count." },
    ],
  },

  // ── Charts ──────────────────────────────────────────────────────────────────
  {
    name: "SVG charts",
    category: "Chart",
    summary:
      "RevenueAreaChart · DailyJobVolumeChart · ProcedureDistributionDonut · ServiceSplitDonut · FacilityRevenueBar — hand-rolled SVG, no chart library.",
    props: [
      { name: "data / segments", type: "array", description: "Series data. All have sensible demo defaults." },
      { name: "className", type: "string", description: "Layout overrides." },
    ],
  },
  {
    name: "ECharts charts",
    category: "Chart",
    clientOnly: true,
    summary:
      "OrderBarChart · RevenueLineChart · CPTDonutChart · CollectionGauge · TechnicianActivityChart.",
    pitfall:
      "Each already wraps its own dynamic(() => import(...), { ssr: false }). Never import ECharts into a server component yourself.",
    props: [
      { name: "data / stat / urgent / routine", type: "number[] | object[]", description: "Series data, varies per chart." },
      { name: "height", type: "number", default: "varies", description: "Chart height in px." },
    ],
  },
  {
    name: "Metric widgets",
    category: "Chart",
    summary:
      "RealtimeCounterCard · ResponseTimeCard · MapDensityCard · CodeScrubberWidget — metric tiles with sparklines and actions.",
    props: [
      { name: "value / label", type: "number | string", description: "The metric." },
      { name: "target / onTrack", type: "number / boolean", description: "SLA comparison." },
      { name: "items / onReconcile (Scrubber)", type: "ScrubberItem[] / () => void", description: "Scrub alerts and the reconcile action." },
    ],
  },

  // ── Onboarding ──────────────────────────────────────────────────────────────
  {
    name: "RoleSelector / StepIndicator / CredentialUpload",
    category: "Onboarding",
    summary: "The onboarding flow: pick a role, track progress, upload a credential.",
    props: [
      { name: "selected / onSelect", type: "Role / (role: Role) => void", description: "RoleSelector state." },
      { name: "steps / currentStep", type: "Step[] / number", description: "StepIndicator progress." },
      { name: "label / acceptedFormats / onUpload", type: "string / string / (f: File) => Promise<void>", description: "CredentialUpload. PDF/JPG/PNG, 10MB max." },
    ],
  },
];

// ── Reference tables ─────────────────────────────────────────────────────────

/*
 * IMPORTANT: `swatchClass` and `chipClass` below must be complete literal class
 * strings. Tailwind's JIT scans source text, so an interpolated class like
 * `bg-${token}` is never generated and silently renders as transparent. Write
 * them out in full even though it is repetitive.
 */
export interface TokenDoc {
  /** Token name as used in a utility, e.g. "medical-blue". */
  name: string;
  /** Literal Tailwind class for the preview swatch. */
  swatchClass: string;
  cssVar: string;
  usage: string;
}

export const BRAND_TOKENS: TokenDoc[] = [
  { name: "midnight-navy", swatchClass: "bg-midnight-navy", cssVar: "--color-midnight-navy", usage: "App shell, headers, dark surfaces" },
  { name: "medical-blue", swatchClass: "bg-medical-blue", cssVar: "--color-medical-blue", usage: "Primary actions, links, routine orders" },
  { name: "emergency-red", swatchClass: "bg-emergency-red", cssVar: "--color-emergency-red", usage: "STAT orders, critical alerts" },
  { name: "warning-amber", swatchClass: "bg-warning-amber", cssVar: "--color-warning-amber", usage: "Urgent orders, warnings" },
  { name: "ghost-white", swatchClass: "bg-ghost-white", cssVar: "--color-ghost-white", usage: "Page background" },
  { name: "slate-gray", swatchClass: "bg-slate-gray", cssVar: "--color-slate-gray", usage: "Secondary text, disabled states" },
  { name: "on-surface", swatchClass: "bg-on-surface", cssVar: "--color-on-surface", usage: "Primary text" },
  { name: "outline-variant", swatchClass: "bg-outline-variant", cssVar: "--color-outline-variant", usage: "Card borders, dividers" },
  { name: "ai-accent", swatchClass: "bg-ai-accent", cssVar: "--color-ai-accent", usage: "AI affordances, streaming caret" },
];

export interface StatusTokenDoc {
  name: string;
  /** Literal class string combining container / on-container / border. */
  chipClass: string;
  usage: string;
}

export const STATUS_TOKEN_GROUPS: StatusTokenDoc[] = [
  { name: "success", chipClass: "bg-success-container text-success-on-container border-success-border", usage: "Completed work, positive trends" },
  { name: "complete", chipClass: "bg-complete-container text-complete-on-container border-complete-border", usage: "OrderStatus complete" },
  { name: "info", chipClass: "bg-info-container text-info-on-container border-info-border", usage: "Assigned orders, neutral notices" },
  { name: "transit", chipClass: "bg-transit-container text-transit-on-container border-transit-border", usage: "En-route orders" },
  { name: "warning", chipClass: "bg-warning-container text-warning-on-container border-warning-border", usage: "Pending, at-risk, urgent" },
  { name: "conflict", chipClass: "bg-conflict-container text-conflict-on-container border-conflict-border", usage: "Sync conflicts — not an error" },
  { name: "danger", chipClass: "bg-danger-container text-danger-on-container border-danger-border", usage: "Errors, flagged claims" },
  { name: "neutral", chipClass: "bg-neutral-container text-neutral-on-container border-neutral-border", usage: "Billed, offline, routine" },
];

export interface PitfallDoc {
  title: string;
  why: string;
  wrong: string;
  right: string;
}

/**
 * Traps found in this codebase, each of which shipped and cost real debugging
 * time. Kept here so the next engineer doesn't rediscover them.
 */
export const PITFALLS: PitfallDoc[] = [
  {
    title: "`.touch-target` in a component's base classes",
    why: "It sets min-height:48px, and CSS resolves min-height over height. Putting it in a cva base string flattens every size variant — this made Button's `size` prop a silent no-op, with sm, md, and icon all rendering at 48px.",
    wrong: `const buttonVariants = cva(
  "inline-flex … touch-target",   // ← flattens all sizes to 48px
  { variants: { size: { sm: "h-9", md: "h-11" } } }
);`,
    right: `const buttonVariants = cva(
  "inline-flex …",                // no touch-target here
  { variants: { size: { sm: "h-9", md: "h-11" } } }
);
// Use .touch-target only on bare elements with no size scale of their own.`,
  },
  {
    title: "Raw Tailwind palette colours for state",
    why: "Colours resolve through CSS variables so themes are a variable override. A literal palette value bypasses that layer entirely, so it cannot re-theme — badges stayed pale-on-pale in high-contrast mode, and a `bg-white` card stayed white on a black field screen.",
    wrong: `<span className="bg-green-100 text-green-800">Synced</span>
<div className="bg-white p-6">…</div>`,
    right: `<span className="bg-success-container text-success-on-container">Synced</span>
<div className="bg-surface-container-lowest p-6">…</div>`,
  },
  {
    title: "`overflow-hidden` on a card wrapper",
    why: "It clips every descendant that needs to paint outside the box: sticky table headers, dropdowns, tooltips, popovers. Card's `clip` prop is off by default for exactly this reason.",
    wrong: `<Card clip>                     {/* clips the sticky header */}
  <DataTable stickyHeader maxHeight="24rem" … />
</Card>`,
    right: `<Card>
  <DataTable stickyHeader maxHeight="24rem" … />
</Card>`,
  },
  {
    title: "`stickyHeader` without `maxHeight`",
    why: "A sticky <thead> needs a vertically scrolling ancestor. Without a height cap the container never scrolls, so the header has nothing to stick to and the prop does nothing. Dev builds now warn.",
    wrong: `<DataTable stickyHeader columns={cols} data={rows} … />`,
    right: `<DataTable stickyHeader maxHeight="24rem" columns={cols} data={rows} … />`,
  },
  {
    title: "DOM ids derived from label text",
    why: 'Two fields labelled "Facility" on one page produce duplicate ids. Label association silently breaks — clicking the second label focuses the first field. Use React\'s useId via useFieldIds.',
    wrong: `const inputId = id ?? label?.toLowerCase().replace(/\\s+/g, "-");`,
    right: `const { fieldId, describedBy } = useFieldIds({ id, error, hint });`,
  },
  {
    title: "Streaming text inside an `aria-live` region",
    why: "The live region re-announces its entire contents on every token. A screen reader stutters continuously and never finishes a sentence, which makes streaming output actively worse than no output.",
    wrong: `<div aria-live="polite">{streamingText}</div>`,
    right: `{/* Defer: busy while streaming, announce once when settled. */}
<div aria-busy={isStreaming}>{streamingText}</div>
<span aria-live="polite" className="sr-only">{settledAnnouncement}</span>`,
  },
];

export interface A11yContractDoc {
  guaranteed: string[];
  yourJob: string[];
}

export const A11Y_CONTRACT: A11yContractDoc = {
  guaranteed: [
    "Modal traps Tab focus, restores focus to the trigger, and locks body scroll.",
    "Tabs implements arrows / Home / End with a roving tabindex and full trigger↔panel wiring.",
    "Input and Select set aria-invalid and aria-describedby from `error`, with unique generated ids.",
    "DataTable rows are focusable and Enter/Space-activatable whenever onRowClick is set; sorted columns expose aria-sort.",
    "AIConfidenceMeter is an ARIA meter whose aria-valuetext carries the band wording, not the raw score.",
    "Toast uses assertive `alert` for errors and warnings, polite `status` for success and info.",
    "Avatar falls back to initials on image failure and gives the status dot a text label.",
    "The reduce-motion media query neutralises animations globally, including the STAT pulse.",
  ],
  yourJob: [
    "Give every icon-only Button an aria-label — there is no visible text to fall back on.",
    "Give DataTable a `caption`. Sighted users infer the table's purpose from context; screen reader users cannot.",
    "Give Modal a `title`, or an explicit aria-label if it has no heading.",
    "Give TabsList an aria-label when the tab set's purpose isn't obvious from the page.",
    "Choose CardTitle's `as` level to fit the page outline instead of accepting the h3 default everywhere.",
    "Pair AI output with an AIDisclaimer — `review-required` for anything reaching a claim or record.",
    "Keep contrast in mind when overriding token colours with className.",
  ],
};
