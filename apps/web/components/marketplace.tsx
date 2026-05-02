"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bot, Check, Loader2, Search, Sparkles } from "lucide-react";
import { useEmployeeRefresh } from "@/lib/employee-refresh-context";
import { useSessionRefresh } from "@/lib/session-refresh-context";
import { useToast } from "@/lib/toast-context";
import type { AgentBlueprintResponse } from "@votrix/shared";

export default function Marketplace({
  blueprints,
}: {
  blueprints: AgentBlueprintResponse[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { refreshEmployees } = useEmployeeRefresh();
  const { refreshSessions } = useSessionRefresh();
  const [hiring, startHiring] = useTransition();
  const [selected, setSelected] = useState<string | null>(null);
  const [hiredIds, setHiredIds] = useState<Set<string>>(
    new Set(blueprints.filter((b) => b.is_hired).map((b) => b.id)),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");

  const filtered = search
    ? blueprints.filter(
        (b) =>
          b.display_name.toLowerCase().includes(search.toLowerCase()) ||
          b.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())),
      )
    : blueprints;

  const hire = (blueprint: AgentBlueprintResponse) => {
    setSelected(blueprint.slug);
    setErrors((prev) => ({ ...prev, [blueprint.slug]: "" }));
    startHiring(async () => {
      const hireRes = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_slug: blueprint.slug }),
      });
      if (!hireRes.ok) {
        const text = await hireRes.text().catch(() => "");
        let detail = text;
        try {
          detail = (JSON.parse(text) as { detail?: string }).detail ?? text;
        } catch {}
        setErrors((prev) => ({
          ...prev,
          [blueprint.slug]: detail || "Couldn't hire agent. Please try again.",
        }));
        setSelected(null);
        return;
      }

      const sessionRes = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_slug: blueprint.slug }),
      });
      if (!sessionRes.ok) {
        toast(
          "Hired successfully, but could not start chat. Select them to start chatting.",
        );
        setSelected(null);
        setHiredIds((prev) => new Set(prev).add(blueprint.id));
        await refreshEmployees(blueprint.id);
        return;
      }
      const session = await sessionRes.json();
      setSelected(null);
      setHiredIds((prev) => new Set(prev).add(blueprint.id));
      await Promise.all([
        refreshEmployees(blueprint.id),
        refreshSessions(),
      ]);
      router.push(`/c/${session.id}`);
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
        refreshSessions();
        router.push(`/c/${session.id}`);
      } catch {
        toast("Could not start chat. Check your connection.");
        setSelected(null);
      }
    });
  };

  return (
    <main className="h-full overflow-y-auto">
      {/* Hero header */}
      <div className="border-b border-border bg-muted/20 px-8 pt-10 pb-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="size-5 text-primary" />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Discover Agents
            </h1>
          </div>
          <p className="mt-2 max-w-xl text-base text-muted-foreground">
            Browse and hire specialized AI employees for your team. Each agent
            comes with unique skills and capabilities.
          </p>

          {/* Search */}
          <div className="mt-6 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search agents by name or skill..."
                className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground/60 transition-colors focus:border-primary focus:shadow-[0_0_0_2px_rgba(83,58,253,0.15)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="px-8 py-8">
        <div className="mx-auto max-w-6xl">
          {filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {search ? "No agents match your search." : "No agents available."}
            </p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((bp, i) => {
                const isHired = hiredIds.has(bp.id);
                const isSelected = selected === bp.slug && hiring;

                return (
                  <div
                    key={bp.id}
                    className="animate-stagger-in group flex flex-col rounded-xl border border-border bg-background p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-border/80 hover:shadow-ambient"
                    style={
                      { "--stagger-index": i } as React.CSSProperties
                    }
                  >
                    {/* Agent info + action */}
                    <div className="flex items-start gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
                        <Bot className="size-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-medium text-foreground">
                            {bp.display_name}
                          </h3>
                          {isHired && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                              <Check className="size-3" />
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => (isHired ? startChat(bp) : hire(bp))}
                        disabled={hiring}
                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                          isHired
                            ? "border border-border text-foreground hover:bg-muted"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                        }`}
                      >
                        {isSelected ? (
                          <Loader2 className="mx-auto size-4 animate-spin" />
                        ) : isHired ? (
                          "Start Chat"
                        ) : (
                          "Hire Agent"
                        )}
                      </button>
                    </div>

                    {/* Error */}
                    {errors[bp.slug] && (
                      <p className="mt-3 line-clamp-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                        {errors[bp.slug]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
