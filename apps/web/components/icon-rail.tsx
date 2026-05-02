"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { LayoutGrid, UserRound, Settings, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", icon: UserRound, label: "Employees", match: (p: string) => p !== "/marketplace" && !p.startsWith("/workspace") },
  { href: "/marketplace", icon: LayoutGrid, label: "Marketplace", match: (p: string) => p === "/marketplace" },
];

const UTILITY_ITEMS = [
  { href: "/workspace/settings", icon: Settings, label: "Settings" },
];

export function IconRail({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const initial = email ? email[0]!.toUpperCase() : "?";

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("mousedown", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <TooltipProvider delayDuration={200}>
      <aside className="flex h-full w-14 shrink-0 flex-col items-center bg-[#1A1917] py-3.5 z-20">
        {/* Logo — links to workspace selection */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/workspace"
              className="mb-7 flex size-8 items-center justify-center rounded-lg bg-white/15 font-display text-base font-bold italic text-white transition-colors hover:bg-white/25"
            >
              V
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Workspace</TooltipContent>
        </Tooltip>

        {/* Main navigation */}
        <nav className="flex flex-1 flex-col items-center gap-1">
          {NAV_ITEMS.map(({ href, icon: Icon, label, match }) => {
            const active = match(pathname);
            return (
              <RailItem key={href} href={href} icon={Icon} label={label} active={active} />
            );
          })}

          <div className="my-2 h-px w-6 bg-white/12" />

          {UTILITY_ITEMS.map(({ href, icon: Icon, label }) => (
            <RailItem key={href} href={href} icon={Icon} label={label} active={false} />
          ))}
        </nav>

        {/* User avatar with dropdown */}
        <div ref={menuRef} className="relative">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex size-[30px] items-center justify-center rounded-full bg-[#2D6A4F] text-[11px] font-semibold text-white transition-opacity hover:opacity-80"
                aria-label="User menu"
              >
                {initial}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{email || "Account"}</TooltipContent>
          </Tooltip>

          {menuOpen && (
            <div className="absolute bottom-0 left-10 z-50 min-w-52 overflow-hidden rounded-lg border border-[#2a2927] bg-[#232221] shadow-elevated animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2.5">
                <p className="text-xs text-white/40">Signed in as</p>
                <p className="truncate text-sm font-medium text-white/90">{email}</p>
              </div>
              <div className="h-px bg-white/10" />
              <button
                onClick={() => { setMenuOpen(false); handleSignOut(); }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-red-400 transition-colors hover:bg-white/5"
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}

function RailItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={cn(
            "relative flex size-10 items-center justify-center rounded-[10px] transition-all duration-150",
            active
              ? "bg-white/15 text-white"
              : "text-white/45 hover:bg-white/10 hover:text-white/80",
          )}
        >
          {active && (
            <span className="absolute -left-[8px] top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-white" />
          )}
          <Icon className="size-5" />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}
