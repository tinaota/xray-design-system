"use client";

import { cn } from "@/lib/utils";
import { ArrowUp, Square } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useFieldIds } from "@/components/ui/Field";

export interface AIPromptInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Called on Enter or the send button. Not called when the value is blank. */
  onSubmit: () => void;
  /** Shown as a Stop button while `isStreaming`. Omit to hide stopping. */
  onStop?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
  placeholder?: string;
  /** Visible label. Falls back to a screen-reader-only one so the field is never unlabelled. */
  label?: string;
  hint?: ReactNode;
  maxLength?: number;
  /** Rows before the textarea starts scrolling instead of growing. */
  maxRows?: number;
  /** Extra controls rendered beside the send button (model picker, attach, …). */
  actions?: ReactNode;
  className?: string;
}

const LINE_HEIGHT_PX = 20;
const VERTICAL_PADDING_PX = 20;

/**
 * Composer for AI prompts.
 *
 * Conventions users already expect from chat inputs, and which are easy to get
 * subtly wrong:
 * - **Enter submits, Shift+Enter inserts a newline.** IME composition is excluded
 *   so Enter confirming a character in a Japanese or Chinese input does not fire
 *   an accidental submit.
 * - **The send button becomes Stop while streaming**, rather than sitting there
 *   disabled with no way to interrupt a long generation.
 * - **Blank and whitespace-only submits are ignored**, so a stray Enter does not
 *   burn a request.
 */
export const AIPromptInput = forwardRef<HTMLTextAreaElement, AIPromptInputProps>(
  function AIPromptInput(
    {
      value,
      onChange,
      onSubmit,
      onStop,
      isStreaming = false,
      disabled = false,
      placeholder = "Ask a question…",
      label,
      hint,
      maxLength,
      maxRows = 8,
      actions,
      className,
    },
    ref
  ) {
    const innerRef = useRef<HTMLTextAreaElement>(null);
    useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);

    const { fieldId, hintId, describedBy } = useFieldIds({
      hint: hint ? "hint" : undefined,
    });

    const canSubmit = value.trim().length > 0 && !disabled && !isStreaming;

    // Grow with content up to maxRows, then scroll.
    useEffect(() => {
      const el = innerRef.current;
      if (!el) return;
      el.style.height = "auto";
      const maxHeight = maxRows * LINE_HEIGHT_PX + VERTICAL_PADDING_PX;
      el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
      el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
    }, [value, maxRows]);

    const onKeyDown = useCallback(
      (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key !== "Enter" || e.shiftKey) return;
        // `isComposing` guards IME input: during composition Enter commits the
        // candidate character and must not submit the form.
        if (e.nativeEvent.isComposing) return;
        e.preventDefault();
        if (value.trim().length > 0 && !disabled && !isStreaming) onSubmit();
      },
      [value, disabled, isStreaming, onSubmit]
    );

    const showCounter = maxLength !== undefined;
    const nearLimit = showCounter && value.length >= maxLength * 0.9;

    return (
      <div className={cn("flex flex-col gap-1.5 w-full", className)}>
        {label ? (
          <label
            htmlFor={fieldId}
            className="text-xs font-semibold font-label uppercase tracking-wider text-on-surface-variant"
          >
            {label}
          </label>
        ) : (
          <label htmlFor={fieldId} className="sr-only">
            Prompt
          </label>
        )}

        <div
          className={cn(
            "relative flex items-end gap-2 rounded-xl border bg-surface-container-lowest p-2 transition-colors",
            "focus-within:ring-2 focus-within:ring-medical-blue focus-within:border-transparent",
            disabled ? "opacity-60 border-outline-variant" : "border-outline-variant hover:border-outline"
          )}
        >
          <textarea
            ref={innerRef}
            id={fieldId}
            rows={1}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            aria-describedby={describedBy}
            className={cn(
              "flex-1 resize-none bg-transparent px-2 py-2 text-sm text-on-surface",
              "placeholder:text-outline focus:outline-none disabled:cursor-not-allowed"
            )}
            style={{ lineHeight: `${LINE_HEIGHT_PX}px` }}
          />

          <div className="flex shrink-0 items-center gap-1">
            {actions}

            {isStreaming && onStop ? (
              <button
                type="button"
                onClick={onStop}
                aria-label="Stop generating"
                className={cn(
                  "inline-flex h-11 w-11 items-center justify-center rounded-lg transition-colors",
                  "bg-surface-container text-on-surface hover:bg-surface-container-high",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-medical-blue focus-visible:ring-offset-2"
                )}
              >
                <Square className="h-4 w-4 fill-current" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onSubmit}
                disabled={!canSubmit}
                aria-label="Send prompt"
                className={cn(
                  "inline-flex h-11 w-11 items-center justify-center rounded-lg transition-colors",
                  "bg-ai-accent text-white hover:bg-ai-accent/90",
                  "disabled:opacity-40 disabled:pointer-events-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ai-accent focus-visible:ring-offset-2"
                )}
              >
                <ArrowUp className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {(hint || showCounter) && (
          <div className="flex items-start justify-between gap-3">
            {hint ? (
              <p id={hintId} className="text-xs text-on-surface-variant">
                {hint}
              </p>
            ) : (
              <span />
            )}
            {showCounter && (
              <p
                className={cn(
                  "shrink-0 font-mono text-xs tabular-nums",
                  nearLimit ? "text-warning-on-container" : "text-on-surface-variant"
                )}
              >
                {value.length}/{maxLength}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);
