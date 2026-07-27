"use client";

import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import { useId, type ReactNode } from "react";

/*
 * Shared plumbing for labelled form controls.
 *
 * Input and Select previously each derived their DOM id from the label text
 * (`label.toLowerCase().replace(/\s+/g, "-")`). Two fields labelled "Facility"
 * on the same page produced duplicate ids, which silently breaks
 * label-to-control association — clicking the second label focuses the first
 * field. Neither component wired `error` to the control either, so screen
 * readers never announced validation failures.
 *
 * Centralising both concerns here means any new control gets them for free.
 */

export interface FieldIdsOptions {
  id?: string;
  error?: string;
  hint?: string;
}

export interface FieldIds {
  fieldId: string;
  errorId: string;
  hintId: string;
  /** Value for `aria-describedby` on the control, or undefined if nothing to describe. */
  describedBy: string | undefined;
}

/** Generates collision-free ids and the aria wiring for one form control. */
export function useFieldIds({ id, error, hint }: FieldIdsOptions): FieldIds {
  const generated = useId();
  const fieldId = id ?? `field${generated}`;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  // The error message replaces the hint when both are present, so describe only
  // what is actually rendered.
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return { fieldId, errorId, hintId, describedBy };
}

export function FieldLabel({
  htmlFor,
  children,
  required,
  className,
}: {
  htmlFor: string;
  children: ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "text-xs font-semibold font-label uppercase tracking-wider text-on-surface-variant",
        className
      )}
    >
      {children}
      {required && (
        <span className="text-emergency-red ml-0.5" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}

/**
 * Renders the error or hint text beneath a control.
 *
 * The error is a live region so it is announced when validation fails after the
 * control has already been read.
 */
export function FieldMessage({
  error,
  hint,
  errorId,
  hintId,
}: {
  error?: string;
  hint?: string;
  errorId: string;
  hintId: string;
}) {
  if (error) {
    return (
      <p id={errorId} role="alert" className="flex items-center gap-1 text-xs text-emergency-red">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {error}
      </p>
    );
  }
  if (hint) {
    return (
      <p id={hintId} className="text-xs text-on-surface-variant">
        {hint}
      </p>
    );
  }
  return null;
}
