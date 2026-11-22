import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  IconBell,
  IconArrowRight,
  IconEye,
  IconTradeCircle,
  IconTransfer,
  IconUserCircle,
} from "../icons";
import { useToast } from "../ui";
import { useProfile } from "../account";
import riseFallImg from "../assets/risefall.jpg";
import goldImg from "../assets/gold.jpg";
import { fmtChange, fmtPrice, GREEN, RED, MARKETS, sparkPath, type Market } from "./markets";

/* ------------------------------------------------------------------ */
/* Header (Real / Demo segmented + eye + bell)                         */
/* ------------------------------------------------------------------ */
export type OptionsAccount = "real" | "demo";

function OptionsHeader({
  account,
  setAccount,
  hidden,
  toggleHidden,
  onBell,
  unread,
  onProfile,
}: {
  account: OptionsAccount;
  setAccount: (a: OptionsAccount) => void;
  hidden: boolean;
  toggleHidden: () => void;
  onBell: () => void;
  unread: number;
  onProfile: () => void;
}) {
  const toast = useToast();
  const [ring, setRing] = useState(false);
  return (
    <header className="sticky top-0 z-30 flex shrink-0 items-center gap-2.5 bg-[#181c25] px-4 py-3 text-white">
      <button
        aria-label="Profile"
        onClick={onProfile}
        className="press flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.14] hover:bg-white/25"
      >
        <IconUserCircle size={21} />
      </button>

      <div
        role="tablist"
        aria-label="Account"
        className="anim-fade-in flex h-10 flex-1 items-center overflow-hidden rounded-full bg-white/[0.10] p-[3px]"
      >
        {(["real", "demo"] as const).map((a) => {
          const active = account === a;
          return (
            <button
              key={a}
              role="tab"
              aria-selected={active}
              onClick={() => {
                if (!active) {
                  setAccount(a);
                  toast(a === "demo" ? "Switched to Demo account" : "Switched to Real account");
                }
              }}
              className={`relative flex-1 rounded-full py-2 text-[11.5px] font-semibold capitalize transition-all duration-300 ${
                active ? "bg-white/[0.16] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.06)]" : "text-white/55 hover:text-white/80"
              }`}
            >
              {a === "real" ? "Real" : "Demo"}
            </button>
          );
        })}
      </div>

      <button
        aria-label="Toggle balance"
        onClick={toggleHidden}
        className="press flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.14] hover:bg-white/25"
      >
        <IconEye size={19} off={hidden} />
      </button>

      <button
        aria-label="Notifications"
        onClick={() => {
          setRing(true);
          window.setTimeout(() => setRing(false), 900);
          onBell();
        }}
        className={`press bell-ring ${ring ? "ringing" : ""} relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.14] hover:bg-white/25`}
      >
        <IconBell size={19} />
        {unread > 0 && (
          <span className="anim-pop absolute -right-0.5 -top-0.5 flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-[#ff444f] px-1 text-[8.5px] font-bold leading-none text-white">
            {unread}
          </span>
        )}
      </button>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Balance hero + Trade / Transfer actions                             */
/* ------------------------------------------------------------------ */
function BalanceHero({
  hidden,
  balance,
  onTrade,
  onTransfer,
}: {
  hidden: boolean;
  balance: number;
  onTrade: () => void;
  onTransfer: () => void;
}) {
  const [spin, setSpin] = useState(0);
  const [busy, setBusy] = useState(false);
  const [updated, setUpdated] = useState("just now");

  const refresh = () => {
    if (busy) return;
    setBusy(true);
    setSpin((s) => s + 1);
    window.setTimeout(() => {
      setBusy(false);
      setUpdated("just now");
    }, 900);
  };
  useEffect(() => {
    const t = window.setTimeout(() => setUpdated("1 min ago"), 60000);
    return () => window.clearTimeout(t);
  }, [updated]);

  const action = (label: string, icon: ReactNode, onClick: () => void, primary?: boolean) => (
    <button onClick={onClick} className="group flex flex-col items-center gap-3">
      <span
        className={`flex h-[62px] w-[62px] items-center justify-center rounded-full transition-all duration-300 group-active:scale-90 group-hover:scale-105 ${
          primary
            ? "bg-[#ff444f] text-white shadow-[0_8px_22px_rgba(255,68,79,.45)]"
            : "border-[1.5px] border-white text-white"
        }`}
      >
        {icon}
      </span>
      <span className="text-[11px] text-white">{label}</span>
    </button>
  );

  return (
    <section className="rounded-b-[30px] bg-[#181c25] px-5 pb-8 pt-2 text-white">
      <p className="text-[11px] text-white/70">Total trading value</p>
      <div className="mt-1 flex items-center gap-3">
        <span className="text-[22.5px] font-bold leading-9 tracking-tight">
          {hidden ? "••••••" : `${fmtPrice(balance)} USD`}
        </span>
        <button aria-label="Refresh" onClick={refresh} className="press text-white">
          <span key={spin} className={`flex ${spin ? "anim-spin-once" : ""}`}>
            <IconRefreshInline />
          </span>
        </button>
      </div>
      <p className="mt-1 text-[10.5px] text-white/55">{busy ? "Updating…" : `Updated ${updated}`}</p>

      <div className="mt-7 flex items-start justify-center gap-16">
        {action("Trade", <IconTradeCircle size={27} />, onTrade, true)}
        {action("Transfer", <IconTransfer size={27} />, onTransfer)}
      </div>
    </section>
  );
}

/** Refresh glyph drawn to match the screenshot's thicker circular arrow. */
function IconRefreshInline() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.5 12a8.5 8.5 0 1 1-2.5-6" />
      <path d="M20.5 3.5V8h-4.5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Market card                                                         */
/* ------------------------------------------------------------------ */
function CandleGlyph({ vol, small = false }: { vol: number; small?: boolean }) {
  const w = small ? 40 : 46;
  const h = w * (46 / 62);
  return (
    <svg width={w} height={h} viewBox="0 0 62 46" className="shrink-0" aria-hidden="true">
      {[
        { x: 4, top: 20, bot: 40, up: true },
        { x: 14, top: 17, bot: 37, up: true },
        { x: 24, top: 23, bot: 42, up: true },
        { x: 34, top: 15, bot: 35, up: false },
        { x: 44, top: 19, bot: 39, up: true },
      ].map((c) => (
        <g key={c.x}>
          <rect x={c.x + 3} y={c.top - 4} width="1.3" height={c.bot - c.top + 8} fill="#0c9db2" />
          <rect x={c.x} y={c.top} width="7" height={c.bot - c.top} rx="1.2" fill={c.up ? "#0c9db2" : "#10c2c2"} />
        </g>
      ))}
      <rect x="0" y="0" width="23" height="15" rx="4.5" fill="#39434f" />
      <text x="11.5" y="11" fontSize="9.5" fontWeight="700" textAnchor="middle" fill="#fff" fontFamily="Inter, sans-serif">
        {vol}
      </text>
      <rect x="26" y="0" width="24" height="15" rx="4.5" fill="#e8384f" />
      <text x="38" y="11" fontSize="9" fontWeight="700" textAnchor="middle" fill="#fff" fontFamily="Inter, sans-serif">
        1s
      </text>
    </svg>
  );
}

function Sparkline({ series, change }: { series: number[]; change: number }) {
  const up = change >= 0;
  return (
    <svg viewBox="0 0 84 30" className="h-[30px] w-full min-w-0" preserveAspectRatio="none" aria-hidden="true">
      <path
        d={sparkPath(series, 84, 30, 2)}
        fill="none"
        stroke={up ? GREEN : RED}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function MarketCard({ m, onPick }: { m: Market; onPick: (m: Market) => void }) {
  const up = m.change >= 0;
  return (
    <button
      onClick={() => onPick(m)}
      className="press anim-fade-up flex min-w-0 flex-col rounded-[16px] bg-[#f4f5f6] px-3 pb-3 pt-2.5 text-left transition-colors hover:bg-[#eef0f2]"
    >
      <CandleGlyph vol={m.vol} small />
      <span className="mt-2 block text-[11px] leading-[1.3] text-[#181c25]">{m.name}</span>
      <span className="mt-2 block truncate text-[15px] font-bold leading-tight tracking-tight text-[#181c25]">
        {fmtPrice(m.price)}
      </span>
      <span className="mt-2 flex items-center gap-1.5">
        <span className="min-w-0 flex-1">
          <Sparkline series={m.series} change={m.change} />
        </span>
        <span className="shrink-0 whitespace-nowrap text-[9.5px] font-medium leading-none" style={{ color: up ? GREEN : RED }}>
          {fmtChange(m.change)}
          <span className="ml-1 text-[8.5px] text-[#6c717b]">(5m)</span>
        </span>
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Platforms                                                           */
/* ------------------------------------------------------------------ */
function PlatformTile({ label, tone }: { label: string; tone: "red" | "navy" }) {
  return (
    <span
      className="flex h-[54px] w-[54px] shrink-0 items-center justify-center text-[14px] font-extrabold text-white"
      style={{
        background: tone === "red" ? "linear-gradient(135deg,#ff5a64,#e5343f)" : "linear-gradient(135deg,#2b3a60,#1b2647)",
        borderRadius: "14px 18px 16px 14px",
        boxShadow: "inset -3px -3px 0 rgba(0,0,0,.16), 0 4px 10px rgba(0,0,0,.10)",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Trade type glyphs (red/teal arrows like the reference)              */
/* ------------------------------------------------------------------ */
type Glyph = "risefall" | "higherlower" | "matches" | "evenodd" | "overunder" | "touch";

function TradeGlyph({ kind }: { kind: Glyph }) {
  const REDA = "#ff444f";
  const TEA = "#7fb3b2";
  const arrow = (d: string, color: string) => <path d={d} stroke={color} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  const head = (d: string, color: string) => <path d={d} stroke={color} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />;

  return (
    <svg width="62" height="44" viewBox="0 0 62 44" aria-hidden="true">
      {kind === "risefall" && (
        <>
          {arrow("M6 34 20 18", TEA)}
          {head("M13.5 18H20v6.5", TEA)}
          {arrow("M36 34 50 18", REDA)}
          {head("M43.5 18H50v6.5", REDA)}
        </>
      )}
      {kind === "higherlower" && (
        <>
          {arrow("M4 16h20", TEA)}
          {head("M17 9.5 24 16l-7 6.5", TEA)}
          {arrow("M34 30h20", REDA)}
          {head("M41 23.5 34 30l7 6.5", REDA)}
        </>
      )}
      {kind === "matches" && (
        <>
          {arrow("M12 12 4 20M12 12l8 8M12 12v11M12 12H1M12 12h11", REDA)}
          {arrow("M44 12l-8 8M44 12l8 8M44 12v11M44 12H33M44 12h11", REDA)}
        </>
      )}
      {kind === "evenodd" && (
        <>
          <rect x="10" y="24" width="9" height="9" rx="1.5" fill={REDA} />
          <rect x="25" y="24" width="9" height="9" rx="1.5" fill={TEA} />
          <path d="M40 33V24l8 9V24" stroke={REDA} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {kind === "overunder" && (
        <>
          <path d="M4 26h54" stroke={TEA} strokeWidth="2.4" strokeLinecap="round" />
          <path d="M14 20 24 12l8 6 10-8" stroke={REDA} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {kind === "touch" && (
        <>
          {arrow("M6 32 22 16", TEA)}
          {head("M15.5 16H22v6.5", TEA)}
          <path d="M34 16h22" stroke={REDA} strokeWidth="2.4" strokeLinecap="round" strokeDasharray="4 4" />
        </>
      )}
    </svg>
  );
}

const TRADE_GROUPS: { id: string; label: string; kinds: { kind: Glyph; label: string }[] }[] = [
  {
    id: "deriv-trader",
    label: "Deriv Trader",
    kinds: [
      { kind: "risefall", label: "Rise/Fall" },
      { kind: "higherlower", label: "Higher/Lower" },
      { kind: "matches", label: "Matches/Differs" },
      { kind: "evenodd", label: "Even/Odd" },
      { kind: "overunder", label: "Over/Under" },
      { kind: "touch", label: "Touch/No Touch" },
    ],
  },
  {
    id: "deriv-bot",
    label: "Deriv Bot",
    kinds: [
      { kind: "risefall", label: "Rise/Fall" },
      { kind: "higherlower", label: "Higher/Lower" },
      { kind: "overunder", label: "Over/Under" },
    ],
  },
  {
    id: "smarttrader",
    label: "SmartTrader",
    kinds: [
      { kind: "risefall", label: "Rise/Fall" },
      { kind: "matches", label: "Matches/Differs" },
      { kind: "evenodd", label: "Even/Odd" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Featured slides                                                     */
/* ------------------------------------------------------------------ */
const FEATURES = [
  {
    id: "risefall",
    img: riseFallImg,
    title: "Rise / Fall",
    text: "Predict whether the market price will rise or fall by the end of your contract.",
    chips: ["100+ markets", "From 1 USD"],
  },
  {
    id: "gold",
    img: goldImg,
    title: "Trade on Gold",
    text: "Predict whether gold prices will rise or fall. Trade one of the world's most popular commodities, available 24/5.",
    chips: ["24/5 trading", "From 1 USD"],
  },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export function OptionsPage({
  onOpenTrader,
  onOpenBot,
  hidden,
  unread,
  onBell,
  onProfile,
  balance,
  onTransfer,
}: {
  onOpenTrader: (market?: string) => void;
  onOpenBot: () => void;
  hidden: boolean;
  unread: number;
  onBell: () => void;
  onProfile: () => void;
  balance: number;
  onTransfer?: () => void;
}) {
  const toast = useToast();
  const [account, setAccount] = useState<OptionsAccount>("real");
  const [localHidden, setLocalHidden] = useState(false);
  const [group, setGroup] = useState("deriv-trader");
  const [featIdx, setFeatIdx] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const featRef = useRef<HTMLDivElement>(null);

  const scrollToFeature = (i: number) => {
    const el = featRef.current;
    const child = el?.children[i] as HTMLElement | undefined;
    if (el && child) el.scrollTo({ left: child.offsetLeft - el.offsetLeft, behavior: "smooth" });
  };

  const onFeatScroll = () => {
    const el = featRef.current;
    if (!el) return;
    const step = el.clientWidth + 12; // card width + gap
    const i = Math.max(0, Math.min(FEATURES.length - 1, Math.round(el.scrollLeft / step)));
    if (i !== featIdx) setFeatIdx(i);
  };

  const { profile } = useProfile();
  const hide = hidden || localHidden;
  const shown = MARKETS.slice(0, 5);
  const active = TRADE_GROUPS.find((g) => g.id === group) ?? TRADE_GROUPS[0];

  return (
    <div ref={scroller} className="flex flex-col bg-white">
      <OptionsHeader
        account={account}
        setAccount={setAccount}
        hidden={hide}
        toggleHidden={() => setLocalHidden((h) => !h)}
        onBell={onBell}
        unread={unread}
        onProfile={onProfile}
      />

      <BalanceHero
        hidden={hide}
        balance={account === "demo" ? 10000 : Math.max(balance, profile.balance)}
        onTrade={() => onOpenTrader()}
        onTransfer={() => (onTransfer ? onTransfer() : toast("Transfers are unavailable right now."))}
      />

      {/* Most traded markets */}
      <section className="px-4 pt-7">
        <h2 className="text-[16.5px] font-bold tracking-tight text-[#181c25]">Most traded markets</h2>
        <div className="mt-4 grid grid-cols-2 items-stretch gap-3">
          {shown.map((m) => (
            <MarketCard
              key={m.vol}
              m={m}
              onPick={(mm) => {
                toast(`${mm.name} selected`);
                onOpenTrader(mm.name);
              }}
            />
          ))}
          <button
            onClick={() => {
              scroller.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              toast("Showing all markets");
            }}
            className="press anim-fade-up flex min-h-[150px] min-w-0 flex-col items-center justify-center gap-3 rounded-[16px] bg-[#f4f5f6] text-[#181c25] hover:bg-[#eef0f2]"
            style={{ animationDelay: "220ms" }}
          >
            <IconArrowRight size={24} strokeWidth={1.6} />
            <span className="text-[11px]">View all</span>
          </button>
        </div>
      </section>

      {/* Featured — swipeable carousel with dot pagination */}
      <section className="mt-8 px-4">
        <h2 className="text-[16.5px] font-bold tracking-tight text-[#181c25]">Featured</h2>
        <div className="relative mt-4">
          {/* stacked-card effect behind the carousel */}
          <div className="pointer-events-none absolute inset-x-3 -top-2 h-6 rounded-t-[14px] border border-[#e3e5e8] bg-white" />
          <div className="pointer-events-none absolute inset-x-1.5 -top-1 h-6 rounded-t-[14px] border border-[#e3e5e8] bg-white" />
          <div
            ref={featRef}
            onScroll={onFeatScroll}
            className="hide-scroll relative flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-0"
          >
            {FEATURES.map((f) => (
              <article
                key={f.id}
                className="flex w-full shrink-0 snap-center flex-col overflow-hidden rounded-[16px] border border-[#e3e5e8] bg-white"
              >
                <img src={f.img} alt={f.title} className="h-[164px] w-full shrink-0 object-cover" />
                <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
                  <h3 className="text-[16px] font-bold tracking-tight text-[#181c25]">{f.title}</h3>
                  <p className="mt-1.5 text-[11.5px] leading-[1.4] text-[#5c6470]">{f.text}</p>
                  <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                    <div className="flex flex-wrap gap-2">
                      {f.chips.map((c) => (
                        <span key={c} className="rounded-md bg-[#eceef0] px-2.5 py-1.5 text-[10px] font-semibold text-[#3c4652]">
                          {c}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => onOpenTrader(f.title)}
                      className="press shrink-0 rounded-full border-[1.5px] border-[#181c25] px-4 py-[9px] text-[11px] font-bold text-[#181c25] hover:bg-[#181c25] hover:text-white"
                    >
                      Trade now
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
        {/* pagination dots */}
        <div className="mt-3 flex items-center justify-center gap-2">
          {FEATURES.map((f, i) => (
            <button
              key={f.id}
              aria-label={`Featured slide ${i + 1}`}
              onClick={() => scrollToFeature(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === featIdx ? "w-2 bg-[#3c4652]" : "w-2 bg-[#d3d7db]"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Platforms */}
      <section className="px-4 pt-9">
        <h2 className="text-[16.5px] font-bold tracking-tight text-[#181c25]">Platforms</h2>
        <div className="mt-4 space-y-3">
          {[
            { name: "Deriv Trader", desc: "Trade options on 100+ markets. No overnight swap fees.", tile: "DT", tone: "red" as const, on: () => onOpenTrader() },
            { name: "Deriv Bot", desc: "Build and run automated bots, no coding needed.", tile: "DB", tone: "red" as const, on: onOpenBot },
            { name: "SmartTrader", desc: "Classic interface for advanced options traders.", tile: "ST", tone: "navy" as const, on: () => toast("SmartTrader is a demo placeholder.") },
          ].map((p, i) => (
            <button
              key={p.name}
              onClick={p.on}
              className="press anim-fade-up flex w-full items-center gap-4 rounded-[18px] bg-[#f4f5f6] p-4 text-left transition-colors hover:bg-[#eef0f2]"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <PlatformTile label={p.tile} tone={p.tone} />
              <span className="flex-1">
                <span className="block text-[13.5px] font-bold text-[#181c25]">{p.name}</span>
                <span className="mt-0.5 block text-[11px] leading-[1.35] text-[#5c6470]">{p.desc}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Trade types */}
      <section className="px-4 pb-10 pt-9">
        <h2 className="text-[16.5px] font-bold tracking-tight text-[#181c25]">Trade types</h2>
        <div className="hide-scroll mt-4 flex gap-2.5 overflow-x-auto pb-1">
          {TRADE_GROUPS.map((g) => (
            <button
              key={g.id}
              onClick={() => setGroup(g.id)}
              className={`press shrink-0 rounded-full border px-4 py-2.5 text-[11.5px] transition-colors ${
                group === g.id
                  ? "border-[#181c25] bg-[#181c25] font-semibold text-white"
                  : "border-[#d3d7db] bg-white text-[#181c25] hover:border-[#9aa1aa]"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
        <div key={group} className="mt-4 grid grid-cols-3 gap-3.5">
          {active.kinds.map((t, i) => (
            <button
              key={t.label}
              onClick={() => {
                toast(`${t.label} — opening Deriv Trader`);
                onOpenTrader(t.label);
              }}
              className="press anim-fade-up flex flex-col items-center justify-center gap-2 rounded-[18px] bg-[#f4f5f6] px-2 py-5 text-center transition-colors hover:bg-[#eef0f2]"
              style={{ animationDelay: `${i * 45}ms` }}
            >
              <TradeGlyph kind={t.kind} />
              <span className="line-clamp-1 w-full text-[11px] text-[#181c25]">{t.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
