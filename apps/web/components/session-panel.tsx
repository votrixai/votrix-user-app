"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  PanelLeftClose,
  Plus,
  Trash2,
} from "lucide-react";
import { useSessionRefresh } from "@/lib/session-refresh-context";
import { useToast } from "@/lib/toast-context";
import type { AgentEmployeeResponse, SessionResponse } from "@votrix/shared";

export function SessionPanel({
  employee,
  sessions,
  onSessionsChange,
  onCollapse,
}: {
  employee: AgentEmployeeResponse | null;
  sessions: SessionResponse[];
  onSessionsChange: (sessions: SessionResponse[]) => void;
  onCollapse: () => void;
}) {
  const router = useRouter();
  const params = useParams<{ sessionId?: string }>();
  const activeId = params?.sessionId;
  const { toast } = useToast();
  const { refreshSessions } = useSessionRefresh();
  const [creating, startCreating] = useTransition();

  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [confirm, setConfirm] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(null); };
    window.addEventListener("click", close);
    window.addEventListener("contextmenu", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("contextmenu", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  useEffect(() => {
    if (!confirm) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setConfirm(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirm]);

  const employeeSessions = employee
    ? sessions
        .filter((s) => s.agent_blueprint_id === employee.agent_blueprint_id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    : [];

  const labelFor = (s: SessionResponse) => {
    if (s.title) return s.title;
    const shortId = s.id.slice(0, 8);
    return s.blueprint_display_name ? `${s.blueprint_display_name} · ${shortId}` : shortId;
  };

  const openDeleteConfirm = (s: SessionResponse) => {
    setMenu(null);
    setConfirm({ id: s.id, title: labelFor(s) });
  };

  const confirmDelete = async () => {
    if (!confirm) return;
    const id = confirm.id;
    setConfirm(null);
    if (activeId === id) router.push("/");
    setDeleting((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
      if (res.ok) {
        onSessionsChange(sessions.filter((s) => s.id !== id));
      } else {
        toast("Could not delete chat. Please try again.");
      }
    } catch {
      toast("Could not delete chat. Check your connection.");
    } finally {
      setDeleting((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const startNewChat = useCallback(() => {
    if (!employee) return;
    startCreating(async () => {
      try {
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agent_slug: employee.slug }),
        });
        if (!res.ok) {
          toast("Could not create chat. Please try again.");
          return;
        }
        const data = await res.json();
        router.push(`/c/${data.id}`);
        refreshSessions();
      } catch {
        toast("Could not create chat. Check your connection.");
      }
    });
  }, [employee, refreshSessions, router, toast]);

  if (!employee) {
    return (
      <div className="flex h-full w-[280px] shrink-0 flex-col items-center justify-center border-r border-border bg-background px-4">
        <p className="text-center text-sm text-muted-foreground">
          Select an employee to view chats
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-[280px] shrink-0 flex-col border-r border-border bg-background">
      {/* Header with new chat button */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
        <h2 className="min-w-0 truncate text-sm font-light text-foreground">
          {employee.display_name}
        </h2>
        <div className="flex items-center gap-1.5">
          <button
            onClick={startNewChat}
            disabled={creating}
            className="flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            aria-label="New chat"
          >
            {creating ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <>
                <Plus className="size-3.5" />
                New Chat
              </>
            )}
          </button>
          <button
            onClick={onCollapse}
            className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Collapse panel"
          >
            <PanelLeftClose className="size-4" />
          </button>
        </div>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {employeeSessions.length === 0 ? (
          <div className="flex h-20 items-center justify-center text-xs text-muted-foreground">
            No chats yet
          </div>
        ) : (
          <ul className="space-y-0.5">
            {employeeSessions.map((s, i) => (
              <li
                key={s.id}
                className="group/session animate-stagger-in"
                style={{ "--stagger-index": Math.min(i, 8) } as React.CSSProperties}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenu({ id: s.id, x: e.clientX, y: e.clientY });
                }}
              >
                <div
                  className={`flex items-center gap-1 rounded-md py-1.5 pl-2 pr-1 text-sm transition-colors ${
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
                    className="min-w-0 flex-1 truncate"
                    title={labelFor(s)}
                  >
                    {labelFor(s)}
                  </Link>
                  {!deleting.has(s.id) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteConfirm(s);
                      }}
                      className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover/session:opacity-100"
                      aria-label={`Delete ${labelFor(s)}`}
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


      {/* Context menu */}
      {menu && (
        <div
          className="fixed z-50 min-w-40 overflow-hidden rounded-md border border-border bg-background shadow-elevated"
          style={{ top: menu.y, left: menu.x }}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
        >
          <button
            onClick={() => {
              const s = sessions.find((x) => x.id === menu.id);
              if (s) openDeleteConfirm(s);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive hover:bg-muted"
          >
            <Trash2 className="size-4" />
            Delete chat
          </button>
        </div>
      )}

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
            <h2 className="text-base font-light">Delete chat?</h2>
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
                onClick={confirmDelete}
                disabled={deleting.size > 0}
                className="rounded-sm bg-destructive px-3 py-1.5 text-sm text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
