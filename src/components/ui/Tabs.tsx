"use client";

import { cn } from "@/lib/utils";
import {
  createContext,
  useCallback,
  useContext,
  useId,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

/*
 * Tabs implementing the WAI-ARIA tabs pattern.
 *
 * Beyond click-to-switch, this adds the parts assistive tech and keyboard users
 * depend on, none of which were present before:
 * - Arrow keys move between tabs (wrapping), Home/End jump to the ends
 * - roving tabindex, so the tablist is a single Tab stop rather than N stops
 * - id / aria-controls / aria-labelledby wiring between each trigger and panel
 * - a controlled mode (`value` + `onValueChange`) for URL- or state-synced tabs
 */

interface TabsContextValue {
  active: string;
  setActive: (id: string) => void;
  baseId: string;
  orientation: "horizontal" | "vertical";
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs components must be used inside <Tabs>");
  return ctx;
}

const triggerId = (baseId: string, value: string) => `${baseId}-trigger-${value}`;
const panelId = (baseId: string, value: string) => `${baseId}-panel-${value}`;

export interface TabsProps {
  /** Initial tab for uncontrolled usage. */
  defaultValue?: string;
  /** Active tab for controlled usage — pair with `onValueChange`. */
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  children: ReactNode;
  className?: string;
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  orientation = "horizontal",
  children,
  className,
}: TabsProps) {
  const baseId = useId();
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? "");
  const isControlled = value !== undefined;
  const active = isControlled ? value : uncontrolled;

  const setActive = useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolled(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange]
  );

  if (process.env.NODE_ENV !== "production" && defaultValue === undefined && value === undefined) {
    console.warn("[Tabs] Provide either `defaultValue` (uncontrolled) or `value` (controlled).");
  }

  return (
    <TabsContext.Provider value={{ active, setActive, baseId, orientation }}>
      <div
        className={cn("flex", orientation === "vertical" ? "flex-row gap-4" : "flex-col", className)}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  className,
  "aria-label": ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}) {
  const { orientation } = useTabs();
  return (
    <div
      role="tablist"
      aria-orientation={orientation}
      aria-label={ariaLabel}
      className={cn(
        "flex items-center",
        orientation === "vertical"
          ? "flex-col items-stretch gap-1 border-r border-outline-variant/40 pr-1"
          : "gap-1 border-b border-outline-variant/40 px-1",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
  disabled = false,
}: {
  value: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const { active, setActive, baseId, orientation } = useTabs();
  const isActive = active === value;

  /*
   * Arrow-key navigation reads the enabled tabs straight out of the DOM rather
   * than from a registration list, so it always follows visual order even when
   * triggers are conditionally rendered or reordered.
   */
  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      const list = e.currentTarget.closest('[role="tablist"]');
      if (!list) return;

      const tabs = Array.from(
        list.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])')
      );
      const index = tabs.indexOf(e.currentTarget);
      if (index === -1) return;

      const prevKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
      const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";

      let target: HTMLButtonElement | undefined;
      if (e.key === nextKey) target = tabs[(index + 1) % tabs.length];
      else if (e.key === prevKey) target = tabs[(index - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") target = tabs[0];
      else if (e.key === "End") target = tabs[tabs.length - 1];
      else return;

      e.preventDefault();
      target?.focus();
      // Automatic activation: focusing a tab selects it, per the ARIA pattern
      // for tabs whose panels are cheap to render.
      target?.click();
    },
    [orientation]
  );

  return (
    <button
      type="button"
      role="tab"
      id={triggerId(baseId, value)}
      aria-selected={isActive}
      aria-controls={panelId(baseId, value)}
      // Also exposed as a data attribute so callers can style with
      // `data-[state=active]:`, the convention most headless libraries use.
      data-state={isActive ? "active" : "inactive"}
      // Roving tabindex: only the active tab is reachable with Tab; arrows move
      // within the list.
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={() => setActive(value)}
      onKeyDown={onKeyDown}
      className={cn(
        "px-4 py-2.5 text-sm font-semibold transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-medical-blue focus-visible:ring-inset",
        "disabled:opacity-50 disabled:pointer-events-none",
        orientation === "vertical"
          ? "border-r-2 -mr-px text-left"
          : "border-b-2 -mb-px",
        isActive
          ? "border-medical-blue text-medical-blue"
          : "border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
  /**
   * Keep the panel mounted while hidden. Use when the panel holds form state,
   * a chart instance, or a scroll position that should survive tab switches.
   */
  forceMount = false,
}: {
  value: string;
  children: ReactNode;
  className?: string;
  forceMount?: boolean;
}) {
  const { active, baseId } = useTabs();
  const isActive = active === value;

  if (!isActive && !forceMount) return null;

  return (
    <div
      role="tabpanel"
      id={panelId(baseId, value)}
      aria-labelledby={triggerId(baseId, value)}
      data-state={isActive ? "active" : "inactive"}
      hidden={!isActive}
      // Panels are focusable so keyboard users can Tab from the tablist into
      // the content they just selected.
      tabIndex={0}
      className={cn(
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-medical-blue",
        isActive && "animate-fade-in",
        className
      )}
    >
      {children}
    </div>
  );
}
