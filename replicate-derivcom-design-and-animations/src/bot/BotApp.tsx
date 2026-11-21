import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  DbLogo,
  IconAlign,
  IconBasket,
  IconChart,
  IconChevronDown,
  IconChevronUp,
  IconDashboard,
  IconDoc,
  IconFolder,
  IconKebab,
  IconList,
  IconMenu,
  IconPlay,
  IconPuzzle,
  IconRedo,
  IconRefresh,
  IconSave,
  IconStop,
  IconUndo,
  IconZoomIn,
  IconZoomOut,
} from "../icons";
import { Sheet, useToast } from "../ui";

type BotTab = "dashboard" | "builder" | "chart" | "menu";
type Account = "real" | "demo";
type Tx = { id: number; entry: number; exit: number; stake: number; profit: number; rise: boolean; contractId?: number };
type Cfg = {
  symbol: string;
  tradeType: string;
  tradeType2: string;
  contractType: string;
  candle: string;
  restartBuySell: boolean;
  restartLast: boolean;
  durationUnit: string;
  duration: number;
  stake: number;
  purchase: string;
};

/**
 * The builder opens with the symbol chosen but trade type / contract type
 * unselected, matching the reference bot.deriv.com screenshot.
 */
const DEFAULT_CFG: Cfg = {
  symbol: "Volatility 100 (1s) Index",
  tradeType: "",
  tradeType2: "",
  contractType: "",
  candle: "1 minute",
  restartBuySell: false,
  restartLast: true,
  durationUnit: "Ticks",
  duration: 1,
  stake: 1,
  purchase: "Rise",
};

/* ------------------------------------------------------------------ */
/* Local persistence so trades/balances survive closing the bot        */
/* ------------------------------------------------------------------ */
const STORE_KEY = "deriv-demo-bot-state-v1";

type Store = { bal: { real: number; demo: number }; txs: Tx[] };

function loadState(): Store {
  const fallback: Store = { bal: { real: 0, demo: 10000 }, txs: [] };
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      bal: {
        real: typeof parsed.bal?.real === "number" ? parsed.bal.real : fallback.bal.real,
        demo: typeof parsed.bal?.demo === "number" ? parsed.bal.demo : fallback.bal.demo,
      },
      txs: Array.isArray(parsed.txs) ? parsed.txs.filter((t) => typeof t?.id === "number") : [],
    };
  } catch {
    return fallback;
  }
}

function saveState(s: Store) {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify({ bal: s.bal, txs: s.txs.slice(0, 50) }));
  } catch {
    /* storage unavailable — demo continues in memory */
  }
}

const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** "2026-11-21 13:37:40 GMT" stamp used by the bot Journal. */
const journalStamp = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())} GMT`;
};
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const today = () => {
  const d = new Date();
  return `${d.getDate()} ${MONTHS[d.getMonth()]}${d.getFullYear()}`;
};

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */
function Sel({ value, options, onChange, placeholder = "" }: { value: string; options: string[]; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="blk-field relative cursor-pointer">
      <span className="min-w-[2px] text-[14px] text-[#333]">{value || placeholder}</span>
      <span className="text-[8px] leading-none text-black">▼</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0">
        {!value && <option value="" />}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function Num({ value, onChange, w = 40 }: { value: number; onChange: (n: number) => void; w?: number }) {
  return (
    <input
      type="number"
      min={1}
      value={value}
      onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
      className="blk-field text-center text-[14px] text-[#333] outline-none focus:border-[#ff444f]"
      style={{ width: w + 24 }}
    />
  );
}

function Row({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex w-max items-center gap-1.5 whitespace-nowrap rounded-[3px] bg-[#e5e7ea] px-2 py-[7px] text-[14.5px] text-[#333] ${className}`}>{children}</div>
  );
}

function Check({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className="flex h-5 w-5 items-center justify-center rounded-[4px] bg-white text-[15px] font-bold leading-none transition-transform active:scale-90">
      {checked ? "✓" : ""}
    </button>
  );
}

function CandleBadge() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26">
      <rect x="1" y="2" width="16" height="6.5" rx="2" fill="#333" />
      <text x="9" y="7.2" fontSize="5" fontWeight="800" textAnchor="middle" fill="#fff">
        100
      </text>
      <circle cx="21" cy="5" r="3.2" fill="#ff444f" />
      {[3, 7, 11, 15, 19].map((x, i) => (
        <g key={x}>
          <rect x={x} y={12 + (i % 2) * 2} width="2.4" height={8 - (i % 3)} fill={i % 2 ? "#ff444f" : "#4bb4b3"} />
          <rect x={x + 0.9} y={10 + (i % 2) * 2} width="0.6" height="12" fill="#555" />
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Boot splash — "Initializing Deriv Bot account…"                     */
/* ------------------------------------------------------------------ */
function BootSplash() {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="flex h-14 shrink-0 items-start justify-start px-3 pt-3">
        <DbLogo size={33} />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center pb-24">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="h-[18px] w-[7px] rounded-full bg-[#9fb3bd]"
              style={{ animation: "boot-pulse 1.1s ease-in-out infinite", animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </div>
        <p className="mt-16 text-[16px] text-[#333]">Initializing Deriv Bot account...</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pages                                                               */
/* ------------------------------------------------------------------ */
function Dashboard({ onBuilder, onQuick }: { onBuilder: () => void; onQuick: () => void }) {
  const toast = useToast();
  const tiles: { label: string; icon: ReactNode; on: () => void }[] = [
    {
      label: "Local",
      on: () => toast("Choose a bot file from your device (demo)."),
      icon: (
        <svg width="40" height="52" viewBox="0 0 40 52">
          <rect x="3" y="2" width="34" height="48" rx="6" fill="#0e4c6e" stroke="#7fc3c0" strokeWidth="2" />
          <rect x="7" y="7" width="26" height="34" rx="2" fill="#0a5a82" />
          <rect x="15" y="4" width="10" height="2" rx="1" fill="#7fc3c0" />
          <circle cx="20" cy="45" r="1.8" fill="#7fc3c0" />
        </svg>
      ),
    },
    {
      label: "Google Drive",
      on: () => toast("Google Drive import is not available in this demo."),
      icon: (
        <svg width="50" height="46" viewBox="0 0 50 44">
          <path d="M17 2h16l17 29H34L17 2Z" fill="#fbbc04" />
          <path d="M17 2 0 31l8 13 17-29L17 2Z" fill="#0f9d58" />
          <path d="M8 44h34l8-13H16L8 44Z" fill="#4285f4" />
          <path d="M34 31h16l-8 13-8-13Z" fill="#ea4335" />
        </svg>
      ),
    },
    {
      label: "Bot Builder",
      on: onBuilder,
      icon: (
        <svg width="44" height="52" viewBox="0 0 44 52">
          <path d="M8 6h12v8a4 4 0 0 1 8 0v0a4 4 0 0 0 0 0V6h6v14H20v6h-8z" fill="#a6d1cc" />
          <path d="M18 26h14v8a4 4 0 0 1 0 0h6v14H18V38h-6v-6h6z" fill="#0e4c6e" />
          <rect x="6" y="6" width="14" height="22" rx="2" fill="#a6d1cc" />
          <rect x="16" y="26" width="18" height="22" rx="2" fill="#0e4c6e" />
        </svg>
      ),
    },
    {
      label: "Quick strategy",
      on: onQuick,
      icon: (
        <svg width="54" height="50" viewBox="0 0 54 50">
          <rect x="0" y="0" width="27" height="25" fill="#a6d1cc" />
          <rect x="27" y="0" width="27" height="25" fill="#0e4c6e" />
          <rect x="0" y="25" width="27" height="25" fill="#0e4c6e" />
          <rect x="27" y="25" width="27" height="25" fill="#a6d1cc" />
          <circle cx="27" cy="12" r="5" fill="#a6d1cc" />
          <circle cx="13" cy="25" r="5" fill="#a6d1cc" />
          <circle cx="40" cy="25" r="5" fill="#0e4c6e" />
          <circle cx="27" cy="37" r="5" fill="#0e4c6e" />
        </svg>
      ),
    },
  ];
  return (
    <div className="px-4 pb-6 pt-5">
      <p className="anim-fade-up max-w-[330px] text-[15px] leading-[1.45] text-[#333]">Import a bot from your computer or Google Drive, build it from scratch, or start with a quick strategy.</p>
      <div className="mt-10 grid grid-cols-4 gap-3">
        {tiles.map((t, i) => (
          <button key={t.label} onClick={t.on} className="group anim-fade-up flex flex-col items-center" style={{ animationDelay: `${i * 70}ms` }}>
            <span className="flex h-[65px] w-[65px] items-center justify-center rounded-xl bg-[#f2f3f4] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md group-active:scale-90">
              <span className="origin-center scale-[0.72]">{t.icon}</span>
            </span>
            <span className="mt-2.5 whitespace-nowrap text-[15px] text-[#333]">{t.label}</span>
          </button>
        ))}
      </div>

      <h2 className="mt-12 text-[18px] font-bold text-[#333]">Your bots:</h2>
      <div className="mt-5 grid grid-cols-[1.35fr_1.1fr_1.25fr_28px] border-b border-[#e6e8ea] pb-3 text-[15px] font-bold text-[#333]">
        <span>Bot name</span>
        <span>Last modified</span>
        <span>Status</span>
        <span />
      </div>
      <div className="anim-fade-up grid grid-cols-[1.35fr_1.1fr_1.25fr_28px] items-center border-b border-[#e6e8ea] py-3.5 text-[15px] text-[#333] transition-colors hover:bg-[#f9fafb]">
        <span>Untitled Bot</span>
        <span>{today()}</span>
        <span className="flex items-center gap-2">
          <IconDoc size={26} strokeWidth={1.2} />
          Unsaved
        </span>
        <button aria-label="Options" onClick={() => toast("Bot options (demo)")} className="press">
          <IconKebab size={20} />
        </button>
      </div>
    </div>
  );
}

function Builder({ cfg, set, zoom, onQuick }: { cfg: Cfg; set: (p: Partial<Cfg>) => void; zoom: number; onQuick: () => void }) {
  const symbols = ["Volatility 10 (1s) Index", "Volatility 25 (1s) Index", "Volatility 50 (1s) Index", "Volatility 75 (1s) Index", "Volatility 100 (1s) Index"];
  return (
    <div className="h-full overflow-auto bg-white pb-14 pl-[57px] pt-3">
      <button onClick={onQuick} className="press anim-fade-up rounded-[4px] bg-[#ff444f] px-[17px] py-[13px] text-[17px] font-bold text-white shadow-sm hover:bg-[#ff5a64]">
        Quick strategy
      </button>
      <div style={{ transform: `scale(${zoom})`, transformOrigin: "0 0", transition: "transform .25s ease" }} className="mt-4 ml-[18px] w-[243px]">
        {/* Block 1 */}
        <div className="anim-fade-up rounded-[3px] bg-[#074f6f] pb-5 text-white shadow-[0_2px_6px_rgba(0,0,0,.15)]" style={{ animationDelay: "60ms" }}>
          <div className="flex items-center gap-3 px-3 py-[11px] text-[17px]">
            <IconList size={20} />
            1. Trade parameters
          </div>
          <div className="space-y-px pl-3.5">
            <Row>
              Market:
              <Sel value="Derived" options={["Derived"]} onChange={() => {}} />
              <span>&gt;</span>
              <Sel value="Continuous Indices" options={["Continuous Indices"]} onChange={() => {}} />
              <span>&gt;</span>
              <Sel value={cfg.symbol} options={symbols} onChange={(v) => set({ symbol: v })} />
            </Row>
            <Row>
              Trade Type:
              <Sel value={cfg.tradeType} options={["Up/Down", "Even/Odd", "Over/Under"]} onChange={(v) => set({ tradeType: v })} />
              <span>&gt;</span>
              <Sel value={cfg.tradeType2} options={["Rise/Fall", "Higher/Lower"]} onChange={(v) => set({ tradeType2: v })} />
            </Row>
            <Row>
              Contract Type:
              <Sel value={cfg.contractType} options={["Both", "Rise", "Fall"]} onChange={(v) => set({ contractType: v })} />
            </Row>
            <Row>
              Default Candle Interval:
              <Sel value={cfg.candle} options={["1 minute", "2 minutes", "5 minutes", "15 minutes"]} onChange={(v) => set({ candle: v })} />
            </Row>
            <Row>
              Restart buy/sell on error (disable for better performance):
              <Check checked={cfg.restartBuySell} onChange={(v) => set({ restartBuySell: v })} />
            </Row>
            <Row>
              Restart last trade on error (bot ignores the unsuccessful trade):
              <Check checked={cfg.restartLast} onChange={(v) => set({ restartLast: v })} />
            </Row>
          </div>
          <div className="px-3 pb-2.5 pt-3.5 text-[17px]">Run once at start:</div>
          <div className="h-7 w-[60px] rounded-[3px] bg-[#e5e7ea] ml-3.5" />
          <div className="px-3 pb-2.5 pt-3.5 text-[17px]">Trade options:</div>
          <div className="pl-3.5">
            <Row>
              Duration:
              <Sel value={cfg.durationUnit} options={["Ticks", "Seconds", "Minutes"]} onChange={(v) => set({ durationUnit: v })} />
              <Num value={cfg.duration} onChange={(n) => set({ duration: n })} w={14} />
              Stake: USD
              <Num value={cfg.stake} onChange={(n) => set({ stake: n })} w={14} />
            </Row>
          </div>
        </div>

        {/* Block 2 */}
        <div className="anim-fade-up mt-16 rounded-[3px] bg-[#074f6f] pb-5 text-white shadow-[0_2px_6px_rgba(0,0,0,.15)]" style={{ animationDelay: "140ms" }}>
          <div className="flex items-center gap-3 px-3 py-[11px] text-[17px]">
            <IconBasket size={20} />
            2. Purchase conditions
          </div>
          <div className="pl-3.5">
            <Row>
              Purchase
              <Sel value={cfg.purchase} options={["Rise", "Fall"]} onChange={(v) => set({ purchase: v })} />
              <span className="w-5" />
            </Row>
          </div>
        </div>
        <div className="h-24" />
      </div>
    </div>
  );
}

function LiveChart({ symbol }: { symbol: string }) {
  type C = { o: number; h: number; l: number; c: number };
  const [candles, setCandles] = useState<C[]>(() => {
    let p = 1525;
    return Array.from({ length: 32 }, () => {
      const o = p;
      const c = o + (Math.random() - 0.48) * 6;
      p = c;
      return { o, c, h: Math.max(o, c) + Math.random() * 2, l: Math.min(o, c) - Math.random() * 2 };
    });
  });
  useEffect(() => {
    let n = 0;
    const id = window.setInterval(() => {
      n++;
      setCandles((cs) => {
        const last = cs[cs.length - 1];
        const c = last.c + (Math.random() - 0.48) * 3;
        const upd = { ...last, c, h: Math.max(last.h, c), l: Math.min(last.l, c) };
        if (n % 4 === 0) return [...cs.slice(1), upd, { o: c, c, h: c, l: c }].slice(-32);
        return [...cs.slice(0, -1), upd];
      });
    }, 700);
    return () => window.clearInterval(id);
  }, []);
  const lo = Math.min(...candles.map((c) => c.l));
  const hi = Math.max(...candles.map((c) => c.h));
  const y = (v: number) => 20 + (1 - (v - lo) / (hi - lo || 1)) * 260;
  const last = candles[candles.length - 1];
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-[#e6e8ea] px-4 py-3">
        <span className="text-[15px] font-bold">{symbol}</span>
        <span className="text-[15px] font-bold text-[#4bb4b3]">{last.c.toFixed(2)}</span>
      </div>
      <svg viewBox="0 0 340 300" className="w-full flex-1 px-2" preserveAspectRatio="none">
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1="0" x2="340" y1={20 + i * 65} y2={20 + i * 65} stroke="#eceef0" />
        ))}
        {candles.map((c, i) => {
          const up = c.c >= c.o;
          const x = 6 + i * 10.3;
          const col = up ? "#4bb4b3" : "#ff444f";
          return (
            <g key={i}>
              <line x1={x + 3} x2={x + 3} y1={y(c.h)} y2={y(c.l)} stroke={col} />
              <rect x={x} y={Math.min(y(c.o), y(c.c))} width="6" height={Math.max(1.5, Math.abs(y(c.o) - y(c.c)))} fill={col} style={{ transition: "all .5s ease" }} />
            </g>
          );
        })}
        <line x1="0" x2="340" y1={y(last.c)} y2={y(last.c)} stroke="#333" strokeDasharray="3 3" opacity={0.5} />
      </svg>
    </div>
  );
}

function MenuPage({ go, openReports, onHome }: { go: (t: BotTab) => void; openReports: () => void; onHome: () => void }) {
  const items: [string, () => void][] = [
    ["Dashboard", () => go("dashboard")],
    ["Bot Builder", () => go("builder")],
    ["Charts", () => go("chart")],
    ["Reports", openReports],
    ["Back to Deriv home", onHome],
  ];
  return (
    <ul className="px-4 pt-3">
      {items.map(([l, f], i) => (
        <li key={l} className="anim-fade-up border-b border-[#e6e8ea]" style={{ animationDelay: `${i * 50}ms` }}>
          <button onClick={f} className="flex w-full items-center justify-between py-4 text-left text-[16px] text-[#333] hover:text-[#ff444f]">
            {l}
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Running-bot activity: the live contract card                         */
/* ------------------------------------------------------------------ */
function ActivityView({ tx, symbol, running }: { tx: Tx | null; symbol: string | null; running: boolean }) {
  if (!symbol) return null;
  const win = tx ? tx.profit > 0 : false;
  const lost = tx ? tx.profit < 0 : false;
  // contract value / payout derived from the stake, like bot.deriv.com
  const stake = tx?.stake ?? 0;
  const contractValue = tx ? Math.round(stake * 0.9018 * 100) / 100 : 0;
  const payout = tx ? Math.round((stake + (stake * 0.9)) * 100) / 100 : 0;

  return (
    <div className="anim-fade-up px-2 pt-2">
      {/* ticker row */}
      <div className="flex items-center justify-between gap-2 px-1 pb-2">
        <span className="flex min-w-0 items-center gap-1.5">
          <CandleBadge />
          <span className="truncate text-[13.5px] font-bold text-[#333]">{symbol}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5 text-[14px] font-bold text-[#333]">
          {tx?.rise === false ? (
            <svg width="16" height="16" viewBox="0 0 24 24" style={{ color: "#4bb4b3" }}>
              <path d="M4 4 20 20M9 20h11V9" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" style={{ color: "#ff444f" }}>
              <path d="M4 20 20 4M9 4h11v11" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {tx?.rise === false ? "Fall" : "Rise"}
        </span>
      </div>

      {/* contract detail card */}
      <div className="rounded-[4px] border border-[#e6e8ea] bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
        <span className="inline-flex items-center justify-center rounded-[4px] bg-[#4bb4b3] px-2 py-[2px] text-[10px] font-bold uppercase tracking-wide text-white">
          USD
        </span>
        <div className="mt-2.5 grid grid-cols-[1fr_1fr_auto] gap-x-3 gap-y-3">
          <div>
            <div className="text-[12px] leading-tight text-[#6c717b]">Total profit/loss:</div>
            <div className="mt-0.5 flex items-center gap-1 text-[15px] font-bold" style={{ color: win ? "#4bb4b3" : "#ff444f" }}>
              {tx ? `${tx.profit > 0 ? "" : ""}${fmt(tx.profit)}` : "0.00"}
              <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor">
                <path d={win ? "M6 1.5 11 9H1L6 1.5Z" : "M6 10.5 1 3h10L6 10.5Z"} />
              </svg>
            </div>
          </div>
          <div>
            <div className="text-[12px] leading-tight text-[#6c717b]">Contract value:</div>
            <div className="mt-0.5 flex items-center gap-1 text-[15px] font-bold" style={{ color: lost ? "#ff444f" : "#333" }}>
              {fmt(contractValue)}
              <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor">
                <path d={lost ? "M6 10.5 1 3h10L6 10.5Z" : "M6 1.5 11 9H1L6 1.5Z"} />
              </svg>
            </div>
          </div>
          <div className="row-span-2 flex flex-col items-center justify-center pr-1">
            <span className="text-[13px] text-[#333]">Tick 0</span>
            <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-[#e6e8ea]" />
          </div>
          <div>
            <div className="text-[12px] leading-tight text-[#6c717b]">Stake:</div>
            <div className="mt-0.5 text-[15px] font-bold text-[#333]">{fmt(stake)}</div>
          </div>
          <div>
            <div className="text-[12px] leading-tight text-[#6c717b]">Potential payout:</div>
            <div className="mt-0.5 text-[15px] font-bold text-[#333]">{fmt(payout)}</div>
          </div>
        </div>
        <div className="mt-4 border-t border-[#eceef0] pt-2.5 text-center text-[13px] text-[#6c717b]">
          {running ? "Resale not offered" : "Contract closed"}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Drawer: Summary / Transactions / Journal                            */
/* ------------------------------------------------------------------ */
function Totals({ txs, big }: { txs: Tx[]; big?: boolean }) {
  const stake = txs.reduce((a, t) => a + t.stake, 0);
  const payout = txs.reduce((a, t) => a + (t.profit > 0 ? t.stake + t.profit : 0), 0);
  const won = txs.filter((t) => t.profit > 0).length;
  const lost = txs.length - won;
  const pl = txs.reduce((a, t) => a + t.profit, 0);
  const cell = (label: string, value: string, color?: string) => (
    <div className="text-center">
      <div className={`font-bold text-[#333] ${big ? "text-[16px]" : "text-[15px]"}`}>{label}</div>
      <div key={value} className="anim-fade-in mt-3 text-[16px]" style={{ color: color ?? "#333" }}>
        {value}
      </div>
    </div>
  );
  return (
    <div className="grid grid-cols-3 gap-x-1 gap-y-9 px-2 pb-16 pt-5">
      {cell("Total stake", `${fmt(stake)} USD`)}
      {cell("Total payout", `${fmt(payout)} USD`)}
      {cell("No. of runs", String(txs.length))}
      {cell("Contracts lost", String(lost))}
      {cell("Contracts won", String(won))}
      {cell("Total profit/loss", `${pl > 0 ? "+" : ""}${fmt(pl)} USD`, pl > 0 ? "#4bb4b3" : pl < 0 ? "#ff444f" : undefined)}
    </div>
  );
}

function Drawer({
  open,
  setOpen,
  txs,
  journal,
  tab,
  setTab,
  reset,
  activeSymbol,
  running,
}: {
  open: boolean;
  setOpen: (o: boolean) => void;
  txs: Tx[];
  journal: string[];
  tab: "Summary" | "Transactions" | "Journal";
  setTab: (t: "Summary" | "Transactions" | "Journal") => void;
  reset: () => void;
  activeSymbol: string | null;
  running: boolean;
}) {
  const toast = useToast();
  return (
    <div
      className="absolute inset-0 z-20 flex flex-col bg-white transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)]"
      style={{ transform: open ? "translateY(0)" : "translateY(calc(100% - 36px))", pointerEvents: "none" }}
    >
      <div className="pointer-events-auto relative flex h-9 shrink-0 items-center justify-center border-y border-[#e6e8ea] bg-white shadow-[0_-2px_6px_rgba(0,0,0,.04)]">
        <button aria-label="Toggle panel" onClick={() => setOpen(!open)} className="press flex h-full w-40 items-center justify-center text-[#181c25]">
          {open ? <IconChevronDown size={30} strokeWidth={2} /> : <IconChevronUp size={30} strokeWidth={2} />}
        </button>
        {open && (
          <button onClick={reset} className="press anim-fade-in absolute right-4 rounded-[4px] border border-[#999] px-4 py-[3px] text-[15px] font-bold text-[#333]">
            Reset
          </button>
        )}
      </div>
      <div className="pointer-events-auto flex min-h-0 flex-1 flex-col">
        <div className="relative flex h-[41px] shrink-0 border-b border-[#e6e8ea] text-[16px]">
          {(["Summary", "Transactions", "Journal"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 transition-colors ${tab === t ? "font-bold text-[#333]" : "text-[#555]"}`}>
              {t}
            </button>
          ))}
          <span
            className="absolute bottom-0 h-[3px] w-1/3 bg-[#ff444f] transition-transform duration-300 ease-out"
            style={{ transform: `translateX(${["Summary", "Transactions", "Journal"].indexOf(tab) * 100}%)` }}
          />
        </div>

        {tab === "Summary" && (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            {/* live activity for the current contract, with room to breathe */}
            <div className="bg-[#fdeff1] px-2 pb-3 pt-1">
              <ActivityView tx={txs[0] ?? null} symbol={activeSymbol} running={running} />
            </div>
            <div className="mt-auto bg-[#f2f3f4] pt-1">
              <Totals txs={txs} big />
            </div>
          </div>
        )}

        {tab === "Transactions" && (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex gap-3 border-b border-[#e6e8ea] px-4 py-3">
              <button onClick={() => toast("Download started (demo).")} className="press rounded-[4px] border border-[#999] px-5 py-[7px] text-[16px] font-bold text-[#333]">
                Download
              </button>
              <button onClick={() => toast("Contract detail view (demo).")} className="press rounded-[4px] border border-[#999] px-5 py-[7px] text-[16px] font-bold text-[#333]">
                View Detail
              </button>
            </div>
            <div className="grid grid-cols-[1.1fr_1.5fr_1.5fr] border-b border-[#e6e8ea] px-5 py-5 text-[15px] font-bold text-[#333]">
              <span>Type</span>
              <span>Entry/Exit spot</span>
              <span className="text-right">Buy price and P/L</span>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {txs.map((t) => (
                <div key={t.id} className="anim-fade-up grid grid-cols-[1.1fr_1.5fr_1.5fr] items-center border-b border-[#e6e8ea] px-4 py-2.5 text-[15.5px] text-[#333]">
                  <span className="flex items-center gap-4">
                    <CandleBadge />
                    <svg width="22" height="22" viewBox="0 0 24 24" className="rotate-0" style={{ color: t.rise ? "#ff444f" : "#4bb4b3" }}>
                      <path d={t.rise ? "M4 20 20 4M9 4h11v11" : "M4 4 20 20M9 20h11V9"} stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="space-y-1">
                    <span className="flex items-center gap-3">
                      <span className="h-3.5 w-3.5 rounded-full border-[4px] border-[#ff444f]" />
                      {t.entry.toFixed(2)}
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-[#8a8f99]" />
                      {t.exit.toFixed(2)}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block">{fmt(t.stake)} USD</span>
                    <span className="block" style={{ color: t.profit > 0 ? "#4bb4b3" : "#ff444f" }}>
                      {t.profit > 0 ? "+" : ""}
                      {fmt(t.profit)} USD
                    </span>
                  </span>
                </div>
              ))}
              {txs.length === 0 && <p className="px-4 py-10 text-center text-[15px] text-[#8a8f99]">No transactions or activity yet.</p>}
            </div>
            <div className="shrink-0 bg-[#f2f3f4] pt-3">
              <div className="pr-6 text-right">
                <span className="cursor-help border-b border-dotted border-[#333] text-[15px] text-[#333]">What's this?</span>
              </div>
              <Totals txs={txs} />
            </div>
          </div>
        )}

        {tab === "Journal" && (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
              <button
                onClick={() => toast("Journal downloaded (demo).")}
                className="press rounded-[4px] border border-[#d6d9dd] px-5 py-[7px] text-[16px] font-bold text-[#b9bec4]"
              >
                Download
              </button>
              <button onClick={() => toast("Journal filters (demo).")} className="press flex items-center gap-2 px-2 text-[16px] text-[#333]">
                Filters
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M3 6h18M6 12h12M10 18h4" />
                </svg>
              </button>
            </div>
            <ul className="min-h-0 flex-1 overflow-y-auto pb-2">
              {journal.map((j, i) => (
                <li key={i} className="anim-fade-in border-b border-[#eceef0] px-4 py-2.5">
                  <p className="text-[14px] leading-snug" style={{ color: j.startsWith("Loss") ? "#e0313d" : j.startsWith("Profit") ? "#4bb4b3" : "#1668b3" }}>
                    {j}
                  </p>
                  <p className="mt-1 text-[11.5px] text-[#8a8f99]">{journalStamp()}</p>
                </li>
              ))}
              {journal.length === 0 && <li className="py-10 text-center text-[#8a8f99]">No journal entries yet.</li>}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Root                                                                */
/* ------------------------------------------------------------------ */
export function BotApp({ onHome, initialTab = "dashboard" }: { onHome: () => void; initialTab?: BotTab }) {
  const toast = useToast();
  const [booting, setBooting] = useState(true);
  const [tab, setTab] = useState<BotTab>(initialTab);

  // Show the Deriv Bot initialising splash briefly, like bot.deriv.com
  useEffect(() => {
    const t = window.setTimeout(() => setBooting(false), 1600);
    return () => window.clearTimeout(t);
  }, []);
  const [account, setAccount] = useState<Account>("real");
  const [bal, setBal] = useState<{ real: number; demo: number }>(() => loadState().bal);
  const [acctMenu, setAcctMenu] = useState(false);
  const [running, setRunning] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [dTab, setDTab] = useState<"Summary" | "Transactions" | "Journal">("Transactions");
  const [txs, setTxs] = useState<Tx[]>(() => loadState().txs);
  const [journal, setJournal] = useState<string[]>([]);
  const [activeSymbol, setActiveSymbol] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.8);
  const [quick, setQuick] = useState(false);
  const [cfg, setCfg] = useState<Cfg>(DEFAULT_CFG);
  const cfgRef = useRef(cfg);
  cfgRef.current = cfg;
  const accRef = useRef(account);
  accRef.current = account;
  const idRef = useRef(Math.max(1, ...loadState().txs.map((t) => t.id + 1)));

  useEffect(() => {
    saveState({ bal, txs });
  }, [bal, txs]);

  const set = (p: Partial<Cfg>) => setCfg((c) => ({ ...c, ...p }));
  const log = (m: string) => setJournal((j) => [`${new Date().toLocaleTimeString()}  ${m}`, ...j].slice(0, 60));

  const stop = (silent = false) => {
    setRunning(false);
    log("Bot stopped.");
    if (!silent)
      toast({
        message: "Bot stopped. Check Reports for contract history",
        action: {
          label: "Reports",
          onClick: () => {
            setDTab("Transactions");
            setDrawer(true);
          },
        },
        duration: 6000,
      });
  };

  const start = () => {
    const stake = cfg.stake;
    if (!stake || stake <= 0) {
      toast({ message: "Set a stake greater than 0 to run the bot." });
      return;
    }
    // A real account starts at 0 USD, so fall back to the funded demo
    // account instead of dead-ending — this is what makes trades runnable.
    if (bal[account] < stake) {
      if (bal.demo >= stake) {
        setAccount("demo");
        accRef.current = "demo";
        toast({ message: "Not enough on the real account — switched to Demo so the bot can trade." });
      } else {
        setBal((b) => ({ ...b, demo: 10000 }));
        accRef.current = "demo";
        setAccount("demo");
        toast({ message: "Demo balance topped up to 10,000.00 USD." });
      }
    }
    setRunning(true);
    setActiveSymbol(cfg.symbol);
    log(`Bot started on ${cfg.symbol}.`);
  };

  // Trade simulation
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const c = cfgRef.current;
      const acc = accRef.current;
      const rise = c.purchase === "Rise";
      const entry = 1525 + Math.random() * 1.2 - 0.6;
      const win = Math.random() < 0.6;
      const move = 0.15 + Math.random() * 0.6;
      const exit = entry + (win === rise ? move : -move);
      const profit = win ? Math.round(c.stake * 0.9 * 100) / 100 : -c.stake;
      const contractId = 4089100000 + Math.floor(Math.random() * 99999);
      const tx: Tx = { id: idRef.current++, entry, exit, stake: c.stake, profit, rise, contractId };
      setTxs((t) => [tx, ...t]);
      setActiveSymbol(c.symbol);
      setBal((b) => ({ ...b, [acc]: Math.max(0, Math.round((b[acc] + profit) * 100) / 100) }));
      setJournal((j) => [
        `${win ? "Profit" : "Loss"} amount: ${fmt(Math.abs(profit))} USD`,
        `Bought! Contract purchased (ID: ${contractId})`,
        ...j,
      ].slice(0, 60));
    }, 2200);
    return () => window.clearInterval(id);
  }, [running]);

  const go = (t: BotTab) => {
    setTab(t);
    setAcctMenu(false);
  };

  const lastTx = txs[0] ?? null;

  // Progress of the current simulated contract (ticks toward the next settle)
  const [runProgress, setRunProgress] = useState(0);
  useEffect(() => {
    if (!running) {
      setRunProgress(0);
      return;
    }
    setRunProgress(12);
    const id = window.setInterval(() => {
      setRunProgress((p) => (p >= 96 ? 12 : p + 14));
    }, 400);
    return () => window.clearInterval(id);
  }, [running]);

  const statusLabel = running
    ? lastTx
      ? "Contract bought"
      : "Bot is starting"
    : lastTx
      ? lastTx.profit > 0
        ? "Won"
        : "Lost"
      : "Bot is not running";

  const label = account === "real" ? "Real account" : "Demo account";
  const labelColor = account === "real" ? "#4bb4b3" : "#ffad3a";
  const navItems = useMemo(
    () => [
      { id: "home", label: "Home", icon: <IconHomeOutline /> },
      { id: "dashboard", label: "Dashboard", icon: <IconDashboard size={27} /> },
      { id: "builder", label: "Bot builder", icon: <IconPuzzle size={27} /> },
      { id: "chart", label: "Chart", icon: <IconChart size={27} /> },
      { id: "menu", label: "Menu", icon: <IconMenu size={27} /> },
    ],
    [],
  );

  if (booting) return <BootSplash />;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white font-plex text-[#333]">
      {/* Header */}
      <header className="relative z-40 flex h-14 shrink-0 items-center justify-between border-b-4 border-[#f2f3f4] bg-white px-3">
        <div className="flex items-center gap-4">
          <DbLogo size={33} />
          <div className="relative">
            <button onClick={() => setAcctMenu((o) => !o)} className="flex flex-col items-start leading-tight">
              <span className="flex items-center gap-1.5 text-[15px]" style={{ color: labelColor }}>
                {label}
                <span className={`transition-transform duration-300 ${acctMenu ? "rotate-180" : ""}`} style={{ color: "#333" }}>
                  <IconChevronDown size={20} />
                </span>
              </span>
              <span key={bal[account]} className="anim-fade-in text-[15px] font-bold text-[#333]">
                {fmt(bal[account])} USD
              </span>
            </button>
            {acctMenu && (
              <div className="anim-fade-up absolute left-0 top-12 z-50 w-56 overflow-hidden rounded-lg border border-[#e6e8ea] bg-white shadow-xl">
                {(["real", "demo"] as const).map((a) => (
                  <button
                    key={a}
                    onClick={() => {
                      if (running) stop(true);
                      setAccount(a);
                      setAcctMenu(false);
                    }}
                    className={`flex w-full items-center justify-between px-4 py-3 text-left text-[14px] hover:bg-[#f7f8f9] ${account === a ? "bg-[#f2f3f4]" : ""}`}
                  >
                    <span style={{ color: a === "real" ? "#4bb4b3" : "#ffad3a" }}>{a === "real" ? "Real" : "Demo"}</span>
                    <span className="font-bold text-[#333]">{fmt(bal[a])} USD</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <button onClick={() => toast("This is a UI demo clone — no real deposits are possible.")} className="press rounded-full bg-[#ff444f] px-[18px] py-[9px] text-[15px] font-bold text-white hover:bg-[#ff5a64]">
          Deposit
        </button>
      </header>

      {/* Content */}
      <div className="relative min-h-0 flex-1" onClick={() => acctMenu && setAcctMenu(false)}>
        <div key={tab} className="page-enter absolute inset-x-0 bottom-9 top-0 overflow-y-auto">
          {tab === "dashboard" && <Dashboard onBuilder={() => go("builder")} onQuick={() => (go("builder"), setQuick(true))} />}
          {tab === "builder" && <Builder cfg={cfg} set={set} zoom={zoom} onQuick={() => setQuick(true)} />}
          {tab === "chart" && <LiveChart symbol={cfg.symbol} />}
          {tab === "menu" && (
            <MenuPage
              go={go}
              openReports={() => {
                setDTab("Transactions");
                setDrawer(true);
              }}
              onHome={onHome}
            />
          )}
        </div>

        {tab === "builder" && (
          <div className="absolute bottom-9 left-0 top-0 z-10 flex w-[41px] flex-col items-center gap-0 bg-white pt-3 shadow-[2px_0_6px_rgba(0,0,0,.12)]">
            {[
              { i: <IconRefresh size={27} />, f: () => toast("Workspace refreshed.") },
              { i: <IconFolder size={27} />, f: () => toast("Import a bot (demo).") },
              { i: <IconSave size={27} />, f: () => toast("Bot saved locally (demo).") },
              { i: <IconAlign size={27} />, f: () => toast("Blocks cleaned up.") },
              { sep: true },
              { i: <IconUndo size={27} />, f: () => toast("Undo") },
              { i: <IconRedo size={27} />, f: () => toast("Redo") },
              { sep: true },
              { i: <IconZoomIn size={27} />, f: () => setZoom((z) => Math.min(1.6, +(z + 0.15).toFixed(2))) },
              { i: <IconZoomOut size={27} />, f: () => setZoom((z) => Math.max(0.45, +(z - 0.15).toFixed(2))) },
            ].map((b, k) =>
              "sep" in b ? (
                <span key={k} className="my-2.5 h-px w-[18px] bg-[#c4c8cd]" />
              ) : (
                <button key={k} onClick={b.f} className="press flex h-[41px] w-full items-center justify-center text-[#333] hover:text-[#ff444f]">
                  {b.i}
                </button>
              ),
            )}
          </div>
        )}

        <Drawer
          open={drawer}
          setOpen={setDrawer}
          txs={txs}
          journal={journal}
          tab={dTab}
          setTab={setDTab}
          reset={() => (setTxs([]), setJournal([]), toast("Transactions cleared."))}
          activeSymbol={activeSymbol}
          running={running}
        />
      </div>

      {/* Run panel — progress strip + status */}
      <div className="relative z-30 shrink-0 border-t border-[#e6e8ea] bg-white px-4 py-3">
        <div className="flex h-[42px] overflow-hidden rounded-[4px] border border-[#d6d9dd]">
          <button
            onClick={running ? () => stop() : start}
            className={`press flex w-[83px] shrink-0 items-center justify-center gap-1.5 text-[17px] font-bold text-white transition-colors duration-300 ${
              running ? "bg-[#ff444f]" : "bg-[#7fcfcb] hover:bg-[#71c3bf]"
            }`}
            style={{ marginLeft: -1 }}
          >
            {running ? <IconStop size={18} /> : <IconPlay size={20} />}
            {running ? "Stop" : "Run"}
          </button>

          {/* status area: label + thin progress bar, with breathing room */}
          <div className="relative flex min-w-0 flex-1 flex-col items-center justify-center gap-2 px-4">
            <span
              className="text-[15px] font-bold"
              style={{ color: running ? "#333" : lastTx ? (lastTx.profit > 0 ? "#4bb4b3" : "#ff444f") : "#333" }}
            >
              {running ? (lastTx ? "Contract bought" : "Bot is starting") : statusLabel}
            </span>
            <div className="relative h-[5px] w-full overflow-hidden rounded-full bg-[#e6e8ea]">
              {running ? (
                <>
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-[#4bb4b3] transition-[width] duration-700 ease-out"
                    style={{ width: `${runProgress}%` }}
                  />
                  <span className="absolute right-0 top-1/2 flex h-3 w-3 -translate-y-1/2 translate-x-1/3 items-center justify-center rounded-full bg-[#bfe3e1]">
                    <span className="h-1 w-1 rounded-full bg-[#4bb4b3]" />
                  </span>
                </>
              ) : (
                <span className="absolute inset-y-0 left-0 w-full rounded-full bg-current opacity-[0.06]" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <nav className="relative z-30 flex h-[70px] shrink-0 border-t border-[#f2f3f4] bg-white">
        {navItems.map((n, i) => {
          const active = n.id === tab;
          return (
            <button
              key={n.id}
              onClick={() => (n.id === "home" ? onHome() : go(n.id as BotTab))}
              className={`press relative flex flex-1 flex-col items-center justify-center gap-1 text-[14.5px] transition-colors duration-300 ${active ? "text-[#ff444f]" : "text-[#333]"}`}
            >
              <span key={String(active)} className={active ? "nav-bounce" : ""}>
                {n.icon}
              </span>
              {n.label}
              {i === 0 && <span className="absolute right-0 top-2 h-[42px] w-px bg-[#e6e8ea]" />}
            </button>
          );
        })}
      </nav>

      {quick && (
        <Sheet title="Quick strategy" onClose={() => setQuick(false)}>
          <p className="mb-3 text-[14px] text-[#6c717b]">Pick a preset to load into the builder.</p>
          <div className="space-y-2.5">
            {[
              { n: "Martingale", d: "Increase stake after a loss to recover.", s: 2 },
              { n: "D'Alembert", d: "Raise stake by one unit after a loss.", s: 1 },
              { n: "Oscar's Grind", d: "Aim for one unit of profit per cycle.", s: 1 },
            ].map((q, i) => (
              <button
                key={q.n}
                onClick={() => {
                  set({ stake: q.s, tradeType: "Up/Down", tradeType2: "Rise/Fall", contractType: "Both" });
                  setZoom(0.7);
                  setQuick(false);
                  go("builder");
                  toast(`${q.n} strategy loaded — zoomed out to show both blocks.`);
                }}
                className="anim-fade-up w-full rounded-xl border border-[#e6e8ea] p-4 text-left transition-colors hover:border-[#ff444f] hover:bg-[#fff5f5]"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="text-[16px] font-bold">{q.n}</div>
                <div className="text-[13.5px] text-[#6c717b]">{q.d}</div>
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </div>
  );
}

function IconHomeOutline() {
  return (
    <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round">
      <path d="M3.5 10.5 12 3.5l8.5 7v9a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-9Z" />
    </svg>
  );
}
