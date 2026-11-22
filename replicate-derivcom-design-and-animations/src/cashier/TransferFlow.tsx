import { useState } from "react";
import { fmtUsd, useProfile } from "../account";
import { useToast } from "../ui";
import { AccountSelect, InlineMessage, type AccountOption } from "./kit";


/**
 * Deriv's "Transfer" page, rebuilt from the reference flow:
 *
 *  1. Form       — grouped From/To cards, amount, 25/50/75/100% shortcuts and
 *                  a "No funds in <account>. Deposit now." strip when a side is
 *                  empty.
 *  2. Review     — "Review and confirm" with From/To, transfer amount, what
 *                  you'll receive, and a single red Confirm button.
 *  3. Success    — the purple gradient receipt: "Transfer successful", the
 *                  amount and destination, Start trading / Go to Portfolio.
 */
type Step = "form" | "review" | "done";

const PCTS = [25, 50, 75, 100];

/** Deriv brands this pocket as "Wallet" in the transfer picker. */
export function TransferFlow({ onClose, onStartTrading }: { onClose: () => void; onStartTrading?: () => void }) {
  const { profile, setBalance, setWallet } = useProfile();
  const toast = useToast();

  const options: AccountOption[] = [
    { group: "Deriv accounts", value: "options", text: "Options", detail: "Real · USD", balance: profile.balance, tone: "teal" },
    { group: "Deriv accounts", value: "wallet", text: "Wallet", detail: "Real · USD", balance: profile.wallet, tone: "navy" },
    { group: "Deriv accounts", value: "demo", text: "Demo account", detail: "Virtual · USD", balance: 10000, tone: "amber" },
  ];
  const byId = (id: string) => options.find((o) => o.value === id)!;

  const [fromId, setFromId] = useState("options");
  const [toId, setToId] = useState("wallet");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [showNotice, setShowNotice] = useState(true);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState({ amount: 0, to: "Wallet" });

  // Re-read balances on every render so the cards track the store.
  const from = byId(fromId);
  const to = byId(toId);
  const toOptions = options.filter((o) => o.value !== fromId);

  const num = Number(amount);
  const error =
    !amount
      ? undefined
      : Number.isNaN(num) || num <= 0
        ? "Enter an amount greater than 0."
        : num > from.balance
          ? "Insufficient balance"
          : num < 0.35
            ? "Minimum transfer amount is 0.35 USD."
            : undefined;
  const valid = !!amount && !error && fromId !== toId;

  const move = (delta: number) => {
    // Guard: a transfer to the same account is a no-op, not a credit.
    if (fromId === toId) return;
    if (fromId === "wallet") setWallet(profile.wallet - delta);
    if (toId === "wallet") setWallet(profile.wallet + delta);
    if (fromId === "options") setBalance(profile.balance - delta);
    if (toId === "options") setBalance(profile.balance + delta);
  };

  const submit = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      move(num);
      setDone({ amount: num, to: to.text });
      setStep("done");
      toast({ kind: "success", message: "Transfer successful", detail: `${fmtUsd(num)} USD moved to ${to.text}.` });
    }, 700);
  };

  /* ---------------------------- success ---------------------------- */
  if (step === "done") {
    return (
      <div className="page-push flex h-full flex-col overflow-y-auto bg-[#231733] text-white">
        {/* Purple radial wash behind the illustration, as in the reference */}
        <div
          className="relative flex flex-1 flex-col items-center px-5 pb-6 pt-10"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 12%, rgba(196,58,90,.55) 0%, rgba(196,58,90,0) 62%), linear-gradient(180deg, #2a1a3a 0%, #1d1428 55%, #171021 100%)",
          }}
        >
          <MoneyBurst />
          <h1 className="anim-fade-up mt-7 text-center text-[19px] font-bold" style={{ animationDelay: "160ms" }}>
            Transfer successful
          </h1>
          <p className="anim-fade-up mt-1.5 text-center text-[11.5px] leading-snug text-white/80" style={{ animationDelay: "220ms" }}>
            {fmtUsd(done.amount)} USD transferred to your {done.to} account.
          </p>

          <div className="mt-auto w-full pt-8">
            <button
              onClick={() => {
                onClose();
                onStartTrading?.();
              }}
              className="press relative w-full overflow-hidden rounded-full bg-[#ff5a63] py-[14px] text-[13.5px] font-bold text-white transition-colors hover:bg-[#ff6d75] btn-sheen"
            >
              Start trading
            </button>
            <button
              onClick={onClose}
              className="press mt-2.5 w-full rounded-full border border-white/25 bg-white/[0.06] py-[14px] text-[13.5px] font-bold text-white transition-colors hover:bg-white/[0.12]"
            >
              Go to Portfolio
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------- review ---------------------------- */
  if (step === "review") {
    return (
      <div className="page-push flex h-full flex-col bg-white">
        <div className="shrink-0 px-4 pt-4">
          <button
            onClick={() => setStep("form")}
            aria-label="Back"
            className="press flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#f5f5f5] text-[#181c25] transition-colors hover:bg-[#ebebeb]"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 19 8 12l7-7" />
            </svg>
          </button>
          <h1 className="mt-5 text-[20px] font-bold tracking-tight text-[#181c25]">Review and confirm</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6 pt-6">
          <div className="divide-y divide-[#eceef0] rounded-[10px] border border-[#eceef0]">
            <Row label="From" value={from.text} balance={from.balance} tone={from.tone} />
            <Row label="To" value={to.text} balance={to.balance} tone={to.tone} />
            <Row label="Transfer amount" strong value={`${fmtUsd(num)} USD`} />
            <Row label="You'll receive" strong value={`${fmtUsd(num)} USD`} />
          </div>

          <div className="mt-4">
            <InlineMessage type="info">
              Transfers between your own accounts are instant and free. You can move the funds again at any time.
            </InlineMessage>
          </div>
        </div>

        <div className="shrink-0 px-4 pb-5">
          <button
            onClick={submit}
            disabled={busy}
            className="press relative flex w-full items-center justify-center overflow-hidden rounded-full bg-[#ff444f] py-[15px] text-[14px] font-bold text-white transition-colors hover:bg-[#ff5a64] disabled:opacity-70"
          >
            {busy ? (
              <span className="flex items-center gap-2">
                <Spinner /> Transferring…
              </span>
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </div>
    );
  }

  /* ----------------------------- form ----------------------------- */
  const fromEmpty = from.balance <= 0;
  const toEmpty = to.balance <= 0;

  return (
    <div className="page-push flex h-full flex-col bg-white">
      <div className="shrink-0 px-4 pb-1 pt-4">
        <button
          onClick={onClose}
          aria-label="Back"
          className="press flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#f5f5f5] text-[#181c25] transition-colors hover:bg-[#ebebeb]"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 19 8 12l7-7" />
          </svg>
        </button>
        <h1 className="mt-5 text-[24px] font-bold tracking-tight text-[#181c25]">Transfer</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4">
        {showNotice && (
          <div className="anim-fade-up rounded-[10px] bg-[#eef6fe] px-3.5 py-3.5">
            <div className="flex items-start gap-2.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2196f3" strokeWidth="2" strokeLinecap="round" className="mt-[2px] shrink-0">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5M12 7.6v.2" />
              </svg>
              <p className="flex-1 text-[11.5px] leading-[1.45] text-[#1f4b6e]">
                We've updated how transfers work. The process is now simpler and faster.
              </p>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <button
                  onClick={() => toast({ kind: "info", message: "Simpler transfers", detail: "Pick two accounts, enter an amount, review it, then confirm." })}
                  className="press whitespace-nowrap rounded-full border border-[#181c25] px-2.5 py-[3px] text-[10px] font-bold text-[#181c25] transition-colors hover:bg-white"
                >
                  See what changed
                </button>
                <button onClick={() => setShowNotice(false)} className="press mr-1 text-[10px] font-bold text-[#181c25] underline">
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 space-y-3">
          <div>
            <AccountSelect
              label="From"
              selected={from}
              options={options}
              onPick={(o) => {
                setFromId(o.value);
                // Never leave both sides on the same account — pick a fallback.
                if (o.value === toId) {
                  const next = options.find((x) => x.value !== o.value);
                  if (next) setToId(next.value);
                }
              }}
            />
            {fromEmpty && <NoFunds text={`No funds in ${from.text}.`} onDeposit={onClose} />}
          </div>

          <div className="relative">
            <AccountSelect
              label="To"
              selected={to.value === fromId ? null : to}
              options={toOptions}
              onPick={(o) => {
                setToId(o.value);
                if (o.value === fromId) {
                  const next = options.find((x) => x.value !== o.value);
                  if (next) setFromId(next.value);
                }
              }}
            />
            {toEmpty && !fromEmpty && <NoFunds text={`No funds in ${to.text}.`} onDeposit={onClose} />}
            <span className="pointer-events-none absolute left-1/2 top-0 z-10 flex h-[30px] w-[30px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#eceef0] bg-white text-[#181c25] shadow-[0_2px_6px_rgba(0,0,0,.08)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v8M8.5 7.5 12 11l3.5-3.5M12 21v-8M8.5 16.5 12 13l3.5 3.5" />
              </svg>
            </span>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-[13px] text-[#181c25]">Amount</label>
          <div
            className="mt-2 flex items-center rounded-[8px] border bg-white px-4 transition-colors"
            style={{ borderColor: error ? "#ff444f" : "#d6d9dd" }}
          >
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
              placeholder="0.00"
              className="h-[50px] w-full bg-transparent text-[16px] text-[#181c25] outline-none placeholder:text-[#9aa1aa]"
            />
            <span className="shrink-0 text-[13px] font-semibold text-[#6c717b]">USD</span>
          </div>
          {error ? (
            <p className="mt-1.5 text-[11.5px] text-[#ff444f]">{error}</p>
          ) : (
            <p className="mt-1.5 text-[11.5px] text-[#8a8f99]">
              Available {fmtUsd(from.balance)} USD · Limits 0.35 – 10,000 USD
            </p>
          )}

          <div className="mt-3 grid grid-cols-4 gap-2">
            {PCTS.map((p, i) => (
              <button
                key={p}
                onClick={() => setAmount(((from.balance * p) / 100).toFixed(2))}
                disabled={fromEmpty}
                className="step-in rounded-full border border-[#d6d9dd] py-2 text-[11.5px] font-semibold text-[#181c25] transition-colors hover:border-[#181c25] disabled:opacity-40"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {p}%
              </button>
            ))}
          </div>
        </div>

        {fromEmpty && (
          <div className="mt-5">
            <InlineMessage type="warning" title="Nothing to transfer yet">
              Deposit into {from.text} first, then move it to {to.text} whenever you want.
            </InlineMessage>
          </div>
        )}
      </div>

      <div className="shrink-0 px-4 pb-5">
        <button
          onClick={() => setStep("review")}
          disabled={!valid}
          className={`press w-full rounded-full py-[15px] text-[15px] font-bold transition-colors ${
            valid ? "bg-[#ff444f] text-white hover:bg-[#ff5a64]" : "bg-[#ffc9cc] text-white"
          }`}
        >
          Transfer
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function NoFunds({ text, onDeposit }: { text: string; onDeposit: () => void }) {
  return (
    <button onClick={onDeposit} className="mt-2 flex w-full items-center gap-2 rounded-[8px] bg-[#fff6e5] px-3 py-2 text-left">
      <span className="flex-1 text-[11.5px] font-semibold text-[#8a6210]">
        {text} <span className="underline underline-offset-2">Deposit now.</span>
      </span>
      <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[#c98a12] text-white">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 5 7 7-7 7" />
        </svg>
      </span>
    </button>
  );
}

function Row({
  label,
  value,
  balance,
  tone,
  strong,
}: {
  label: string;
  value: string;
  balance?: number;
  tone?: "teal" | "amber" | "navy";
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-3.5 py-3">
      <span className="text-[11.5px] text-[#8a8f99]">{label}</span>
      <span className="flex items-center gap-2">
        {tone && (
          <span
            className="flex h-[18px] w-[18px] items-center justify-center rounded-full"
            style={{ background: { teal: "#4bb4b3", amber: "#ffad3a", navy: "#181c25" }[tone] }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2.5" y="6" width="19" height="13" rx="2.5" />
              <path d="M2.5 10.5h19" />
            </svg>
          </span>
        )}
        <span className={`text-[13px] ${strong ? "font-bold text-[#181c25]" : "text-[#181c25]"}`}>
          {value}
          {balance !== undefined && <span className="ml-1.5 text-[11px] text-[#8a8f99] tabular-nums">{balance.toFixed(2)} USD</span>}
        </span>
      </span>
    </div>
  );
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" className="anim-spin-loop">
      <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="2.6" fill="none" opacity="0.3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/**
 * The success illustration: two banknote cards tumbling with confetti, drawn
 * rather than shipped as an asset so it scales cleanly.
 */
function MoneyBurst() {
  return (
    <div className="relative flex h-[132px] w-[132px] items-center justify-center">
      <svg viewBox="0 0 132 132" className="receipt-tick h-full w-full" aria-hidden>
        {/* confetti */}
        <g stroke="#ff5a63" strokeWidth="2.4" strokeLinecap="round" fill="none">
          <path d="M44 30c-3 4-1 8 3 9" />
          <path d="M88 22c3 5 1 9-3 10" />
          <path d="M96 96c4-2 6 1 6 4" />
        </g>
        <g fill="#fff">
          <rect x="72" y="26" width="4" height="7" rx="1.5" transform="rotate(18 74 29)" />
          <rect x="38" y="46" width="3.5" height="6" rx="1.5" transform="rotate(-24 40 49)" />
          <rect x="60" y="104" width="4" height="6" rx="1.5" transform="rotate(12 62 107)" />
          <rect x="86" y="86" width="3" height="5" rx="1.5" transform="rotate(-30 87 88)" />
        </g>

        {/* back note, tilted left */}
        <g transform="rotate(-16 58 68)">
          <rect x="26" y="46" width="62" height="40" rx="7" fill="#fff1f2" stroke="#ff5a63" strokeWidth="3" />
          <rect x="33" y="53" width="48" height="26" rx="3" fill="none" stroke="#ffd0d4" strokeWidth="1.6" />
          <circle cx="47" cy="66" r="8" fill="#e8323f" />
        </g>

        {/* front note, tilted right */}
        <g transform="rotate(12 76 62)">
          <rect x="46" y="38" width="64" height="42" rx="7" fill="#fff7f3" stroke="#ff5a63" strokeWidth="3" />
          <rect x="53" y="45" width="50" height="28" rx="3" fill="none" stroke="#ffe0d4" strokeWidth="1.6" />
          <circle cx="92" cy="59" r="9" fill="#ff9b52" />
        </g>
      </svg>
    </div>
  );
}
