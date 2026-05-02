"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { EmployeePanelProvider } from "@/lib/employee-panel-context";
import { EmployeeRefreshProvider } from "@/lib/employee-refresh-context";
import { SessionRefreshProvider } from "@/lib/session-refresh-context";
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
import type { AgentEmployeeResponse, SessionResponse } from "@votrix/shared";
import type { RightPanelType } from "@/components/employee-header";

export function AuthedShell({
  email,
  userId,
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

  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [employees, setEmployees] = useState<AgentEmployeeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [rightPanel, setRightPanel] = useState<RightPanelType>(null);

  const cmdPalette = useCommandPaletteState();

  const isMarketplace = pathname === "/marketplace";

  useEffect(() => {
    Promise.all([
      fetch("/api/sessions").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/employees").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([sess, emps]) => {
        setSessions(sess);
        setEmployees(emps);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Initial employee selection
  const hasAutoSelected = useRef(false);
  useEffect(() => {
    if (employees.length === 0 || hasAutoSelected.current) return;
    hasAutoSelected.current = true;

    if (activeSessionId) {
      const session = sessions.find((s) => s.id === activeSessionId);
      if (session?.agent_blueprint_id) {
        const emp = employees.find(
          (e) => e.agent_blueprint_id === session.agent_blueprint_id,
        );
        if (emp) { setSelectedEmployeeId(emp.id); return; }
      }
    }

    const sorted = [...employees].sort((a, b) => {
      const aLatest = sessions
        .filter((s) => s.agent_blueprint_id === a.agent_blueprint_id)
        .sort((x, y) => new Date(y.created_at).getTime() - new Date(x.created_at).getTime())[0];
      const bLatest = sessions
        .filter((s) => s.agent_blueprint_id === b.agent_blueprint_id)
        .sort((x, y) => new Date(y.created_at).getTime() - new Date(x.created_at).getTime())[0];
      const aTime = aLatest ? new Date(aLatest.created_at).getTime() : new Date(a.created_at).getTime();
      const bTime = bLatest ? new Date(bLatest.created_at).getTime() : new Date(b.created_at).getTime();
      return bTime - aTime;
    });
    setSelectedEmployeeId(sorted[0]?.id ?? null);
  }, [employees, sessions, activeSessionId]);

  // Sync employee selection when URL changes to a different session
  const prevSessionId = useRef(activeSessionId);
  useEffect(() => {
    if (activeSessionId === prevSessionId.current) return;
    prevSessionId.current = activeSessionId;
    if (!activeSessionId || employees.length === 0) return;

    const session = sessions.find((s) => s.id === activeSessionId);
    if (session?.agent_blueprint_id) {
      const emp = employees.find(
        (e) => e.agent_blueprint_id === session.agent_blueprint_id,
      );
      if (emp) setSelectedEmployeeId(emp.id);
    }
  }, [activeSessionId, employees, sessions]);

  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === selectedEmployeeId) ?? null,
    [employees, selectedEmployeeId],
  );

  const refreshSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/sessions");
      if (res.ok) setSessions(await res.json());
    } catch {}
  }, []);

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

  const handleSelectEmployee = useCallback((id: string) => {
    setSelectedEmployeeId(id);
    if (pathname === "/") {
      const emp = employees.find((e) => e.id === id);
      if (!emp) return;
      fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_slug: emp.slug }),
      }).then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        router.push(`/c/${data.id}`);
        refreshSessions();
      }).catch(() => {});
    }
  }, [employees, pathname, refreshSessions, router]);

  const sessionRefreshValue = useMemo(() => ({ refreshSessions }), [refreshSessions]);
  const employeeRefreshValue = useMemo(() => ({ refreshEmployees }), [refreshEmployees]);

  const activeSessionTitle = activeSessionId
    ? (sessions.find((s) => s.id === activeSessionId)?.title ?? null)
    : null;

  const showHeader = !isMarketplace && selectedEmployee !== null;
  const showHistoryPanel = rightPanel === "history" && selectedEmployee !== null;
  const showInfoPanel = rightPanel === "info" && selectedEmployee !== null;

  return (
    <ToastProvider>
      <CommandPaletteContext.Provider value={cmdPalette}>
        <SessionRefreshProvider value={sessionRefreshValue}>
          <EmployeeRefreshProvider value={employeeRefreshValue}>
            <EmployeePanelProvider>
              <div className="flex h-dvh overflow-hidden">
                {/* Dark icon rail */}
                <IconRail email={email} />

                {/* Context-sensitive sidebar */}
                <EmployeeRail
                  email={email}
                  employees={employees}
                  selectedEmployeeId={selectedEmployeeId}
                  onSelectEmployee={handleSelectEmployee}
                  loading={loading}
                />

                {/* Main column */}
                <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                  {/* Employee header (workspace only) */}
                  {showHeader && (
                    <EmployeeHeader
                      employee={selectedEmployee}
                      sessionTitle={activeSessionTitle}
                      rightPanel={rightPanel}
                      onSetRightPanel={setRightPanel}
                    />
                  )}

                  {/* Page content + optional right panel */}
                  <div className="flex min-h-0 flex-1 overflow-hidden">
                    {/* Main — clicking here closes any open right panel */}
                    <div
                      className="flex-1 overflow-hidden"
                      onClick={rightPanel ? () => setRightPanel(null) : undefined}
                    >
                      {children}
                    </div>

                    {showHistoryPanel && (
                      <HistoryPanel
                        employee={selectedEmployee}
                        sessions={sessions}
                        onClose={() => setRightPanel(null)}
                      />
                    )}

                    {showInfoPanel && (
                      <InfoPanel
                        employee={selectedEmployee}
                        sessions={sessions}
                        onClose={() => setRightPanel(null)}
                      />
                    )}
                  </div>
                </div>

                <EmployeeDetailPanel sessions={sessions} />
              </div>
            </EmployeePanelProvider>
          </EmployeeRefreshProvider>
        </SessionRefreshProvider>
        <CommandPalette employees={employees} sessions={sessions} />
        <Toaster />
      </CommandPaletteContext.Provider>
    </ToastProvider>
  );
}
