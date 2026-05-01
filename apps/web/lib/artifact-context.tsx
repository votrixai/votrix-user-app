"use client";

import { createContext, useCallback, useContext, useState } from "react";

export interface Artifact {
  code: string;
  language: string;
  title?: string;
}

interface ArtifactContextValue {
  artifact: Artifact | null;
  isOpen: boolean;
  openArtifact: (artifact: Artifact) => void;
  closeArtifact: () => void;
}

const ArtifactContext = createContext<ArtifactContextValue | null>(null);

export function ArtifactProvider({ children }: { children: React.ReactNode }) {
  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openArtifact = useCallback((a: Artifact) => {
    setArtifact(a);
    setIsOpen(true);
  }, []);

  const closeArtifact = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <ArtifactContext.Provider value={{ artifact, isOpen, openArtifact, closeArtifact }}>
      {children}
    </ArtifactContext.Provider>
  );
}

export function useArtifact() {
  const ctx = useContext(ArtifactContext);
  if (!ctx) throw new Error("useArtifact must be used inside ArtifactProvider");
  return ctx;
}
