"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, Loader2, Store } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/lib/toast-context";
import type { AgentEmployeeResponse } from "@votrix/shared";

const AVATAR_COLORS: { bg: string; icon: string }[] = [
  { bg: "#E8F5EE", icon: "#2D6A4F" },
  { bg: "#EBF0FA", icon: "#3B5998" },
  { bg: "#F3EEFF", icon: "#7C3AED" },
  { bg: "#FEF3E2", icon: "#D97706" },
  { bg: "#FFF1F3", icon: "#E11D48" },
  { bg: "#E6FAF8", icon: "#0D9488" },
];

function getAvatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]!;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0]![0] ?? "?").toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export function EmployeeHome({
  employee,
}: {
  employee: AgentEmployeeResponse | null;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [creating, startCreating] = useTransition();
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!employee) {
    return (
      <main className="flex h-full flex-col items-center justify-center px-6">
        <div
          className="flex flex-col items-center text-center animate-stagger-in"
          style={{ "--stagger-index": 0 } as React.CSSProperties}
        >
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted">
            <Store className="size-7 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            No employees yet
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Hire your first AI employee to get started.
          </p>
          <Link
            href="/marketplace"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Store className="size-4" />
            Browse Marketplace
          </Link>
        </div>
      </main>
    );
  }

  const { bg, icon } = getAvatarColor(employee.display_name);

  const handleSubmit = () => {
    const message = input.trim();
    if (!message || creating) return;

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
        router.push(`/chat/${data.id}?q=${encodeURIComponent(message)}`);
      } catch {
        toast("Could not create session. Check your connection.");
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  };

  return (
    <main className="flex h-full flex-col items-center justify-center px-6">
      <div className="w-full max-w-2xl">
        {/* Employee identity */}
        <div
          className="mb-8 flex flex-col items-center text-center animate-stagger-in"
          style={{ "--stagger-index": 0 } as React.CSSProperties}
        >
          <div
            className="mb-3 flex size-14 items-center justify-center rounded-2xl text-xl font-bold"
            style={{ background: bg, color: icon }}
          >
            {getInitials(employee.display_name)}
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            {employee.display_name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{employee.slug}</p>
        </div>

        {/* Input box */}
        <div
          className="animate-stagger-in"
          style={{ "--stagger-index": 1 } as React.CSSProperties}
        >
          <div className="relative rounded-2xl border border-border bg-card shadow-ambient transition-shadow focus-within:shadow-elevated">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${employee.display_name}…`}
              rows={1}
              disabled={creating}
              autoFocus
              className="block max-h-48 w-full resize-none rounded-2xl bg-transparent px-4 py-3.5 pr-14 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || creating}
              className="absolute bottom-2.5 right-2.5 flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity disabled:opacity-30 hover:bg-primary/90"
              aria-label="Send"
            >
              {creating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowUp className="size-4" />
              )}
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </main>
  );
}
