"use client";

import {
  type FC,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowDownIcon,
  Bot,
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  PaperclipIcon,
  PencilIcon,
  RefreshCwIcon,
  XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { MarkdownText } from "@/components/chat-ui/markdown-text";
import { ReasoningBlock } from "@/components/chat-ui/reasoning-block";
import { ToolCall } from "@/components/chat-ui/tool-call";
import { Composer } from "@/components/chat-ui/composer";
import { useChatCtx } from "@/lib/chat-context";
import { cn } from "@/lib/utils";
import type { UIMessage } from "ai";

function mapToolState(state: string): "running" | "complete" | "incomplete" | "requires-action" {
  // "input-available" / "partial-call" / "call" = tool is executing (no output yet)
  if (state === "input-available" || state === "input-streaming" || state === "running" || state === "partial-call" || state === "call") return "running";
  // "output-available" / "result" = tool finished
  if (state === "output-available" || state === "result" || state === "complete") return "complete";
  if (state === "approval-requested" || state === "requires-action") return "requires-action";
  return "complete";
}

// ---------------------------------------------------------------------------
// Auto-scroll hook — LobeHub uses 240px visibility threshold
// ---------------------------------------------------------------------------

function useAutoScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const userScrolledRef = useRef(false);
  const prevScrollTop = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const scrollingUp = scrollTop < prevScrollTop.current;
      prevScrollTop.current = scrollTop;

      const atBottom = scrollHeight - scrollTop - clientHeight < 50;
      setIsAtBottom(atBottom);

      if (scrollingUp && !atBottom) {
        userScrolledRef.current = true;
      }
      if (atBottom) {
        userScrolledRef.current = false;
      }
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || userScrolledRef.current) return;

    const observer = new MutationObserver(() => {
      if (!userScrolledRef.current) {
        el.scrollTop = el.scrollHeight;
      }
    });

    observer.observe(el, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    userScrolledRef.current = false;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, []);

  return { scrollRef, isAtBottom, scrollToBottom };
}

// ---------------------------------------------------------------------------
// Thread header — LobeHub style top bar with agent name
// ---------------------------------------------------------------------------

const ThreadHeader: FC = () => {
  const { sessionTitle } = useChatCtx();

  if (!sessionTitle) return null;

  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
          <Bot className="size-4 text-muted-foreground" />
        </div>
        <span className="min-w-0 truncate text-sm font-medium text-foreground">
          {sessionTitle}
        </span>
      </div>
      <div className="flex items-center gap-1 text-muted-foreground">
        <ExportButton />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Thread root
// ---------------------------------------------------------------------------

export const Thread: FC = () => {
  const { messages, status, employeeName } = useChatCtx();
  const { scrollRef, isAtBottom, scrollToBottom } = useAutoScroll();
  const isEmpty = messages.length === 0;
  const lastMessage = messages.at(-1);
  const isAwaitingAssistant =
    (status === "submitted" || status === "streaming") &&
    lastMessage?.role === "user";

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <ThreadHeader />

      {/* Scrollable message area */}
      <div
        ref={scrollRef}
        className="relative flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto scroll-smooth px-3"
      >
        {isEmpty && <ThreadWelcome employeeName={employeeName} />}

        <div className="mx-auto w-full max-w-[52rem]">
          {messages.map((msg, i) => (
            <Message
              key={msg.id}
              message={msg}
              index={i}
              isLast={i === messages.length - 1}
            />
          ))}
          {isAwaitingAssistant && <PendingAssistantMessage />}
        </div>
      </div>

      {/* Fixed composer at bottom */}
      <div className="relative mx-auto flex w-full max-w-[52rem] flex-col gap-3 px-3 pt-3 pb-6 md:pb-8">
        <div className="absolute -top-10 right-3 flex items-center gap-2">
          <ScrollToBottomButton
            visible={!isAtBottom}
            onClick={scrollToBottom}
          />
        </div>
        <Composer />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Message dispatcher
// ---------------------------------------------------------------------------

const Message: FC<{
  message: UIMessage;
  index: number;
  isLast: boolean;
}> = ({ message, index, isLast }) => {
  const { status } = useChatCtx();
  const isRunning =
    isLast && (status === "submitted" || status === "streaming");

  if (message.role === "user") {
    return <UserMessage message={message} index={index} isLast={isLast} />;
  }
  if (message.role === "assistant") {
    return (
      <AssistantMessage
        message={message}
        isLast={isLast}
        isRunning={isRunning}
      />
    );
  }
  return null;
};

const PendingAssistantMessage: FC = () => {
  return (
    <div
      className="group/message relative mx-auto w-full max-w-[52rem] pt-6 pb-3 px-0"
      data-role="assistant"
    >
      <div className="break-words text-foreground leading-[1.8]">
        <ThinkingIndicator className="bg-background" />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Assistant message
// ---------------------------------------------------------------------------

const AssistantMessage: FC<{
  message: UIMessage;
  isLast: boolean;
  isRunning: boolean;
}> = ({ message, isLast, isRunning }) => {
  const { error } = useChatCtx();

  return (
    <div
      className="group/message relative mx-auto w-full max-w-[52rem] pt-6 pb-3 px-0"
      data-role="assistant"
    >
      <div className="break-words text-foreground leading-[1.8]">
        {message.parts.map((part, i) => {
          if (part.type === "text") {
            return (
              <MarkdownText
                key={i}
                text={part.text}
                isStreaming={isRunning && isLast && i === message.parts.length - 1}
              />
            );
          }
          if (part.type === "reasoning") {
            return (
              <ReasoningBlock
                key={i}
                text={part.text}
                status={part.state ? { type: part.state === "streaming" ? "running" : "complete" } : undefined}
              />
            );
          }
          // Handle tool parts — both typed (tool-${name}) and dynamic (dynamic-tool)
          // Also handle legacy "tool-call" format from buildInitialMessages
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const anyPart = part as any;
          if (part.type.startsWith("tool-") || part.type === "dynamic-tool" || anyPart.toolName) {
            const toolName: string = anyPart.toolName ?? part.type.replace(/^tool-/, "");
            const input = anyPart.input ?? anyPart.args ?? {};
            const output = anyPart.output ?? anyPart.result;
            const state = anyPart.state ?? anyPart.status?.type;

            if (toolName === "__file_output__") {
              return <FileDownloadCard key={i} input={input} />;
            }
            return (
              <ToolCall
                key={i}
                toolName={toolName}
                argsText={
                  typeof input === "string"
                    ? input
                    : JSON.stringify(input, null, 2)
                }
                result={output}
                status={state ? { type: mapToolState(state) } : undefined}
              />
            );
          }
          return null;
        })}

        {isRunning && (
          <ThinkingIndicator className="sticky bottom-0 z-10 bg-background/95 backdrop-blur-sm" />
        )}

        {isLast && error && (
          <div className="mt-2 rounded-md border border-destructive bg-destructive/10 p-3 text-destructive text-sm">
            {error.message || "An error occurred"}
          </div>
        )}
      </div>

      {/* Action bar — fades in on hover */}
      <div
        className={cn(
          "mt-1.5 ml-0.5 flex min-h-6 items-center gap-1 text-muted-foreground",
          "pointer-events-none opacity-0 transition-opacity duration-200 ease-out",
          "group-hover/message:pointer-events-auto group-hover/message:opacity-100",
          isLast && "pointer-events-auto opacity-100",
        )}
      >
        <AssistantActionBar messageId={message.id} message={message} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// User message
// ---------------------------------------------------------------------------

const UserMessage: FC<{
  message: UIMessage;
  index: number;
  isLast: boolean;
}> = ({ message, index, isLast }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div
      className="group/message relative mx-auto w-full max-w-[52rem] pt-6 pb-3 pl-9 pr-3"
      data-role="user"
    >
      <div className="flex flex-col items-end gap-1.5">
        {isEditing ? (
          <EditComposer
            message={message}
            index={index}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <>
            <div className="break-words rounded-lg bg-muted px-4 py-3 text-foreground leading-[1.8] empty:hidden">
              {message.parts.map((part, i) => {
                if (part.type === "text") {
                  return <MarkdownText key={i} text={part.text} />;
                }
                return null;
              })}
            </div>
            {/* Attachment chips — file parts in user messages */}
            {message.parts
              .filter((p) => p.type === "file")
              .map((att, i) => (
                <UserAttachmentChip key={i} attachment={att} />
              ))}
            {/* Action bar */}
            <div
              className={cn(
                "flex min-h-7 justify-end gap-1 text-muted-foreground",
                "pointer-events-none opacity-0 transition-opacity duration-200 ease-out",
                "group-hover/message:pointer-events-auto group-hover/message:opacity-100",
                isLast && "pointer-events-auto opacity-100",
              )}
            >
              <TooltipIconButton tooltip="Edit" onClick={() => setIsEditing(true)}>
                <PencilIcon />
              </TooltipIconButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Edit composer (inline)
// ---------------------------------------------------------------------------

const EditComposer: FC<{
  message: UIMessage;
  index: number;
  onCancel: () => void;
}> = ({ message, index, onCancel }) => {
  const { setMessages, sendMessage } = useChatCtx();
  const textPart = message.parts.find((p) => p.type === "text");
  const [value, setValue] = useState(
    textPart?.type === "text" ? textPart.text : "",
  );

  const handleSave = useCallback(async () => {
    const text = value.trim();
    if (!text) return;
    setMessages((prev) => prev.slice(0, index));
    onCancel();
    await sendMessage({ text });
  }, [value, index, setMessages, sendMessage, onCancel]);

  return (
    <div className="flex w-full flex-col gap-2 rounded-lg border bg-background p-3">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full resize-none bg-transparent text-sm outline-none [field-sizing:content]"
        autoFocus
      />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Assistant action bar — copy + retry
// ---------------------------------------------------------------------------

const AssistantActionBar: FC<{ messageId: string; message: UIMessage }> = ({
  message,
}) => {
  const { regenerate } = useChatCtx();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const text = message.parts
      .filter((p) => p.type === "text")
      .map((p) => (p.type === "text" ? p.text : ""))
      .join("\n");
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    });
  }, [message.parts]);

  return (
    <>
      <TooltipIconButton tooltip="Copy" onClick={handleCopy}>
        {isCopied ? <CheckIcon /> : <CopyIcon />}
      </TooltipIconButton>
      <TooltipIconButton tooltip="Retry" onClick={() => regenerate()}>
        <RefreshCwIcon />
      </TooltipIconButton>
    </>
  );
};

// ---------------------------------------------------------------------------
// File download card (with inline image preview + lightbox)
// ---------------------------------------------------------------------------

function isImageFile(input: Record<string, unknown>): boolean {
  const ct = (input.content_type as string) ?? "";
  const fn = (input.filename as string) ?? "";
  return (
    ct.startsWith("image/") ||
    /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(fn)
  );
}

const FileDownloadCard: FC<{ input: Record<string, unknown> }> = ({
  input,
}) => {
  const fileId = input.file_id as string;
  const filename = (input.filename as string | null) ?? "Download file";
  const isImg = isImageFile(input);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <div className="my-1 inline-flex flex-col items-start gap-1 rounded-lg border bg-muted px-3 py-2">
        {isImg && (
          <img
            src={`/api/files/${fileId}/content`}
            alt={filename}
            className="mb-1 max-h-48 max-w-xs cursor-zoom-in rounded-md object-contain"
            onClick={() => setLightboxOpen(true)}
          />
        )}
        <a
          href={`/api/files/${fileId}/content`}
          download={filename}
          className="inline-flex items-center gap-2 text-sm text-foreground transition-colors hover:text-primary"
        >
          <DownloadIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="max-w-48 truncate">{filename}</span>
        </a>
      </div>
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setLightboxOpen(false)}
        >
          <img
            src={`/api/files/${fileId}/content`}
            alt={filename}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
          >
            <XIcon className="size-5" />
          </button>
        </div>
      )}
    </>
  );
};

// ---------------------------------------------------------------------------
// User attachment chip
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const UserAttachmentChip: FC<{ attachment: any }> = ({ attachment }) => {
  const filename: string = attachment?.name ?? "Attachment";
  const contentType: string = attachment?.contentType ?? "";
  const isImage =
    attachment?.type === "image" || contentType.startsWith("image/");
  const ext = filename.includes(".")
    ? filename.split(".").pop()!.toUpperCase()
    : "";
  const subtitle = isImage
    ? "Image"
    : ext || contentType.split("/")[1]?.toUpperCase() || "File";

  return (
    <div className="flex max-w-[18rem] items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        {isImage ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z" /><polyline points="14 2 14 8 20 8" />
          </svg>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-foreground">{filename}</div>
        <div className="truncate text-xs text-muted-foreground">{subtitle}</div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Thinking indicator — LobeHub loading dots (1.2s cycle, 0.15s stagger)
// ---------------------------------------------------------------------------

const ThinkingIndicator: FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("flex items-center gap-2 py-1 text-muted-foreground text-sm", className)}>
      <span className="flex items-center gap-1">
        <span className="size-1.5 rounded-full bg-primary animate-loading-dot" />
        <span
          className="size-1.5 rounded-full bg-primary animate-loading-dot"
          style={{ animationDelay: "0.15s" }}
        />
        <span
          className="size-1.5 rounded-full bg-primary animate-loading-dot"
          style={{ animationDelay: "0.3s" }}
        />
      </span>
      <span>thinking...</span>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Welcome screen
// ---------------------------------------------------------------------------

const ThreadWelcome: FC<{ employeeName?: string }> = ({ employeeName }) => {
  return (
    <div className="mx-auto my-auto flex w-full max-w-[52rem] min-h-[50vh] grow flex-col">
      <div className="flex w-full grow flex-col items-center justify-center">
        <div className="flex size-full flex-col justify-center px-4">
          {employeeName && (
            <div
              className="mb-4 flex size-10 items-center justify-center rounded-lg bg-muted animate-stagger-in"
              style={{ "--stagger-index": 0 } as React.CSSProperties}
            >
              <Bot className="size-5 text-muted-foreground" />
            </div>
          )}
          <h1
            className="font-light tracking-tight text-2xl animate-stagger-in"
            style={{ "--stagger-index": 1 } as React.CSSProperties}
          >
            {employeeName ?? "Hello there!"}
          </h1>
          <p
            className="text-muted-foreground text-xl animate-stagger-in"
            style={{ "--stagger-index": 2 } as React.CSSProperties}
          >
            How can I help you today?
          </p>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Scroll-to-bottom — LobeHub: 16px from edge, glass effect, translateY anim
// ---------------------------------------------------------------------------

const ScrollToBottomButton: FC<{
  visible: boolean;
  onClick: () => void;
}> = ({ visible, onClick }) => {
  return (
    <TooltipIconButton
      tooltip="Scroll to bottom"
      variant="outline"
      onClick={onClick}
      className={cn(
        "size-9 rounded-full border bg-background/80 backdrop-blur-sm transition-all duration-200 ease-out",
        visible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-4 opacity-0 pointer-events-none",
      )}
    >
      <ArrowDownIcon className="size-4" />
    </TooltipIconButton>
  );
};

// ---------------------------------------------------------------------------
// Export conversation
// ---------------------------------------------------------------------------

const ExportButton: FC = () => {
  const { messages, employeeName } = useChatCtx();

  const handleExport = useCallback(() => {
    if (!messages.length) return;

    const lines = [
      `# Chat Export`,
      `*${employeeName ?? "AI"} · ${new Date().toLocaleDateString()}*`,
      "",
      "---",
    ];

    for (const msg of messages) {
      if (msg.role === "system") continue;
      const label =
        msg.role === "user" ? "You" : (employeeName ?? "Assistant");
      lines.push("", `**${label}**`, "");
      for (const part of msg.parts) {
        if (part.type === "text") lines.push(part.text);
        if (part.type === "dynamic-tool") lines.push(`*Used tool: ${part.toolName}*`);
        if (part.type.startsWith("tool-") && part.type !== "dynamic-tool") {
          lines.push(`*Used tool: ${part.type.replace(/^tool-/, "")}*`);
        }
      }
    }

    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement("a"), {
      href: url,
      download: `chat-export-${Date.now()}.md`,
    }).click();
    URL.revokeObjectURL(url);
  }, [messages, employeeName]);

  return (
    <button
      type="button"
      onClick={handleExport}
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 transition-colors duration-200 hover:text-muted-foreground"
    >
      <DownloadIcon className="size-3" />
      <span>Export</span>
    </button>
  );
};
