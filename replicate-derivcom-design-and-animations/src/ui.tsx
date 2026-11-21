import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { IconClose } from "./icons";

export type ToastOpts = {
  message: string;
  action?: { label: string; onClick: () => void };
  duration?: number;
};

type ToastFn = (t: ToastOpts | string) => void;
const ToastCtx = createContext<ToastFn>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children, bottom = 96 }: { children: ReactNode; bottom?: number }) {
  const [toast, setToast] = useState<(ToastOpts & { id: number }) | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const show = useCallback<ToastFn>((t) => {
    const opts = typeof t === "string" ? { message: t } : t;
    window.clearTimeout(timer.current);
    setToast({ ...opts, id: Date.now() });
    timer.current = window.setTimeout(() => setToast(null), opts.duration ?? 4500);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <ToastCtx.Provider value={show}>
      {children}
      {toast && (
        <div
          key={toast.id}
          className="pointer-events-none absolute inset-x-0 z-[60] flex justify-center px-2"
          style={{ bottom, animation: "toast-in .35s cubic-bezier(.22,1,.36,1) both" }}
        >
          <div className="pointer-events-auto flex w-full items-center gap-3 rounded-2xl bg-black px-4 py-3.5 text-[14px] text-white shadow-xl">
            <span className="flex-1 leading-snug">{toast.message}</span>
            {toast.action && (
              <button
                className="font-bold underline underline-offset-2"
                onClick={() => {
                  toast.action!.onClick();
                  setToast(null);
                }}
              >
                {toast.action.label}
              </button>
            )}
            <button aria-label="Close" onClick={() => setToast(null)} className="press">
              <IconClose size={20} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      )}
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
          <h3 className="text-[18px] font-bold">{title}</h3>
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
