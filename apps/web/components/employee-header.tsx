"use client";

import { Clock, Info, Loader2, Plus } from "lucide-react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSessionRefresh } from "@/lib/session-refresh-context";
import { useToast } from "@/lib/toast-context";
import type { AgentEmployeeResponse } from "@votrix/shared";
import { cn } from "@/lib/utils";

export type RightPanelType = "history" | "info" | null;

// Stable color per employee initial
const BADGE_COLORS: { bg: string; text: string }[] = [
  { bg: "#E8F5EE", text: "#2D6A4F" },
  { bg: "#EBF0FA", text: "#3B5998" },
  { bg: "#F3EEFF", text: "#7C3AED" },
  { bg: "#FEF3E2", text: "#D97706" },
  { bg: "#FFF1F3", text: "#E11D48" },
  { bg: "#E6FAF8", text: "#0D9488" },
];

function getBadgeColor(name: string) {
  const idx = name.charCodeAt(0) % BADGE_COLORS.length;
  return BADGE_COLORS[idx]!;
}

export function EmployeeHeader({
  employee,
  sessionTitle,
  rightPanel,
  onSetRightPanel,
}: {
  employee: AgentEmployeeResponse;
  sessionTitle?: string | null;
  rightPanel: RightPanelType;
  onSetRightPanel: (type: RightPanelType) => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { refreshSessions } = useSessionRefresh();
  const [creating, startCreating] = useTransition();

  const initials = employee.display_name.slice(0, 2).toUpperCase();
  const { bg, text } = getBadgeColor(employee.display_name);

  const handleNewSession = () => {
    startCreating(async () => {
      try {
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agent_slug: employee.slug }),
        });
        if (!res.ok) {
          toast("Could not create session. Please try again.");
          return;
        }
        const data = await res.json();
        refreshSessions();
        router.push(`/c/${data.id}`);
      } catch {
        toast("Could not create session. Check your connection.");
      }
    });
  };

  const toggle = (type: "history" | "info") =>
    onSetRightPanel(rightPanel === type ? null : type);

  return (
    <div className="flex shrink-0 items-center border-b border-border bg-card px-5 py-2.5">
      {/* Employee identity */}
      <div className="flex w-[200px] shrink-0 items-center gap-3">
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-[13px] font-bold"
          style={{ background: bg, color: text }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-[14px] font-semibold leading-snug text-foreground">
            {employee.display_name}
          </h2>
          <p className="truncate text-[12px] leading-snug text-muted-foreground">
            {employee.slug}
          </p>
        </div>
      </div>

      {/* Session title — center */}
      <div className="flex min-w-0 flex-1 items-center justify-center px-4">
        {sessionTitle && (
          <p className="max-w-md truncate text-[13px] text-muted-foreground">
            {sessionTitle}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={handleNewSession}
          disabled={creating}
          className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-[12.5px] font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:opacity-50"
        >
          {creating ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Plus className="size-3.5" />
          )}
          New session
        </button>

        <button
          onClick={() => toggle("history")}
          className={cn(
            "flex size-8 items-center justify-center rounded-md border transition-colors",
            rightPanel === "history"
              ? "border-foreground bg-foreground text-primary-foreground"
              : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
          )}
          aria-label="Session history"
        >
          <Clock className="size-4" />
        </button>

        <button
          onClick={() => toggle("info")}
          className={cn(
            "flex size-8 items-center justify-center rounded-md border transition-colors",
            rightPanel === "info"
              ? "border-foreground bg-foreground text-primary-foreground"
              : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
          )}
          aria-label="Employee info"
        >
          <Info className="size-4" />
        </button>
      </div>
    </div>
  );
}
