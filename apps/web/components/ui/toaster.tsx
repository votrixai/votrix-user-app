"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useToast, type Toast } from "@/lib/toast-context";

const variantStyles: Record<Toast["variant"], string> = {
  error:
    "border-destructive/20 bg-background text-foreground",
  success:
    "border-[rgba(21,190,83,0.4)] bg-background text-foreground",
  info:
    "border-border bg-background text-foreground",
};

const dotStyles: Record<Toast["variant"], string> = {
  error: "bg-destructive",
  success: "bg-[#15be53]",
  info: "bg-primary",
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-start gap-2.5 rounded-md border px-3 py-2.5 text-sm shadow-deep transition-all duration-200 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      } ${variantStyles[toast.variant]}`}
    >
      <span
        className={`mt-1.5 size-1.5 shrink-0 rounded-full ${dotStyles[toast.variant]}`}
      />
      <span className="flex-1 leading-normal">{toast.message}</span>
      <button
        onClick={onDismiss}
        className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

export function Toaster() {
  const { toasts, dismiss } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || toasts.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-4 right-4 z-[100] flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>,
    document.body,
  );
}
