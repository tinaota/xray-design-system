"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  AlertTriangle,
  BookOpen,
  Check,
  ChevronRight,
  Copy,
  Layers,
  Palette,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  A11Y_CONTRACT,
  BRAND_TOKENS,
  CATEGORIES,
  COMPONENTS,
  PITFALLS,
  STATUS_TOKEN_GROUPS,
  type ComponentDoc,
  type DocCategory,
} from "./catalog";

/* ── Small building blocks ─────────────────────────────────────────────────── */

function CodeBlock({ code, className }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked by permissions policy; the code is still
      // selectable, so failing silently is better than throwing at the user.
      setCopied(false);
    }
  };

  return (
    <div className={cn("relative group", className)}>
      <pre className="overflow-x-auto rounded-lg bg-midnight-navy p-3.5 pr-12 text-xs leading-relaxed text-white/90">
        <code className="font-mono">{code}</code>
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy code"}
        className={cn(
          "absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors",
          "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-medical-blue"
        )}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

function DocSection({
  id,
  icon,
  title,
  lead,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  lead?: string;
  children: React.ReactNode;
}) {
  return (
    // scroll-mt clears the two stacked sticky bars above the content.
    <section id={id} className="scroll-mt-32">
      <div className="mb-4 border-b border-outline-variant/40 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-medical-blue">{icon}</span>
          <h3 className="text-headline-md font-bold text-midnight-navy">{title}</h3>
        </div>
        {lead && <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-on-surface-variant">{lead}</p>}
      </div>
      {children}
    </section>
  );
}

function PitfallNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-warning-border bg-warning-container px-3 py-2">
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning-on-container" aria-hidden="true" />
      <p className="text-xs leading-relaxed text-warning-on-container">{children}</p>
    </div>
  );
}

/* ── Component reference entry ─────────────────────────────────────────────── */

const categoryVariant: Record<DocCategory, "secondary" | "info" | "neutral" | "success" | "warning" | "conflict"> = {
  Primitive: "secondary",
  AI: "conflict",
  Layout: "info",
  Domain: "success",
  Chart: "warning",
  Onboarding: "neutral",
};

function ComponentEntry({ doc }: { doc: ComponentDoc }) {
  const [open, setOpen] = useState(false);
  const hasDetail = Boolean(doc.props?.length || doc.example || doc.pitfall);

  return (
    <div className="rounded-xl border border-outline-variant/40 bg-surface-container-lowest">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        disabled={!hasDetail}
        className={cn(
          "flex w-full items-start gap-3 px-4 py-3 text-left rounded-xl",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-medical-blue",
          hasDetail && "hover:bg-surface-container/50"
        )}
      >
        <ChevronRight
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0 text-on-surface-variant transition-transform",
            open && "rotate-90",
            !hasDetail && "opacity-0"
          )}
          aria-hidden="true"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <code className="font-mono text-sm font-semibold text-on-surface">{doc.name}</code>
            <Badge variant={categoryVariant[doc.category]} size="sm">
              {doc.category}
            </Badge>
            {doc.clientOnly && (
              <Badge variant="outline" size="sm" title='Marked "use client"'>
                client
              </Badge>
            )}
            {doc.pitfall && (
              <span title="Has a documented pitfall">
                <TriangleAlert className="h-3.5 w-3.5 text-warning-on-container" aria-hidden="true" />
                <span className="sr-only">Has a documented pitfall</span>
              </span>
            )}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{doc.summary}</p>
        </div>
      </button>

      {open && hasDetail && (
        <div className="space-y-4 border-t border-outline-variant/40 px-4 py-4">
          {doc.pitfall && <PitfallNote>{doc.pitfall}</PitfallNote>}

          {doc.props && doc.props.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-outline-variant/40">
                    <th scope="col" className="pb-2 pr-3 font-label font-semibold uppercase tracking-wider text-on-surface-variant">
                      Prop
                    </th>
                    <th scope="col" className="pb-2 pr-3 font-label font-semibold uppercase tracking-wider text-on-surface-variant">
                      Type
                    </th>
                    <th scope="col" className="pb-2 pr-3 font-label font-semibold uppercase tracking-wider text-on-surface-variant">
                      Default
                    </th>
                    <th scope="col" className="pb-2 font-label font-semibold uppercase tracking-wider text-on-surface-variant">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {doc.props.map((p) => (
                    <tr key={p.name} className="align-top">
                      <td className="py-2 pr-3 whitespace-nowrap">
                        <code className="font-mono text-[11px] font-semibold text-on-surface">{p.name}</code>
                        {p.required && (
                          <span className="ml-1 text-emergency-red" title="Required" aria-label="required">
                            *
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-3">
                        <code className="font-mono text-[11px] text-medical-blue break-words">{p.type}</code>
                      </td>
                      <td className="py-2 pr-3 whitespace-nowrap">
                        {p.default ? (
                          <code className="font-mono text-[11px] text-on-surface-variant">{p.default}</code>
                        ) : (
                          <span className="text-on-surface-variant/50">—</span>
                        )}
                      </td>
                      <td className="py-2 leading-relaxed text-on-surface-variant">{p.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {doc.example && <CodeBlock code={doc.example} />}
        </div>
      )}
    </div>
  );
}

/* ── Token swatch ──────────────────────────────────────────────────────────── */

function Swatch({ className, label, sub }: { className: string; label: string; sub: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={cn("h-9 w-9 shrink-0 rounded-lg border border-outline-variant/40", className)}
        aria-hidden="true"
      />
      <div className="min-w-0">
        <code className="block truncate font-mono text-[11px] font-semibold text-on-surface">{label}</code>
        <span className="block truncate text-[11px] text-on-surface-variant">{sub}</span>
      </div>
    </div>
  );
}

/* ── Panel ─────────────────────────────────────────────────────────────────── */

const NAV = [
  { id: "docs-start", label: "Getting started" },
  { id: "docs-tokens", label: "Tokens & theming" },
  { id: "docs-catalog", label: "Component reference" },
  { id: "docs-pitfalls", label: "Pitfalls" },
  { id: "docs-a11y", label: "Accessibility contract" },
  { id: "docs-ai", label: "AI rules" },
  { id: "docs-contributing", label: "Adding a component" },
];

export function DocsPanel() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<DocCategory | "All">("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COMPONENTS.filter((doc) => {
      if (activeCategory !== "All" && doc.category !== activeCategory) return false;
      if (!q) return true;
      // Search name, summary, and prop names so "aria" or "sortable" finds things.
      return (
        doc.name.toLowerCase().includes(q) ||
        doc.summary.toLowerCase().includes(q) ||
        (doc.props ?? []).some((p) => p.name.toLowerCase().includes(q))
      );
    });
  }, [query, activeCategory]);

  const grouped = useMemo(() => {
    const map = new Map<DocCategory, ComponentDoc[]>();
    for (const doc of filtered) {
      const list = map.get(doc.category) ?? [];
      list.push(doc);
      map.set(doc.category, list);
    }
    return map;
  }, [filtered]);

  const pitfallCount = COMPONENTS.filter((c) => c.pitfall).length;

  return (
    <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10">
      {/* In-page nav */}
      <nav aria-label="Documentation sections" className="mb-8 lg:mb-0">
        <div className="lg:sticky lg:top-32">
          <p className="mb-2 font-label text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
            On this page
          </p>
          <ul className="flex flex-wrap gap-1.5 lg:flex-col lg:gap-0.5">
            {NAV.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={cn(
                    "block rounded-md px-2.5 py-1.5 text-sm text-on-surface-variant transition-colors",
                    "hover:bg-surface-container hover:text-on-surface",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-medical-blue"
                  )}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="space-y-14">
        {/* ── Getting started ── */}
        <DocSection
          id="docs-start"
          icon={<BookOpen className="h-5 w-5" />}
          title="Getting started"
          lead="Everything ships from one barrel. Import from @/components — individual file paths are an implementation detail and will move."
        >
          <div className="grid gap-widget-gap lg:grid-cols-2">
            <Card>
              <CardContent className="space-y-3 py-5">
                <h4 className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Import surface
                </h4>
                <CodeBlock
                  code={`import {
  Button, Card, CardContent, DataTable,
  PriorityBadge, useToast,
  AIStreamingText, AISuggestionCard,
  type Order, type AIMessage,
} from "@/components";`}
                />
                <p className="text-xs leading-relaxed text-on-surface-variant">
                  Domain types (<code className="font-mono">Order</code>,{" "}
                  <code className="font-mono">Technician</code>,{" "}
                  <code className="font-mono">Invoice</code>) live in{" "}
                  <code className="font-mono">src/lib/utils.ts</code>. Never redefine them locally.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-3 py-5">
                <h4 className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Page shell
                </h4>
                <CodeBlock
                  code={`<PageLayout
  role="technician"
  title="Active Order"
  syncStatus={syncStatus}
  highContrast={fieldMode}
>
  {children}
</PageLayout>`}
                />
                <p className="text-xs leading-relaxed text-on-surface-variant">
                  Use <code className="font-mono">PageLayout</code> on every page. The sidebar is
                  already role-aware — never build nav alongside it.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { k: "Where components live", v: "src/components/{ui,layout,domain,charts,onboarding,ai}" },
              { k: "Where tokens live", v: "src/app/globals.css → tailwind.config.ts" },
              { k: "Dev server", v: "npm run dev → localhost:3000" },
            ].map((row) => (
              <div key={row.k} className="rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5">
                <p className="font-label text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  {row.k}
                </p>
                <code className="mt-0.5 block break-words font-mono text-[11px] text-on-surface">{row.v}</code>
              </div>
            ))}
          </div>
        </DocSection>

        {/* ── Tokens ── */}
        <DocSection
          id="docs-tokens"
          icon={<Palette className="h-5 w-5" />}
          title="Tokens & theming"
          lead="Every colour is a CSS variable holding an RGB channel triplet, referenced from Tailwind as rgb(var(--token) / <alpha-value>). Theming is therefore a variable override, not a config change — and the alpha placeholder is what keeps modifiers like /40 working."
        >
          <div className="grid gap-widget-gap lg:grid-cols-2">
            <Card>
              <CardContent className="py-5">
                <h4 className="mb-3 font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Brand & surface
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {BRAND_TOKENS.map((t) => (
                    <Swatch key={t.name} className={t.swatchClass} label={t.name} sub={t.usage} />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-5">
                <h4 className="mb-3 font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Status groups
                </h4>
                <p className="mb-3 text-xs leading-relaxed text-on-surface-variant">
                  Each group provides <code className="font-mono">DEFAULT</code>,{" "}
                  <code className="font-mono">-container</code>,{" "}
                  <code className="font-mono">-on-container</code>, and{" "}
                  <code className="font-mono">-border</code>. Use these for state tints instead of
                  raw palette colours.
                </p>
                <div className="space-y-1.5">
                  {STATUS_TOKEN_GROUPS.map((g) => (
                    <div key={g.name} className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 font-label text-[10px] font-semibold uppercase tracking-wider",
                          g.chipClass
                        )}
                      >
                        {g.name}
                      </span>
                      <span className="truncate text-[11px] text-on-surface-variant">{g.usage}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-4 grid gap-widget-gap lg:grid-cols-2">
            <Card>
              <CardContent className="space-y-2 py-5">
                <h4 className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Adding a colour
                </h4>
                <CodeBlock
                  code={`/* 1. globals.css — RGB channel triplet, not hex */
--color-my-token: 59 130 246;

/* 2. tailwind.config.ts */
"my-token": "rgb(var(--color-my-token) / <alpha-value>)",

/* 3. optional: high-contrast override in .high-contrast */`}
                />
                <PitfallNote>
                  A variable holding a hex string breaks every opacity modifier in the codebase.
                  Always store bare channel triplets.
                </PitfallNote>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-2 py-5">
                <h4 className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  High-contrast field mode
                </h4>
                <CodeBlock code={`<PageLayout role="technician" highContrast>`} />
                <p className="text-xs leading-relaxed text-on-surface-variant">
                  <code className="font-mono">.high-contrast</code> re-points the tokens, so every
                  Tailwind utility beneath it follows with no component changes. This is why
                  hardcoded colours are a correctness problem, not a style preference — they
                  silently opt out of the theme.
                </p>
                <div className="high-contrast mt-2 space-y-2 rounded-lg border border-outline-variant/40 p-3">
                  <p className="text-xs font-semibold text-on-surface">Preview — high contrast</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full border border-success-border bg-success-container px-2 py-0.5 font-label text-[10px] font-semibold uppercase tracking-wider text-success-on-container">
                      Synced
                    </span>
                    <span className="inline-flex items-center rounded-full border border-warning-border bg-warning-container px-2 py-0.5 font-label text-[10px] font-semibold uppercase tracking-wider text-warning-on-container">
                      Pending
                    </span>
                    <span className="text-xs text-on-surface-variant">body text</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DocSection>

        {/* ── Catalog ── */}
        <DocSection
          id="docs-catalog"
          icon={<Layers className="h-5 w-5" />}
          title="Component reference"
          lead="Searchable index with prop tables. Search matches component names, summaries, and prop names — so 'sortable' or 'aria' will find the right entry."
        >
          <div className="mb-4 space-y-3">
            <Input
              label="Search components"
              placeholder="e.g. sortable, asChild, confidence…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              leadingIcon={<Zap className="h-4 w-4" />}
              hint={`${filtered.length} of ${COMPONENTS.length} entries · ${pitfallCount} have documented pitfalls`}
            />

            <div className="flex flex-wrap gap-1.5">
              {(["All", ...CATEGORIES] as const).map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    aria-pressed={isActive}
                    className={cn(
                      "rounded-full border px-3 py-1 font-label text-[11px] font-semibold uppercase tracking-wider transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-medical-blue focus-visible:ring-offset-1",
                      isActive
                        ? "border-midnight-navy bg-midnight-navy text-white"
                        : "border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-outline hover:text-on-surface"
                    )}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-12 text-center text-sm text-on-surface-variant">
              No components match <code className="font-mono">{query}</code>.
            </div>
          ) : (
            <div className="space-y-6">
              {CATEGORIES.filter((cat) => grouped.has(cat)).map((cat) => (
                <div key={cat}>
                  <h4 className="mb-2 font-label text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                    {cat}
                    <span className="ml-1.5 font-mono text-on-surface-variant/60">
                      {grouped.get(cat)!.length}
                    </span>
                  </h4>
                  <div className="space-y-2">
                    {grouped.get(cat)!.map((doc) => (
                      <ComponentEntry key={doc.name} doc={doc} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DocSection>

        {/* ── Pitfalls ── */}
        <DocSection
          id="docs-pitfalls"
          icon={<TriangleAlert className="h-5 w-5" />}
          title="Pitfalls"
          lead="Every one of these shipped in this codebase and cost real debugging time. They are recorded here so the next engineer doesn't rediscover them."
        >
          <div className="space-y-4">
            {PITFALLS.map((p, i) => (
              <Card key={p.title}>
                <CardContent className="space-y-3 py-5">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-warning-container font-mono text-[11px] font-semibold text-warning-on-container">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-on-surface">{p.title}</h4>
                      <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">{p.why}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-2">
                    <div className="space-y-1.5">
                      <p className="font-label text-[10px] font-semibold uppercase tracking-wider text-danger-on-container">
                        Don&rsquo;t
                      </p>
                      <CodeBlock code={p.wrong} />
                    </div>
                    <div className="space-y-1.5">
                      <p className="font-label text-[10px] font-semibold uppercase tracking-wider text-success-on-container">
                        Do
                      </p>
                      <CodeBlock code={p.right} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DocSection>

        {/* ── A11y ── */}
        <DocSection
          id="docs-a11y"
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Accessibility contract"
          lead="What the components handle for you, and what they cannot know and therefore need from the call site."
        >
          <div className="grid gap-widget-gap lg:grid-cols-2">
            <Card>
              <CardContent className="py-5">
                <h4 className="mb-3 flex items-center gap-1.5 font-label text-xs font-semibold uppercase tracking-wider text-success-on-container">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  Handled for you
                </h4>
                <ul className="space-y-2">
                  {A11Y_CONTRACT.guaranteed.map((item) => (
                    <li key={item} className="flex gap-2 text-xs leading-relaxed text-on-surface-variant">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-success" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-5">
                <h4 className="mb-3 flex items-center gap-1.5 font-label text-xs font-semibold uppercase tracking-wider text-warning-on-container">
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                  Your responsibility
                </h4>
                <ul className="space-y-2">
                  {A11Y_CONTRACT.yourJob.map((item) => (
                    <li key={item} className="flex gap-2 text-xs leading-relaxed text-on-surface-variant">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-warning-amber" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </DocSection>

        {/* ── AI rules ── */}
        <DocSection
          id="docs-ai"
          icon={<Sparkles className="h-5 w-5" />}
          title="AI rules"
          lead="The AI layer is presentational only — no fetching, no model calls. These four rules are safety properties of a medical product, not style preferences."
        >
          <div className="space-y-3">
            {[
              {
                rule: "No suggestion applies itself",
                detail:
                  "There is no auto-accept threshold anywhere in this layer, and adding one would be a regression. An unreviewed suggestion becoming a submitted CPT code is a compliance incident, not a saved click.",
              },
              {
                rule: "Confidence is banded, never a percentage",
                detail:
                  '"91% confident" reads as probability of correctness, which a model score is not. Use AIConfidenceMeter and don\'t print the raw number beside it.',
              },
              {
                rule: "Generated output carries a disclaimer",
                detail:
                  "review-required for anything that can reach a claim or patient record; not-diagnostic for anything touching image interpretation.",
              },
              {
                rule: "Never announce streaming text token-by-token",
                detail:
                  "An aria-live region re-reads its whole contents on every token. Mark the region aria-busy while streaming and announce once when it settles.",
              },
            ].map((r, i) => (
              <div
                key={r.rule}
                className="flex items-start gap-3 rounded-xl border border-ai-border bg-ai-surface px-4 py-3"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-ai-accent font-mono text-[11px] font-semibold text-white">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ai-on-surface">{r.rule}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-on-surface-variant">{r.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </DocSection>

        {/* ── Contributing ── */}
        <DocSection
          id="docs-contributing"
          icon={<Check className="h-5 w-5" />}
          title="Adding a component"
          lead="Work through this before opening a PR. It encodes the conventions the existing components already follow."
        >
          <Card>
            <CardContent className="py-5">
              <ol className="space-y-2.5">
                {[
                  "Colours come from tokens. No hex, no raw Tailwind palette values for state.",
                  "Forward a ref when the element is focusable or measurable.",
                  'Add "use client" only if you use hooks or handlers — keep it server-renderable otherwise.',
                  "Accept className and merge it last through cn() so callers can override.",
                  "Derive ids with useId (or useFieldIds for form controls). Never from label text.",
                  "Interactive elements need a visible focus ring and a keyboard path, not just a click handler.",
                  "Wire error state through aria-invalid and aria-describedby.",
                  "Keep touch targets at 44px+, and 48px on technician screens.",
                  "Export the component and its props type from the module barrel.",
                  "Add an entry to src/app/_docs/catalog.ts in the same commit.",
                  "Add it to the gallery so it is discoverable.",
                  "Run npm run build — it typechecks and lints.",
                ].map((step, i) => (
                  <li key={step} className="flex gap-2.5 text-sm leading-relaxed text-on-surface-variant">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-surface-container font-mono text-[11px] font-semibold text-on-surface">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              <div className="mt-4">
                <Button asChild variant="outline" size="sm">
                  <a href="#docs-catalog">Back to component reference</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </DocSection>
      </div>
    </div>
  );
}
