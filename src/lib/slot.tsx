"use client";

import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "./utils";

/*
 * Minimal `asChild` primitive.
 *
 * Exists so a design-system component can lend its styling and behavior to a
 * different element — most often a Next.js <Link> that needs to look like a
 * <Button>. Without it, engineers copy `buttonVariants()` onto an anchor by
 * hand, and the two drift apart the first time the button styling changes.
 *
 * This is deliberately a local implementation rather than a Radix dependency:
 * the project has no Radix packages, and `asChild` is the only piece we need.
 */

type ChildProps = HTMLAttributes<HTMLElement> & { className?: string };

export interface SlotProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

/** True when a prop name is a React event handler (`onClick`, `onKeyDown`, …). */
function isEventHandlerName(key: string): boolean {
  return /^on[A-Z]/.test(key);
}

/**
 * Merges the Slot's own props into its single child element.
 *
 * Precedence rules, chosen to be predictable:
 * - `className` — merged through `cn()`, child's classes last so they win.
 * - `style` — shallow merged, child's keys win.
 * - event handlers — *composed*: both run, slot's first. This matters because
 *   dropping one silently breaks either the component's behavior or the
 *   caller's, and neither failure is obvious at the call site.
 * - everything else — child wins, so `<Link href>` keeps its own href.
 */
export const Slot = forwardRef<HTMLElement, SlotProps>(function Slot(
  { children, className, style, ...slotProps },
  ref
) {
  if (!isValidElement(children)) {
    if (process.env.NODE_ENV !== "production") {
      const count = Children.count(children);
      throw new Error(
        `asChild expects exactly one React element child, received ${
          count === 0 ? "none" : `${count} children or a non-element`
        }. Wrap the content in a single element, or drop asChild.`
      );
    }
    return null;
  }

  const child = children as ReactElement<ChildProps>;
  const childProps = child.props as Record<string, unknown>;
  const merged: Record<string, unknown> = { ...slotProps };

  for (const [key, childValue] of Object.entries(childProps)) {
    if (key === "className" || key === "style") continue; // merged explicitly below
    const slotValue = merged[key];

    if (isEventHandlerName(key) && typeof slotValue === "function" && typeof childValue === "function") {
      merged[key] = (...args: unknown[]) => {
        (slotValue as (...a: unknown[]) => void)(...args);
        (childValue as (...a: unknown[]) => void)(...args);
      };
    } else {
      merged[key] = childValue;
    }
  }

  merged.className = cn(className, childProps.className as string | undefined);
  merged.style = { ...style, ...(childProps.style as object | undefined) };
  merged.ref = ref;

  return cloneElement(child, merged as ChildProps);
});
