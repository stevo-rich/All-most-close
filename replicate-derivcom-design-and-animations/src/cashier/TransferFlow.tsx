import { useState } from "react";
import { fmtUsd, useProfile } from "../account";
import { useToast } from "../ui";
import { AccountSelect, CashierScreen, GhostButton, PrimaryButton, type AccountOption } from "./kit";
import { DateRows, SuccessTick, TransferRoute } from "./Receipt";

/**
 * Deriv's Cashier › Transfer between your accounts.
 *
 * Real flow: From / To dropdowns grouped by platform, an amount field with a
 * percentage selector, a red "Check transfer information" confirmation with a
 * consent checkbox, then a receipt reading "Your funds have been transferred".
 */
type Step = "form" | "confirm" | "done";

const PCTS = [25, 50, 75, 100];

export function TransferFlow({ onClose }: { onClose: () => void }) {
  const { profile, setBalance } = useProfile();
  const toast = useToast();

  const options: AccountOption[] = [
    { group: "Deriv accounts", value: "options", text: "Options", detail: "Real · USD", balance: profile.balance, tone: "teal" },
    { group: "Deriv accounts", value: "demo", text: "Demo account", detail: "Virtual · USD", balance: 10000, tone: "amber" },
  ];

  const [from, setFrom] = useState<AccountOption>(options[0]);
  const [to, setTo] = useState<AccountOption>(options[1]);
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [busy, setBusy] = useState(false);
  const [showNotice, setShowNotice] = useState(true);
  const [move, setMove] = useState(0);

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

  const valid = !!amount && !error;

  const submit = () => {
    setBusy(true);
    // Deriv shows the cashier spinner while the transfer is authorised.
    window.setTimeout(() => {
      setBusy(false);
      setMove(num);
      // Move the money between the real balance and the demo pocket. The real
      // balance is the shared store, so Home/Portfolio/Bot all follow it.
      if (from.value === "options" && to.value === "demo") setBalance(profile.balance - num);
      if (from.value === "demo" && to.value === "options") setBalance(profile.balance + num);
      setStep("done");
      toast({ kind: "success", message: "Transfer complete", detail: `${fmtUsd(num)} USD moved to ${to.text}` });
    }, 900);
  };

  if (step === "done") {
    return (
      <CashierScreen title="Transfer" onClose={onClose}>
        <div className="px-5 pb-10 pt-8">
          <div className="flex flex-col items-center">
            <SuccessTick />
            <h2 className="anim-fade-up mt-4 text-center text-[13px] font-bold text-[#181c25]" style={{ animationDelay: "180ms" }}>
              Your funds have been transferred
            </h2>
            <div className="anim-fade-up mt-1.5 text-[18px] font-bold tabular-nums text-[#4bb4b3]" style={{ animationDelay: "230ms" }}>
              {fmtUsd(move)} USD
            </div>
          </div>
          <TransferRoute from={from.text} to={to.text} fromDetail={from.detail} toDetail={to.detail} />
          <DateRows
            rows={[
              ["Transfer amount", `${fmtUsd(move)} USD`],
              ["Balance after transfer", `${fmtUsd(from.balance - move)} USD`],
              ["Transfer fee", "0.00 USD (free)"],
              ["Date", new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })],
              ["Reference", `TRF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`],
            ]}
          />
          <div className="mt-6 space-y-2.5">
            <PrimaryButton onClick={onClose}>Done</PrimaryButton>
            <GhostButton
              onClick={() => {
                setAmount("");
                setStep("form");
              }}
            >
              Make a new transfer
            </GhostButton>
          </div>
        </div>
      </CashierScreen>
    );
  }

  if (step === "confirm") {
    return (
      <CashierScreen title="Transfer" onBack={() => setStep("form")} onClose={onClose}>
        <div className="px-5 pb-10 pt-6">
          <div className="flex flex-col items-center">
            <span className="anim-pop flex h-14 w-14 items-center justify-center rounded-full bg-[#ffedee]">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ff444f" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3.5 21 19H3l9-15.5ZM12 9.5v4M12 16.5v.2" />
              </svg>
            </span>
            <h2 className="mt-4 text-[13px] font-bold text-[#ff444f]">Check transfer information</h2>
          </div>

          <div className="mt-5 divide-y divide-[#eceef0] rounded-[6px] border border-[#eceef0]">
            {[
              ["From", `${from.text} · ${from.detail}`],
              ["To", `${to.text} · ${to.detail}`],
              ["Amount", `${fmtUsd(num)} USD`],
              ["Transfer fee", "0.00 USD"],
            ].map(([k, v], i) => (
              <div key={k} className="step-in flex items-start justify-between gap-4 px-3.5 py-3" style={{ animationDelay: `${i * 60}ms` }}>
                <span className="text-[10px] text-[#6c717b]">{k}</span>
                <span className="text-right text-[10px] font-semibold text-[#181c25]">{v}</span>
              </div>
            ))}
          </div>

          <ul className="mt-4 space-y-1.5 text-[9.5px] leading-snug text-[#ff444f]">
            <li className="flex gap-2">
              <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-[#ff444f]" />
              Please ensure all details are correct before making your transfer.
            </li>
            <li className="flex gap-2">
              <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-[#ff444f]" />
              We do not guarantee a refund if you make a wrong transfer.
            </li>
          </ul>

          <label className="mt-5 flex cursor-pointer items-start gap-2.5">
            <input type="checkbox" className="mt-[3px] h-4 w-4 accent-[#ff444f]" />
            <span className="text-[10px] leading-snug text-[#181c25]">I confirm that I have verified the transfer information.</span>
          </label>

          <div className="mt-6 space-y-2.5">
            <PrimaryButton onClick={submit} loading={busy}>
              Transfer
            </PrimaryButton>
            <GhostButton onClick={() => setStep("form")}>Back</GhostButton>
          </div>
        </div>
      </CashierScreen>
    );
  }

  const noFunds = from.balance <= 0;

  return (
    <div className="page-push flex h-full flex-col bg-white">
      {/* Back circle + page title, as on deriv.com's Transfer page */}
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
        {/* What's-new banner with the two inline actions */}
        {showNotice && (
          <div className="anim-fade-up rounded-[10px] bg-[#eef6fe] px-4 py-4">
            <div className="flex gap-2.5">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2196f3" strokeWidth="2" strokeLinecap="round" className="mt-[2px] shrink-0">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5M12 7.6v.2" />
              </svg>
              <p className="text-[12.5px] leading-[1.5] text-[#1f4b6e]">
                We've updated how transfers work. The process is now simpler and faster.
              </p>
            </div>
            <div className="mt-3 flex items-center gap-4 pl-[27px]">
              <button
                onClick={() => toast({ kind: "info", message: "Simpler transfers", detail: "Fewer steps: pick accounts, enter an amount, confirm." })}
                className="press rounded-full border border-[#181c25] px-3 py-[6px] text-[11.5px] font-bold text-[#181c25] transition-colors hover:bg-white"
              >
                See what changed
              </button>
              <button onClick={() => setShowNotice(false)} className="press text-[11.5px] font-bold text-[#181c25] underline">
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* No funds strip + From / To cards, welded into one hairline stack */}
        <div className="mt-4 overflow-hidden rounded-[10px] border border-[#eceef0]">
          {noFunds && (
            <button onClick={onClose} className="flex w-full items-center gap-3 bg-[#fff6e5] px-4 py-3 text-left">
              <span className="flex-1 text-[12.5px] font-bold text-[#8a6210]">
                No funds available. <span className="underline underline-offset-2">Deposit now.</span>
              </span>
              <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-[#c98a12] text-white">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 5 7 7-7 7" />
                </svg>
              </span>
            </button>
          )}

          <div className="relative">
            <AccountSelect label="From" selected={from} options={options} onPick={setFrom} disabled={noFunds} />
            {/* the swap glyph that straddles the two cards */}
            <span className="absolute -bottom-[17px] left-1/2 z-10 flex h-[34px] w-[34px] -translate-x-1/2 items-center justify-center rounded-full border border-[#eceef0] bg-white text-[#181c25] shadow-[0_2px_6px_rgba(0,0,0,.08)]">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v8M8.5 7.5 12 11l3.5-3.5M12 21v-8M8.5 16.5 12 13l3.5 3.5" />
              </svg>
            </span>
          </div>
          <div className="mt-[26px]">
            <AccountSelect
              label="To"
              selected={to}
              options={options.filter((o) => o.value !== from.value)}
              onPick={setTo}
              error={to.value === from.value ? "Choose a different account." : undefined}
            />
          </div>
        </div>

        {/* Amount label sits outside the field here, unlike the cashier form */}
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
                disabled={noFunds}
                className="step-in rounded-full border border-[#d6d9dd] py-2 text-[11.5px] font-semibold text-[#181c25] transition-colors hover:border-[#181c25] disabled:opacity-40"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {p}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Disabled-until-valid pink Transfer button, pinned like the screenshot */}
      <div className="shrink-0 px-4 pb-5">
        <button
          onClick={() => setStep("confirm")}
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
