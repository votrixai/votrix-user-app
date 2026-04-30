"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bot, Loader2, Store } from "lucide-react";
import type { AgentEmployeeResponse } from "@votrix/shared";

export default function NewChatLanding({
  employees,
}: {
  employees: AgentEmployeeResponse[];
}) {
  const router = useRouter();
  const [creating, startCreating] = useTransition();
  const [selected, setSelected] = useState<string | null>(null);

  const start = (employee: AgentEmployeeResponse) => {
    setSelected(employee.slug);
    startCreating(async () => {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_slug: employee.slug }),
      });
      if (!res.ok) {
        setSelected(null);
        return;
      }
      const data = await res.json();
      router.push(`/c/${data.id}`);
      router.refresh();
    });
  };

  if (employees.length === 0) {
    return (
      <main className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-semibold">
            Welcome to Votrix
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Hire your first AI employee to get started.
          </p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
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
        <h1 className="mb-2 text-center text-2xl font-semibold">
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
              className="flex items-start gap-3 rounded-lg border border-border bg-background p-4 text-left transition-colors hover:bg-muted disabled:opacity-50"
            >
              <div className="mt-0.5 flex size-8 items-center justify-center rounded-md bg-muted">
                <Bot className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium">{emp.display_name}</div>
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
