"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  FileText,
  MessageSquare,
  Search,
  Store,
} from "lucide-react";
import { useCommandPalette } from "@/lib/use-command-palette";
import type { SessionResponse } from "@votrix/shared";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  group: string;
  action: () => void;
}

export function CommandPalette() {
  const router = useRouter();
  const { isOpen, close } = useCommandPalette();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [sessions, setSessions] = useState<SessionResponse[]>([]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
      fetch("/api/sessions")
        .then((r) => (r.ok ? r.json() : []))
        .then((all: SessionResponse[]) => setSessions(all))
        .catch(() => {});
    }
  }, [isOpen]);

  const items = useMemo<CommandItem[]>(() => {
    const results: CommandItem[] = [];

    results.push(
      {
        id: "nav-home",
        label: "Go Home",
        icon: <MessageSquare className="size-4" />,
        group: "Navigate",
        action: () => { close(); router.push("/"); },
      },
      {
        id: "nav-files",
        label: "Files",
        icon: <FileText className="size-4" />,
        group: "Navigate",
        action: () => { close(); router.push("/files"); },
      },
      {
        id: "nav-marketplace",
        label: "Marketplace",
        icon: <Store className="size-4" />,
        group: "Navigate",
        action: () => { close(); router.push("/marketplace"); },
      },
    );

    for (const s of sessions.slice(0, 20)) {
      const label = s.title || s.blueprint_display_name || `Chat ${s.id.slice(0, 8)}`;
      results.push({
        id: `session-${s.id}`,
        label,
        description: s.blueprint_display_name ?? undefined,
        icon: <Bot className="size-4" />,
        group: "Recent Chats",
        action: () => { close(); router.push(`/chat/${s.id}`); },
      });
    }

    return results;
  }, [sessions, close, router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q),
    );
  }, [items, query]);

  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    for (const item of filtered) {
      (groups[item.group] ??= []).push(item);
    }
    return groups;
  }, [filtered]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[selectedIndex]?.action();
    }
  };

  if (!isOpen) return null;

  let flatIndex = -1;

  return (
    <>
      <div
        className="fixed inset-0 z-[60] animate-in fade-in bg-black/50 backdrop-blur-sm duration-100"
        onClick={close}
      />
      <div
        className="fixed inset-x-0 top-[15vh] z-[60] mx-auto flex w-[min(640px,90vw)] flex-col overflow-hidden rounded-lg border border-border bg-background shadow-elevated animate-in fade-in zoom-in-[0.96] slide-in-from-top-5 duration-[120ms]"
        style={{
          maxHeight: "min(500px, 70vh)",
          animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands, chats, employees..."
            className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground/60"
          />
          <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">
            ESC
          </kbd>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No results found
            </div>
          ) : (
            Object.entries(grouped).map(([group, groupItems]) => (
              <div key={group} className="mb-1">
                <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  {group}
                </div>
                {groupItems.map((item) => {
                  flatIndex++;
                  const idx = flatIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors duration-150 ${
                        selectedIndex === idx
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      <span className="shrink-0 text-muted-foreground">
                        {item.icon}
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {item.label}
                      </span>
                      {item.description && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-center gap-4 border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border px-1 py-0.5 text-[10px]">&uarr;&darr;</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border px-1 py-0.5 text-[10px]">&crarr;</kbd>
            Select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border px-1 py-0.5 text-[10px]">Esc</kbd>
            Close
          </span>
        </div>
      </div>
    </>
  );
}
