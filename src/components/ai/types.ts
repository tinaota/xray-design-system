import type { ReactNode } from "react";

/*
 * Contracts for the AI component layer.
 *
 * These live here rather than in src/lib/utils.ts on purpose: that file holds
 * *domain* types (Order, Technician, Invoice) which model the business. These are
 * UI contracts for presentational components and carry no domain meaning. They
 * are re-exported from `@/components`, so there is still a single import site.
 *
 * Nothing in this layer fetches data or calls a model. Components take the state
 * they render as props; the caller owns the transport.
 */

export type AIRole = "user" | "assistant" | "system";

export type AIMessageStatus = "streaming" | "complete" | "error";

export interface AIMessage {
  id: string;
  role: AIRole;
  /** Plain text, or a node when the caller renders markdown itself. */
  content: ReactNode;
  /** Pre-formatted for display — this layer does no date math. */
  timestamp?: string;
  status?: AIMessageStatus;
  /** Sources backing this message, rendered via `<AICitationList>`. */
  citations?: AICitation[];
}

export interface AICitation {
  id: string;
  /** Short display name, e.g. "CMS Portable Imaging Policy". */
  label: string;
  /** Where it came from, e.g. "Payer policy manual §4.2". */
  source?: string;
  /** Quoted supporting passage. */
  excerpt?: string;
  /** Optional deep link. External URLs get safe rel attributes. */
  href?: string;
  page?: string | number;
}

/**
 * Confidence bands.
 *
 * Deliberately coarse. Surfacing a raw "0.87" implies calibration the model
 * doesn't have, and invites clinicians to treat it as a probability of
 * correctness. Bands force honest language.
 */
export type AIConfidenceBand = "high" | "medium" | "low";

export type AISuggestionStatus = "pending" | "accepted" | "rejected";

/**
 * Failure modes, split because they are not the same thing to a user.
 *
 * `refusal` is the model declining — a valid outcome, not a bug, and retrying
 * verbatim will not help. The rest are transport or capacity problems where a
 * retry is reasonable.
 */
export type AIErrorVariant =
  | "refusal"
  | "content-filter"
  | "timeout"
  | "rate-limit"
  | "network"
  | "unknown";

export type AIDisclaimerVariant =
  | "review-required"
  | "not-diagnostic"
  | "generated"
  | "custom";
