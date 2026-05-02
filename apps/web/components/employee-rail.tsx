"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Bot,
  ChevronsUpDown,
  LogOut,
  Store,
  UserRound,
  UsersRound,
} from "lucide-react";
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

const SIDEBAR_COLLAPSED_KEY = "votrix-sidebar-collapsed";

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
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true");
    } catch {}
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {}
      return next;
    });
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const initial = email ? email[0]!.toUpperCase() : "?";

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          "flex h-full shrink-0 flex-col border-r border-border bg-[#f6f7fc] px-3 py-3 transition-[width] duration-200",
          collapsed ? "w-[72px] items-center" : "w-[260px]",
        )}
      >
        <div className={cn("flex w-full items-center", collapsed ? "justify-center" : "justify-between")}>
          <button
            onClick={toggleCollapsed}
            className={cn(
              "flex h-11 items-center rounded-lg text-foreground transition-colors hover:bg-background",
              collapsed ? "w-11 justify-center" : "w-full justify-start gap-3 px-2",
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Image src="/icon.png" alt="" width={28} height={28} className="size-7 rounded-md" />
            {!collapsed && (
              <span className="truncate text-xl font-semibold tracking-normal text-foreground">
                Votrix
              </span>
            )}
          </button>
        </div>

        <WorkspaceSelector email={email} initial={initial} collapsed={collapsed} />

        <nav className="mt-6 flex min-h-0 flex-1 flex-col gap-1">
          <SidebarLink
            href="/marketplace"
            icon={Store}
            label="Marketplace"
            active={marketplaceActive}
            collapsed={collapsed}
          />
          <div className={cn("my-3 h-px bg-border", collapsed ? "mx-auto w-10" : "w-full")} />

          {employees.map((emp, i) => {
            const isSelected = selectedEmployeeId === emp.id;
            return (
              <div
                key={emp.id}
                className="relative animate-stagger-in"
                style={{ "--stagger-index": i } as React.CSSProperties}
              >
                <div
                  className={cn(
                    "absolute top-1/2 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-all duration-200",
                    collapsed ? "-left-3" : "-left-3",
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
                        "group flex h-11 items-center rounded-lg text-sm transition-all duration-200",
                        collapsed ? "w-11 justify-center" : "w-full justify-start gap-3 px-3",
                        isSelected
                          ? "bg-background text-foreground shadow-ambient"
                          : "text-muted-foreground hover:bg-background hover:text-foreground",
                      )}
                      aria-label={emp.display_name}
                    >
                      <Bot className={cn("size-5 shrink-0", isSelected && "text-primary")} />
                      {!collapsed && (
                        <span className="min-w-0 truncate font-medium">
                          {emp.display_name}
                        </span>
                      )}
                    </button>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">{emp.display_name}</TooltipContent>
                  )}
                </Tooltip>
              </div>
            );
          })}
        </nav>

        <UserMenu
          email={email}
          initial={initial}
          onSignOut={handleSignOut}
          collapsed={collapsed}
        />
      </aside>
    </TooltipProvider>
  );
}

function WorkspaceSelector({
  email,
  initial,
  collapsed,
}: {
  email: string;
  initial: string;
  collapsed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const workspaceName = email ? `${email.split("@")[0]} Workspace` : "Votrix Workspace";

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
    <div ref={ref} className="relative mt-4 w-full">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "flex h-12 items-center rounded-lg border border-border bg-background text-foreground shadow-ambient transition-colors hover:border-input",
              collapsed ? "w-12 justify-center" : "w-full gap-3 px-3",
            )}
            aria-label="Workspace selector"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
              {initial}
            </span>
            {!collapsed && (
              <>
                <span className="min-w-0 flex-1 truncate text-left text-sm font-medium">
                  {workspaceName}
                </span>
                <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
              </>
            )}
          </button>
        </TooltipTrigger>
        {collapsed && (
          <TooltipContent side="right">{workspaceName}</TooltipContent>
        )}
      </Tooltip>

      {open && (
        <div
          className={cn(
            "absolute z-50 min-w-56 rounded-lg border border-border bg-background p-1 shadow-elevated animate-in fade-in zoom-in-95 duration-150",
            collapsed ? "left-14 top-0" : "left-0 top-14 w-full",
          )}
        >
          <div className="flex items-center gap-2 rounded-md px-3 py-2">
            <UsersRound className="size-4 text-muted-foreground" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {workspaceName}
              </p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarLink({
  href,
  icon: Icon,
  label,
  active,
  collapsed,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  collapsed: boolean;
}) {
  const content = (
    <Link
      href={href}
      className={cn(
        "flex h-11 items-center rounded-lg text-sm transition-colors",
        collapsed ? "w-11 justify-center" : "w-full justify-start gap-3 px-3",
        active
          ? "bg-background text-foreground shadow-ambient"
          : "text-muted-foreground hover:bg-background hover:text-foreground",
      )}
    >
      <Icon className={cn("size-5 shrink-0", active && "text-primary")} />
      {!collapsed && <span className="truncate font-medium">{label}</span>}
    </Link>
  );

  if (!collapsed) return content;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

function UserMenu({
  email,
  initial,
  onSignOut,
  collapsed,
}: {
  email: string;
  initial: string;
  onSignOut: () => void;
  collapsed: boolean;
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
    <div ref={ref} className="relative w-full">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-11 items-center rounded-lg text-sm text-muted-foreground transition-colors hover:bg-background hover:text-foreground",
          collapsed ? "w-11 justify-center" : "w-full justify-start gap-3 px-3",
          open && "bg-background text-foreground shadow-ambient",
        )}
        aria-label="User menu"
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
          {initial || <UserRound className="size-4" />}
        </span>
        {!collapsed && (
          <span className="min-w-0 flex-1 truncate text-left font-medium">
            {email || "Account"}
          </span>
        )}
      </button>

      {open && (
        <div
          className={cn(
            "absolute bottom-0 z-50 min-w-56 rounded-lg border border-border bg-background p-1 shadow-elevated animate-in fade-in zoom-in-95 duration-150",
            collapsed ? "left-14" : "left-full ml-2",
          )}
        >
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
