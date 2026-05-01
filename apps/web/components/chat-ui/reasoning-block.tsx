"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Brain, Loader2 } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useElapsedTimer } from "@/lib/use-elapsed-timer";
import { cn } from "@/lib/utils";

interface ReasoningBlockProps {
  text: string;
  status?: { type: string };
}

export function ReasoningBlock({ text, status }: ReasoningBlockProps) {
  const isRunning = status?.type === "running";
  const elapsed = useElapsedTimer(isRunning);

  const [open, setOpen] = useState(isRunning);
  const userToggled = useRef(false);

  useEffect(() => {
    if (userToggled.current) return;
    if (isRunning) {
      setOpen(true);
    } else {
      const timer = setTimeout(() => setOpen(false), 800);
      return () => clearTimeout(timer);
    }
  }, [isRunning]);

  const handleOpenChange = useCallback((next: boolean) => {
    userToggled.current = true;
    setOpen(next);
  }, []);

  return (
    <Collapsible
      open={open}
      onOpenChange={handleOpenChange}
      className="my-1 w-full rounded-md border border-border"
    >
      <CollapsibleTrigger className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted/50">
        {isRunning ? (
          <Loader2 className="size-3.5 shrink-0 animate-spin text-primary" />
        ) : (
          <Brain className="size-3.5 shrink-0" />
        )}
        <span className={cn("grow text-left", isRunning && "animate-shimmer-text")}>
          {isRunning ? "Thinking..." : elapsed ? `Thought for ${elapsed}` : "Thought"}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="scroll-shadow-y max-h-[min(40vh,320px)] overflow-y-auto border-t border-border px-3 py-2">
          <p className="whitespace-pre-wrap text-sm italic text-muted-foreground leading-relaxed">
            {text}
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
