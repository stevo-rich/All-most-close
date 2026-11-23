import { useEffect, useRef, useState } from "react";
import { accountStore, fmtUsd, useProfile } from "../account";
import { marketByName, ALL_VOLATILITY } from "../home/markets";
import { useToast } from "../ui";
import { Spinner } from "./kit";
import { SuccessTick } from "./Receipt";

/**
 * The Deriv Trader (DTrader) screen the Trade action opens.
 *
 * Mirrors app.deriv.com/dtrader: a dark header with the account chip and
 * balance, the symbol selector, a live-ish chart panel, the Rise/Fall two-button
 * purchase row with the quoted payout %, and — once a contract is bought — the
 * position card that flips to a green or red result when it closes.
 */
type Phase = "idle" | "buying" | "open" | "won" | "lost";

const PIPS = (n: number) => (n > 0 ? `+${n.toFixed(2)}` : n.toFixed(2));

function Chart({ series, tone }: { series: number[]; tone: string }) {
  const w = 340;
  const h = 150;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  const pts = series.map((v, i) => `${((i / (series.length - 1)) * w).toFixed(1)},${((1 - (v - min) / span) * (h - 14) + 7).toFixed(1)}`);
  const d = `M${pts.join(" L")}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tone} stopOpacity="0.22" />
          <stop offset="100%" stopColor={tone} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1="0" y1={h * g} x2={w} y2={h * g} stroke="#eceef0" strokeWidth="1" strokeDasharray="3 4" />
      ))}
      <path d={`${d} L${w},${h} L0,${h} Z`} fill="url(#chartfill)" />
      <path d={d} fill="none" stroke={tone} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function DTraderPage({
  onClose,
  symbol,
  account = "real",
}: {
  onClose: () => void;
  symbol?: string;
  /** Which pocket the stake comes from — the main trader or the demo balance. */
  account?: "real" | "demo";
}) {
  const { profile } = useProfile();
  const toast = useToast();
  const market = marketByName(symbol ?? "") ?? marketByName("Volatility 100 (1s) Index")!;

  const [sym, setSym] = useState(market.name);
  const [stake, setStake] = useState(1);
  const [phase, setPhase] = useState<Phase>("idle");
  const [tick, setTick] = useState(market.price);
  const [series, setSeries] = useState<number[]>(() => [...market.series]);
  const [profit, setProfit] = useState(0);
  const timer = useRef<number | undefined>(undefined);
  const opening = useRef<number | undefined>(undefined);
  const active = ALL_VOLATILITY.find((m) => m.name === sym) ?? market;
  const balance = account === "demo" ? profile.demo : profile.balance;
  const settle = (delta: number) => (account === "demo" ? accountStore.adjustDemo(delta) : accountStore.adjustBalance(delta));

  // Live tick feed so the chart breathes like the real one.
  useEffect(() => {
    const id = window.setInterval(() => {
      setTick((t) => {
        const next = t * (1 + (Math.random() - 0.5) * 0.0009);
        setSeries((s) => [...s.slice(1), Math.min(94, Math.max(6, s[s.length - 1] + (Math.random() - 0.5) * 9))]);
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => () => {
    window.clearTimeout(opening.current);
    window.clearTimeout(timer.current);
  }, []);

  // Switching symbol starts a fresh series at that market's quote.
  useEffect(() => {
    const m = marketByName(sym);
    if (!m) return;
    setTick(m.price);
    setSeries([...m.series]);
  }, [sym]);

  const buy = (rise: boolean) => {
    if (stake > balance) {
      toast({ kind: "error", message: "Insufficient balance", detail: "Transfer funds from your main account or lower your stake." });
      return;
    }
    if (phase === "buying" || phase === "open") return;
    setPhase("buying");
    opening.current = window.setTimeout(() => {
      opening.current = undefined;
      setPhase("open");
      timer.current = window.setTimeout(() => {
        timer.current = undefined;
        const win = Math.random() < 0.7;
        const p = win ? Math.round(stake * (active.payout / 100) * 100) / 100 : -stake;
        setProfit(p);
        // Settle against the pocket this screen is trading, so the header,
        // Portfolio and the bot all see the same money.
        settle(p);
        setPhase(win ? "won" : "lost");
        toast({
          kind: win ? "success" : "error",
          message: win ? "Contract won" : "Contract lost",
          detail: `${PIPS(p)} USD · ${rise ? "Rise" : "Fall"} · ${active.name}`,
        });
      }, 3200);
    }, 700);
  };

  const payout = Math.round(stake * (1 + active.payout / 100) * 100) / 100;
  const tone = phase === "lost" ? "#ff444f" : "#4bb4b3";

  return (
    <div className="page-push flex h-full flex-col bg-[#f2f3f4]">
      <header className="shrink-0 bg-[#181c25] text-white">
        <div className="flex h-[52px] items-center gap-2 px-2">
          <button onClick={onClose} aria-label="Close trader" className="press flex h-9 w-9 items-center justify-center rounded-full">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 19 8 12l7-7" />
            </svg>
          </button>
          <span className="flex-1 truncate text-[11px] font-bold">Deriv Trader</span>
          <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-semibold">
            <span className={`h-1.5 w-1.5 rounded-full ${account === "demo" ? "bg-[#ffad3a]" : "bg-[#4bb4b3]"}`} />
            {account === "demo" ? "Demo" : "Options"}
          </span>
        </div>
        <div className="flex items-baseline justify-between px-4 pb-3">
          <span className="text-[9px] text-white/60">Balance</span>
          <span className="text-[13px] font-bold tabular-nums">{fmtUsd(balance)} USD</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* symbol + quote */}
        <div className="bg-white px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <select
              value={sym}
              onChange={(e) => setSym(e.target.value)}
              className="min-w-0 flex-1 truncate bg-transparent text-[11px] font-bold text-[#181c25] outline-none"
            >
              {ALL_VOLATILITY.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
            <span className="shrink-0 text-[11px] font-bold tabular-nums text-[#181c25]">
              {tick.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-[8.5px] text-[#6c717b]">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4bb4b3]" />
              Live · tick {active.tick}
            </span>
            <span>·</span>
            <span>Payout {active.payout.toFixed(1)}%</span>
          </div>
        </div>

        <div className="mt-2 bg-white px-1 py-2">
          <Chart series={series} tone={tone} />
        </div>

        {/* stake + payout */}
        <div className="mt-2 bg-white px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#6c717b]">Stake</span>
            <span className="text-[10px] font-semibold tabular-nums text-[#181c25]">
              {fmtUsd(stake)} USD · payout {fmtUsd(payout)} USD
            </span>
          </div>
          <input
            type="range"
            min={0.35}
            max={Math.max(2, Math.min(100, balance || 2))}
            step={0.35}
            value={stake}
            onChange={(e) => setStake(Number(e.target.value))}
            className="mt-3 w-full accent-[#ff444f]"
          />
        </div>

        {/* position card */}
        {phase !== "idle" && phase !== "buying" && (
          <div className="anim-fade-up mt-2 bg-white px-4 py-3">
            {phase === "open" && (
              <div className="flex items-center gap-3">
                <Spinner size={20} />
                <div className="flex-1">
                  <div className="text-[10px] font-bold text-[#181c25]">Contract open</div>
                  <div className="text-[9px] text-[#6c717b]">Waiting for the next ticks to settle…</div>
                </div>
                <span className="text-[10px] font-semibold tabular-nums text-[#6c717b]">{fmtUsd(stake)}</span>
              </div>
            )}
            {(phase === "won" || phase === "lost") && (
              <div className="flex items-center gap-3">
                <SuccessTick tone={phase === "won" ? "#4bb4b3" : "#ff444f"} size={44} />
                <div className="flex-1">
                  <div className="text-[10px] font-bold" style={{ color: phase === "won" ? "#0f5655" : "#8c1d25" }}>
                    {phase === "won" ? "Contract won" : "Contract lost"}
                  </div>
                  <div className="text-[9px] text-[#6c717b]">{active.name} · {active.payout.toFixed(1)}% payout</div>
                </div>
                <span className="text-[11px] font-bold tabular-nums" style={{ color: phase === "won" ? "#4bb4b3" : "#ff444f" }}>
                  {PIPS(profit)}
                </span>
              </div>
            )}
            {phase !== "open" && (
              <button onClick={() => setPhase("idle")} className="press mt-3 w-full rounded-full border border-[#d6d9dd] py-2 text-[10px] font-bold">
                New trade
              </button>
            )}
          </div>
        )}
      </div>

      {/* Rise / Fall purchase row, like DTrader's purchase buttons */}
      <div className="shrink-0 border-t border-[#e6e8ea] bg-white p-3">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => buy(true)}
            disabled={phase === "buying" || phase === "open"}
            className="press flex flex-col items-center rounded-[8px] bg-[#4bb4b3] py-3 text-white transition-colors hover:brightness-105 disabled:opacity-50"
          >
            <span className="text-[11px] font-bold">Rise</span>
            <span className="text-[9px] font-semibold opacity-90">{fmtUsd(payout)} USD</span>
          </button>
          <button
            onClick={() => buy(false)}
            disabled={phase === "buying" || phase === "open"}
            className="press flex flex-col items-center rounded-[8px] bg-[#ff444f] py-3 text-white transition-colors hover:brightness-105 disabled:opacity-50"
          >
            <span className="text-[11px] font-bold">Fall</span>
            <span className="text-[9px] font-semibold opacity-90">{fmtUsd(payout)} USD</span>
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between text-[8px] text-[#9aa1aa]">
          <span>Rise/Fall · {active.name}</span>
          <span>Stake {fmtUsd(stake)} USD</span>
        </div>
      </div>
    </div>
  );
}
