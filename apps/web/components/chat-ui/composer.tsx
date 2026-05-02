"use client";

import {
  type FC,
  forwardRef,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useComposedRefs } from "@radix-ui/react-compose-refs";
import {
  ArrowUpIcon,
  Loader2Icon,
  PaperclipIcon,
  SquareIcon,
  XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { useChatCtx } from "@/lib/chat-context";
import { useAttachments, type PendingAttachment } from "@/lib/attachment-context";
import { useToast } from "@/lib/toast-context";

const IMESafeTextarea = forwardRef<
  HTMLTextAreaElement,
  React.ComponentPropsWithoutRef<"textarea"> & { value?: string }
>(({ value, defaultValue, onCompositionStart, onCompositionEnd, ...rest }, fwdRef) => {
  const localRef = useRef<HTMLTextAreaElement>(null);
  const ref = useComposedRefs(fwdRef, localRef);
  const composingRef = useRef(false);

  useLayoutEffect(() => {
    const el = localRef.current;
    if (!el || composingRef.current) return;
    const next = String(value ?? "");
    if (el.value !== next) {
      el.value = next;
    }
  });

  return (
    <textarea
      {...rest}
      ref={ref}
      defaultValue={String(value ?? defaultValue ?? "")}
      onCompositionStart={(e) => {
        composingRef.current = true;
        (onCompositionStart as React.CompositionEventHandler<HTMLTextAreaElement>)?.(e);
      }}
      onCompositionEnd={(e) => {
        composingRef.current = false;
        (onCompositionEnd as React.CompositionEventHandler<HTMLTextAreaElement>)?.(e);
      }}
    />
  );
});
IMESafeTextarea.displayName = "IMESafeTextarea";

const AttachmentChip: FC<{ att: PendingAttachment; onRemove: () => void }> = ({
  att,
  onRemove,
}) => (
  <div className="flex items-center gap-1 rounded-full border bg-muted px-2.5 py-0.5 text-xs">
    <PaperclipIcon className="size-3 shrink-0 text-muted-foreground" />
    <span className="max-w-32 truncate">{att.filename}</span>
    <button
      type="button"
      onClick={onRemove}
      className="ml-0.5 text-muted-foreground hover:text-foreground"
      aria-label={`Remove ${att.filename}`}
    >
      <XIcon className="size-3" />
    </button>
  </div>
);

export const Composer: FC = () => {
  const { sendMessage, stop, status } = useChatCtx();
  const { attachments, addAttachment, removeAttachment, clearAttachmentsUI } =
    useAttachments();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const composingRef = useRef(false);
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);

  const isRunning = status === "submitted" || status === "streaming";

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const text = input.trim();
      if (!text && !attachments.length) return;
      clearAttachmentsUI();
      setInput("");
      await sendMessage({ text });
    },
    [input, attachments.length, clearAttachmentsUI, sendMessage],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !composingRef.current) {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    },
    [],
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/files", { method: "POST", body: form });
      if (!res.ok) {
        toast("File upload failed. Please try again.");
        return;
      }
      const data = await res.json();
      addAttachment({
        file_id: data.file_id,
        filename: data.filename,
        content_type: file.type.startsWith("image/") ? "image" : "document",
      });
    } catch {
      toast("File upload failed. Check your connection.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="relative flex w-full flex-col">
      <div className="flex w-full flex-col rounded-lg border border-border bg-background shadow-[0_3px_10px_-4px_rgba(0,0,0,0.08),0_4px_6px_-2px_rgba(0,0,0,0.05)] transition-all duration-200 ease-out focus-within:border-primary focus-within:shadow-[0_0_0_2px_rgba(0,0,0,0.08)] dark:shadow-[0_3px_10px_-4px_rgba(0,0,0,0.2),0_4px_6px_-2px_rgba(0,0,0,0.1)]">
        {/* Textarea zone */}
        <div className="px-3 pt-2 pb-2">
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pb-2">
              {attachments.map((att) => (
                <AttachmentChip
                  key={att.file_id}
                  att={att}
                  onRemove={() => removeAttachment(att.file_id)}
                />
              ))}
            </div>
          )}
          <IMESafeTextarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => { composingRef.current = true; }}
            onCompositionEnd={() => { composingRef.current = false; }}
            autoFocus
            placeholder="Send a message..."
            aria-label="Message input"
            className="max-h-80 min-h-[36px] w-full resize-none bg-transparent py-2 px-1 text-sm outline-none placeholder:text-muted-foreground/45 [field-sizing:content]"
            rows={1}
          />
        </div>
        {/* Toolbar zone */}
        <div className="flex items-center justify-between border-t border-border/60 px-2 py-1.5">
          <div className="flex items-center">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.txt,.md,image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
            />
            <TooltipIconButton
              tooltip={uploading ? "Uploading..." : "Attach file"}
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 rounded-md text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              aria-label="Attach file"
            >
              {uploading ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <PaperclipIcon className="size-4" />
              )}
            </TooltipIconButton>
          </div>
          <div className="flex items-center gap-1">
            {isRunning ? (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="size-8 rounded-md transition-all duration-300"
                aria-label="Stop generating"
                onClick={() => stop()}
              >
                <SquareIcon className="size-3 fill-current" />
              </Button>
            ) : (
              <TooltipIconButton
                tooltip="Send message"
                side="bottom"
                type="submit"
                variant="default"
                size="icon"
                className="size-8 rounded-md transition-all duration-300 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                aria-label="Send message"
                disabled={!input.trim() && !attachments.length}
              >
                <ArrowUpIcon className="size-4" />
              </TooltipIconButton>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};
