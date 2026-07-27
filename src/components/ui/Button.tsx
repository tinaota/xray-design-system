"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Slot } from "@/lib/slot";
import { Loader2 } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

/*
 * NOTE ON SIZES: the base string must never include the `.touch-target` utility.
 * That class sets `min-height: 48px`, and CSS resolves `min-height` over
 * `height`, so its presence here previously collapsed every size variant —
 * `sm`, `md`, and `icon` all rendered at 48px and the `size` prop did nothing.
 * Touch compliance is handled per-size below instead.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap",
    "transition-colors select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    // Keeps <a>/<Link> children non-interactive when disabled via asChild.
    "aria-disabled:pointer-events-none aria-disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-medical-blue text-white hover:bg-medical-blue/90 active:bg-medical-blue/80 focus-visible:ring-medical-blue",
        secondary:
          "bg-midnight-navy text-white hover:bg-midnight-navy/90 active:bg-midnight-navy/80 focus-visible:ring-midnight-navy",
        outline:
          "border border-outline bg-transparent text-on-surface hover:bg-surface-container focus-visible:ring-medical-blue",
        ghost:
          "bg-transparent text-on-surface hover:bg-surface-container focus-visible:ring-medical-blue",
        danger:
          "bg-emergency-red text-white hover:bg-emergency-red/90 active:bg-emergency-red/80 focus-visible:ring-emergency-red",
        warning:
          "bg-warning-amber text-midnight-navy hover:bg-warning-amber/90 active:bg-warning-amber/80 focus-visible:ring-warning-amber",
        stat:
          "bg-emergency-red text-white font-bold uppercase tracking-wider hover:bg-emergency-red/90 focus-visible:ring-emergency-red",
      },
      size: {
        /*
         * `sm` sits below the 48px field-touch guidance on purpose — it is for
         * dense desktop UI (table row actions, filter chips). Don't use it on
         * technician screens; reach for `lg` or `xl` there.
         */
        sm: "h-9 px-3 text-xs rounded-md",
        md: "h-11 px-4 text-sm rounded-lg",
        lg: "h-12 px-6 text-base rounded-lg",
        xl: "h-14 px-8 text-base rounded-xl",
        icon: "h-11 w-11 rounded-lg",
        "icon-sm": "h-9 w-9 rounded-md",
        "icon-lg": "h-12 w-12 rounded-lg",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Shows a spinner, disables the button, and marks it `aria-busy`. */
  loading?: boolean;
  /** Announced to screen readers while `loading`. */
  loadingLabel?: string;
  /** Icon before the label. Swapped for the spinner while `loading`. */
  leadingIcon?: ReactNode;
  /** Icon after the label. */
  trailingIcon?: ReactNode;
  /**
   * Render the child element with this button's styling instead of a <button>.
   * Use for links: `<Button asChild><Link href="/orders">View</Link></Button>`.
   * The child owns its own content, so `leadingIcon` / `trailingIcon` /
   * `loading` are ignored in this mode — compose them inside the child.
   */
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant,
    size,
    fullWidth,
    loading = false,
    loadingLabel = "Loading",
    leadingIcon,
    trailingIcon,
    children,
    disabled,
    asChild = false,
    type,
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;
  const Comp = asChild ? Slot : "button";

  if (process.env.NODE_ENV !== "production" && asChild && (loading || leadingIcon || trailingIcon)) {
    console.warn(
      "[Button] `loading`, `leadingIcon`, and `trailingIcon` are ignored when `asChild` is set, " +
        "because the child element supplies its own content. Compose them inside the child instead."
    );
  }

  /*
   * `disabled` is not valid on an anchor, so in asChild mode the disabled state
   * is expressed with `aria-disabled` (styled in the base above). Defaulting
   * `type` to "button" avoids the classic accidental form submit.
   */
  const stateProps = asChild
    ? { "aria-disabled": isDisabled || undefined }
    : { disabled: isDisabled, type: type ?? "button" };

  return (
    <Comp
      {...props}
      {...stateProps}
      ref={ref}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
          ) : (
            leadingIcon
          )}
          {children}
          {!loading && trailingIcon}
          {/*
            Only announce the spinner when there is no visible label to announce.
            Adding it unconditionally makes an icon-only button accessible but
            makes a labelled one read as "Loading… Loading".
          */}
          {loading && !children && <span className="sr-only">{loadingLabel}</span>}
        </>
      )}
    </Comp>
  );
});

export { Button, buttonVariants };
