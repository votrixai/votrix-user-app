"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { FileUIPart } from "ai";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { PanelRightCloseIcon, PanelRightOpenIcon } from "lucide-react";
import { Thread } from "@/components/chat-ui/thread";
import { ArtifactPanel } from "@/components/artifact-panel";
import { SessionFilesPanel } from "@/components/session-files-panel";
import { ArtifactProvider, useArtifact } from "@/lib/artifact-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AttachmentContext, type PendingAttachment } from "@/lib/attachment-context";
import { ChatContext, type ChatContextValue } from "@/lib/chat-context";
import { useShellData } from "@/lib/shell-data-context";
import { buildInitialMessages, isAwaitingAssistantResponse } from "@/lib/session-messages";
import type { SessionDetailResponse, SessionFileResponse } from "@votrix/shared";
import type { UIMessage } from "ai";

export default function Chat({
  initialMessages,
  sessionId,
  sessionFiles = [],
  awaitingResponse = false,
  agentBlueprintId,
  sessionTitle: sessionTitleProp,
  // legacy prop kept for mock mode
  employeeName: employeeNameProp,
}: {
  initialMessages: UIMessage[];
  sessionId: string;
  sessionFiles?: SessionFileResponse[];
  awaitingResponse?: boolean;
  agentBlueprintId?: string;
  sessionTitle?: string;
  employeeName?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { employees } = useShellData();

  const employeeName = employeeNameProp ?? (
    agentBlueprintId
      ? employees.find((e) => e.agent_blueprint_id === agentBlueprintId)?.display_name
      : undefined
  );
  const sessionTitle = sessionTitleProp ?? employeeName ?? `Chat ${sessionId.slice(0, 8)}`;

  const [isAwaitingResponse, setIsAwaitingResponse] = useState(awaitingResponse);
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [requestAttachments, setRequestAttachments] = useState<PendingAttachment[]>([]);
  const [filesOpen, setFilesOpen] = useState(false);

  // useChat stores transport in a ref and never re-reads it after mount.
  // Use a ref here so the closure in prepareSendMessagesRequest always sees
  // the latest attachments without needing to recreate the transport object.
  const requestAttachmentsRef = useRef<PendingAttachment[]>([]);
  useEffect(() => {
    requestAttachmentsRef.current = requestAttachments;
  }, [requestAttachments]);

  const addAttachment = useCallback((att: PendingAttachment) => {
    const next = [...requestAttachmentsRef.current, att];
    setAttachments(next);
    setRequestAttachments(next);
  }, []);

  const removeAttachment = useCallback((fileId: string) => {
    const next = requestAttachmentsRef.current.filter((a) => a.file_id !== fileId);
    setAttachments(next);
    setRequestAttachments(next);
  }, []);

  const clearAttachments = useCallback(() => {
    setAttachments([]);
    setRequestAttachments([]);
  }, []);

  const clearAttachmentsUI = useCallback(() => {
    setAttachments([]);
  }, []);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { session_id: sessionId },
        prepareSendMessagesRequest: async (options) => ({
          body: {
            ...options.body,
            id: options.id,
            messages: options.messages,
            trigger: options.trigger,
            messageId: options.messageId,
            metadata: options.requestMetadata,
            attachments: requestAttachmentsRef.current.map(({ file_id, content_type, filename }) => ({
              file_id,
              content_type,
              filename,
            })),
          },
        }),
      }),
    [sessionId],
  );

  const onFinish = useCallback(() => {
    clearAttachments();
  }, [clearAttachments]);

  const chat = useChat({
    transport,
    messages: initialMessages,
    id: sessionId,
    onFinish,
  });

  // Auto-send initial message from ?q= (home page). sessionStorage dedupes React Strict Mode
  // double-mount and avoids duplicate /api/chat runs for the same session + prompt.
  useEffect(() => {
    const q = searchParams.get("q");
    if (!q?.trim()) return;
    const dedupeKey = `votrix:auto-q:${sessionId}:${q}`;
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(dedupeKey)) {
      const url = new URL(window.location.href);
      url.searchParams.delete("q");
      window.history.replaceState(null, "", url.toString());
      return;
    }
    if (typeof sessionStorage !== "undefined") sessionStorage.setItem(dedupeKey, "1");
    const url = new URL(window.location.href);
    url.searchParams.delete("q");
    window.history.replaceState(null, "", url.toString());
    chat.sendMessage({ text: q });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Poll for awaiting response (when navigating to a session that's still generating)
  useEffect(() => {
    if (!isAwaitingResponse) return;

    const intervalId = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;

      void fetch(`/api/sessions/${sessionId}`, { cache: "no-store" })
        .then(async (res) => {
          if (!res.ok) return null;
          return (await res.json()) as SessionDetailResponse;
        })
        .then((detail) => {
          if (!detail) return;

          chat.setMessages(buildInitialMessages(detail.id, detail.events));

          const stillAwaiting = isAwaitingAssistantResponse(detail.events);
          setIsAwaitingResponse(stillAwaiting);

          if (!stillAwaiting) {
            router.refresh();
          }
        })
        .catch(() => {});
    }, 2500);

    return () => window.clearInterval(intervalId);
  }, [isAwaitingResponse, router, sessionId, chat]);

  const attachmentContextValue = useMemo(
    () => ({ attachments, addAttachment, removeAttachment, clearAttachments, clearAttachmentsUI }),
    [attachments, addAttachment, removeAttachment, clearAttachments, clearAttachmentsUI],
  );

  // Override sendMessage to inject FileUIPart entries when attachments exist.
  // This makes files visible in message history (thread.tsx UserAttachmentChip).
  // The actual file_ids are still sent to the backend via requestAttachments in the transport.
  const sendMessage = useCallback(
    async (opts: { text: string }) => {
      const pending = requestAttachmentsRef.current;
      if (pending.length === 0) {
        return chat.sendMessage(opts);
      }
      const files: FileUIPart[] = pending.map((att) => ({
        type: "file" as const,
        mediaType: att.content_type === "image" ? "image/jpeg" : "application/octet-stream",
        filename: att.filename,
        url: `/api/files/${att.file_id}/content`,
      }));
      return chat.sendMessage({ text: opts.text, files });
    },
    [chat],
  );

  const chatContextValue = useMemo<ChatContextValue>(
    () => ({
      ...chat,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sendMessage: sendMessage as any,
      employeeName,
      sessionTitle,
    }),
    [chat, sendMessage, employeeName, sessionTitle],
  );

  return (
    <AttachmentContext.Provider value={attachmentContextValue}>
      <ArtifactProvider>
        <ChatContext.Provider value={chatContextValue}>
          <TooltipProvider>
            <ChatLayout
              sessionFiles={sessionFiles}
              filesOpen={filesOpen}
              setFilesOpen={setFilesOpen}
            />
          </TooltipProvider>
        </ChatContext.Provider>
      </ArtifactProvider>
    </AttachmentContext.Provider>
  );
}

function ChatLayout({
  sessionFiles,
  filesOpen,
  setFilesOpen,
}: {
  sessionFiles: SessionFileResponse[];
  filesOpen: boolean;
  setFilesOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { isOpen: artifactOpen } = useArtifact();

  return (
    <main className="flex h-full min-h-0 bg-background">
      <div className="relative flex min-w-0 flex-1 flex-col">
        {sessionFiles.length > 0 && (
          <div className="absolute top-4 right-4 z-20">
            <button
              type="button"
              onClick={() => setFilesOpen((open) => !open)}
              className="inline-flex items-center gap-2 rounded-md border bg-background/95 px-3 py-2 text-sm text-foreground shadow-ambient backdrop-blur transition-colors hover:bg-accent"
              aria-expanded={filesOpen}
              aria-controls="session-files-panel"
            >
              {filesOpen ? (
                <PanelRightCloseIcon className="size-4" />
              ) : (
                <PanelRightOpenIcon className="size-4" />
              )}
              <span>View Files</span>
              <span className="rounded-sm bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                {sessionFiles.length}
              </span>
            </button>
          </div>
        )}
        <Thread />
      </div>

      {artifactOpen && <ArtifactPanel />}


      {sessionFiles.length > 0 && filesOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={() => setFilesOpen(false)}
            aria-hidden="true"
          />
          <aside
            id="session-files-panel"
            className="fixed inset-y-0 right-0 z-40 w-full max-w-sm border-l bg-background shadow-elevated md:static md:z-0 md:w-80 md:max-w-none md:shrink-0 md:shadow-none"
          >
            <SessionFilesPanel files={sessionFiles} onClose={() => setFilesOpen(false)} />
          </aside>
        </>
      )}
    </main>
  );
}
