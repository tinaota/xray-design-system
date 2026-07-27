"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Button } from "./Button";

export interface ModalProps {
  /** Whether the dialog is visible. */
  open?: boolean;
  /**
   * Alias for `open`. Kept because the platform guide documented `isOpen` while
   * the implementation shipped `open`; both work so existing call sites and the
   * documented API agree.
   */
  isOpen?: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  /** Rendered in a bordered action bar below the body. */
  footer?: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Set false for destructive confirmations that need a deliberate choice. */
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  /** Hide the header close button (pair with an explicit footer action). */
  hideCloseButton?: boolean;
}

const sizeMap: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
  full: "max-w-[calc(100vw-2rem)] h-[calc(100vh-2rem)]",
};

/* Elements that can hold focus, used for the focus trap and initial focus. */
const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

/**
 * Accessible modal dialog.
 *
 * Implements the pieces a dialog needs to actually be usable with a keyboard or
 * screen reader, all of which were previously missing:
 * - renders in a portal on document.body, so it escapes ancestor `overflow`
 *   and `transform` stacking contexts (a Card's `overflow-hidden` used to clip it)
 * - traps Tab focus inside the panel, and restores focus to the trigger on close
 * - locks body scroll while open, compensating for scrollbar width so the page
 *   behind doesn't shift
 * - derives ids with `useId`, so two mounted modals no longer collide on a
 *   hardcoded `id="modal-title"` and break their own aria wiring
 */
export function Modal({
  open,
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  size = "md",
  closeOnBackdropClick = true,
  closeOnEscape = true,
  hideCloseButton = false,
}: ModalProps) {
  const visible = open ?? isOpen ?? false;
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  const reactId = useId();
  const titleId = `modal-title-${reactId}`;
  const descriptionId = `modal-description-${reactId}`;

  // Portals need a DOM target, which does not exist during SSR.
  useEffect(() => setMounted(true), []);

  // Remember the trigger so focus can go back where the user left it.
  useEffect(() => {
    if (!visible) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    return () => restoreFocusRef.current?.focus?.();
  }, [visible]);

  // Move focus into the dialog once it opens.
  useEffect(() => {
    if (!visible) return;
    const panel = panelRef.current;
    if (!panel) return;
    const first = panel.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel).focus();
  }, [visible]);

  // Lock body scroll, compensating for the scrollbar we remove.
  useEffect(() => {
    if (!visible) return;
    const { overflow, paddingRight } = document.body.style;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [visible]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape" && closeOnEscape) {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      // Wrap at both ends so Tab never escapes to the page behind the dialog.
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [closeOnEscape, onClose]
  );

  if (!visible || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-midnight-navy/50 backdrop-blur-sm animate-fade-in"
        aria-hidden="true"
        onClick={closeOnBackdropClick ? onClose : undefined}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        aria-label={title ? undefined : "Dialog"}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className={cn(
          "relative flex w-full flex-col outline-none",
          "bg-surface-container-lowest rounded-2xl shadow-card-lg border border-outline-variant/40",
          "max-h-[calc(100vh-2rem)] animate-fade-in",
          sizeMap[size],
          className
        )}
      >
        {(title || description || !hideCloseButton) && (
          <div className="flex items-start justify-between gap-4 p-5 border-b border-outline-variant/40">
            <div className="min-w-0">
              {title && (
                <h2 id={titleId} className="text-base font-semibold text-on-surface">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descriptionId} className="mt-1 text-sm text-on-surface-variant">
                  {description}
                </p>
              )}
            </div>
            {!hideCloseButton && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
                aria-label="Close dialog"
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Body scrolls independently so long content never pushes the dialog off screen. */}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-outline-variant/40 bg-surface-container">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
