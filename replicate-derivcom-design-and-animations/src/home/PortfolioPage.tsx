import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { IconMinus, IconPlus, IconRefresh, IconTransfer } from "../icons";
import { useLoaded } from "../ui";
import { fmtUsd, useProfile } from "../account";
import { CashierHub, type CashierRoute } from "../cashier/CashierHub";
import { DepositFlow } from "../cashier/DepositFlow";
import { WithdrawFlow } from "../cashier/WithdrawFlow";
import { TransferFlow } from "../cashier/TransferFlow";
import { DTraderPage } from "../cashier/DTraderPage";

const TABS = ["Overview", "Wallet", "Partners", "Trading", "P2P"] as const;

function ActionButton({ label, children, primary, onClick, i }: { label: string; children: ReactNode; primary?: boolean; onClick: () => void; i: number }) {
  return (
    <button onClick={onClick} className="group anim-fade-up flex flex-col items-center gap-1.5" style={{ animationDelay: `${150 + i * 70}ms` }}>
      <span
        className={`flex h-[49px] w-[49px] items-center justify-center rounded-full text-white transition-all duration-300 group-active:scale-90 group-hover:scale-105 ${
          primary ? "bg-[#ff444f] shadow-[0_6px_20px_rgba(255,68,79,.4)]" : "border-[1.5px] border-white/90 hover:bg-white/10"
        }`}
      >
        {children}
      </span>
      <span className="text-[10.5px] text-white">{label}</span>
    </button>
  );
}

function Card({ children, onClick, className = "" }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button onClick={onClick} className={`press text-left ${className}`}>
      {children}
    </button>
  );
}

function PayIcon({ kind }: { kind: "usd" | "p2p" | "crypto" }) {
  return (
    <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border-[1.6px] border-[#181c25] text-[#181c25]">
      {kind === "usd" && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5v9M14.6 9.6c-.5-.8-1.4-1.2-2.6-1.2-1.5 0-2.6.7-2.6 1.9 0 1.3 1.2 1.8 2.6 2 1.5.3 2.7.8 2.7 2.1 0 1.2-1.1 1.9-2.7 1.9-1.3 0-2.2-.5-2.7-1.3" />
        </svg>
      )}
      {kind === "p2p" && (
        <span className="text-[9px] font-extrabold tracking-tight">P2P</span>
      )}
      {kind === "crypto" && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M9.5 15.5v-7h3a2.1 2.1 0 0 1 0 4.2h-3M11.2 6.5v1.6M11.2 15.5v1.8" />
        </svg>
      )}
    </span>
  );
}

function Overview({ onDeposit }: { onDeposit: () => void }) {
  const { profile } = useProfile();
  const [tab3, setTab3] = useState(false);
  return (
    <>
      <section className="bg-white px-4 pb-6 pt-5">
        <h2 className="text-[15px] font-bold tracking-tight text-[#181c25]">Make your first deposit</h2>
        <p className="mt-1 text-[11.5px] text-[#8a8f99]">Deposit in crypto or your local currency, instantly.</p>
        <div className="hide-scroll -mx-4 mt-4 flex gap-2.5 overflow-x-auto px-4">
          <Card onClick={onDeposit} className="anim-fade-up flex h-[108px] w-[137px] shrink-0 flex-col items-center justify-between rounded-[14px] bg-[#f2f2f2] px-3 pb-3.5 pt-5 hover:bg-[#e9e9e9]">
            <span className="text-[15px] font-extrabold tracking-tight">
              <span className="text-[#7b3fa0]">Dusu</span>
              <span className="text-[#f5b800]">Pay</span>
            </span>
            <span className="text-[12px] font-bold text-[#181c25]">Mobile Money</span>
          </Card>
          <Card onClick={onDeposit} className="anim-fade-up flex h-[108px] w-[137px] shrink-0 flex-col items-center justify-between rounded-[14px] bg-[#f2f2f2] px-3 pb-3.5 pt-5 hover:bg-[#e9e9e9]">
            <span className="flex items-center gap-1 text-[7.5px] font-bold leading-[10px] text-[#181c25]">
              <svg width="21" height="21" viewBox="0 0 24 24">
                <rect x="3" y="8" width="18" height="12" rx="2" fill="#111" />
                <rect x="6" y="4" width="12" height="5" rx="1" fill="#111" />
                <circle cx="14" cy="14" r="2.5" fill="#f2f2f2" />
              </svg>
              Payment Agent
            </span>
            <span className="text-[12px] font-bold text-[#181c25]">Payment Agent</span>
          </Card>
          <Card onClick={onDeposit} className="anim-fade-up flex h-[108px] w-[137px] shrink-0 flex-col items-center justify-between rounded-[14px] bg-[#f2f2f2] px-3 pb-3.5 pt-5 hover:bg-[#e9e9e9]">
            <span className="text-[14px] font-extrabold tracking-tight">
              <span className="text-[#3a9d23]">m</span>
              <span className="text-[#e11d2a]">-</span>
              <span className="text-[#3a9d23]">PESA</span>
            </span>
            <span className="text-[12px] font-bold text-[#181c25]">MPESA</span>
          </Card>
        </div>
      </section>

      <section className="px-4 pb-2 pt-5">
        <h2 className="text-[15px] font-bold tracking-tight text-[#181c25]">Other payment methods</h2>
        <div className="mt-3.5 space-y-2.5">
          {[
            { t: "USD", d: "Fund via bank, card, e-wallet, and crypto.", k: "usd" as const },
            { t: "P2P", d: "Buy and sell USD with other traders. Deposit and withdraw in your local currency.", k: "p2p" as const },
            { t: "Crypto", d: "Quickly fund your account with USDT, USDC, and more.", k: "crypto" as const },
          ].map((m, i) => (
            <Card
              key={m.t}
              onClick={onDeposit}
              className="anim-fade-up flex w-full items-center gap-4 rounded-[16px] bg-[#f5f5f5] px-4 py-4 text-left hover:bg-[#eeeeee]"
            >
              <PayIcon kind={m.k} />
              <span className="min-w-0 flex-1" style={{ animationDelay: `${i * 70}ms` }}>
                <span className="block text-[16px] leading-[1.35] text-[#181c25]">{m.t}</span>
                <span className="mt-0.5 block text-[11.5px] leading-[1.45] text-[#8a8f99]">{m.d}</span>
              </span>
            </Card>
          ))}
        </div>
      </section>

      <section className="px-4 pb-6 pt-6">
        <h2 className="text-[15px] font-bold tracking-tight text-[#181c25]">Trading</h2>
        <div className="mt-4 space-y-3">
          <div className="anim-fade-up flex items-center gap-3.5">
            <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[7px] bg-[#ff444f]">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 19V9m5 10V5m5 14v-8m5 8V7" />
              </svg>
            </span>
            <span className="flex-1 text-[15px] text-[#181c25]">Options</span>
            <span className="text-[14px] tabular-nums text-[#181c25]">{fmtUsd(profile.balance)} USD</span>
          </div>
          <div className="h-px bg-[#eceef0]" />
          <div className="anim-fade-up flex items-center gap-3.5" style={{ animationDelay: "70ms" }}>
            <span className="flex h-[30px] w-[30px] flex-col items-center justify-center overflow-hidden rounded-[7px] bg-[#1c2b4a]">
              <span className="text-[4.5px] font-bold leading-none text-white">MTS</span>
              <span className="mt-[2px] rounded-[1px] bg-[#2d6bd8] px-[3px] text-[4.5px] font-bold leading-[6px] text-white">STD</span>
            </span>
            <span className="flex-1 text-[15px] text-[#181c25]">Standard</span>
            <span className="text-[14px] tabular-nums text-[#181c25]">0.00 USD</span>
          </div>
        </div>

        <div className="relative mt-8 flex items-center justify-center">
          <span className="absolute inset-x-6 -top-3 h-[26px] rounded-t-[14px] border border-[#eceef0] border-b-transparent bg-white" />
          <button
            onClick={() => setTab3((v) => !v)}
            className="press relative flex w-[268px] items-center justify-center gap-2.5 rounded-full border border-[#eceef0] bg-white py-[13px] text-[14px] text-[#181c25] shadow-[0_2px_10px_rgba(0,0,0,.05)]"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 8h13l-3-3M20 16H7l3 3" />
            </svg>
            View all transactions
          </button>
        </div>

        {tab3 && (
          <div className="anim-fade-up mt-3 rounded-[14px] bg-[#f5f5f5] p-4 text-[11.5px] text-[#6c717b]">
            No transactions yet. Deposits, withdrawals and trades will appear here.
          </div>
        )}
      </section>
    </>
  );
}

function Placeholder({ tab }: { tab: string }) {
  const rows: Record<string, [string, string][]> = {
    Wallet: [
      ["USD Wallet", "0.00 USD"],
      ["BTC Wallet", "0.00000000 BTC"],
      ["USDT Wallet", "0.00 USDT"],
    ],
    Partners: [
      ["Affiliate programme", "Earn commission by referring traders"],
      ["Payment agents", "Become a payment agent"],
    ],
    Trading: [
      ["CFDs | Standard", "0.00 USD"],
      ["Options", "0.00 USD"],
    ],
    P2P: [
      ["Buy / Sell", "Trade USD with other users"],
      ["My ads", "No ads yet"],
    ],
  };
  return (
    <section className="space-y-3 px-4 py-6">
      <h2 className="text-[15px] font-bold">{tab}</h2>
      {(rows[tab] ?? []).map(([a, b], i) => (
        <div key={a} className="anim-fade-up rounded-3xl bg-[#f5f5f5] p-5" style={{ animationDelay: `${i * 70}ms` }}>
          <div className="text-[13px] font-semibold">{a}</div>
          <div className="text-[10.5px] text-[#6c717b]">{b}</div>
        </div>
      ))}
    </section>
  );
}

export function PortfolioPage({ balanceHidden }: { balanceHidden: boolean }) {
  const { profile } = useProfile();
  const [route, setRoute] = useState<CashierRoute>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [ind, setInd] = useState({ left: 0, width: 0 });
  const loaded = useLoaded(600);
  const [spin, setSpin] = useState(0);

  useLayoutEffect(() => {
    const el = refs.current[tab];
    if (el) setInd({ left: el.offsetLeft, width: el.offsetWidth });
  }, [tab]);

  const open = (r: Exclude<CashierRoute, null>) => setRoute(r);

  return (
    <div>
      <section className="bg-[#181c25] pb-8 text-white" style={{ borderRadius: "0 0 32px 32px", position: "relative", zIndex: 2 }}>
        <div className="relative flex gap-5 px-6 pt-2">
          {TABS.map((t) => (
            <button
              key={t}
              ref={(el) => {
                refs.current[t] = el;
              }}
              onClick={() => setTab(t)}
              className={`pb-2 text-[13.5px] transition-colors duration-300 ${tab === t ? "text-white" : "text-[#8a8f99] hover:text-white/80"}`}
            >
              {t}
            </button>
          ))}
          <span className="absolute bottom-0 h-[3px] rounded-full bg-[#ff444f] transition-all duration-300 ease-out" style={{ left: ind.left, width: Math.min(ind.width, 32) }} />
        </div>

        {tab === "Overview" && (
          <>
            <div className="mt-6 px-6">
              <div className="text-[11px] text-[#b5b9c2]">Estimated total value</div>
              <div className="mt-0.5 flex items-center gap-3">
                {loaded ? (
                  <span className="anim-fade-in text-[19.5px] font-bold tracking-tight">{balanceHidden ? "••••••" : fmtUsd(profile.balance)} USD</span>
                ) : (
                  <span className="skeleton h-8 w-36 rounded-lg" />
                )}
                <button aria-label="Refresh" onClick={() => setSpin((s) => s + 1)} className="press">
                  <span key={spin} className={`flex ${spin ? "anim-spin-once" : ""}`}>
                    <IconRefresh size={20} />
                  </span>
                </button>
              </div>
              <div className="text-[11px] text-[#b5b9c2]">Updated 1 min ago</div>
            </div>
            <div className="mt-6 grid grid-cols-3 px-2">
              <ActionButton i={0} primary label="Deposit" onClick={() => open("deposit")}>
                <IconPlus size={26} />
              </ActionButton>
              <ActionButton i={1} label="Transfer" onClick={() => open("transfer")}>
                <IconTransfer size={26} />
              </ActionButton>
              <ActionButton i={2} label="Withdraw" onClick={() => open("withdraw")}>
                <IconMinus size={26} />
              </ActionButton>
            </div>
          </>
        )}
      </section>

      <div key={tab} className="page-enter relative z-[1]">
        {tab === "Overview" ? <Overview onDeposit={() => open("deposit")} /> : <Placeholder tab={tab} />}
      </div>

      {route && (
        <div className="absolute inset-0 z-50">
          {route === "deposit" && <DepositFlow onClose={() => setRoute(null)} />}
          {route === "withdraw" && <WithdrawFlow onClose={() => setRoute(null)} />}
          {route === "transfer" && <TransferFlow onClose={() => setRoute(null)} />}
          {route === "trader" && <DTraderPage onClose={() => setRoute(null)} />}
          {route === "hub" && <CashierHub onClose={() => setRoute(null)} onGo={(r) => setRoute(r)} />}
        </div>
      )}
    </div>
  );
}
