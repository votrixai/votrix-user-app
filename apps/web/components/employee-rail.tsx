"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  FileText,
  Info,
  Loader2,
  LogOut,
  Store,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEmployeePanel } from "@/lib/employee-panel-context";
import type { AgentEmployeeResponse } from "@votrix/shared";

export function EmployeeRail({
  email,
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
  const router = useRouter();
  const pathname = usePathname();
  const { openPanel } = useEmployeePanel();
  const filesActive = pathname === "/files";
  const marketplaceActive = pathname === "/marketplace";

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="flex h-full w-[180px] shrink-0 flex-col border-r border-border bg-muted/30">
      {/* Header */}
      <div className="px-3 pt-3 pb-1">
        <div className="px-1 py-1 text-xs uppercase tracking-wider text-muted-foreground">
          My Employees
        </div>
      </div>

      {/* Employee list */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-1">
        {loading && (
          <div className="flex items-center gap-2 px-2 py-2 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            Loading...
          </div>
        )}

        {!loading && employees.length === 0 && (
          <div className="px-2 py-4 text-center">
            <p className="text-xs text-muted-foreground">No employees yet</p>
            <Link
              href="/marketplace"
              className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Store className="size-3" />
              Hire one
            </Link>
          </div>
        )}

        {employees.map((emp, i) => {
          const isSelected = selectedEmployeeId === emp.id;
          return (
            <div
              key={emp.id}
              className="animate-stagger-in"
              style={{ "--stagger-index": i } as React.CSSProperties}
            >
              <button
                onClick={() => onSelectEmployee(emp.id)}
                className={`group flex h-9 w-full items-center gap-2 rounded-md px-1.5 text-left transition-colors ${
                  isSelected
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                <div className="flex size-6 shrink-0 items-center justify-center rounded bg-muted">
                  <Bot className="size-3.5 text-muted-foreground" />
                </div>
                <span className="min-w-0 flex-1 truncate text-sm font-light">
                  {emp.display_name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openPanel(emp);
                  }}
                  className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                  aria-label={`Info for ${emp.display_name}`}
                >
                  <Info className="size-3.5" />
                </button>
              </button>
            </div>
          );
        })}
      </nav>

      {/* Nav links */}
      {employees.length > 0 && (
        <div className="space-y-0.5 border-t border-border px-2 py-2">
          <Link
            href="/files"
            className={`flex h-8 items-center gap-2 rounded-md px-1.5 text-xs transition-colors ${
              filesActive
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            }`}
          >
            <FileText className="size-3.5" />
            Files
          </Link>
          <Link
            href="/marketplace"
            className={`flex h-8 items-center gap-2 rounded-md px-1.5 text-xs transition-colors ${
              marketplaceActive
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            }`}
          >
            <Store className="size-3.5" />
            Marketplace
          </Link>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-border px-3 py-2">
        <div className="flex items-center justify-between gap-1 text-xs text-muted-foreground">
          <span className="min-w-0 truncate" title={email}>
            {email}
          </span>
          <button
            onClick={handleSignOut}
            className="shrink-0 rounded p-1 hover:bg-muted hover:text-foreground"
            aria-label="Sign out"
          >
            <LogOut className="size-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
