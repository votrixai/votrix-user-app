"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { EmployeePanelProvider } from "@/lib/employee-panel-context";
import { EmployeeRefreshProvider } from "@/lib/employee-refresh-context";
import { ToastProvider } from "@/lib/toast-context";
import {
  CommandPaletteContext,
  useCommandPaletteState,
} from "@/lib/use-command-palette";
import { Toaster } from "@/components/ui/toaster";
import { CommandPalette } from "@/components/command-palette";
import { EmployeeDetailPanel } from "@/components/employee-detail-panel";
import { IconRail } from "@/components/icon-rail";
import { EmployeeRail } from "@/components/employee-rail";
import { EmployeeHeader } from "@/components/employee-header";
import { HistoryPanel } from "@/components/history-panel";
import { InfoPanel } from "@/components/info-panel";
import { EmployeeHome } from "@/components/employee-home";
import { ShellDataProvider } from "@/lib/shell-data-context";
import type {
  AgentEmployeeResponse,
  SessionDetailResponse,
  SessionResponse,
} from "@votrix/shared";
import type { RightPanelType } from "@/components/employee-header";

export function AuthedShell({
  email,
  children,
}: {
  email: string;
  userId: string;
  children: React.ReactNode;
}) {
  const params = useParams<{ sessionId?: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const activeSessionId = params?.sessionId;

  const [employees, setEmployees] = useState<AgentEmployeeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [activeBlueprintId, setActiveBlueprintId] = useState<string | null>(null);
  const [activeSessionTitle, setActiveSessionTitle] = useState<string | null>(null);
  const [rightPanel, setRightPanel] = useState<RightPanelType>(null);

  const cmdPalette = useCommandPaletteState();
  const isMarketplace = pathname === "/marketplace";

  useEffect(() => {
    fetch("/api/employees")
      .then((r) => (r.ok ? r.json() : []))
      .then((emps: AgentEmployeeResponse[]) => setEmployees(emps))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Initial employee selection — runs once after employees load
  const hasAutoSelected = useRef(false);
  useEffect(() => {
    if (employees.length === 0 || hasAutoSelected.current) return;
    hasAutoSelected.current = true;

    const selectDefault = () => {
      const sorted = [...employees].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setSelectedEmployeeId(sorted[0]?.id ?? null);
    };

    if (activeSessionId) {
      fetch(`/api/sessions/${activeSessionId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((session: SessionDetailResponse | null) => {
          if (session?.agent_blueprint_id) {
            setActiveBlueprintId(session.agent_blueprint_id);
            setActiveSessionTitle(session.title ?? null);
            const emp = employees.find(
              (e) => e.agent_blueprint_id === session.agent_blueprint_id,
            );
            if (emp) { setSelectedEmployeeId(emp.id); return; }
          }
          selectDefault();
        })
        .catch(selectDefault);
      return;
    }

    selectDefault();
  }, [employees, activeSessionId]);

  // Sync employee selection when URL changes to a different session
  const prevSessionId = useRef(activeSessionId);
  useEffect(() => {
    if (activeSessionId === prevSessionId.current) return;
    prevSessionId.current = activeSessionId;

    if (!activeSessionId) {
      setActiveBlueprintId(null);
      setActiveSessionTitle(null);
      return;
    }
    if (employees.length === 0) return;

    fetch(`/api/sessions/${activeSessionId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((session: SessionDetailResponse | null) => {
        if (session?.agent_blueprint_id) {
          setActiveBlueprintId(session.agent_blueprint_id);
          setActiveSessionTitle(session.title ?? null);
          const emp = employees.find(
            (e) => e.agent_blueprint_id === session.agent_blueprint_id,
          );
          if (emp) setSelectedEmployeeId(emp.id);
        }
      })
      .catch(() => {});
  }, [activeSessionId, employees]);

  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === selectedEmployeeId) ?? null,
    [employees, selectedEmployeeId],
  );

  const refreshEmployees = useCallback(async (selectedBlueprintId?: string) => {
    try {
      const res = await fetch("/api/employees");
      if (!res.ok) return;
      const nextEmployees = (await res.json()) as AgentEmployeeResponse[];
      setEmployees(nextEmployees);

      if (selectedBlueprintId) {
        const hired = nextEmployees.find(
          (e) => e.agent_blueprint_id === selectedBlueprintId,
        );
        if (hired) setSelectedEmployeeId(hired.id);
        return;
      }
      setSelectedEmployeeId((prev) => {
        if (prev && nextEmployees.some((e) => e.id === prev)) return prev;
        return nextEmployees[0]?.id ?? null;
      });
    } catch {}
  }, []);

  const handleSelectEmployee = useCallback(
    (id: string) => {
      if (id === selectedEmployeeId) return;

      const nextEmployee = employees.find((e) => e.id === id);
      setSelectedEmployeeId(id);

      if (!nextEmployee || !pathname.startsWith("/chat/")) return;

      const sessionIdInUrl = activeSessionId;
      void (async () => {
        if (sessionIdInUrl) {
          try {
            const r = await fetch(`/api/sessions/${sessionIdInUrl}`);
            if (r.ok) {
              const session = (await r.json()) as SessionDetailResponse;
              if (session.agent_blueprint_id === nextEmployee.agent_blueprint_id) {
                return;
              }
            }
          } catch {
            /* fall through to navigate */
          }
        }

        try {
          const listRes = await fetch("/api/sessions");
          if (!listRes.ok) {
            router.push("/");
            return;
          }
          const all = (await listRes.json()) as SessionResponse[];
          const forAgent = all
            .filter((s) => s.agent_blueprint_id === nextEmployee.agent_blueprint_id)
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
            );
          const latest = forAgent[0];
          if (latest) router.push(`/chat/${latest.id}`);
          else router.push("/");
        } catch {
          router.push("/");
        }
      })();
    },
    [activeSessionId, employees, pathname, router, selectedEmployeeId],
  );

  const employeeRefreshValue = useMemo(() => ({ refreshEmployees }), [refreshEmployees]);

  const showHeader = !isMarketplace && selectedEmployee !== null;
  const showHistoryPanel = rightPanel === "history" && selectedEmployee !== null;
  const showInfoPanel = rightPanel === "info" && selectedEmployee !== null;

  const shellData = useMemo(
    () => ({ employees, activeBlueprintId }),
    [employees, activeBlueprintId],
  );

  return (
    <ToastProvider>
      <CommandPaletteContext.Provider value={cmdPalette}>
        <EmployeeRefreshProvider value={employeeRefreshValue}>
          <ShellDataProvider value={shellData}>
            <EmployeePanelProvider>
              <div className="flex h-dvh overflow-hidden">
                <IconRail email={email} />

                <EmployeeRail
                  email={email}
                  employees={employees}
                  selectedEmployeeId={selectedEmployeeId}
                  onSelectEmployee={handleSelectEmployee}
                  loading={loading}
                />

                <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                  {showHeader && (
                    <EmployeeHeader
                      employee={selectedEmployee}
                      sessionTitle={activeSessionTitle}
                      rightPanel={rightPanel}
                      onSetRightPanel={setRightPanel}
                    />
                  )}

                  <div className="flex min-h-0 flex-1 overflow-hidden">
                    <div
                      className="flex-1 overflow-hidden"
                      onClick={rightPanel ? () => setRightPanel(null) : undefined}
                    >
                      {pathname === "/" ? (
                        <EmployeeHome employee={selectedEmployee} />
                      ) : (
                        children
                      )}
                    </div>

                    {showHistoryPanel && (
                      <HistoryPanel
                        employee={selectedEmployee}
                        onClose={() => setRightPanel(null)}
                      />
                    )}

                    {showInfoPanel && (
                      <InfoPanel
                        employee={selectedEmployee}
                        onClose={() => setRightPanel(null)}
                      />
                    )}
                  </div>
                </div>

                <EmployeeDetailPanel />
              </div>
            </EmployeePanelProvider>
          </ShellDataProvider>
        </EmployeeRefreshProvider>
        <CommandPalette />
        <Toaster />
      </CommandPaletteContext.Provider>
    </ToastProvider>
  );
}
