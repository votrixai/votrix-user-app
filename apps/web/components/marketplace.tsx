"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bot, Check, Loader2 } from "lucide-react";
import { useToast } from "@/lib/toast-context";
import type { AgentBlueprintResponse } from "@votrix/shared";

export default function Marketplace({
  blueprints,
}: {
  blueprints: AgentBlueprintResponse[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [hiring, startHiring] = useTransition();
  const [selected, setSelected] = useState<string | null>(null);
  const [hiredIds, setHiredIds] = useState<Set<string>>(
    new Set(blueprints.filter((b) => b.is_hired).map((b) => b.id)),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const hire = (blueprint: AgentBlueprintResponse) => {
    setSelected(blueprint.slug);
    setErrors((prev) => ({ ...prev, [blueprint.slug]: "" }));
    startHiring(async () => {
      // Step 1: Hire the employee
      const hireRes = await fetch("/api/employees/hire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_slug: blueprint.slug }),
      });
      if (!hireRes.ok) {
        const text = await hireRes.text().catch(() => "");
        let detail = text;
        try {
          detail = (JSON.parse(text) as { detail?: string }).detail ?? text;
        } catch {
          // not JSON, use raw text
        }
        console.error("hire failed", hireRes.status, text);
        setErrors((prev) => ({ ...prev, [blueprint.slug]: detail || "Couldn't hire agent. Please try again." }));
        setSelected(null);
        return;
      }

      // Step 2: Create first chat session
      const sessionRes = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_slug: blueprint.slug }),
      });
      if (!sessionRes.ok) {
        toast("Hired successfully, but could not start chat. Try from the sidebar.");
        setSelected(null);
        setHiredIds((prev) => new Set(prev).add(blueprint.id));
        router.refresh();
        return;
      }
      const session = await sessionRes.json();
      setSelected(null);
      router.push(`/c/${session.id}`);
      router.refresh();
    });
  };

  const startChat = (blueprint: AgentBlueprintResponse) => {
    setSelected(blueprint.slug);
    startHiring(async () => {
      try {
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agent_slug: blueprint.slug }),
        });
        if (!res.ok) {
          toast("Could not start chat. Please try again.");
          setSelected(null);
          return;
        }
        const session = await res.json();
        setSelected(null);
        router.push(`/c/${session.id}`);
        router.refresh();
      } catch {
        toast("Could not start chat. Check your connection.");
        setSelected(null);
      }
    });
  };

  return (
    <main className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-2xl font-light tracking-tight">Marketplace</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Hire AI employees for your team.
        </p>
        {blueprints.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No agents available.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {blueprints.map((bp) => {
              const isHired = hiredIds.has(bp.id);
              const isSelected = selected === bp.slug && hiring;

              return (
                <div
                  key={bp.id}
                  className="flex flex-col items-start gap-3 rounded-md border border-border bg-background p-5 shadow-ambient transition-colors"
                >
                  <div className="flex w-full items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-md bg-muted">
                      <Bot className="size-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-light text-foreground">{bp.display_name}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {bp.model}
                      </div>
                    </div>
                  </div>

                  {bp.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {bp.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-sm bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {errors[bp.slug] && (
                    <p className="line-clamp-2 rounded-sm bg-destructive/10 px-2 py-1.5 text-xs text-destructive">{errors[bp.slug]}</p>
                  )}

                  <div className="mt-auto w-full pt-1">
                    {isHired ? (
                      <div className="flex gap-2">
                        <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground">
                          <Check className="size-3.5" />
                          Hired
                        </span>
                        <button
                          onClick={() => startChat(bp)}
                          disabled={hiring}
                          className="flex-1 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                        >
                          {isSelected ? (
                            <Loader2 className="mx-auto size-4 animate-spin" />
                          ) : (
                            "Chat"
                          )}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => hire(bp)}
                        disabled={hiring}
                        className="w-full rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                      >
                        {isSelected ? (
                          <Loader2 className="mx-auto size-4 animate-spin" />
                        ) : (
                          "Hire"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
