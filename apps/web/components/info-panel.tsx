"use client";

import { useTransition, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Trash2, X } from "lucide-react";
import { useEmployeeRefresh } from "@/lib/employee-refresh-context";
import { useShellData } from "@/lib/shell-data-context";
import { useToast } from "@/lib/toast-context";
import type { AgentEmployeeResponse } from "@votrix/shared";

export function InfoPanel({
  employee,
  onClose,
}: {
  employee: AgentEmployeeResponse;
  onClose: () => void;
}) {
  const router = useRouter();
  const params = useParams<{ sessionId?: string }>();
  const activeSessionId = params?.sessionId;
  const { toast } = useToast();
  const { refreshEmployees } = useEmployeeRefresh();
  const { activeBlueprintId } = useShellData();
  const [removing, startRemoving] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRemove = () => {
    const shouldReset =
      !!activeSessionId && activeBlueprintId === employee.agent_blueprint_id;

    startRemoving(async () => {
      try {
        const res = await fetch(`/api/employees/${employee.id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          toast("Could not remove employee. Please try again.");
          setShowConfirm(false);
          return;
        }
        setShowConfirm(false);
        onClose();
        await refreshEmployees();
        if (shouldReset) router.push("/");
        else router.refresh();
      } catch {
        toast("Could not remove employee. Check your connection.");
        setShowConfirm(false);
      }
    });
  };

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-l border-border bg-card">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-[13px] font-semibold text-foreground">Info</h3>
        <button
          onClick={onClose}
          className="flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close info"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {/* Status */}
        <div className="mb-4">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.7px] text-muted-foreground/60">
            Status
          </p>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Hired</span>
              <span className="text-foreground">
                {new Date(employee.created_at).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
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
              Remove {employee.display_name}?
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
  );
}
