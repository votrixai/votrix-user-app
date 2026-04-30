"use client";

import { createContext, useContext } from "react";

type SessionRefreshContextType = {
  refreshSessions: () => Promise<void>;
};

const SessionRefreshContext = createContext<SessionRefreshContextType>({
  refreshSessions: async () => {},
});

export const SessionRefreshProvider = SessionRefreshContext.Provider;
export const useSessionRefresh = () => useContext(SessionRefreshContext);
