"use client";

import { createContext, useContext } from "react";

type EmployeeRefreshContextType = {
  refreshEmployees: (selectedBlueprintId?: string) => Promise<void>;
};

const EmployeeRefreshContext = createContext<EmployeeRefreshContextType>({
  refreshEmployees: async () => {},
});

export const EmployeeRefreshProvider = EmployeeRefreshContext.Provider;
export const useEmployeeRefresh = () => useContext(EmployeeRefreshContext);
