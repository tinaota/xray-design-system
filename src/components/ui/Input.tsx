"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { FieldLabel, FieldMessage, useFieldIds } from "./Field";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Presence of this switches the control into its invalid state. */
  error?: string;
  /** Helper text. Hidden while `error` is set, to avoid two competing messages. */
  hint?: string;
  leadingIcon?: ReactNode;
  /**
   * Trailing adornment. Non-interactive by default; pass `interactiveTrailing`
   * when it contains a button (a password reveal, a clear control) so it can
   * receive clicks.
   */
  trailingIcon?: ReactNode;
  interactiveTrailing?: boolean;
  /** Use tabular mono for CPT codes, license numbers, IDs, and amounts. */
  mono?: boolean;
  /** Stretches to the container width. Defaults to true. */
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    label,
    error,
    hint,
    leadingIcon,
    trailingIcon,
    interactiveTrailing = false,
    mono = false,
    fullWidth = true,
    id,
    required,
    ...props
  },
  ref
) {
  const { fieldId, errorId, hintId, describedBy } = useFieldIds({ id, error, hint });

  return (
    <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
      {label && (
        <FieldLabel htmlFor={fieldId} required={required}>
          {label}
        </FieldLabel>
      )}

      <div className="relative flex items-center">
        {leadingIcon && (
          <span className="absolute left-3 flex text-slate-gray pointer-events-none" aria-hidden="true">
            {leadingIcon}
          </span>
        )}

        <input
          ref={ref}
          id={fieldId}
          required={required}
          // Announces the invalid state and points at the message that explains it.
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "w-full h-11 bg-surface-container-lowest border rounded-lg text-sm text-on-surface placeholder:text-outline",
            "px-3 py-2 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-medical-blue focus:border-transparent",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error
              ? "border-emergency-red focus:ring-emergency-red"
              : "border-outline-variant hover:border-outline",
            leadingIcon && "pl-10",
            trailingIcon && "pr-10",
            mono && "font-mono tracking-tight",
            className
          )}
          {...props}
        />

        {trailingIcon && (
          <span
            className={cn(
              "absolute right-3 flex text-slate-gray",
              !interactiveTrailing && "pointer-events-none"
            )}
            aria-hidden={!interactiveTrailing}
          >
            {trailingIcon}
          </span>
        )}
      </div>

      <FieldMessage error={error} hint={hint} errorId={errorId} hintId={hintId} />
    </div>
  );
});

export { Input };
