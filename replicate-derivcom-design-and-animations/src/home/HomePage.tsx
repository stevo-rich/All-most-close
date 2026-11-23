import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconClose,
  IconRefresh,
  TileDxn,
  TileMore,
  TileMt5,
  TileOptions,
  TileP2p,
  TileTv,
} from "../icons";
import { useLoaded } from "../ui";
import { fmtUsd, totalUsd, useProfile } from "../account";
import { Scene3D, TiltButton } from "./three";
import antImg from "../assets/ant.jpg";
import dxnImg from "../assets/dxn.jpg";
import metalsImg from "../assets/metals.jpg";
import whatsNewImg from "../assets/whatsnew.jpg";

export type HomeTab = "home" | "cfds" | "exchange" | "options" | "portfolio" | "profile";

type Props = {
  balanceHidden: boolean;
  go: (t: HomeTab) => void;
  openMore: () => void;
  onDeposit: () => void;
};

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */
function Hero({ hidden, onDeposit, go }: { hidden: boolean; onDeposit: () => void; go: Props["go"] }) {
  const loaded = useLoaded(750);
  const { profile } = useProfile();
  const [spin, setSpin] = useState(0);
  const [updated, setUpdated] = useState("just now");
  const [busy, setBusy] = useState(false);

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

  return (
    <section className="rounded-b-[32px] bg-[#181c25] px-4 pb-6 pt-1 text-white">
      <button onClick={() => go("portfolio")} className="press flex items-center gap-0.5 text-[10px] text-white/70">
        Total value <IconChevronRight size={13} />
      </button>
      <div className="mt-1.5 flex items-end justify-between">
        <div>
          {loaded ? (
            <div className="anim-fade-in flex items-center gap-2.5">
              <span className="text-[19.5px] font-bold leading-8 tracking-tight">
                {hidden ? "••••••" : fmtUsd(totalUsd(profile))} USD
              </span>
              <button aria-label="Refresh" onClick={refresh} className="press text-white">
                <span key={spin} className={`flex ${spin ? "anim-spin-once" : ""}`}>
                  <IconRefresh size={18} />
                </span>
              </button>
            </div>
          ) : (
            <div className="skeleton h-8 w-40 rounded-lg" />
          )}
          <div className="mt-1 text-[9.5px] text-white/60">{loaded ? (busy ? "Updating…" : `Updated ${updated}`) : <span className="skeleton inline-block h-3 w-24 rounded" />}</div>
        </div>
        <button
          onClick={onDeposit}
          className="press rounded-full bg-[#ff444f] px-6 py-2.5 text-[10.5px] font-bold text-white shadow-[0_6px_18px_rgba(255,68,79,.35)] hover:bg-[#ff5a64]"
        >
          Deposit
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* My trading accounts                                                 */
/* ------------------------------------------------------------------ */
function Accounts({ hidden, go }: { hidden: boolean; go: Props["go"] }) {
  const { profile } = useProfile();
  const val = (v: string) => (hidden ? "••••" : v);
  return (
    <section className="mt-6">
      <h2 className="px-4 text-[15px] font-bold tracking-tight">My trading accounts</h2>
      <div className="hide-scroll mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        <button onClick={() => go("cfds")} className="press anim-fade-up flex min-w-[168px] flex-1 flex-col items-start rounded-3xl bg-[#f3f4f5] p-4 text-left hover:bg-[#ecedee]">
          <TileMt5 size={44} sub="SVG" />
          <span className="mt-2 text-[9px] text-[#6c717b]">CFDs | Standard</span>
          <span className="text-[11px] font-bold">{val(fmtUsd(profile.balance))} USD</span>
        </button>
        <button onClick={() => go("options")} className="press anim-fade-up flex min-w-[168px] flex-1 flex-col items-start rounded-3xl bg-[#f3f4f5] p-4 text-left hover:bg-[#ecedee]" style={{ animationDelay: "80ms" }}>
          <TileOptions size={44} />
          <span className="mt-2 text-[9px] text-[#6c717b]">Options</span>
          <span className="text-[11px] font-bold">{val(fmtUsd(profile.balance))} USD</span>
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Promo carousel (auto-advancing with progress indicator)             */
/* ------------------------------------------------------------------ */
type Slide = { id: string; title: string; text: string; art: ReactNode };

const SLIDE_MS = 5000;

function PromoCarousel() {
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: "ant",
      title: "ANT has entered the chart",
      text: "Trade Anthropic CFDs on MT5, cTrader and TradingView.",
      art: <img src={antImg} alt="" className="h-full w-full object-cover mix-blend-lighten" />,
    },
    {
      id: "spacex",
      title: "SpaceX CFDs",
      text: "Trade the space giant with competitive leverage.",
      art: (
        <div className="flex h-full items-center justify-end pr-3">
          <span className="text-[16.5px] font-black italic tracking-[0.18em] text-white" style={{ fontFamily: "Inter" }}>
            SPACEX
          </span>
        </div>
      ),
    },
    {
      id: "dxn",
      title: "DXN Futures",
      text: "Go long or short on top pairs with up to 50x leverage.",
      art: <img src={dxnImg} alt="" className="h-full w-full object-cover" />,
    },
    {
      id: "bot",
      title: "Automate with Deriv Bot",
      text: "Build trading bots with drag-and-drop blocks — no coding.",
      art: (
        <div className="flex h-full items-center justify-center">
          <div className="grid grid-cols-3 gap-1" style={{ animation: "float-y 3s ease-in-out infinite" }}>
            {[1, 0, 1, 0, 1, 0, 1, 0, 1].map((r, i) => (
              <span key={i} className={`h-5 w-5 rounded-md ${r ? "bg-[#ff444f]" : "bg-white"}`} />
            ))}
          </div>
        </div>
      ),
    },
  ]);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const scrollTo = (i: number) => {
    const el = ref.current;
    const child = el?.children[i] as HTMLElement | undefined;
    if (el && child) el.scrollTo({ left: child.offsetLeft - 16, behavior: "smooth" });
  };

  const next = () => {
    const n = (idx + 1) % slides.length;
    setIdx(n);
    scrollTo(n);
  };

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const first = el.children[0] as HTMLElement | undefined;
    if (!first) return;
    const step = first.offsetWidth + 8;
    const i = Math.max(0, Math.min(slides.length - 1, Math.round(el.scrollLeft / step)));
    if (i !== idx) setIdx(i);
  };

  const dismiss = (id: string) => {
    setSlides((s) => s.filter((x) => x.id !== id));
    setIdx(0);
  };

  if (!slides.length) return null;

  return (
    <section className="mt-6">
      <div
        ref={ref}
        onScroll={onScroll}
        onPointerDown={() => setPaused(true)}
        onPointerUp={() => setPaused(false)}
        onPointerLeave={() => setPaused(false)}
        className="hide-scroll flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 scroll-px-4"
      >
        {slides.map((s, i) => (
          <article
            key={s.id}
            className="anim-fade-up relative flex h-[132px] w-full shrink-0 snap-start items-center overflow-hidden rounded-3xl bg-[#181c25] text-white"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="z-10 w-[62%] pl-5 pr-1">
              <h3 className="text-[12px] font-bold leading-[1.25]">{s.title}</h3>
              <p className="mt-1.5 text-[10px] leading-[1.35] text-white/65">{s.text}</p>
            </div>
            <div className="absolute inset-y-0 right-0 w-[42%]">{s.art}</div>
            <button
              aria-label="Dismiss"
              onClick={() => dismiss(s.id)}
              className="press absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 hover:bg-white/30"
            >
              <IconClose size={16} />
            </button>
          </article>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-center gap-2.5">
        {slides.map((s, i) => {
          const active = i === idx;
          return (
            <button
              key={s.id}
              aria-label={`Slide ${i + 1}`}
              onClick={() => {
                setIdx(i);
                scrollTo(i);
              }}
              className="relative h-2 overflow-hidden rounded-full bg-[#d1d4d9] transition-all duration-500"
              style={{ width: active ? 48 : 8 }}
            >
              {active && (
                <span
                  key={`${idx}-${slides.length}`}
                  onAnimationEnd={next}
                  className="absolute inset-y-0 left-0 rounded-full bg-[#0c0e12]"
                  style={{ animation: `progress-fill ${SLIDE_MS}ms linear forwards`, animationPlayState: paused ? "paused" : "running" }}
                />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Explore Deriv                                                       */
/* ------------------------------------------------------------------ */
function Explore({ go, openMore }: Pick<Props, "go" | "openMore">) {
  const items: { label: string; icon: ReactNode; badge?: string; on: () => void }[] = [
    { label: "Exchange", icon: <TileDxn size={46} />, badge: "New", on: () => go("exchange") },
    { label: "Options", icon: <TileOptions size={46} />, on: () => go("options") },
    { label: "TradingView", icon: <TileTv size={46} />, on: () => go("cfds") },
    { label: "Swap-Free", icon: <TileMt5 size={46} sub="SWF" />, on: () => go("cfds") },
    { label: "P2P", icon: <TileP2p size={46} />, on: () => go("portfolio") },
    { label: "More", icon: <TileMore size={46} />, on: openMore },
  ];
  return (
    <section className="mt-7 px-4">
      <h2 className="text-[15px] font-bold tracking-tight">Explore Deriv</h2>
      <div className="mt-4 grid grid-cols-3 gap-y-5">
        {items.map((it, i) => (
          <button
            key={it.label}
            onClick={it.on}
            className="group anim-fade-up flex flex-col items-center"
            style={{ animationDelay: `${120 + i * 55}ms` }}
          >
            <span className="relative flex h-[66px] w-[66px] items-center justify-center rounded-full bg-[#f3f3f4] shadow-[inset_0_-3px_8px_rgba(0,0,0,.05),0_6px_14px_rgba(0,0,0,.07)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[inset_0_-3px_8px_rgba(0,0,0,.05),0_10px_18px_rgba(0,0,0,.12)] group-active:scale-90">
              <span className="transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">{it.icon}</span>
              {it.badge && (
                <span className="anim-pop absolute -top-1 left-[46px] rounded-full bg-[#00c390] px-2 py-[3px] text-[9px] font-bold leading-none text-white" style={{ animationDelay: "700ms" }}>
                  {it.badge}
                </span>
              )}
            </span>
            <span className="mt-2 text-[10.5px] text-[#181c25]">{it.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* What's new                                                          */
/* ------------------------------------------------------------------ */
function WhatsNew() {
  const [open, setOpen] = useState(true);
  const [gone, setGone] = useState(false);
  if (gone) return null;
  return (
    <div
      className="grid transition-[grid-template-rows,opacity,margin] duration-500 ease-out"
      style={{ gridTemplateRows: open ? "1fr" : "0fr", opacity: open ? 1 : 0, marginTop: open ? 28 : 0 }}
      onTransitionEnd={(e) => {
        if (!open && e.propertyName === "grid-template-rows") setGone(true);
      }}
    >
      <div className="overflow-hidden px-6">
        <div className="relative flex items-center gap-3 rounded-3xl bg-[#e8ebef] p-4 pl-6">
          <div className="flex-1">
            <h3 className="text-[13px] font-semibold leading-tight text-[#181c25]">What's new in Deriv</h3>
            <p className="mt-1 text-[11px] leading-[1.4] text-[#6c717b]">Explore a unified wallet, faster trading, and more.</p>
          </div>
          <img src={whatsNewImg} alt="" className="h-[98px] w-[98px] shrink-0 rounded-xl object-cover" />
          <button
            aria-label="Dismiss"
            onClick={() => setOpen(false)}
            className="press absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm"
          >
            <IconClose size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Highlights                                                          */
/* ------------------------------------------------------------------ */
function Highlights({ go }: Pick<Props, "go">) {
  const cards = [
    { title: "DXN Futures", text: "Go long or short on top pairs, with up to 50x leverage.", tags: ["DXN", "BTC", "ETH", "SOL"], img: dxnImg, badge: "DXN", tab: "exchange" as HomeTab },
    { title: "Metals", text: "Key metals. Tight spreads and up to 1:1000 leverage.", tags: ["MT5", "Gold", "Silver", "Copper"], img: metalsImg, tab: "cfds" as HomeTab },
    { title: "Forex", text: "Major, minor and exotic pairs with zero-commission trading.", tags: ["MT5", "EURUSD", "GBPUSD"], gradient: "linear-gradient(135deg,#0b1d3a,#1c4f9c)", big: "EUR/USD", tab: "cfds" as HomeTab },
    { title: "Options", text: "Rise/Fall, Digits and more with defined risk.", tags: ["Rise", "Fall", "Digits"], gradient: "linear-gradient(135deg,#3a0a10,#ff444f)", big: "↗", tab: "options" as HomeTab },
  ];
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ start: true, end: false });
  const upd = () => {
    const el = ref.current;
    if (!el) return;
    setPos({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  };
  const by = (d: number) => ref.current?.scrollBy({ left: d * 256, behavior: "smooth" });

  return (
    <section className="mt-8 pb-8">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-[15px] font-bold tracking-tight">Highlights</h2>
        <div className="flex overflow-hidden rounded-full bg-[#f3f3f4]">
          <button aria-label="Previous" disabled={pos.start} onClick={() => by(-1)} className="press flex h-8 w-10 items-center justify-center text-[#181c25] disabled:text-black/25">
            <IconChevronLeft size={16} strokeWidth={2} />
          </button>
          <span className="w-px bg-white" />
          <button aria-label="Next" disabled={pos.end} onClick={() => by(1)} className="press flex h-8 w-10 items-center justify-center text-[#181c25] disabled:text-black/25">
            <IconChevronRight size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
      <div ref={ref} onScroll={upd} className="hide-scroll mt-4 flex snap-x gap-4 overflow-x-auto px-4 scroll-px-4">
        {cards.map((c, i) => (
          <TiltButton
            key={c.title}
            onClick={() => go(c.tab)}
            className="group anim-fade-up w-[245px] shrink-0 snap-start overflow-hidden rounded-3xl bg-[#f4f4f5] text-left active:scale-[0.97]"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="relative h-[139px] overflow-hidden">
              {c.img ? (
                <img src={c.img} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[25.5px] font-black text-white/90 transition-transform duration-700 group-hover:scale-110" style={{ background: c.gradient }}>
                  {c.big}
                </div>
              )}
              {c.badge && (
                <span className="absolute left-2.5 top-2.5 -rotate-6 rounded-md bg-[#ff444f] px-1.5 py-0.5 text-[8px] font-black italic text-white shadow">{c.badge}</span>
              )}
            </div>
            <div className="p-4 pb-5">
              <h3 className="text-[15px] font-bold leading-tight text-[#181c25]">{c.title}</h3>
              <p className="mt-2 h-[60px] text-[10.5px] leading-[1.45] text-[#6c717b]">{c.text}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.tags.map((t) => (
                  <span key={t} className="rounded-lg bg-[#e8e9eb] px-2 py-1 text-[10px] font-bold text-[#181c25]">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </TiltButton>
        ))}
      </div>
    </section>
  );
}

export function HomePage({ balanceHidden, go, openMore, onDeposit }: Props) {
  return (
    <div className="pb-2">
      <Hero hidden={balanceHidden} onDeposit={onDeposit} go={go} />
      <Accounts hidden={balanceHidden} go={go} />
      <Scene3D />
      <PromoCarousel />
      <Explore go={go} openMore={openMore} />
      <WhatsNew />
      <Highlights go={go} />
    </div>
  );
}
