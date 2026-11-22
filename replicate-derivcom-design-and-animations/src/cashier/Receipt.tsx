import type { ReactNode } from "react";

/**
 * The stamping tick Deriv uses on cashier receipts. The halo expands once,
 * the badge scales in, then the check stroke draws itself — the same beat as
 * the cashier success screen.
 */
export function SuccessTick({ tone = "#4bb4b3", size = 72 }: { tone?: string; size?: number }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <span
        className="receipt-tick__halo absolute inset-0 rounded-full"
        style={{ border: `2px solid ${tone}`, opacity: 0.4 }}
      />
      <span
        className="receipt-tick absolute inset-0 flex items-center justify-center rounded-full"
        style={{ background: `${tone}1a` }}
      >
        <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="none">
          <path
            className="receipt-tick__path"
            d="M4.5 12.5 9.5 17.5 19.5 7"
            stroke={tone}
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
}

/** Stacked amount + label used in the middle of a receipt. */
export function ReceiptAmount({ amount, currency = "USD", tone = "#4bb4b3" }: { amount: string; currency?: string; tone?: string }) {
  return (
    <div className="mt-4 text-center">
      <div className="anim-fade-up text-[26px] font-bold tabular-nums leading-none" style={{ color: tone }}>
        {amount} <span className="text-[15px] font-semibold">{currency}</span>
      </div>
    </div>
  );
}

/** From → To block with the arrow between, as on the transfer receipt. */
export function TransferRoute({
  from,
  to,
  fromDetail,
  toDetail,
}: {
  from: string;
  to: string;
  fromDetail?: string;
  toDetail?: string;
}) {
  return (
    <div className="mt-6 flex items-center justify-between gap-2">
      <div className="step-in flex-1 text-center" style={{ animationDelay: "60ms" }}>
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#f2f3f4]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#181c25" strokeWidth="2" strokeLinecap="round">
            <rect x="2.5" y="6" width="19" height="13" rx="2.5" />
            <path d="M2.5 10.5h19" />
          </svg>
        </div>
        <div className="mt-2 text-[13.5px] font-semibold text-[#181c25]">{from}</div>
        {fromDetail && <div className="text-[11.5px] text-[#6c717b]">{fromDetail}</div>}
      </div>
      <div className="step-in flex shrink-0 items-center justify-center text-[#4bb4b3]" style={{ animationDelay: "140ms" }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 8h13l-3-3M20 16H7l3 3" />
        </svg>
      </div>
      <div className="step-in flex-1 text-center" style={{ animationDelay: "220ms" }}>
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#f2f3f4]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#181c25" strokeWidth="2" strokeLinecap="round">
            <rect x="2.5" y="6" width="19" height="13" rx="2.5" />
            <path d="M2.5 10.5h19" />
          </svg>
        </div>
        <div className="mt-2 text-[13.5px] font-semibold text-[#181c25]">{to}</div>
        {toDetail && <div className="text-[11.5px] text-[#6c717b]">{toDetail}</div>}
      </div>
    </div>
  );
}

/** Key/value rows that fall into place one after another. */
export function DateRows({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <div className="mt-6 divide-y divide-[#eceef0] rounded-[6px] border border-[#eceef0]">
      {rows.map(([k, v], i) => (
        <div key={k} className="step-in flex items-start justify-between gap-4 px-3.5 py-3" style={{ animationDelay: `${260 + i * 60}ms` }}>
          <span className="text-[13px] text-[#6c717b]">{k}</span>
          <span className="text-right text-[13px] font-semibold text-[#181c25]">{v}</span>
        </div>
      ))}
    </div>
  );
}
