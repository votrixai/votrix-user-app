import { createClient } from "@/lib/supabase/server";
import { Building2, Users, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";

export default async function WorkspacePage() {
  let email = "";
  let userId = "";

  if (process.env.NEXT_PUBLIC_MOCK !== "true") {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    email = user?.email ?? "";
    userId = user?.id ?? "";
  } else {
    email = "mock@votrix.ai";
    userId = "mock-user-1";
  }

  const workspaceName = email ? `${email.split("@")[0]}'s Workspace` : "My Workspace";
  const initial = email ? email[0]!.toUpperCase() : "W";

  return (
    <main className="h-full overflow-y-auto">
      {/* Header */}
      <div className="border-b border-border bg-card px-8 pt-10 pb-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl font-medium italic tracking-tight text-foreground">
            Workspace
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Manage your workspace settings and switch between workspaces.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8">
        <div className="mx-auto max-w-2xl space-y-5">
          {/* Current workspace card */}
          <section>
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.7px] text-muted-foreground">
              Current Workspace
            </h2>
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-ambient">
              <div className="flex items-center gap-4 p-5">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-lg font-semibold text-primary-foreground">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{workspaceName}</p>
                  <p className="text-sm text-muted-foreground">{email}</p>
                </div>
                <span className="shrink-0 rounded-full bg-brand-light px-2.5 py-1 text-[11px] font-semibold text-brand">
                  Active
                </span>
              </div>
              <div className="border-t border-border bg-muted/30 px-5 py-3">
                <div className="flex items-center gap-6 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="size-3.5" />
                    <span>Personal workspace</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="size-3.5" />
                    <span>1 member</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick actions */}
          <section>
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.7px] text-muted-foreground">
              Quick Actions
            </h2>
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-ambient divide-y divide-border">
              <Link
                href="/marketplace"
                className="flex items-center gap-3 px-5 py-3.5 text-sm transition-colors hover:bg-muted/40"
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                  <Plus className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">Hire an employee</p>
                  <p className="text-xs text-muted-foreground">Browse the marketplace for AI agents</p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground/50" />
              </Link>
              <Link
                href="/"
                className="flex items-center gap-3 px-5 py-3.5 text-sm transition-colors hover:bg-muted/40"
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                  <Users className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">View employees</p>
                  <p className="text-xs text-muted-foreground">Chat with your hired AI employees</p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground/50" />
              </Link>
            </div>
          </section>

          {/* Future: multiple workspaces */}
          <section>
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.7px] text-muted-foreground">
              Other Workspaces
            </h2>
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card px-8 py-10 text-center">
              <Building2 className="size-8 text-muted-foreground/30" />
              <p className="text-sm font-medium text-muted-foreground">No other workspaces</p>
              <p className="text-xs text-muted-foreground/70">
                Team workspaces are coming soon.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
