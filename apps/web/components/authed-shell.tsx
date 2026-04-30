"use client";

import { useEffect, useState } from "react";
import { EmployeePanelProvider } from "@/lib/employee-panel-context";
import { EmployeeDetailPanel } from "@/components/employee-detail-panel";
import Sidebar from "@/components/sidebar";
import type { SessionResponse } from "@votrix/shared";

export function AuthedShell({
  email,
  userId,
  children,
}: {
  email: string;
  userId: string;
  children: React.ReactNode;
}) {
  const [sessions, setSessions] = useState<SessionResponse[]>([]);

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setSessions(data))
      .catch(() => {});
  }, []);

  return (
    <EmployeePanelProvider>
      <div className="flex h-dvh">
        <Sidebar email={email} userId={userId} />
        <div className="flex-1 overflow-hidden">{children}</div>
        <EmployeeDetailPanel sessions={sessions} />
      </div>
    </EmployeePanelProvider>
  );
}
