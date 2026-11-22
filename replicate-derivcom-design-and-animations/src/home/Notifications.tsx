import { useState, type ReactNode } from "react";
import { IconClose } from "../icons";

/**
 * Notification centre. Deriv groups these into promos, announcements and
 * system notices, with an unread dot, a category chip and a per-item dismiss —
 * the same structure is mirrored here.
 */
export type NotifKind = "announcement" | "promo" | "system" | "security";

export type Notif = {
  id: string;
  kind: NotifKind;
  title: string;
  body: string;
  time: string;
  read: boolean;
  action?: string;
};

export const SEED_NOTIFICATIONS: Notif[] = [
  {
    id: "n1",
    kind: "announcement",
    title: "ANT has entered the chart",
    body: "Trade Anthropic CFDs on MT5, cTrader and TradingView.",
    time: "2m ago",
    read: false,
    action: "Explore",
  },
  {
    id: "n2",
    kind: "promo",
    title: "Volatility 250 (1s) is here",
    body: "The fastest index on Deriv is now available in your Options account.",
    time: "1h ago",
    read: false,
    action: "Trade now",
  },
  {
    id: "n3",
    kind: "system",
    title: "Withdrawal processed",
    body: "Your withdrawal of 50.00 USD has been sent to M-Pesa.",
    time: "Yesterday",
    read: true,
  },
  {
    id: "n4",
    kind: "security",
    title: "New login to your account",
    body: "We noticed a sign-in from Nairobi, Kenya. If this wasn't you, secure your account.",
    time: "2 days ago",
    read: true,
  },
];

const KIND: Record<NotifKind, { label: string; tint: string; bg: string; icon: ReactNode }> = {
  announcement: {
    label: "Announcement",
    tint: "#2196f3",
    bg: "#eef6fe",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10v4h3l6 4V6L6 10H3ZM17 9a4 4 0 0 1 0 6" />
      </svg>
    ),
  },
  promo: {
    label: "Promo",
    tint: "#ff444f",
    bg: "#ffedee",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m4 12 8-8h8v8l-8 8-8-8Z" />
        <circle cx="16" cy="8" r="1.4" fill="currentColor" />
      </svg>
    ),
  },
  system: {
    label: "System",
    tint: "#4bb4b3",
    bg: "#eaf7f6",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4.5M12 16.2v.2" />
      </svg>
    ),
  },
  security: {
    label: "Security",
    tint: "#b8860b",
    bg: "#fff6e8",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3 20 6v6c0 4.5-3.4 7.8-8 9-4.6-1.2-8-4.5-8-9V6l8-3Z" />
        <path d="M9 12.5 11 15l4-4.5" />
      </svg>
    ),
  },
};

const FILTERS: { id: "all" | NotifKind; label: string }[] = [
  { id: "all", label: "All" },
  { id: "announcement", label: "Announcements" },
  { id: "promo", label: "Promos" },
  { id: "system", label: "System" },
  { id: "security", label: "Security" },
];

export function NotificationsPanel({
  items,
  onRead,
  onDismiss,
  onMarkAll,
  onAction,
}: {
  items: Notif[];
  onRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onMarkAll: () => void;
  onAction?: (n: Notif) => void;
}) {
  const [filter, setFilter] = useState<"all" | NotifKind>("all");
  const unread = items.filter((n) => !n.read).length;
  const shown = items.filter((n) => filter === "all" || n.kind === filter);

  return (
    <div>
      <div className="sticky top-0 z-10 bg-white pb-2">
        <div className="hide-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
                filter === f.id ? "border-[#181c25] bg-[#181c25] text-white" : "border-[#d6d9dd] text-[#5c6470]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {unread > 0 && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[#6c717b]">{unread} unread</span>
            <button onClick={onMarkAll} className="text-[12.5px] font-bold text-[#ff444f]">
              Mark all as read
            </button>
          </div>
        )}
      </div>

      {shown.length === 0 ? (
        <div className="flex flex-col items-center py-14 text-[#8a8f99]">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M12 3a6 6 0 0 0-6 6v4l-1.6 3.2h15.2L18 13V9a6 6 0 0 0-6-6ZM9.5 19a2.5 2.5 0 0 0 5 0" />
          </svg>
          <p className="mt-2 text-[14px]">You're all caught up</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {shown.map((n, i) => {
            const k = KIND[n.kind];
            return (
              <li
                key={n.id}
                className="step-in relative rounded-[10px] border border-[#eceef0] p-3.5"
                style={{ animationDelay: `${i * 55}ms`, background: n.read ? "#fff" : "#fafbfb" }}
                onClick={() => onRead(n.id)}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-[2px] flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: k.bg, color: k.tint }}>
                    {k.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full px-1.5 py-[1px] text-[10px] font-bold uppercase tracking-wide" style={{ background: k.bg, color: k.tint }}>
                        {k.label}
                      </span>
                      {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-[#ff444f]" />}
                      <span className="ml-auto shrink-0 text-[11px] text-[#9aa1aa]">{n.time}</span>
                    </div>
                    <div className="mt-1.5 text-[14px] font-bold leading-snug text-[#181c25]">{n.title}</div>
                    <div className="mt-0.5 text-[13px] leading-snug text-[#5c6470]">{n.body}</div>
                    {n.action && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAction?.(n);
                        }}
                        className="mt-2 rounded-full bg-[#181c25] px-3 py-1.5 text-[12px] font-bold text-white"
                      >
                        {n.action}
                      </button>
                    )}
                  </div>
                  <button
                    aria-label="Dismiss"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismiss(n.id);
                    }}
                    className="press shrink-0 text-[#9aa1aa] hover:text-[#181c25]"
                  >
                    <IconClose size={16} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
