import { fmtUsd, useProfile } from "../account";
import { CashierScreen } from "./kit";

/**
 * Cashier home. Real Deriv puts Deposit / Withdrawal / Transfer / Payment agent
 * / Transactions behind one entry point, with the balance pinned at the top.
 */
export type CashierRoute = null | "deposit" | "withdraw" | "transfer" | "trader" | "hub";

const ITEMS = [
  {
    id: "deposit" as const,
    title: "Deposit",
    sub: "Add funds with a local method or crypto",
    tone: "#ff444f",
    glyph: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
  {
    id: "withdraw" as const,
    title: "Withdrawal",
    sub: "Take money out to your wallet or bank",
    tone: "#181c25",
    glyph: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
      </svg>
    ),
  },
  {
    id: "transfer" as const,
    title: "Transfer",
    sub: "Move funds between your Deriv accounts",
    tone: "#4bb4b3",
    glyph: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 8h13l-3-3M20 16H7l3 3" />
      </svg>
    ),
  },
  {
    id: "trader" as const,
    title: "Deriv Trader",
    sub: "Open the trading screen and place a contract",
    tone: "#ffad3a",
    glyph: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19V9m5 10V5m5 14v-7m5 7V8" />
      </svg>
    ),
  },
];

export function CashierHub({
  onClose,
  onGo,
}: {
  onClose: () => void;
  onGo: (r: Exclude<CashierRoute, null>) => void;
}) {
  const { profile } = useProfile();
  return (
    <CashierScreen title="Cashier" onClose={onClose}>
      <div className="px-4 pb-10 pt-4">
        <div className="rounded-[10px] bg-[#181c25] px-4 py-4 text-white">
          <div className="text-[9px] text-white/60">Available balance</div>
          <div className="mt-0.5 text-[18px] font-bold tabular-nums">{fmtUsd(profile.balance)} USD</div>
          <div className="mt-1 flex items-center gap-1.5 text-[8.5px] text-white/55">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4bb4b3]" />
            Options · Real account
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {ITEMS.map((it, i) => (
            <button
              key={it.id}
              onClick={() => onGo(it.id)}
              className="step-in flex w-full items-center gap-3 rounded-[8px] border border-[#e6e8ea] px-3 py-3.5 text-left transition-colors hover:bg-[#fafbfb]"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                style={{ background: it.tone }}
              >
                {it.glyph}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-bold text-[#181c25]">{it.title}</span>
                <span className="block text-[9.5px] leading-snug text-[#6c717b]">{it.sub}</span>
              </span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9aa1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="m9 5 7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-[8px] bg-[#f5f5f5] p-3.5">
          <div className="text-[9.5px] font-bold text-[#181c25]">Transaction history</div>
          <p className="mt-1 text-[9px] leading-snug text-[#6c717b]">
            Your deposits, withdrawals and transfers appear here as soon as they're authorised.
          </p>
        </div>
      </div>
    </CashierScreen>
  );
}
