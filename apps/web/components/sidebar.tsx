"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LogOut,
  Trash2,
  Store,
  Loader2,
  Plus,
  ChevronRight,
  ChevronDown,
  Bot,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEmployeePanel } from "@/lib/employee-panel-context";
import type { SessionResponse, AgentEmployeeResponse } from "@votrix/shared";

type Props = {
  email: string;
  userId: string;
};

type EmployeeGroup = {
  employee: AgentEmployeeResponse;
  sessions: SessionResponse[];
  latestAt: number;
};

const COLLAPSE_KEY = "votrix-sidebar-collapsed";

function loadCollapsed(): Set<string> {
  try {
    const raw = localStorage.getItem(COLLAPSE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveCollapsed(set: Set<string>) {
  localStorage.setItem(COLLAPSE_KEY, JSON.stringify([...set]));
}

export default function Sidebar({ email, userId }: Props) {
  const router = useRouter();
  const params = useParams<{ sessionId?: string }>();
  const pathname = usePathname();
  const activeId = params?.sessionId;
  const marketplaceActive = pathname === "/marketplace";
  const { openPanel } = useEmployeePanel();

  const [employees, setEmployees] = useState<AgentEmployeeResponse[]>([]);
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [creating, startCreating] = useTransition();
  const [creatingSlug, setCreatingSlug] = useState<string | null>(null);

  useEffect(() => {
    setCollapsed(loadCollapsed());
    Promise.all([
      fetch("/api/employees").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/sessions").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([emps, sess]) => {
        setEmployees(emps);
        setSessions(sess);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleCollapse = useCallback(
    (employeeId: string) => {
      setCollapsed((prev) => {
        const next = new Set(prev);
        if (next.has(employeeId)) next.delete(employeeId);
        else next.add(employeeId);
        saveCollapsed(next);
        return next;
      });
    },
    [],
  );

  const startNewChat = useCallback(
    (slug: string) => {
      setCreatingSlug(slug);
      startCreating(async () => {
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agent_slug: slug }),
        });
        if (!res.ok) {
          setCreatingSlug(null);
          return;
        }
        const data = await res.json();
        setCreatingSlug(null);
        router.push(`/c/${data.id}`);
        router.refresh();
      });
    },
    [router],
  );

  // Context menu & delete state
  const [menu, setMenu] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const [confirm, setConfirm] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [deleting, setDeleting] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(null);
    };
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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirm(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirm]);

  const labelFor = (s: SessionResponse) => {
    if (s.title) return s.title;
    const shortId = s.id.slice(0, 8);
    return s.blueprint_display_name
      ? `${s.blueprint_display_name} · ${shortId}`
      : shortId;
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
      await fetch(`/api/sessions/${id}`, { method: "DELETE" });
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setDeleting((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Build employee groups sorted by most recent chat
  const groups: EmployeeGroup[] = employees
    .map((emp) => {
      const empSessions = sessions
        .filter((s) => s.agent_blueprint_id === emp.agent_blueprint_id)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime(),
        );
      const latestAt =
        empSessions.length > 0
          ? new Date(empSessions[0].created_at).getTime()
          : new Date(emp.created_at).getTime();
      return { employee: emp, sessions: empSessions, latestAt };
    })
    .sort((a, b) => b.latestAt - a.latestAt);

  const hasEmployees = employees.length > 0;

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-border bg-muted/30">
      {/* Header */}
      <div className="space-y-0.5 p-3">
        <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          My Employees
        </div>
      </div>

      {/* Employee groups */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-1">
        {loading && (
          <div className="flex items-center gap-2 px-2 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            Loading...
          </div>
        )}

        {!loading && !hasEmployees && (
          <div className="px-2 py-4 text-center">
            <p className="text-sm text-muted-foreground">
              No employees yet
            </p>
            <Link
              href="/marketplace"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline"
            >
              <Store className="size-3.5" />
              Browse Marketplace
            </Link>
          </div>
        )}

        {groups.map(({ employee, sessions: empSessions }) => {
          const isCollapsed = collapsed.has(employee.id);
          const isCreating = creating && creatingSlug === employee.slug;

          return (
            <div key={employee.id} className="mb-1">
              {/* Employee header */}
              <div className="group flex items-center gap-1 rounded-md px-1 py-1 hover:bg-muted/60">
                <button
                  onClick={() => toggleCollapse(employee.id)}
                  className="flex shrink-0 items-center justify-center rounded p-0.5 text-muted-foreground hover:text-foreground"
                  aria-label={isCollapsed ? "Expand" : "Collapse"}
                >
                  {isCollapsed ? (
                    <ChevronRight className="size-3.5" />
                  ) : (
                    <ChevronDown className="size-3.5" />
                  )}
                </button>
                <button
                  onClick={() => openPanel(employee)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <div className="flex size-6 shrink-0 items-center justify-center rounded bg-muted">
                    <Bot className="size-3.5 text-muted-foreground" />
                  </div>
                  <span className="truncate text-sm font-medium text-foreground">
                    {employee.display_name}
                  </span>
                </button>
                <button
                  onClick={() => startNewChat(employee.slug)}
                  disabled={creating}
                  className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
                  aria-label={`New chat with ${employee.display_name}`}
                  title="New chat"
                >
                  {isCreating ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Plus className="size-3.5" />
                  )}
                </button>
              </div>

              {/* Nested chats */}
              {!isCollapsed && (
                <ul className="ml-4 mt-0.5 space-y-0.5 border-l border-border/50 pl-3">
                  {empSessions.length === 0 && (
                    <li className="px-2 py-1 text-xs text-muted-foreground">
                      No chats yet
                    </li>
                  )}
                  {empSessions.map((s) => (
                    <li
                      key={s.id}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMenu({ id: s.id, x: e.clientX, y: e.clientY });
                      }}
                    >
                      <Link
                        href={`/c/${s.id}`}
                        className={`flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors ${
                          deleting.has(s.id)
                            ? "pointer-events-none opacity-50"
                            : activeId === s.id
                              ? "bg-muted font-medium text-foreground"
                              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                        }`}
                        title={labelFor(s)}
                      >
                        {deleting.has(s.id) && (
                          <Loader2 className="size-3 shrink-0 animate-spin" />
                        )}
                        <span className="truncate">{labelFor(s)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}

        {/* Browse marketplace link */}
        {hasEmployees && (
          <Link
            href="/marketplace"
            className={`mt-2 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
              marketplaceActive
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            }`}
          >
            <Store className="size-4" />
            Browse Marketplace
          </Link>
        )}
      </nav>

      {/* Context menu */}
      {menu && (
        <div
          className="fixed z-50 min-w-40 overflow-hidden rounded-md border border-border bg-background shadow-lg"
          style={{ top: menu.y, left: menu.x }}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
        >
          <button
            onClick={() => {
              const s = sessions.find((x) => x.id === menu.id);
              if (s) openDeleteConfirm(s);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-muted"
          >
            <Trash2 className="size-4" />
            Delete chat
          </button>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setConfirm(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-lg border border-border bg-background p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold">Delete chat?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This will delete{" "}
              <span className="font-medium text-foreground">
                {confirm.title}
              </span>
              .
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
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-border p-3">
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="truncate" title={email}>
            {email}
          </span>
          <button
            onClick={handleSignOut}
            className="rounded p-1 hover:bg-muted hover:text-foreground"
            aria-label="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
        <div
          className="mt-1 text-xs text-muted-foreground/60"
          title={userId}
        >
          {userId}
        </div>
      </div>
    </aside>
  );
}
