"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Bot, LogOut, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEmployeePanel } from "@/lib/employee-panel-context";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import type { AgentEmployeeResponse } from "@votrix/shared";
import { cn } from "@/lib/utils";

export function EmployeeRail({
  email,
  employees,
  selectedEmployeeId,
  onSelectEmployee,
}: {
  email: string;
  employees: AgentEmployeeResponse[];
  selectedEmployeeId: string | null;
  onSelectEmployee: (id: string) => void;
  loading: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { openPanel } = useEmployeePanel();
  const marketplaceActive = pathname === "/marketplace";

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const initial = email ? email[0]!.toUpperCase() : "?";

  return (
    <TooltipProvider delayDuration={200}>
      <aside className="flex h-full w-[56px] shrink-0 flex-col items-center border-r border-border bg-muted/30 py-2">
        {/* User avatar with popover */}
        <UserMenu email={email} initial={initial} onSignOut={handleSignOut} />

        {/* Divider */}
        <div className="my-2 h-px w-8 bg-border" />

        {/* Marketplace */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/marketplace"
              className={cn(
                "flex size-10 items-center justify-center rounded-2xl transition-all duration-200 hover:rounded-xl",
                marketplaceActive
                  ? "bg-primary text-primary-foreground rounded-xl"
                  : "bg-muted text-muted-foreground hover:bg-primary/80 hover:text-primary-foreground",
              )}
            >
              <Store className="size-4" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Marketplace</TooltipContent>
        </Tooltip>

        {/* Divider */}
        <div className="my-2 h-px w-8 bg-border" />

        {/* Employee icons */}
        <nav className="flex flex-1 flex-col items-center gap-2 overflow-y-auto py-1">
          {employees.map((emp, i) => {
            const isSelected = selectedEmployeeId === emp.id;
            return (
              <div
                key={emp.id}
                className="relative animate-stagger-in"
                style={{ "--stagger-index": i } as React.CSSProperties}
              >
                {/* Left pill indicator */}
                <div
                  className={cn(
                    "absolute -left-2 top-1/2 w-1 -translate-y-1/2 rounded-r-full bg-foreground transition-all duration-200",
                    isSelected ? "h-5" : "h-0 group-hover:h-2",
                  )}
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onSelectEmployee(emp.id)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        openPanel(emp);
                      }}
                      className={cn(
                        "group flex size-10 items-center justify-center rounded-2xl transition-all duration-200 hover:rounded-xl",
                        isSelected
                          ? "bg-primary text-primary-foreground rounded-xl"
                          : "bg-muted text-muted-foreground hover:bg-primary/80 hover:text-primary-foreground",
                      )}
                      aria-label={emp.display_name}
                    >
                      <Bot className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{emp.display_name}</TooltipContent>
                </Tooltip>
              </div>
            );
          })}
        </nav>

      </aside>
    </TooltipProvider>
  );
}

function UserMenu({
  email,
  initial,
  onSignOut,
}: {
  email: string;
  initial: string;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex size-10 items-center justify-center rounded-2xl bg-muted text-xs font-medium text-muted-foreground transition-all duration-200 hover:rounded-xl hover:bg-muted-foreground/20",
          open && "rounded-xl ring-2 ring-primary",
        )}
      >
        {initial}
      </button>

      {open && (
        <div className="absolute left-14 top-0 z-50 min-w-56 rounded-lg border border-border bg-background p-1 shadow-elevated animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-foreground">{email}</p>
          </div>
          <div className="h-px bg-border" />
          <button
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive transition-colors hover:bg-muted"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
