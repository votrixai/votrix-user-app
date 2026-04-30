"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  Brain,
  ChevronDown,
  ChevronRight,
  Loader2,
  MessageSquarePlus,
  Trash2,
} from "lucide-react";
import { useEmployeePanel } from "@/lib/employee-panel-context";
import { useToast } from "@/lib/toast-context";
import type {
  MemoryStoreResponse,
  MemoryResponse,
  SessionResponse,
} from "@votrix/shared";

export function EmployeeDetailPanel({
  sessions,
}: {
  sessions: SessionResponse[];
}) {
  const router = useRouter();
  const { selectedEmployee, closePanel } = useEmployeePanel();
  const { toast } = useToast();
  const [memoryStores, setMemoryStores] = useState<MemoryStoreResponse[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [expandedStores, setExpandedStores] = useState<Set<string>>(new Set());
  const [memories, setMemories] = useState<Record<string, MemoryResponse[]>>(
    {},
  );
  const [loadingMemories, setLoadingMemories] = useState<Set<string>>(
    new Set(),
  );
  const [removing, startRemoving] = useTransition();
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [creating, startCreating] = useTransition();

  // Fetch memory stores when employee changes
  useEffect(() => {
    if (!selectedEmployee) return;
    setMemoryStores([]);
    setExpandedStores(new Set());
    setMemories({});
    setLoadingStores(true);

    fetch(`/api/employees/${selectedEmployee.id}/memory-stores`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setMemoryStores(data))
      .catch(() => {})
      .finally(() => setLoadingStores(false));
  }, [selectedEmployee]);

  const toggleStore = useCallback(
    (storeId: string) => {
      setExpandedStores((prev) => {
        const next = new Set(prev);
        if (next.has(storeId)) {
          next.delete(storeId);
        } else {
          next.add(storeId);
          // Fetch memories if not already loaded
          if (!memories[storeId] && selectedEmployee) {
            setLoadingMemories((p) => new Set(p).add(storeId));
            fetch(
              `/api/employees/${selectedEmployee.id}/memory-stores/${storeId}/memories`,
            )
              .then((r) => (r.ok ? r.json() : []))
              .then((data) =>
                setMemories((prev) => ({ ...prev, [storeId]: data })),
              )
              .catch(() =>
                setMemories((prev) => ({ ...prev, [storeId]: [] })),
              )
              .finally(() =>
                setLoadingMemories((p) => {
                  const next = new Set(p);
                  next.delete(storeId);
                  return next;
                }),
              );
          }
        }
        return next;
      });
    },
    [memories, selectedEmployee],
  );

  const handleRemove = () => {
    if (!selectedEmployee) return;
    startRemoving(async () => {
      try {
        const res = await fetch(`/api/employees/${selectedEmployee.id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          toast("Could not remove employee. Please try again.");
          setShowRemoveConfirm(false);
          return;
        }
        setShowRemoveConfirm(false);
        closePanel();
        router.refresh();
        window.location.reload();
      } catch {
        toast("Could not remove employee. Check your connection.");
        setShowRemoveConfirm(false);
      }
    });
  };

  const handleNewChat = () => {
    if (!selectedEmployee) return;
    startCreating(async () => {
      try {
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agent_slug: selectedEmployee.slug }),
        });
        if (!res.ok) {
          toast("Could not create chat. Please try again.");
          return;
        }
        const data = await res.json();
        closePanel();
        router.push(`/c/${data.id}`);
        router.refresh();
      } catch {
        toast("Could not create chat. Check your connection.");
      }
    });
  };

  if (!selectedEmployee) return null;

  const employeeSessions = sessions
    .filter(
      (s) =>
        s.agent_blueprint_id === selectedEmployee.agent_blueprint_id,
    )
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 10);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={closePanel}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-background shadow-elevated">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <button
            onClick={closePanel}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close panel"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div className="flex size-8 items-center justify-center rounded-md bg-muted">
            <Bot className="size-4 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-light text-foreground">
              {selectedEmployee.display_name}
            </h2>
            <p className="text-xs text-muted-foreground">
              {selectedEmployee.model}
            </p>
          </div>
          <button
            onClick={handleNewChat}
            disabled={creating}
            className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-3 py-1.5 text-sm text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {creating ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <MessageSquarePlus className="size-3.5" />
            )}
            New Chat
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Info */}
          <div className="border-b border-border px-4 py-3">
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Hired</dt>
                <dd className="text-foreground">
                  {new Date(selectedEmployee.created_at).toLocaleDateString(
                    undefined,
                    { month: "short", day: "numeric", year: "numeric" },
                  )}
                </dd>
              </div>
            </dl>
          </div>

          {/* Memory Stores */}
          <div className="border-b border-border px-4 py-3">
            <h3 className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <Brain className="size-3.5" />
              Memory Stores
            </h3>

            {loadingStores && (
              <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
                <Loader2 className="size-3 animate-spin" />
                Loading memory stores...
              </div>
            )}

            {!loadingStores && memoryStores.length === 0 && (
              <p className="py-2 text-xs text-muted-foreground">
                No memory stores
              </p>
            )}

            <div className="space-y-1">
              {memoryStores.map((store) => {
                const isExpanded = expandedStores.has(store.id);
                const storeMemories = memories[store.id] ?? [];
                const isLoading = loadingMemories.has(store.id);

                return (
                  <div
                    key={store.id}
                    className="rounded-md border border-border"
                  >
                    <button
                      onClick={() => toggleStore(store.id)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50"
                    >
                      {isExpanded ? (
                        <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
                      )}
                      <span className="flex-1 truncate font-medium">
                        {store.name || "Unnamed store"}
                      </span>
                      {isExpanded && storeMemories.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {storeMemories.length}
                        </span>
                      )}
                    </button>

                    {isExpanded && (
                      <div className="border-t border-border bg-muted/20 px-3 py-2">
                        {isLoading && (
                          <div className="flex items-center gap-2 py-1 text-xs text-muted-foreground">
                            <Loader2 className="size-3 animate-spin" />
                            Loading memories...
                          </div>
                        )}
                        {!isLoading && storeMemories.length === 0 && (
                          <p className="py-1 text-xs text-muted-foreground">
                            No memories yet
                          </p>
                        )}
                        {storeMemories.map((mem) => (
                          <div
                            key={mem.id}
                            className="border-b border-border/50 py-2 last:border-0"
                          >
                            <p className="whitespace-pre-wrap text-xs text-foreground">
                              {mem.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent chats */}
          <div className="border-b border-border px-4 py-3">
            <h3 className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
              Recent Chats
            </h3>
            {employeeSessions.length === 0 ? (
              <p className="py-1 text-xs text-muted-foreground">
                No chats yet
              </p>
            ) : (
              <ul className="space-y-0.5">
                {employeeSessions.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => {
                        closePanel();
                        router.push(`/c/${s.id}`);
                      }}
                      className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <span className="truncate">
                        {s.title || `Chat ${s.id.slice(0, 8)}`}
                      </span>
                      <span className="shrink-0 pl-2 text-xs">
                        {formatRelativeDate(s.created_at)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Remove from team */}
          <div className="px-4 py-4">
            <button
              onClick={() => setShowRemoveConfirm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-sm border border-destructive/20 px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/5"
            >
              <Trash2 className="size-3.5" />
              Remove from team
            </button>
          </div>
        </div>

        {/* Remove confirmation */}
        {showRemoveConfirm && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
            onClick={() => setShowRemoveConfirm(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              className="w-full max-w-sm rounded-md border border-border bg-background p-5 shadow-deep"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-base font-light">
                Remove {selectedEmployee.display_name}?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                This will remove the employee from your team. Their memory
                stores will be deleted.
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setShowRemoveConfirm(false)}
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

function formatRelativeDate(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const day = 86400000;

  if (diff < day) return "Today";
  if (diff < 2 * day) return "Yesterday";
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
