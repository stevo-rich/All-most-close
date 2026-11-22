import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { IconClose } from "./icons";

export type ToastKind = "info" | "success" | "error" | "warning" | "notification";

export type ToastOpts = {
  message: string;
  /** Deriv's dc-toast variants: neutral notification, blue info, red error. */
  kind?: ToastKind;
  /** Second line, used by the cashier to echo the amount moved. */
  detail?: string;
  action?: { label: string; onClick: () => void };
  duration?: number;
  /** Keep it on screen until the user closes it (network / status toasts). */
  sticky?: boolean;
};

type ToastFn = (t: ToastOpts | string) => void;
const ToastCtx = createContext<ToastFn>(() => {});
export const useToast = () => useContext(ToastCtx);

type Live = ToastOpts & { id: number; leaving?: boolean };
const MAX_TOASTS = 3;

const KIND_STYLE: Record<ToastKind, { bg: string; fg: string; accent: string; icon: ReactNode }> = {
  notification: {
    bg: "#33373f",
    fg: "#ffffff",
    accent: "rgba(255,255,255,.18)",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 3a6 6 0 0 0-6 6v4l-1.6 3.2h15.2L18 13V9a6 6 0 0 0-6-6ZM9.5 19a2.5 2.5 0 0 0 5 0" />
      </svg>
    ),
  },
  info: {
    bg: "#2196f3",
    fg: "#ffffff",
    accent: "rgba(255,255,255,.22)",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 7.6v.2" />
      </svg>
    ),
  },
  success: {
    bg: "#4bb4b3",
    fg: "#ffffff",
    accent: "rgba(255,255,255,.24)",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 12.5 9.5 17.5 19.5 7" />
      </svg>
    ),
  },
  error: {
    bg: "#ff444f",
    fg: "#ffffff",
    accent: "rgba(255,255,255,.24)",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M12 7.5v6M12 16.8v.2" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  warning: {
    bg: "#ffad3a",
    fg: "#3b2a06",
    accent: "rgba(0,0,0,.16)",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3.5 21 19H3l9-15.5ZM12 9.5v4M12 16.5v.2" />
      </svg>
    ),
  },
};

export function ToastProvider({ children, bottom = 96 }: { children: ReactNode; bottom?: number }) {
  const [toasts, setToasts] = useState<Live[]>([]);
  const timers = useRef<Record<number, number>>({});

  const dismiss = useCallback((id: number) => {
    window.clearTimeout(timers.current[id]);
    setToasts((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    // let the collapse animation finish before unmounting
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 240);
  }, []);

  const show = useCallback<ToastFn>(
    (t) => {
      const opts: ToastOpts = typeof t === "string" ? { message: t } : t;
      const id = Date.now() + Math.random();
      const next: Live = { ...opts, kind: opts.kind ?? "notification", id };
      setToasts((list) => [...list, next].slice(-MAX_TOASTS));
      if (!opts.sticky) {
        timers.current[id] = window.setTimeout(() => dismiss(id), opts.duration ?? 4500);
      }
    },
    [dismiss],
  );

  useEffect(() => {
    const t = timers.current;
    return () => Object.values(t).forEach((id) => window.clearTimeout(id));
  }, []);

  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className="pointer-events-none absolute inset-x-0 z-[60] flex justify-center px-3" style={{ bottom }}>
        <div className="toast-stack w-full">
          {toasts.map((t) => {
            const k = KIND_STYLE[t.kind ?? "notification"];
            return (
              <div
                key={t.id}
                className={`toast-item pointer-events-auto w-full ${t.leaving ? "toast-item--leaving" : ""} ${t.sticky ? "toast-item--sticky" : ""}`}
              >
                <div
                  className="flex items-start gap-2.5 rounded-[6px] px-3 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,.22)]"
                  style={{ background: k.bg, color: k.fg }}
                >
                  <span className="mt-[2px] shrink-0 opacity-90">{k.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-semibold leading-snug">{t.message}</span>
                    {t.detail && <span className="mt-0.5 block text-[9px] opacity-85">{t.detail}</span>}
                  </span>
                  {t.action && (
                    <button
                      className="shrink-0 text-[10px] font-bold underline underline-offset-2"
                      onClick={() => {
                        t.action!.onClick();
                        dismiss(t.id);
                      }}
                    >
                      {t.action.label}
                    </button>
                  )}
                  <button aria-label="Close" onClick={() => dismiss(t.id)} className="press shrink-0 opacity-80 hover:opacity-100">
                    <IconClose size={16} strokeWidth={2.4} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ToastCtx.Provider>
  );
}

export function Sheet({
  title,
  onClose,
  children,
  full,
}: {
  title?: string;
  onClose: () => void;
  children: ReactNode;
  full?: boolean;
}) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="anim-fade-in absolute inset-0 bg-black/45" onClick={onClose} />
      <div
        className={`relative flex flex-col rounded-t-[28px] bg-white text-[#181c25] shadow-2xl ${full ? "h-[92%]" : "max-h-[85%]"}`}
        style={{ animation: "sheet-up .38s cubic-bezier(.22,1,.36,1) both" }}
      >
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-black/15" />
        <div className="flex items-center justify-between px-5 pb-2 pt-3">
          <h3 className="text-[13.5px] font-bold">{title}</h3>
          <button onClick={onClose} className="press flex h-8 w-8 items-center justify-center rounded-full bg-black/5">
            <IconClose size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-6">{children}</div>
      </div>
    </div>
  );
}

export function useLoaded(ms = 650) {
  const [l, setL] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setL(true), ms);
    return () => window.clearTimeout(t);
  }, [ms]);
  return l;
}
