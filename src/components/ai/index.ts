/*
 * AI component layer.
 *
 * Domain-neutral primitives for building AI surfaces. Every component here is
 * presentational: it takes the state it renders as props and never fetches,
 * streams, or calls a model itself. The caller owns transport and state, exactly
 * as with the rest of the design system.
 *
 * Two conventions this layer enforces, both deliberate:
 * - **No self-applying suggestions.** `AISuggestionCard` requires an explicit
 *   human accept or reject. There is no auto-accept threshold.
 * - **Confidence is banded, not numeric.** See `AIConfidenceMeter` — a raw
 *   percentage implies calibration the model does not have.
 */

export { AIStreamingText } from "./AIStreamingText";
export type { AIStreamingTextProps } from "./AIStreamingText";

export { AIThread } from "./AIThread";
export type { AIThreadProps } from "./AIThread";

export { AIPromptInput } from "./AIPromptInput";
export type { AIPromptInputProps } from "./AIPromptInput";

export { AISuggestionCard } from "./AISuggestionCard";
export type { AISuggestionCardProps } from "./AISuggestionCard";

export { AIConfidenceMeter, bandForScore } from "./AIConfidenceMeter";
export type { AIConfidenceMeterProps } from "./AIConfidenceMeter";

export { AICitationList, AICitationRef } from "./AICitationList";
export type { AICitationListProps } from "./AICitationList";

export { AIDisclaimer } from "./AIDisclaimer";
export type { AIDisclaimerProps } from "./AIDisclaimer";

export { AIErrorState } from "./AIErrorState";
export type { AIErrorStateProps } from "./AIErrorState";

export type {
  AIRole,
  AIMessage,
  AIMessageStatus,
  AICitation,
  AIConfidenceBand,
  AISuggestionStatus,
  AIErrorVariant,
  AIDisclaimerVariant,
} from "./types";
