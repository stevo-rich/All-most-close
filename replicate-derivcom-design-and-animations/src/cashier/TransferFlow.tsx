import { useState } from "react";
import { fmtUsd, useProfile } from "../account";
import { useToast } from "../ui";
import {
  AccountSelect,
  CashierScreen,
  Field,
  GhostButton,
  InlineMessage,
  PrimaryButton,
  type AccountOption,
} from "./kit";
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

  return (
    <CashierScreen title="Transfer" onClose={onClose}>
      <div className="px-5 pb-10 pt-4">
        <h2 className="text-[12px] font-bold text-[#181c25]">Transfer between your accounts in Deriv</h2>
        <div className="mt-3">
          <InlineMessage type="info">
            Transfers within accounts are only available for trading, not withdrawals. To withdraw funds, use the same
            method you used to deposit.
          </InlineMessage>
        </div>

        <div className="mt-5 space-y-3">
          <AccountSelect label="From" selected={from} options={options} onPick={setFrom} />
          <div className="flex justify-center">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f2f3f4] text-[#4bb4b3]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4v16M7 15l5 5 5-5" />
              </svg>
            </span>
          </div>
          <AccountSelect
            label="To"
            selected={to}
            options={options.filter((o) => o.value !== from.value)}
            onPick={setTo}
            error={to.value === from.value ? "Choose a different account." : undefined}
          />
        </div>

        <div className="mt-5">
          <Field
            label="Amount"
            value={amount}
            onChange={setAmount}
            suffix="USD"
            error={error}
            hint={
              <>
                Available: <span className="font-semibold text-[#181c25]">{fmtUsd(from.balance)} USD</span> · Transfer limits: 0.35 – 10,000 USD
              </>
            }
          />
          <div className="mt-3 grid grid-cols-4 gap-2">
            {PCTS.map((p, i) => (
              <button
                key={p}
                onClick={() => setAmount(((from.balance * p) / 100).toFixed(2))}
                className="step-in rounded-full border border-[#d6d9dd] py-2 text-[10px] font-semibold text-[#181c25] transition-colors hover:border-[#181c25]"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {p}%
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <PrimaryButton onClick={() => setStep("confirm")} disabled={!valid}>
            Transfer
          </PrimaryButton>
        </div>
      </div>
    </CashierScreen>
  );
}
