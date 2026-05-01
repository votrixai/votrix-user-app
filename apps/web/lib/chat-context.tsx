"use client";

import { createContext, useContext } from "react";
import type { UIMessage } from "ai";
import type { UseChatHelpers } from "@ai-sdk/react";

export interface ChatContextValue extends UseChatHelpers<UIMessage> {
  employeeName?: string;
  sessionTitle?: string;
}

export const ChatContext = createContext<ChatContextValue | null>(null);

export function useChatCtx(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatCtx must be used within ChatContext.Provider");
  return ctx;
}

export function useIsRunning(): boolean {
  const { status } = useChatCtx();
  return status === "submitted" || status === "streaming";
}

export function useIsEmpty(): boolean {
  const { messages } = useChatCtx();
  return messages.length === 0;
}
