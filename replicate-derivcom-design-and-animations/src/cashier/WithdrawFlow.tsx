import { useState } from "react";
import { fmtUsd, useProfile } from "../account";
import { useToast } from "../ui";
import { CashierScreen, Field, GhostButton, InlineMessage, PrimaryButton, StatusPill, useCountdown } from "./kit";
import { DateRows, ReceiptAmount, SuccessTick } from "./Receipt";

/**
 * Deriv's Cashier › Withdrawal.
 *
 * Real flow: an identity-check empty state ("Confirm your identity to make a
 * withdrawal") with a Send email action, a "We've sent you an email" state with
 * a resend countdown, the amount form, then a receipt that shows the request as
 * "In review" while it processes.
 */
type Step = "verify" | "sent" | "form" | "done";

const METHODS = [
  { id: "mpesa", name: "M-Pesa", sub: "Mobile money · Kenya", eta: "Within 24 hours", glyph: "mpesa" as const },
  { id: "usdt", name: "USDT (TRC-20)", sub: "Crypto wallet", eta: "Usually under 1 hour", glyph: "crypto" as const },
  { id: "card", name: "Bank card", sub: "Visa / Mastercard", eta: "3–5 working days", glyph: "card" as const },
];

function MethodGlyph({ kind }: { kind: "mpesa" | "crypto" | "card" }) {
  if (kind === "crypto")
    return (
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff4e5] text-[15px] font-black text-[#f7931a]">₿</span>
    );
  if (kind === "card")
    return (
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef2f7]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#181c25" strokeWidth="2" strokeLinecap="round">
          <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
          <path d="M2.5 10h19M6 15h4" />
        </svg>
      </span>
    );
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f7ec]">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3a9d23" strokeWidth="2" strokeLinecap="round">
        <rect x="5" y="2.5" width="14" height="19" rx="2.5" />
        <path d="M10 18.5h4" />
      </svg>
    </span>
  );
}

export function WithdrawFlow({ onClose }: { onClose: () => void }) {
  const { profile, setBalance } = useProfile();
  const toast = useToast();
  const countdown = useCountdown(60);

  const [step, setStep] = useState<Step>("verify");
  const [method, setMethod] = useState(METHODS[0].id);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);

  const num = Number(amount);
  const min = 10;
  const error =
    !amount
      ? undefined
      : Number.isNaN(num) || num <= 0
        ? "Enter an amount greater than 0."
        : num < min
          ? `Minimum withdrawal is ${min}.00 USD.`
          : num > profile.balance
            ? "Insufficient balance"
            : undefined;
  const valid = !!amount && !error;
  const chosen = METHODS.find((m) => m.id === method)!;

  const sendEmail = () => {
    setStep("sent");
    countdown.start();
    toast({ kind: "info", message: "Verification email sent", detail: "Check your inbox to confirm this withdrawal." });
  };

  const submit = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      // Deriv deducts the amount from the balance when the request is accepted,
      // then the receipt shows it as "In review" until it is processed.
      setBalance(profile.balance - num);
      setStep("done");
      toast({ kind: "warning", message: "Withdrawal requested", detail: `${fmtUsd(num)} USD is in review.` });
    }, 1100);
  };

  if (step === "verify") {
    return (
      <CashierScreen title="Withdrawal" onClose={onClose}>
        <div className="px-5 pb-10 pt-8">
          <div className="flex flex-col items-center text-center">
            <span className="anim-pop flex h-[92px] w-[92px] items-center justify-center rounded-full bg-[#eef6fe]">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#2196f3" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
                <path d="m3.5 7 8.5 6 8.5-6" />
              </svg>
            </span>
            <h2 className="anim-fade-up mt-5 text-[13px] font-bold leading-snug text-[#181c25]">
              Confirm your identity to make a withdrawal.
            </h2>
            <p className="anim-fade-up mt-2.5 max-w-[320px] text-[10.5px] leading-[1.5] text-[#5c6470]" style={{ animationDelay: "70ms" }}>
              Hit the button below, and we'll email you a verification link.
              <br />
              <br />
              This is to confirm that it's you making the withdrawal request.
            </p>
            <div className="mt-6 w-full max-w-[320px]">
              <PrimaryButton onClick={sendEmail}>Send email</PrimaryButton>
            </div>
          </div>
        </div>
      </CashierScreen>
    );
  }

  if (step === "sent") {
    return (
      <CashierScreen title="Withdrawal" onBack={() => setStep("verify")} onClose={onClose}>
        <div className="px-5 pb-10 pt-8">
          <div className="flex flex-col items-center text-center">
            <span className="anim-pop flex h-[92px] w-[92px] items-center justify-center rounded-full bg-[#eaf7f6]">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#4bb4b3" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
                <path d="m3.5 7 8.5 6 8.5-6" />
                <path d="M16.5 4.2 19 6.7l3-3" stroke="#4bb4b3" strokeWidth="2" />
              </svg>
            </span>
            <h2 className="anim-fade-up mt-5 text-[13px] font-bold text-[#181c25]">We've sent you an email.</h2>
            <p className="anim-fade-up mt-2 max-w-[320px] text-[10.5px] leading-[1.5] text-[#5c6470]" style={{ animationDelay: "70ms" }}>
              Please check your email for the verification link to complete the process.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-[320px]">
            <div className="rounded-[6px] border border-[#eceef0] p-4 text-center">
              <div className="text-[10px] font-bold text-[#181c25]">Didn't receive the email?</div>
              <p className="mt-1 text-[9.5px] leading-snug text-[#6c717b]">
                Check your spam or junk folder. If it's not there, try resending the email.
              </p>
              <button
                onClick={() => countdown.start()}
                disabled={countdown.running}
                className="mt-3 text-[10px] font-bold text-[#ff444f] disabled:text-[#9aa1aa]"
              >
                {countdown.running ? `Resend email in ${countdown.left}s` : "Resend email"}
              </button>
            </div>

            {/* In the clone this stands in for clicking the emailed link. */}
            <button
              onClick={() => setStep("form")}
              className="press mt-4 w-full rounded-full bg-[#181c25] py-3.5 text-[11px] font-bold text-white"
            >
              I've verified my email
            </button>
            <p className="mt-2 text-center text-[8.5px] text-[#9aa1aa]">
              Demo shortcut — in the real app this link arrives by email.
            </p>
          </div>
        </div>
      </CashierScreen>
    );
  }

  if (step === "done") {
    return (
      <CashierScreen title="Withdrawal" onClose={onClose}>
        <div className="px-5 pb-10 pt-8">
          <div className="flex flex-col items-center">
            <SuccessTick tone="#ffad3a" />
            <h2 className="anim-fade-up mt-4 text-center text-[13px] font-bold text-[#181c25]" style={{ animationDelay: "180ms" }}>
              Your withdrawal is being processed
            </h2>
            <ReceiptAmount amount={fmtUsd(num)} tone="#181c25" />
            <div className="mt-3">
              <StatusPill status="pending" />
            </div>
          </div>

          <DateRows
            rows={[
              ["Withdrawal method", `${chosen.name} · ${chosen.sub}`],
              ["Estimated arrival", chosen.eta],
              ["Remaining balance", `${fmtUsd(profile.balance - num)} USD`],
              ["Fee", "0.00 USD"],
              ["Reference", `WDR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`],
            ]}
          />

          <div className="mt-4">
            <InlineMessage type="warning" title="Withdrawal in progress">
              Funds are deducted from your balance once the request is authorised and are checked again before it's
              processed. If anything changes in between, we may ask you to submit the request again.
            </InlineMessage>
          </div>

          <div className="mt-6 space-y-2.5">
            <PrimaryButton onClick={onClose}>Done</PrimaryButton>
            <GhostButton onClick={() => setStep("form")}>Make another withdrawal</GhostButton>
          </div>
        </div>
      </CashierScreen>
    );
  }

  return (
    <CashierScreen title="Withdrawal" onBack={() => setStep("sent")} onClose={onClose}>
      <div className="px-5 pb-10 pt-4">
        <div>
          <InlineMessage type="info">
            Withdraw using the same payment method you used to deposit. If that method isn't supported, check our
            available payment methods.
          </InlineMessage>
        </div>

        <h3 className="mt-5 text-[11px] font-bold text-[#181c25]">Select withdrawal method</h3>
        <div className="mt-2.5 space-y-2">
          {METHODS.map((m, i) => {
            const active = m.id === method;
            return (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`step-in flex w-full items-center gap-3 rounded-[6px] border px-3 py-3 text-left transition-colors ${
                  active ? "border-[#181c25] bg-[#f7f8f9]" : "border-[#e6e8ea] hover:bg-[#fafbfb]"
                }`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <MethodGlyph kind={m.glyph} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-semibold text-[#181c25]">{m.name}</span>
                  <span className="block text-[9px] text-[#6c717b]">{m.sub} · {m.eta}</span>
                </span>
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    active ? "border-[#ff444f]" : "border-[#d6d9dd]"
                  }`}
                >
                  {active && <span className="h-2.5 w-2.5 rounded-full bg-[#ff444f]" />}
                </span>
              </button>
            );
          })}
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
                Available: <span className="font-semibold text-[#181c25]">{fmtUsd(profile.balance)} USD</span> · Minimum 10.00 USD
              </>
            }
          />
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[25, 50, 75, 100].map((p, i) => (
              <button
                key={p}
                onClick={() => setAmount(((profile.balance * p) / 100).toFixed(2))}
                className="step-in rounded-full border border-[#d6d9dd] py-2 text-[10px] font-semibold text-[#181c25] transition-colors hover:border-[#181c25]"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {p}%
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <PrimaryButton onClick={submit} disabled={!valid} loading={busy}>
            Withdraw
          </PrimaryButton>
        </div>
      </div>
    </CashierScreen>
  );
}
