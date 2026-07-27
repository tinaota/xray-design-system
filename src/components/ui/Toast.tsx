"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Info, X, XCircle } from "lucide-react";
import { createPortal } from "react-dom";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ToastVariant = "success" | "warning" | "error" | "info";

export interface ToastOptions {
  variant?: ToastVariant;
  title: string;
  description?: string;
  /** Milliseconds before auto-dismiss. `0` keeps it up until dismissed. */
  duration?: number;
  action?: ReactNode;
}

export interface ToastRecord extends ToastOptions {
  id: string;
}

const iconMap: Record<ToastVariant, ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-success shrink-0" aria-hidden="true" />,
  warning: <AlertTriangle className="h-5 w-5 text-warning-amber shrink-0" aria-hidden="true" />,
  error: <XCircle className="h-5 w-5 text-emergency-red shrink-0" aria-hidden="true" />,
  info: <Info className="h-5 w-5 text-medical-blue shrink-0" aria-hidden="true" />,
};

const styleMap: Record<ToastVariant, string> = {
  success: "border-success-border bg-success-container text-success-on-container",
  warning: "border-warning-border bg-warning-container text-warning-on-container",
  error: "border-danger-border bg-danger-container text-danger-on-container",
  info: "border-info-border bg-info-container text-info-on-container",
};

export interface ToastProps extends ToastOptions {
  onDismiss?: () => void;
}

/**
 * A single toast. Usually rendered for you by `ToastProvider` — reach for this
 * directly only when you need a toast in a fixed spot in the layout.
 */
export function Toast({ variant = "info", title, description, onDismiss, action }: ToastProps) {
  return (
    <div
      /*
       * Errors and warnings interrupt (`alert` / assertive); success and info
       * wait for a pause (`status` / polite). Marking everything as `alert`, as
       * this component used to, means a routine "Saved" notice cuts off whatever
       * the screen reader was in the middle of reading.
       */
      role={variant === "error" || variant === "warning" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 w-full max-w-sm rounded-xl border px-4 py-3 shadow-card-md animate-fade-in",
        styleMap[variant]
      )}
    >
      {iconMap[variant]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        {description && <p className="text-xs opacity-90 mt-0.5">{description}</p>}
        {action && <div className="mt-2">{action}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded p-0.5 transition-colors hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
          aria-label={`Dismiss: ${title}`}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

/** Positioned stack for toasts. */
export function ToastContainer({ children }: { children: ReactNode }) {
  return (
    <div
      // A labelled region gives screen reader users a way to navigate to
      // notifications they may have missed.
      role="region"
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 w-full max-w-sm pointer-events-none [&>*]:pointer-events-auto"
    >
      {children}
    </div>
  );
}

interface ToastContextValue {
  /** Queues a toast and returns its id. */
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Access the toast queue.
 *
 * ```tsx
 * const { toast } = useToast();
 * toast({ variant: "error", title: "Sync failed", description: "3 orders pending." });
 * ```
 */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside <ToastProvider>. Add it near the app root.");
  }
  return ctx;
}

export interface ToastProviderProps {
  children: ReactNode;
  /** Default auto-dismiss delay. Errors get 1.6× this, since they matter more. */
  duration?: number;
  /** Oldest toasts beyond this are dropped, so the stack can't cover the UI. */
  max?: number;
}

/**
 * Owns the toast queue, timers, and rendering.
 *
 * Added because `Toast` was presentational only: every feature that wanted a
 * notification had to build its own array-of-toasts state, `setTimeout`
 * bookkeeping, and cleanup — the same code, slightly differently wrong, in each
 * place.
 */
export function ToastProvider({ children, duration = 5000, max = 4 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
    setToasts([]);
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const variant = options.variant ?? "info";
      const ttl = options.duration ?? (variant === "error" ? duration * 1.6 : duration);

      setToasts((current) => {
        const next = [...current, { ...options, id, variant }];
        // Drop the oldest overflow, and clear its pending timer so it can't
        // fire against a toast that is no longer displayed.
        const overflow = next.slice(0, Math.max(0, next.length - max));
        overflow.forEach((t) => {
          const timer = timers.current.get(t.id);
          if (timer) {
            clearTimeout(timer);
            timers.current.delete(t.id);
          }
        });
        return next.slice(-max);
      });

      if (ttl > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), ttl)
        );
      }
      return id;
    },
    [dismiss, duration, max]
  );

  // Clear every outstanding timer if the provider unmounts mid-flight.
  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, []);

  const value = useMemo(() => ({ toast, dismiss, dismissAll }), [toast, dismiss, dismissAll]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted &&
        createPortal(
          <ToastContainer>
            {toasts.map((t) => (
              <Toast key={t.id} {...t} onDismiss={() => dismiss(t.id)} />
            ))}
          </ToastContainer>,
          document.body
        )}
    </ToastContext.Provider>
  );
}
