"use client";

import { useEffect, useState } from "react";

const MOCK = process.env.NEXT_PUBLIC_MOCK === "true";

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(!MOCK);

  useEffect(() => {
    if (!MOCK) return;
    import("@/mocks/browser")
      .then(({ worker }) => worker.start({ onUnhandledRequest: "bypass" }))
      .then(() => setReady(true));
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
