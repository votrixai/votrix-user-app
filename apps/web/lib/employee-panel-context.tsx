"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { AgentEmployeeResponse } from "@votrix/shared";

interface EmployeePanelContextValue {
  selectedEmployee: AgentEmployeeResponse | null;
  openPanel: (employee: AgentEmployeeResponse) => void;
  closePanel: () => void;
}

const EmployeePanelContext = createContext<EmployeePanelContextValue>({
  selectedEmployee: null,
  openPanel: () => {},
  closePanel: () => {},
});

export function EmployeePanelProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedEmployee, setSelectedEmployee] =
    useState<AgentEmployeeResponse | null>(null);

  const openPanel = useCallback((employee: AgentEmployeeResponse) => {
    setSelectedEmployee(employee);
  }, []);

  const closePanel = useCallback(() => {
    setSelectedEmployee(null);
  }, []);

  const value = useMemo(
    () => ({ selectedEmployee, openPanel, closePanel }),
    [selectedEmployee, openPanel, closePanel],
  );

  return (
    <EmployeePanelContext.Provider value={value}>
      {children}
    </EmployeePanelContext.Provider>
  );
}

export function useEmployeePanel() {
  return useContext(EmployeePanelContext);
}
