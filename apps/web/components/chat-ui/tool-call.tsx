"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  LoaderIcon,
  XCircleIcon,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useElapsedTimer } from "@/lib/use-elapsed-timer";
import { cn } from "@/lib/utils";

type ToolStatus = "running" | "complete" | "incomplete" | "requires-action";

export interface ToolCallProps {
  toolName: string;
  argsText?: string;
  result?: unknown;
  status?: { type: ToolStatus; reason?: string };
}

const statusIconMap: Record<ToolStatus, React.ElementType> = {
  running: LoaderIcon,
  complete: CheckIcon,
  incomplete: XCircleIcon,
  "requires-action": AlertCircleIcon,
};

const statusColorMap: Record<ToolStatus, string> = {
  running: "text-primary",
  complete: "text-emerald-600",
  incomplete: "text-destructive",
  "requires-action": "text-amber-600",
};

export const ToolCall = memo(function ToolCall({
  toolName,
  argsText,
  result,
  status,
}: ToolCallProps) {
  const statusType = (status?.type ?? "complete") as ToolStatus;
  const isRunning = statusType === "running";
  const isCancelled = status?.type === "incomplete" && status.reason === "cancelled";

  const elapsed = useElapsedTimer(isRunning);

  const [open, setOpen] = useState(isRunning);
  const userToggled = useRef(false);

  useEffect(() => {
    if (userToggled.current) return;
    if (isRunning) {
      setOpen(true);
    } else {
      const timer = setTimeout(() => setOpen(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isRunning]);

  const handleOpenChange = useCallback((next: boolean) => {
    userToggled.current = true;
    setOpen(next);
  }, []);

  const Icon = statusIconMap[statusType];

  return (
    <Collapsible
      open={open}
      onOpenChange={handleOpenChange}
      className={cn(
        "w-full rounded-lg border py-3",
        isCancelled && "border-muted-foreground/30 bg-muted/30",
      )}
    >
      <CollapsibleTrigger className="group/trigger flex w-full items-center gap-2 px-4 text-sm transition-colors">
        <Icon
          className={cn(
            "size-4 shrink-0",
            isRunning && "animate-spin",
            isCancelled ? "text-muted-foreground" : statusColorMap[statusType],
          )}
        />
        <span
          className={cn(
            "relative inline-block grow text-left leading-none",
            isCancelled && "text-muted-foreground line-through",
          )}
        >
          {isRunning ? (
            <span className="animate-shimmer-text">
              Running <b>{toolName}</b>...
            </span>
          ) : isCancelled ? (
            <span>
              Cancelled <b>{toolName}</b>
            </span>
          ) : (
            <span>
              Used <b>{toolName}</b>
              {elapsed && (
                <span className="ml-1.5 text-xs text-muted-foreground">
                  ({elapsed})
                </span>
              )}
            </span>
          )}
        </span>
        <ChevronDownIcon
          className={cn(
            "size-4 shrink-0 transition-transform duration-200 ease-out",
            "group-data-[state=closed]/trigger:-rotate-90",
            "group-data-[state=open]/trigger:rotate-0",
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="relative overflow-hidden text-sm outline-none">
        <div className="mt-3 flex flex-col gap-2 border-t pt-2">
          {argsText && (
            <div className={cn("px-4", isCancelled && "opacity-60")}>
              <pre className="whitespace-pre-wrap">{argsText}</pre>
            </div>
          )}
          {!isCancelled && result !== undefined && (
            <div className="border-t border-dashed px-4 pt-2">
              <p className="font-semibold">Result:</p>
              <pre className="whitespace-pre-wrap">
                {typeof result === "string" ? result : JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
});
