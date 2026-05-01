"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { EmployeePanelProvider } from "@/lib/employee-panel-context";
import { SessionRefreshProvider } from "@/lib/session-refresh-context";
import { ToastProvider } from "@/lib/toast-context";
import {
  CommandPaletteContext,
  useCommandPaletteState,
} from "@/lib/use-command-palette";
import { PanelLeftOpen } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { CommandPalette } from "@/components/command-palette";
import { EmployeeDetailPanel } from "@/components/employee-detail-panel";
import { EmployeeRail } from "@/components/employee-rail";
import { SessionPanel } from "@/components/session-panel";
import type { AgentEmployeeResponse, SessionResponse } from "@votrix/shared";

const PANEL_COLLAPSED_KEY = "votrix-session-panel";

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
  const activeSessionId = params?.sessionId;

  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [employees, setEmployees] = useState<AgentEmployeeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  const cmdPalette = useCommandPaletteState();

  useEffect(() => {
    try {
      setPanelCollapsed(localStorage.getItem(PANEL_COLLAPSED_KEY) === "true");
    } catch {}

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

  // Initial employee selection — runs once when data loads
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
        if (emp) {
          setSelectedEmployeeId(emp.id);
          return;
        }
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

  const sessionRefreshValue = useMemo(
    () => ({ refreshSessions }),
    [refreshSessions],
  );

  const togglePanelCollapsed = useCallback(() => {
    setPanelCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(PANEL_COLLAPSED_KEY, String(next)); } catch {}
      return next;
    });
  }, []);

  const showSessionPanel = employees.length > 0 && !panelCollapsed;

  return (
    <ToastProvider>
      <CommandPaletteContext.Provider value={cmdPalette}>
        <SessionRefreshProvider value={sessionRefreshValue}>
          <EmployeePanelProvider>
            <div className="flex h-dvh overflow-hidden">
              {/* Employee rail */}
              <EmployeeRail
                email={email}
                employees={employees}
                selectedEmployeeId={selectedEmployeeId}
                onSelectEmployee={setSelectedEmployeeId}
                loading={loading}
              />

              {/* Session panel */}
              {showSessionPanel && (
                <SessionPanel
                  employee={selectedEmployee}
                  sessions={sessions}
                  onSessionsChange={setSessions}
                  onCollapse={togglePanelCollapsed}
                />
              )}

              {/* Expand session panel toggle */}
              {employees.length > 0 && panelCollapsed && (
                <button
                  onClick={togglePanelCollapsed}
                  className="flex h-full w-6 shrink-0 items-center justify-center border-r border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Expand session panel"
                >
                  <PanelLeftOpen className="size-3.5" />
                </button>
              )}

              {/* Main content */}
              <div className="flex-1 overflow-hidden">{children}</div>

              <EmployeeDetailPanel sessions={sessions} />
            </div>
          </EmployeePanelProvider>
        </SessionRefreshProvider>
        <CommandPalette employees={employees} sessions={sessions} />
        <Toaster />
      </CommandPaletteContext.Provider>
    </ToastProvider>
  );
}
