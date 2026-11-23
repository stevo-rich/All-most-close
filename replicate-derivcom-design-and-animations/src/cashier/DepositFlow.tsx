import { useEffect, useRef, useState } from "react";
import { accountStore, fmtUsd, useProfile } from "../account";
import { useToast } from "../ui";
import { CashierScreen, Field, GhostButton, InlineMessage, PrimaryButton } from "./kit";
import { DateRows, SuccessTick } from "./Receipt";

/**
 * Deriv's Cashier › Deposit.
 *
 * Real flow: a method gallery, the amount + a local-currency conversion, then a
 * provider hand-off. The clone mirrors the two states the user can see back —
 * "Waiting for payment" while the provider is open and the credited receipt.
 */
type Step = "methods" | "amount" | "waiting" | "done";

const METHODS = [
  { id: "mpesa", name: "M-Pesa", sub: "Mobile money · Kenya", min: 10, max: 250, tag: "Instant", glyph: "mpesa" as const },
  { id: "payagent", name: "Payment Agent", sub: "Deposit with a local agent", min: 10, max: 5000, tag: "Manual", glyph: "agent" as const },
  { id: "usdt", name: "USDT (TRC-20)", sub: "Crypto deposit", min: 10, max: 10000, tag: "1 confirmation", glyph: "crypto" as const },
  { id: "card", name: "Bank card", sub: "Visa / Mastercard", min: 10, max: 2000, tag: "Instant", glyph: "card" as const },
];

function Glyph({ kind }: { kind: "mpesa" | "agent" | "crypto" | "card" }) {
  if (kind === "crypto")
    return <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff4e5] text-[16.5px] font-black text-[#f7931a]">₿</span>;
  if (kind === "card")
    return (
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef2f7]">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#181c25" strokeWidth="1.9" strokeLinecap="round">
          <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
          <path d="M2.5 10h19M6 15h4" />
        </svg>
      </span>
    );
  if (kind === "agent")
    return (
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f2f3f4]">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#181c25" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 9h16v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9ZM8 9V6a4 4 0 0 1 8 0v3" />
        </svg>
      </span>
    );
  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e8f7ec]">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3a9d23" strokeWidth="1.9" strokeLinecap="round">
        <rect x="5" y="2.5" width="14" height="19" rx="2.5" />
        <path d="M10 18.5h4" />
      </svg>
    </span>
  );
}

const RATE = 129.4; // USD → KES, shown the way the cashier shows a conversion

export function DepositFlow({
  onClose,
  onTransfer,
}: {
  onClose: () => void;
  /** Optional hand-off: after a deposit, jump straight to Transfer. */
  onTransfer?: () => void;
}) {
  const { profile } = useProfile();
  const toast = useToast();

  const [step, setStep] = useState<Step>("methods");
  const [method, setMethod] = useState(METHODS[0].id);
  const [amount, setAmount] = useState("");
  const pending = useRef<number | undefined>(undefined);

  // A cancelled deposit must never be credited: clear the payment timer on
  // unmount as well as when the user cancels.
  useEffect(() => () => window.clearTimeout(pending.current), []);

  const chosen = METHODS.find((m) => m.id === method)!;
  const num = Number(amount);
  const error =
    !amount
      ? undefined
      : Number.isNaN(num) || num <= 0
        ? "Enter an amount greater than 0."
        : num < chosen.min
          ? `Minimum deposit is ${chosen.min}.00 USD.`
          : num > chosen.max
            ? `Maximum deposit is ${fmtUsd(chosen.max)} USD for this method.`
            : undefined;
  const valid = !!amount && !error;

  const pay = () => {
    window.clearTimeout(pending.current);
    setStep("waiting");
    pending.current = window.setTimeout(() => {
      pending.current = undefined;
      // Deposits land in the main account; Transfer moves them to Options.
      accountStore.adjustWallet(num);
      setStep("done");
      toast({
        kind: "success",
        message: "Deposit successful",
        detail: `${fmtUsd(num)} USD added to your main account.`,
      });
    }, 2200);
  };

  const cancelPayment = () => {
    window.clearTimeout(pending.current);
    pending.current = undefined;
    setStep("methods");
  };

  if (step === "waiting") {
    return (
      <CashierScreen title="Deposit" onClose={onClose}>
        <div className="flex flex-col items-center px-6 pb-10 pt-16 text-center">
          <span className="relative flex h-20 w-20 items-center justify-center">
            <span className="absolute inset-0 rounded-full border-[3px] border-[#eceef0]" />
            <span className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#ff444f] anim-spin-loop" />
            <Glyph kind={chosen.glyph} />
          </span>
          <h2 className="mt-6 text-[13px] font-bold text-[#181c25]">Waiting for your payment</h2>
          <p className="mt-2 max-w-[300px] text-[10.5px] leading-[1.5] text-[#5c6470]">
            Complete the payment with {chosen.name}. We'll credit your account as soon as it's confirmed.
          </p>
          <div className="mt-6 w-full max-w-[300px] rounded-[6px] border border-[#eceef0] p-4">
            <div className="text-[9px] text-[#6c717b]">Amount</div>
            <div className="text-[14px] font-bold tabular-nums text-[#181c25]">{fmtUsd(num)} USD</div>
            <div className="mt-1 text-[9.5px] text-[#6c717b]">≈ KES {fmtUsd(num * RATE)}</div>
          </div>
          <div className="mt-6 w-full max-w-[300px]">
            <GhostButton onClick={cancelPayment}>Cancel payment</GhostButton>
          </div>
        </div>
      </CashierScreen>
    );
  }

  if (step === "done") {
    return (
      <CashierScreen title="Deposit" onClose={onClose}>
        <div className="px-5 pb-10 pt-8">
          <div className="flex flex-col items-center">
            <SuccessTick />
            <h2 className="anim-fade-up mt-4 text-center text-[13px] font-bold text-[#181c25]" style={{ animationDelay: "180ms" }}>
              Your deposit is successful
            </h2>
            <div className="anim-fade-up mt-1.5 text-[19.5px] font-bold tabular-nums text-[#4bb4b3]" style={{ animationDelay: "230ms" }}>
              +{fmtUsd(num)} <span className="text-[11px] font-semibold">USD</span>
            </div>
          </div>
          <DateRows
            rows={[
              ["Deposit method", `${chosen.name} · ${chosen.sub}`],
              ["Amount", `${fmtUsd(num)} USD`],
              ["Credited to", "Main account"],
              ["Main account balance", `${fmtUsd(profile.wallet)} USD`],
              ["Reference", `DEP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`],
              ["Date", new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })],
            ]}
          />
          <div className="mt-6 space-y-2.5">
            <PrimaryButton onClick={onClose}>Done</PrimaryButton>
            {onTransfer && <GhostButton onClick={onTransfer}>Transfer to Options</GhostButton>}
            <GhostButton
              onClick={() => {
                setAmount("");
                setStep("methods");
              }}
            >
              Make another deposit
            </GhostButton>
          </div>
        </div>
      </CashierScreen>
    );
  }

  if (step === "amount") {
    return (
      <CashierScreen title="Deposit" onBack={() => setStep("methods")} onClose={onClose}>
        <div className="px-5 pb-10 pt-4">
          <div className="flex items-center gap-3 rounded-[6px] border border-[#e6e8ea] p-3">
            <Glyph kind={chosen.glyph} />
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold text-[#181c25]">{chosen.name}</span>
              <span className="block text-[9px] text-[#6c717b]">{chosen.sub}</span>
            </span>
            <button onClick={() => setStep("methods")} className="shrink-0 text-[10px] font-bold text-[#ff444f]">
              Change
            </button>
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
                  Limits: {chosen.min}.00 – {fmtUsd(chosen.max)} USD · ≈ KES {fmtUsd((Number(amount) || 0) * RATE)} at 129.40
                </>
              }
            />
            <div className="mt-3 grid grid-cols-4 gap-2">
              {[10, 25, 50, 100].map((v, i) => (
                <button
                  key={v}
                  onClick={() => setAmount(String(v))}
                  className="step-in rounded-full border border-[#d6d9dd] py-2 text-[10px] font-semibold text-[#181c25] transition-colors hover:border-[#181c25]"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {v} USD
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <InlineMessage type="info">
              You will be redirected to {chosen.name} to complete this payment. Your balance updates automatically once
              the payment is confirmed.
            </InlineMessage>
          </div>

          <div className="mt-6">
            <PrimaryButton onClick={pay} disabled={!valid}>
              Deposit {valid ? `${fmtUsd(num)} USD` : ""}
            </PrimaryButton>
          </div>
        </div>
      </CashierScreen>
    );
  }

  return (
    <CashierScreen title="Deposit" onClose={onClose}>
      <div className="px-5 pb-10 pt-4">
        <div>
          <InlineMessage type="info">
            Deposit in crypto or your local currency, instantly. Choose the method that suits you — your balance is
            credited as soon as the payment is confirmed.
          </InlineMessage>
        </div>

        <h3 className="mt-5 text-[11px] font-bold text-[#181c25]">Select a payment method</h3>
        <div className="mt-2.5 space-y-2">
          {METHODS.map((m, i) => (
            <button
              key={m.id}
              onClick={() => {
                setMethod(m.id);
                setAmount("");
                setStep("amount");
              }}
              className="step-in flex w-full items-center gap-3 rounded-[6px] border border-[#e6e8ea] px-3 py-3 text-left transition-colors hover:bg-[#fafbfb]"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <Glyph kind={m.glyph} />
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold text-[#181c25]">{m.name}</span>
                <span className="block text-[9px] text-[#6c717b]">{m.sub}</span>
              </span>
              <span className="shrink-0 rounded-full bg-[#f2f3f4] px-2 py-1 text-[8px] font-semibold text-[#5c6470]">{m.tag}</span>
            </button>
          ))}
        </div>

        <p className="mt-4 text-center text-[8.5px] text-[#9aa1aa]">Payments are simulated in this demo.</p>
      </div>
    </CashierScreen>
  );
}
