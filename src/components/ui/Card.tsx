import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Clip children to the card's rounded corners with `overflow-hidden`.
   *
   * Off by default, and deliberately so: this used to be unconditional, which
   * meant a Card silently broke anything that needs to paint outside its box —
   * a <DataTable stickyHeader>, a dropdown, a tooltip, a popover. Turn it on
   * only for cards whose child genuinely needs clipping, such as a full-bleed
   * image or map that would otherwise square off the corners.
   */
  clip?: boolean;
  /** Adds hover elevation. Use on cards that are themselves clickable. */
  interactive?: boolean;
}

function Card({ className, clip = false, interactive = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface-container-lowest rounded-xl shadow-card border border-outline-variant/40",
        clip && "overflow-hidden",
        interactive && "transition-shadow hover:shadow-card-md",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-5 py-4 border-b border-outline-variant/40",
        className
      )}
      {...props}
    />
  );
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /**
   * Heading level. Pick the one that fits the page's outline rather than
   * accepting the default — screen reader users navigate by heading structure,
   * and a page of sibling <h3>s under an <h1> has a gap in it.
   */
  as?: "h2" | "h3" | "h4" | "h5";
}

function CardTitle({ className, as: Comp = "h3", ...props }: CardTitleProps) {
  return (
    <Comp
      className={cn(
        "text-sm font-semibold text-on-surface font-label uppercase tracking-wider",
        className
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-on-surface-variant", className)} {...props} />;
}

function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-4", className)} {...props} />;
}

function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        // rounded-b-xl rather than relying on the parent to clip, so the footer
        // fill follows the card's corners without `overflow-hidden`.
        "px-5 py-3 bg-surface-container border-t border-outline-variant/40 rounded-b-xl flex items-center gap-3",
        className
      )}
      {...props}
    />
  );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
