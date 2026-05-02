"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Trash2, X } from "lucide-react";
import { useSessionRefresh } from "@/lib/session-refresh-context";
import { useToast } from "@/lib/toast-context";
import type { AgentEmployeeResponse, SessionResponse } from "@votrix/shared";

export function HistoryPanel({
  employee,
  sessions,
  onClose,
}: {
  employee: AgentEmployeeResponse;
  sessions: SessionResponse[];
  onClose: () => void;
}) {
  const router = useRouter();
  const params = useParams<{ sessionId?: string }>();
  const activeId = params?.sessionId;
  const { toast } = useToast();
  const { refreshSessions } = useSessionRefresh();
  const [deleting, setDeleting] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<{ id: string; title: string } | null>(null);

  const employeeSessions = sessions
    .filter((s) => s.agent_blueprint_id === employee.agent_blueprint_id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const labelFor = (s: SessionResponse) => {
    if (s.title) return s.title;
    const shortId = s.id.slice(0, 8);
    return s.blueprint_display_name ? `${s.blueprint_display_name} · ${shortId}` : shortId;
  };

  const handleDelete = async (id: string) => {
    setConfirm(null);
    if (activeId === id) router.push("/");
    setDeleting((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
      if (res.ok) {
        refreshSessions();
      } else {
        toast("Could not delete session. Please try again.");
      }
    } catch {
      toast("Could not delete session. Check your connection.");
    } finally {
      setDeleting((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-l border-border bg-card">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-[13px] font-semibold text-foreground">History</h3>
        <button
          onClick={onClose}
          className="flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close history"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto px-2 py-1.5">
        {employeeSessions.length === 0 ? (
          <div className="flex h-20 items-center justify-center text-xs text-muted-foreground">
            No sessions yet
          </div>
        ) : (
          <ul className="space-y-0.5">
            {employeeSessions.map((s) => (
              <li
                key={s.id}
                className="group/session"
                onContextMenu={(e) => {
                  e.preventDefault();
                  setConfirm({ id: s.id, title: labelFor(s) });
                }}
              >
                <div
                  className={`flex items-center gap-1 rounded-md py-1.5 pl-2.5 pr-1 text-sm transition-colors ${
                    deleting.has(s.id)
                      ? "pointer-events-none opacity-50"
                      : activeId === s.id
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  {deleting.has(s.id) && (
                    <Loader2 className="size-3 shrink-0 animate-spin" />
                  )}
                  <Link
                    href={`/c/${s.id}`}
                    className="min-w-0 flex-1 truncate text-xs"
                    title={labelFor(s)}
                  >
                    {labelFor(s)}
                  </Link>
                  {!deleting.has(s.id) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirm({ id: s.id, title: labelFor(s) });
                      }}
                      className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover/session:opacity-100"
                      aria-label="Delete session"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Delete confirmation */}
      {confirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setConfirm(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-sm animate-in fade-in zoom-in-[0.96] rounded-md border border-border bg-background p-5 shadow-deep duration-[120ms]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-light">Delete session?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This will delete{" "}
              <span className="font-medium text-foreground">{confirm.title}</span>.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirm(null)}
                className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirm.id)}
                disabled={deleting.size > 0}
                className="rounded-sm bg-destructive px-3 py-1.5 text-sm text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
