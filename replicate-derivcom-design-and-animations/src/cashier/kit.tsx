import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { IconChevronDown, IconClose } from "../icons";

/* ------------------------------------------------------------------ */
/* Shared cashier building blocks                                      */
/*                                                                     */
/* Modelled on Deriv's own cashier components: EmptyState pulls a big   */
/* centred icon + title + description + one action, InlineMessage is    */
/* the bordered note above forms, Field is the floating-label input     */
/* Deriv uses for amount fields.                                        */
/* ------------------------------------------------------------------ */

export function CashierScreen({
  title,
  onBack,
  onClose,
  right,
  children,
  footer,
  tone = "#181c25",
}: {
  title: string;
  onBack?: () => void;
  onClose?: () => void;
  right?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  tone?: string;
}) {
  return (
    <div className="page-push flex h-full flex-col bg-white">
      <header className="flex h-[56px] shrink-0 items-center gap-2 px-2" style={{ background: tone }}>
        <button
          onClick={onBack}
          aria-label="Back"
          className="press flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
          style={{ visibility: onBack ? "visible" : "hidden" }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 19 8 12l7-7" />
          </svg>
        </button>
        <h1 className="min-w-0 flex-1 truncate text-[13px] font-bold text-white">{title}</h1>
        {right}
        <button
          onClick={onClose}
          aria-label="Close"
          className="press flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
          style={{ visibility: onClose ? "visible" : "hidden" }}
        >
          <IconClose size={20} strokeWidth={2.2} />
        </button>
      </header>
      <div className="flex-1 overflow-y-auto">{children}</div>
      {footer && <div className="shrink-0 border-t border-[#eceef0] bg-white px-4 pb-4 pt-3">{footer}</div>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondary,
}: {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: { label: string; onClick: () => void; disabled?: boolean };
  secondary?: { label: string; onClick: () => void; disabled?: boolean };
}) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      {icon && <div className="anim-pop mb-5">{icon}</div>}
      <h2 className="anim-fade-up text-[13px] font-bold leading-snug text-[#181c25]">{title}</h2>
      {description && (
        <div className="anim-fade-up mt-2.5 max-w-[320px] text-[10.5px] leading-[1.5] text-[#5c6470]" style={{ animationDelay: "70ms" }}>
          {description}
        </div>
      )}
      {action && (
        <button
          onClick={action.onClick}
          disabled={action.disabled}
          className="press anim-fade-up relative mt-6 w-full max-w-[320px] overflow-hidden rounded-full bg-[#ff444f] py-3.5 text-[11px] font-bold text-white transition-colors hover:bg-[#ff5a64] disabled:opacity-50"
          style={{ animationDelay: "130ms" }}
        >
          {action.label}
        </button>
      )}
      {secondary && (
        <button
          onClick={secondary.onClick}
          disabled={secondary.disabled}
          className="press mt-3 text-[10.5px] font-semibold text-[#ff444f] disabled:text-[#9aa1aa]"
        >
          {secondary.label}
        </button>
      )}
    </div>
  );
}

export function InlineMessage({
  type = "info",
  title,
  children,
}: {
  type?: "info" | "warning" | "danger" | "success";
  title?: ReactNode;
  children: ReactNode;
}) {
  const tones = {
    info: { bar: "#2196f3", bg: "#eef6fe", text: "#1f4b6e" },
    warning: { bar: "#ffad3a", bg: "#fff6e8", text: "#7a5210" },
    danger: { bar: "#ff444f", bg: "#ffedee", text: "#8c1d25" },
    success: { bar: "#4bb4b3", bg: "#eaf7f6", text: "#0f5655" },
  }[type];
  return (
    <div className="anim-fade-up flex gap-2.5 rounded-[6px] p-3" style={{ background: tones.bg }}>
      <span className="mt-[3px] h-3 w-1 shrink-0 rounded-full" style={{ background: tones.bar }} />
      <div className="text-[10px] leading-[1.45]" style={{ color: tones.text }}>
        {title && <div className="font-bold">{title}</div>}
        {children}
      </div>
    </div>
  );
}

export function Field({
  label,
  value,
  onChange,
  suffix,
  hint,
  error,
  inputMode = "decimal",
  disabled,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: ReactNode;
  hint?: ReactNode;
  error?: string;
  inputMode?: "decimal" | "numeric" | "text";
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const [focus, setFocus] = useState(false);
  const lifted = focus || !!value;
  return (
    <div>
      <div
        className="relative rounded-[6px] border bg-white transition-colors duration-200"
        style={{ borderColor: error ? "#ff444f" : focus ? "#181c25" : "#d6d9dd" }}
      >
        <span
          className="pointer-events-none absolute left-3 origin-left bg-white px-1 transition-all duration-200"
          style={{
            top: lifted ? -7 : 14,
            fontSize: lifted ? 8 : 11,
            color: error ? "#ff444f" : focus ? "#181c25" : "#6c717b",
          }}
        >
          {label}
        </span>
        <div className="flex items-center">
          <input
            autoFocus={autoFocus}
            disabled={disabled}
            inputMode={inputMode}
            value={value}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ""))}
            className="h-[50px] w-full bg-transparent px-4 text-[12px] font-semibold text-[#181c25] outline-none disabled:text-[#9aa1aa]"
          />
          {suffix && <span className="shrink-0 pr-4 text-[10.5px] font-semibold text-[#6c717b]">{suffix}</span>}
        </div>
      </div>
      {error ? (
        <p className="mt-1.5 pl-1 text-[9.5px] text-[#ff444f]">{error}</p>
      ) : (
        hint && <div className="mt-1.5 pl-1 text-[9.5px] text-[#6c717b]">{hint}</div>
      )}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  loading,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="press relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-[#ff444f] py-3.5 text-[11px] font-bold text-white transition-colors hover:bg-[#ff5a64] disabled:cursor-not-allowed disabled:bg-[#e6e8ea] disabled:text-[#9aa1aa]"
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}

export function GhostButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="press w-full rounded-full border border-[#d6d9dd] py-3.5 text-[11px] font-bold text-[#181c25] transition-colors hover:bg-[#f5f5f5] disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function Spinner({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="anim-spin-loop" style={{ color: "currentColor" }}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.4" fill="none" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** Account dropdown used by Transfer (From / To), grouped like Deriv's list. */
export type AccountOption = {
  group: string;
  value: string;
  text: string;
  detail: string;
  balance: number;
  tone: "teal" | "amber" | "navy";
};

export function AccountSelect({
  label,
  selected,
  options,
  onPick,
  error,
}: {
  label: string;
  selected: AccountOption | null;
  options: AccountOption[];
  onPick: (o: AccountOption) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const groups = Array.from(new Set(options.map((o) => o.group)));
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={label}
        className="flex w-full items-center gap-3 rounded-[6px] border bg-white px-3 py-2.5 text-left transition-colors"
        style={{ borderColor: error ? "#ff444f" : open ? "#181c25" : "#d6d9dd" }}
      >
        <Pocket tone={selected?.tone ?? "navy"} />
        <span className="min-w-0 flex-1">
          <span className="block text-[8px] uppercase tracking-wide text-[#6c717b]">{label}</span>
          <span className="block truncate text-[11px] font-semibold text-[#181c25]">
            {selected ? selected.text : "Select an account"}
          </span>
        </span>
        {selected && (
          <span className="shrink-0 text-[10px] font-semibold tabular-nums text-[#5c6470]">{selected.balance.toFixed(2)}</span>
        )}
        <IconChevronDown size={16} className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-[280px] overflow-y-auto rounded-[8px] border border-[#e6e8ea] bg-white py-1 shadow-[0_12px_32px_rgba(0,0,0,.18)]"
            style={{ animation: "step-in .18s ease-out both" }}
          >
            {groups.map((g) => (
              <div key={g}>
                <div className="px-3 pb-1 pt-2 text-[8px] font-bold uppercase tracking-wide text-[#9aa1aa]">{g}</div>
                {options
                  .filter((o) => o.group === g)
                  .map((o) => {
                    const active = o.value === selected?.value;
                    return (
                      <button
                        key={o.value}
                        onClick={() => {
                          onPick(o);
                          setOpen(false);
                        }}
                        className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[#f5f5f5] ${active ? "bg-[#f7f8f9]" : ""}`}
                      >
                        <Pocket tone={o.tone} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[11px] font-semibold text-[#181c25]">{o.text}</span>
                          <span className="block truncate text-[9px] text-[#6c717b]">{o.detail}</span>
                        </span>
                        <span className="shrink-0 text-[10px] font-semibold tabular-nums text-[#5c6470]">{o.balance.toFixed(2)}</span>
                      </button>
                    );
                  })}
              </div>
            ))}
          </div>
        </>
      )}
      {error && <p className="mt-1.5 pl-1 text-[9.5px] text-[#ff444f]">{error}</p>}
    </div>
  );
}

function Pocket({ tone }: { tone: "teal" | "amber" | "navy" }) {
  const bg = { teal: "#4bb4b3", amber: "#ffad3a", navy: "#181c25" }[tone];
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: bg }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2.5" y="6" width="19" height="13" rx="2.5" />
        <path d="M2.5 10.5h19M16 15h2.5" />
      </svg>
    </span>
  );
}

/** Orange / green / red status pill used on withdrawal receipts. */
export function StatusPill({ status }: { status: "pending" | "processed" | "rejected" }) {
  const map = {
    pending: { label: "In review", color: "#b8860b", bg: "#fff6e8", dot: "#ffad3a" },
    processed: { label: "Processed", color: "#0f5655", bg: "#eaf7f6", dot: "#4bb4b3" },
    rejected: { label: "Rejected", color: "#8c1d25", bg: "#ffedee", dot: "#ff444f" },
  }[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-bold"
      style={{ background: map.bg, color: map.color }}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${status === "pending" ? "status-dot--pending" : ""}`}
        style={{ background: map.dot }}
      />
      {map.label}
    </span>
  );
}

/**
 * Countdown for the "Resend email in 59s" state Deriv shows after it sends
 * a withdrawal verification link.
 */
export function useCountdown(from = 60) {
  const [left, setLeft] = useState(from);
  const [running, setRunning] = useState(false);
  const t = useRef<number | undefined>(undefined);

  const start = useCallback(() => {
    setLeft(from);
    setRunning(true);
  }, [from]);

  useEffect(() => {
    if (!running) return;
    t.current = window.setInterval(() => {
      setLeft((n) => {
        if (n <= 1) {
          window.clearInterval(t.current);
          setRunning(false);
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    return () => window.clearInterval(t.current);
  }, [running]);

  return { left, running, start };
}
