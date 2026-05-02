"use client";

import Link from "next/link";
import { Bot, Store } from "lucide-react";
import type { AgentEmployeeResponse } from "@votrix/shared";

export default function NewChatLanding({
  employees,
}: {
  employees: AgentEmployeeResponse[];
}) {
  if (employees.length === 0) {
    return (
      <main className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <div
            className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg bg-muted animate-stagger-in"
            style={{ "--stagger-index": 0 } as React.CSSProperties}
          >
            <Bot className="size-6 text-muted-foreground" />
          </div>
          <h1
            className="mb-2 text-2xl font-light tracking-tight animate-stagger-in"
            style={{ "--stagger-index": 1 } as React.CSSProperties}
          >
            Welcome to Votrix
          </h1>
          <p
            className="mb-6 text-sm text-muted-foreground animate-stagger-in"
            style={{ "--stagger-index": 2 } as React.CSSProperties}
          >
            Hire your first AI employee to get started.
          </p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90 animate-stagger-in"
            style={{ "--stagger-index": 3 } as React.CSSProperties}
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
      <p className="text-sm text-muted-foreground">
        Select an employee from the left to start chatting.
      </p>
    </main>
  );
}
