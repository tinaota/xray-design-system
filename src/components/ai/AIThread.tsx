"use client";

import { cn } from "@/lib/utils";
import { ArrowDown, Sparkles, User } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AICitationList } from "./AICitationList";
import type { AIMessage } from "./types";

export interface AIThreadProps {
  messages: AIMessage[];
  /** Rendered when there are no messages yet. */
  emptyState?: ReactNode;
  /** Take full control of message rendering. */
  renderMessage?: (message: AIMessage) => ReactNode;
  /** e.g. "24rem" or "60vh". Without it the thread grows and the page scrolls. */
  maxHeight?: string;
  showTimestamps?: boolean;
  /** Names the log for screen reader navigation. */
  label?: string;
  className?: string;
}

/** How close to the bottom still counts as "following along", in px. */
const PIN_THRESHOLD = 48;

const roleStyles: Record<AIMessage["role"], string> = {
  assistant: "bg-ai-surface border-ai-border text-on-surface",
  user: "bg-ai-user-surface border-outline-variant/40 text-on-surface",
  // System notes are metadata, not conversation — deliberately quiet.
  system: "bg-transparent border-transparent text-on-surface-variant italic",
};

function RoleAvatar({ role }: { role: AIMessage["role"] }) {
  if (role === "system") return null;
  const isAssistant = role === "assistant";
  return (
    <div
      className={cn(
        "shrink-0 h-7 w-7 rounded-full flex items-center justify-center",
        isAssistant ? "bg-ai-accent text-white" : "bg-midnight-navy text-white"
      )}
      aria-hidden="true"
    >
      {isAssistant ? <Sparkles className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
    </div>
  );
}

/**
 * Scrolling message log.
 *
 * Two behaviours worth knowing:
 *
 * 1. **Autoscroll only when already at the bottom.** If the reader has scrolled
 *    up to check an earlier answer, incoming tokens must not drag them back down
 *    — that is the single most common complaint about streaming chat UIs. A
 *    "jump to latest" affordance appears instead.
 *
 * 2. **Announcements are deferred, not suppressed.** The container is a
 *    `role="log"`, and streaming messages are marked `aria-busy`. Assistive tech
 *    holds the announcement until the message settles, so a screen reader hears
 *    one complete response instead of stuttering on every token. When composing
 *    `<AIStreamingText>` inside a thread, pass `completionAnnouncement={null}` so
 *    the log is the only thing announcing.
 */
export function AIThread({
  messages,
  emptyState,
  renderMessage,
  maxHeight,
  showTimestamps = false,
  label = "Conversation",
  className,
}: AIThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(true);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setPinned(distanceFromBottom <= PIN_THRESHOLD);
  }, []);

  const scrollToBottom = useCallback((smooth = false) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }, []);

  useEffect(() => {
    // `auto` rather than `smooth`: during streaming, smooth scrolling queues
    // animations faster than they complete and the view visibly lags the text.
    if (pinned) scrollToBottom(false);
  }, [messages, pinned, scrollToBottom]);

  const hasMessages = messages.length > 0;

  return (
    <div className={cn("relative flex flex-col min-h-0", className)}>
      <div
        ref={scrollRef}
        onScroll={onScroll}
        role="log"
        aria-label={label}
        aria-relevant="additions text"
        tabIndex={0}
        className={cn(
          "flex-1 overflow-y-auto flex flex-col gap-4 p-4",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-medical-blue rounded-xl"
        )}
        style={maxHeight ? { maxHeight } : undefined}
      >
        {!hasMessages && emptyState && (
          <div className="flex-1 flex items-center justify-center text-sm text-on-surface-variant">
            {emptyState}
          </div>
        )}

        {messages.map((message) => {
          if (renderMessage) return <div key={message.id}>{renderMessage(message)}</div>;

          const isUser = message.role === "user";
          const isSystem = message.role === "system";

          return (
            <div
              key={message.id}
              // Defers this message's announcement until it stops changing.
              aria-busy={message.status === "streaming" || undefined}
              className={cn("flex gap-3", isUser && "flex-row-reverse", isSystem && "justify-center")}
            >
              <RoleAvatar role={message.role} />

              <div className={cn("min-w-0 max-w-[85%]", isSystem && "max-w-full text-center")}>
                <div
                  className={cn(
                    "rounded-xl border px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words",
                    roleStyles[message.role]
                  )}
                >
                  {message.content}
                </div>

                {message.citations && message.citations.length > 0 && (
                  <div className="mt-2">
                    <AICitationList citations={message.citations} compact />
                  </div>
                )}

                {showTimestamps && message.timestamp && (
                  <p
                    className={cn(
                      "mt-1 text-[11px] text-on-surface-variant",
                      isUser && "text-right"
                    )}
                  >
                    {message.timestamp}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/*
        Only offered when the reader has actually scrolled away. Rendering it
        permanently trains people to ignore it.
      */}
      {!pinned && hasMessages && (
        <button
          type="button"
          onClick={() => {
            scrollToBottom(true);
            setPinned(true);
          }}
          className={cn(
            "absolute bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5",
            "h-9 px-3 rounded-full text-xs font-semibold shadow-card-md",
            "bg-midnight-navy text-white hover:bg-midnight-navy/90",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-medical-blue focus-visible:ring-offset-2"
          )}
        >
          <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
          Jump to latest
        </button>
      )}
    </div>
  );
}
