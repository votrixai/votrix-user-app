"use client";

import { usePathname } from "next/navigation";
import {
  Bot,
  LayoutGrid,
  PenLine,
  BarChart3,
  Headphones,
  FileText,
  CheckCircle2,
  Circle,
  Plus,
} from "lucide-react";
import Link from "next/link";

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
import { useEmployeePanel } from "@/lib/employee-panel-context";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import type { AgentEmployeeResponse } from "@votrix/shared";
import { cn } from "@/lib/utils";

// Marketplace category sidebar
const MARKETPLACE_CATEGORIES = [
  { icon: LayoutGrid, label: "All Agents", count: null },
  { icon: PenLine, label: "Marketing", count: null },
  { icon: BarChart3, label: "Sales", count: null },
  { icon: Headphones, label: "Support", count: null },
  { icon: BarChart3, label: "Data", count: null },
  { icon: FileText, label: "Content", count: null },
];

const STATUS_FILTERS = [
  { icon: CheckCircle2, label: "Hired" },
  { icon: Circle, label: "Available" },
];

export function EmployeeRail({
  employees,
  selectedEmployeeId,
  onSelectEmployee,
  loading,
}: {
  email: string;
  employees: AgentEmployeeResponse[];
  selectedEmployeeId: string | null;
  onSelectEmployee: (id: string) => void;
  loading: boolean;
}) {
  const pathname = usePathname();
  const isMarketplace = pathname === "/marketplace";

  return (
    <TooltipProvider delayDuration={200}>
      <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-border bg-card">
        {isMarketplace ? (
          <MarketplaceSidebar />
        ) : (
          <WorkspaceSidebar
            employees={employees}
            selectedEmployeeId={selectedEmployeeId}
            onSelectEmployee={onSelectEmployee}
            loading={loading}
          />
        )}
      </aside>
    </TooltipProvider>
  );
}

function MarketplaceSidebar() {
  return (
    <>
      <div className="border-b border-border px-4 py-3.5">
        <h2 className="text-[13px] font-semibold tracking-[-0.2px] text-foreground">Categories</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="mb-1">
          {MARKETPLACE_CATEGORIES.map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-[13px] text-muted-foreground transition-all duration-100 hover:bg-muted hover:text-foreground"
            >
              <Icon className="size-3.5 shrink-0" />
              {label}
            </button>
          ))}
        </div>
        <div className="mt-4">
          <p className="mb-1 px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-[0.7px] text-muted-foreground/60">
            Status
          </p>
          {STATUS_FILTERS.map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-[13px] text-muted-foreground transition-all duration-100 hover:bg-muted hover:text-foreground"
            >
              <Icon className="size-3.5 shrink-0" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function WorkspaceSidebar({
  employees,
  selectedEmployeeId,
  onSelectEmployee,
  loading,
}: {
  employees: AgentEmployeeResponse[];
  selectedEmployeeId: string | null;
  onSelectEmployee: (id: string) => void;
  loading: boolean;
}) {
  const { openPanel } = useEmployeePanel();

  return (
    <>
      <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
        <h2 className="text-[15px] font-semibold tracking-[-0.2px] text-foreground">My Employees</h2>
        <Link
          href="/marketplace"
          className="flex size-6 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          aria-label="Hire an employee"
        >
          <Plus className="size-3.5" />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="space-y-1 p-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-[52px] animate-pulse rounded-lg bg-muted"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        ) : employees.length === 0 ? (
          <div className="flex h-24 flex-col items-center justify-center gap-2 px-4 text-center">
            <Bot className="size-6 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">
              No employees yet.{" "}
              <a href="/marketplace" className="text-brand underline-offset-2 hover:underline">
                Browse the marketplace
              </a>
            </p>
          </div>
        ) : (
          employees.map((emp, i) => {
            const isSelected = selectedEmployeeId === emp.id;
            return (
              <div
                key={emp.id}
                className="relative animate-stagger-in"
                style={{ "--stagger-index": i } as React.CSSProperties}
              >
                {/* Active indicator */}
                <div
                  className={cn(
                    "absolute -left-2 top-1/2 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-all duration-200",
                    isSelected ? "h-5" : "h-0",
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
                        "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150",
                        isSelected
                          ? "bg-secondary text-foreground shadow-ambient"
                          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                      )}
                      aria-label={emp.display_name}
                    >
                      {(() => {
                        const { bg, icon } = getAvatarColor(emp.display_name);
                        return (
                          <div
                            className="flex size-8 shrink-0 items-center justify-center rounded-full"
                            style={{ background: bg }}
                          >
                            <span className="text-[12px] font-semibold leading-none" style={{ color: icon }}>
                              {getInitials(emp.display_name)}
                            </span>
                          </div>
                        );
                      })()}
                      <div className="min-w-0 flex-1 text-left">
                        <div className="truncate text-[13px] font-medium leading-snug">
                          {emp.display_name}
                        </div>
                        <div className="truncate text-[11.5px] text-muted-foreground">
                          {emp.slug}
                        </div>
                      </div>
                      {/* Online status dot */}
                      <div className="size-[7px] shrink-0 rounded-full bg-emerald-400" />
                    </button>
                  </TooltipTrigger>
                </Tooltip>
              </div>
            );
          })
        )}
      </nav>
    </>
  );
}
