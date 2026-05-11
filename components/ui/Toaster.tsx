"use client";

import { useEffect, useState } from "react";
import { subscribe } from "./useToast";
import { X, CheckCircle2, AlertCircle } from "lucide-react";

type Toast = {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
};

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsub = subscribe((t) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, t.duration ?? 4000);
    });
    return unsub;
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 card p-4 shadow-modal pointer-events-auto animate-fade-in ${
            t.variant === "destructive"
              ? "border-destructive/30 bg-destructive/5"
              : "border-success/30 bg-success/5"
          }`}
        >
          {t.variant === "destructive" ? (
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-primary">{t.title}</p>
            {t.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
            )}
          </div>
          <button
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            className="p-0.5 hover:bg-muted rounded transition-colors"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      ))}
    </div>
  );
}
