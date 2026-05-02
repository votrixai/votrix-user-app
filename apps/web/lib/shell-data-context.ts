"use client";

import { createContext, useContext } from "react";
import type { AgentEmployeeResponse } from "@votrix/shared";

type ShellDataContextType = {
  employees: AgentEmployeeResponse[];
  activeBlueprintId: string | null;
};

const ShellDataContext = createContext<ShellDataContextType>({
  employees: [],
  activeBlueprintId: null,
});

export const ShellDataProvider = ShellDataContext.Provider;
export const useShellData = () => useContext(ShellDataContext);
