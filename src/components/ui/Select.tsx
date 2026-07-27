"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { forwardRef, type SelectHTMLAttributes } from "react";
import { FieldLabel, FieldMessage, useFieldIds } from "./Field";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  /** Rendered as a non-selectable first option when the field is required. */
  placeholder?: string;
  fullWidth?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    className,
    label,
    error,
    hint,
    options,
    placeholder,
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

      <div className="relative">
        <select
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "w-full h-11 appearance-none bg-surface-container-lowest border rounded-lg",
            "text-sm text-on-surface px-3 pr-10 py-2 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-medical-blue focus:border-transparent",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error
              ? "border-emergency-red focus:ring-emergency-red"
              : "border-outline-variant hover:border-outline",
            className
          )}
          {...props}
        >
          {placeholder && (
            // `disabled` on the placeholder keeps required validation honest:
            // the user cannot submit the empty choice back.
            <option value="" disabled={required}>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-gray pointer-events-none"
          aria-hidden="true"
        />
      </div>

      <FieldMessage error={error} hint={hint} errorId={errorId} hintId={hintId} />
    </div>
  );
});

export { Select };
