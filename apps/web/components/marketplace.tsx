"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { useEmployeeRefresh } from "@/lib/employee-refresh-context";
import { useSessionRefresh } from "@/lib/session-refresh-context";
import { useToast } from "@/lib/toast-context";
import type { AgentBlueprintResponse } from "@votrix/shared";

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
  if (parts.length === 1) return parts[0]![0]!.toUpperCase();
  return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
}

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
      {/* Header */}
      <div className="px-9 pt-8 pb-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-display text-2xl font-medium italic tracking-[-0.5px] text-foreground">
            Discover Agents
          </h1>
          <p className="mt-1 text-[13.5px] text-muted-foreground">
            Browse and hire specialized AI employees for your team.
          </p>

          {/* Search */}
          <div className="mt-5 max-w-[400px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-[15px] -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search agents by name or skill..."
                className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-4 text-[13px] outline-none placeholder:text-muted-foreground/60 transition-colors focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="px-9 pb-8">
        <div className="mx-auto max-w-6xl">
          {filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {search ? "No agents match your search." : "No agents available."}
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((bp, i) => {
                const isHired = hiredIds.has(bp.id);
                const isSelected = selected === bp.slug && hiring;
                const { bg, icon } = getAvatarColor(bp.display_name);
                const initials = getInitials(bp.display_name);

                return (
                  <div
                    key={bp.id}
                    className="animate-stagger-in flex flex-col rounded-xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-primary/40 hover:shadow-ambient"
                    style={{ "--stagger-index": i } as React.CSSProperties}
                  >
                    {/* Top: avatar + hired badge */}
                    <div className="mb-3 flex items-start justify-between">
                      <div
                        className="flex size-[38px] shrink-0 items-center justify-center rounded-[9px] text-[13px] font-bold"
                        style={{ background: bg, color: icon }}
                      >
                        {initials}
                      </div>
                      {isHired && (
                        <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: "#E8F5EE", color: "#2D6A4F" }}>
                          ✓ Hired
                        </span>
                      )}
                    </div>

                    {/* Name + role */}
                    <h3 className="text-[14.5px] font-semibold text-foreground">{bp.display_name}</h3>
                    <p className="mt-0.5 text-[12.5px] text-muted-foreground">{bp.display_name}</p>
                    <p className="mt-2 text-[12.5px] leading-[1.45] text-muted-foreground/70 min-h-[36px]">
                      Description not available
                    </p>

                    {/* Error */}
                    {errors[bp.slug] && (
                      <p className="mt-2 line-clamp-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                        {errors[bp.slug]}
                      </p>
                    )}

                    {/* Bottom: price + button */}
                    <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-3 mt-4">
                      <span className="text-sm font-semibold text-foreground">
                        Free
                      </span>
                      <button
                        onClick={() => (isHired ? startChat(bp) : hire(bp))}
                        disabled={hiring || isHired}
                        className={`rounded-[7px] px-4 py-1.5 text-[12.5px] font-medium transition-colors disabled:opacity-100 ${
                          isHired
                            ? "cursor-default"
                            : "bg-foreground text-background hover:bg-foreground/85"
                        }`}
                        style={isHired ? { background: "#E8F5EE", color: "#2D6A4F" } : undefined}
                      >
                        {isSelected ? (
                          <Loader2 className="mx-auto size-4 animate-spin" />
                        ) : isHired ? (
                          "Active"
                        ) : (
                          "Hire"
                        )}
                      </button>
                    </div>
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
