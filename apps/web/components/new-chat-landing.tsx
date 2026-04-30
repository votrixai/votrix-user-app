"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bot, Loader2, Store } from "lucide-react";
import { useToast } from "@/lib/toast-context";
import type { AgentEmployeeResponse } from "@votrix/shared";

export default function NewChatLanding({
  employees,
}: {
  employees: AgentEmployeeResponse[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [creating, startCreating] = useTransition();
  const [selected, setSelected] = useState<string | null>(null);

  const start = (employee: AgentEmployeeResponse) => {
    setSelected(employee.slug);
    startCreating(async () => {
      try {
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agent_slug: employee.slug }),
        });
        if (!res.ok) {
          toast("Could not start chat. Please try again.");
          setSelected(null);
          return;
        }
        const data = await res.json();
        router.push(`/c/${data.id}`);
        router.refresh();
      } catch {
        toast("Could not start chat. Check your connection.");
        setSelected(null);
      }
    });
  };

  if (employees.length === 0) {
    return (
      <main className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-light tracking-tight">
            Welcome to Votrix
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Hire your first AI employee to get started.
          </p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Store className="size-4" />
            Browse Marketplace
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <h1 className="mb-2 text-center text-2xl font-light tracking-tight">
          Start a new chat
        </h1>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          Choose an employee to begin.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {employees.map((emp) => (
            <button
              key={emp.id}
              onClick={() => start(emp)}
              disabled={creating}
              className="flex items-start gap-3 rounded-md border border-border bg-background p-4 text-left shadow-ambient transition-colors hover:shadow-standard disabled:opacity-50"
            >
              <div className="mt-0.5 flex size-8 items-center justify-center rounded-md bg-muted">
                <Bot className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-light text-foreground">{emp.display_name}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {selected === emp.slug && creating
                    ? "Creating..."
                    : emp.model}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
