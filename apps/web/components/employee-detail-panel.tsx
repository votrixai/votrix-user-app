"use client";

import { useTransition, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Bot, Loader2, Trash2 } from "lucide-react";
import { useEmployeePanel } from "@/lib/employee-panel-context";
import { useEmployeeRefresh } from "@/lib/employee-refresh-context";
import { useSessionRefresh } from "@/lib/session-refresh-context";
import { useToast } from "@/lib/toast-context";
import type { SessionResponse } from "@votrix/shared";

export function EmployeeDetailPanel({
  sessions,
}: {
  sessions: SessionResponse[];
}) {
  const router = useRouter();
  const params = useParams<{ sessionId?: string }>();
  const activeSessionId = params?.sessionId;
  const { selectedEmployee, closePanel } = useEmployeePanel();
  const { refreshEmployees } = useEmployeeRefresh();
  const { refreshSessions } = useSessionRefresh();
  const { toast } = useToast();
  const [removing, startRemoving] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRemove = () => {
    if (!selectedEmployee) return;
    const removedEmployee = selectedEmployee;
    const activeSession = activeSessionId
      ? sessions.find((s) => s.id === activeSessionId)
      : null;
    const shouldReset =
      activeSession?.agent_blueprint_id === removedEmployee.agent_blueprint_id;

    startRemoving(async () => {
      try {
        const res = await fetch(`/api/employees/${removedEmployee.id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          toast("Could not remove employee. Please try again.");
          setShowConfirm(false);
          return;
        }
        setShowConfirm(false);
        closePanel();
        await Promise.all([refreshEmployees(), refreshSessions()]);
        if (shouldReset) router.push("/");
        else router.refresh();
      } catch {
        toast("Could not remove employee. Check your connection.");
        setShowConfirm(false);
      }
    });
  };

  if (!selectedEmployee) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 animate-in fade-in bg-black/40 backdrop-blur-sm duration-200"
        onClick={closePanel}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-border bg-background shadow-elevated animate-in slide-in-from-right duration-200"
        style={{ animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <button
            onClick={closePanel}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div className="flex size-8 items-center justify-center rounded-md bg-muted">
            <Bot className="size-4 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold text-foreground">
              {selectedEmployee.display_name}
            </h2>
            {selectedEmployee.model && (
              <p className="truncate text-xs text-muted-foreground">
                {selectedEmployee.model}
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Status */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.7px] text-muted-foreground/60">
              Status
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Hired</span>
                <span className="text-foreground">
                  {new Date(selectedEmployee.created_at).toLocaleDateString(
                    undefined,
                    { day: "numeric", month: "short", year: "numeric" },
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F5EE] px-2 py-0.5 text-[11px] font-semibold text-[#2D6A4F]">
                  <span className="size-1.5 rounded-full bg-[#2D6A4F]" />
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Remove */}
          <button
            onClick={() => setShowConfirm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-destructive/20 px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/5"
          >
            <Trash2 className="size-3.5" />
            Remove from team
          </button>
        </div>

        {/* Confirm modal */}
        {showConfirm && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              className="w-full max-w-sm animate-in fade-in zoom-in-[0.96] rounded-md border border-border bg-background p-5 shadow-deep duration-[120ms]"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-base font-light">
                Remove {selectedEmployee.display_name}?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                This will remove the employee from your team.
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemove}
                  disabled={removing}
                  className="rounded-sm bg-destructive px-3 py-1.5 text-sm text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                >
                  {removing ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Remove"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
