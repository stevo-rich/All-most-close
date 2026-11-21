import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { IconDollar, IconMinus, IconPlus, IconRefresh, IconTransfer } from "../icons";
import { useLoaded, useToast } from "../ui";

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
      <span className="text-[14px] text-white">{label}</span>
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

function Overview({ toast }: { toast: (m: string) => void }) {
  const demo = () => toast("This is a UI demo clone — no real payments are possible.");
  return (
    <>
      <section className="-mt-8 rounded-b-[32px] bg-[#f5f5f5] px-4 pb-6 pt-14">
        <h2 className="text-[20px] font-bold tracking-tight text-[#181c25]">Make your first deposit</h2>
        <p className="mt-1 text-[15px] text-[#8a8f99]">Deposit in crypto or your local currency, instantly.</p>
        <div className="hide-scroll -mx-4 mt-4 flex gap-2 overflow-x-auto px-4">
          <Card onClick={demo} className="anim-fade-up flex h-[110px] w-[137px] shrink-0 flex-col items-center justify-between rounded-3xl bg-[#ebebeb] px-3 pb-3 pt-4 hover:bg-[#e3e3e3]">
            <span className="text-[20px] font-extrabold tracking-tight">
              <span className="text-[#7b3fa0]">Dusu</span>
              <span className="text-[#f5b800]">Pay</span>
            </span>
            <span className="text-[14px] font-semibold">Mobile Money</span>
          </Card>
          <Card onClick={demo} className="anim-fade-up flex h-[110px] w-[137px] shrink-0 flex-col items-center justify-between rounded-3xl bg-[#ebebeb] px-3 pb-3 pt-4 hover:bg-[#e3e3e3]" >
            <span className="flex items-center gap-1 text-[10px] font-bold leading-[10px]">
              <svg width="22" height="22" viewBox="0 0 24 24">
                <rect x="3" y="8" width="18" height="12" rx="2" fill="#111" />
                <rect x="6" y="4" width="12" height="5" rx="1" fill="#111" />
                <circle cx="14" cy="14" r="2.5" fill="#ebebeb" />
              </svg>
              Payment
              <br />
              Agent
            </span>
            <span className="text-[14px] font-semibold">Payment Agent</span>
          </Card>
          <Card onClick={demo} className="anim-fade-up flex h-[110px] w-[137px] shrink-0 flex-col items-center justify-between rounded-3xl bg-[#ebebeb] px-3 pb-3 pt-4 hover:bg-[#e3e3e3]">
            <span className="text-[18px] font-extrabold tracking-tight">
              <span className="text-[#3a9d23]">m</span>
              <span className="text-[#e11d2a]">-</span>
              <span className="text-[#3a9d23]">PESA</span>
            </span>
            <span className="text-[14px] font-semibold">MPESA</span>
          </Card>
          <Card onClick={demo} className="anim-fade-up flex h-[110px] w-[137px] shrink-0 flex-col items-center justify-between rounded-3xl bg-[#ebebeb] px-3 pb-3 pt-4 hover:bg-[#e3e3e3]">
            <span className="text-[24px] font-black text-[#f7931a]">₿</span>
            <span className="text-[14px] font-semibold">Crypto</span>
          </Card>
        </div>
      </section>

      <section className="px-4 pb-8 pt-8">
        <h2 className="text-[20px] font-bold tracking-tight">Other payment methods</h2>
        <div className="mt-4 space-y-3">
          {[
            { t: "USD", d: "Fund via bank, card, e-wallet, and crypto." },
            { t: "Crypto", d: "Deposit BTC, ETH, USDT and more." },
            { t: "Deriv P2P", d: "Buy USD from other Deriv users." },
          ].map((m, i) => (
            <Card key={m.t} onClick={demo} className="anim-fade-up flex w-full items-center gap-4 rounded-3xl bg-[#f5f5f5] p-5 hover:bg-[#eeeeee]">
              <span style={{ animationDelay: `${i * 70}ms` }} className="text-[#181c25]">
                <IconDollar size={34} />
              </span>
              <span>
                <span className="block text-[20px] leading-6 text-[#181c25]">{m.t}</span>
                <span className="block text-[14px] text-[#6c717b]">{m.d}</span>
              </span>
            </Card>
          ))}
        </div>
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
      <h2 className="text-[20px] font-bold">{tab}</h2>
      {(rows[tab] ?? []).map(([a, b], i) => (
        <div key={a} className="anim-fade-up rounded-3xl bg-[#f5f5f5] p-5" style={{ animationDelay: `${i * 70}ms` }}>
          <div className="text-[17px] font-semibold">{a}</div>
          <div className="text-[14px] text-[#6c717b]">{b}</div>
        </div>
      ))}
    </section>
  );
}

export function PortfolioPage({ balanceHidden }: { balanceHidden: boolean }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [ind, setInd] = useState({ left: 0, width: 0 });
  const loaded = useLoaded(600);
  const toast = useToast();
  const [spin, setSpin] = useState(0);

  useLayoutEffect(() => {
    const el = refs.current[tab];
    if (el) setInd({ left: el.offsetLeft, width: el.offsetWidth });
  }, [tab]);

  const demo = () => toast("This is a UI demo clone — no real transactions are possible.");

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
              className={`pb-2 text-[18px] transition-colors duration-300 ${tab === t ? "text-white" : "text-[#8a8f99] hover:text-white/80"}`}
            >
              {t}
            </button>
          ))}
          <span className="absolute bottom-0 h-[3px] rounded-full bg-[#ff444f] transition-all duration-300 ease-out" style={{ left: ind.left, width: Math.min(ind.width, 32) }} />
        </div>

        {tab === "Overview" && (
          <>
            <div className="mt-6 px-6">
              <div className="text-[15px] text-[#b5b9c2]">Estimated total value</div>
              <div className="mt-0.5 flex items-center gap-3">
                {loaded ? (
                  <span className="anim-fade-in text-[26px] font-bold tracking-tight">{balanceHidden ? "••••••" : "0.00"} USD</span>
                ) : (
                  <span className="skeleton h-8 w-36 rounded-lg" />
                )}
                <button aria-label="Refresh" onClick={() => setSpin((s) => s + 1)} className="press">
                  <span key={spin} className={`flex ${spin ? "anim-spin-once" : ""}`}>
                    <IconRefresh size={20} />
                  </span>
                </button>
              </div>
              <div className="text-[15px] text-[#b5b9c2]">Updated 1 min ago</div>
            </div>
            <div className="mt-6 grid grid-cols-3 px-2">
              <ActionButton i={0} primary label="Deposit" onClick={demo}>
                <IconPlus size={26} />
              </ActionButton>
              <ActionButton i={1} label="Transfer" onClick={demo}>
                <IconTransfer size={26} />
              </ActionButton>
              <ActionButton i={2} label="Withdraw" onClick={demo}>
                <IconMinus size={26} />
              </ActionButton>
            </div>
          </>
        )}
      </section>

      <div key={tab} className="page-enter relative z-[1]">
        {tab === "Overview" ? <Overview toast={toast} /> : <Placeholder tab={tab} />}
      </div>
    </div>
  );
}
