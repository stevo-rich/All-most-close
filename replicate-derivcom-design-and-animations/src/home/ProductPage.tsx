import type { ReactNode } from "react";
import { IconChevronRight, TileCfd, TileDxn, TileMt5, TileOptions, TileSmartTrader, TileTv } from "../icons";
import { useToast } from "../ui";

type Item = { name: string; desc: string; icon: ReactNode };
const DATA: Record<string, { title: string; sub: string; items: Item[] }> = {
  cfds: {
    title: "CFDs",
    sub: "Trade forex, metals, stocks and more with competitive spreads.",
    items: [
      { name: "MT5 | Standard", desc: "Powerful trading on the industry-standard platform.", icon: <TileMt5 size={44} sub="STD" /> },
      { name: "MT5 | Swap-Free", desc: "Trade with no overnight swap fees.", icon: <TileMt5 size={44} sub="SWF" /> },
      { name: "cTrader", desc: "Fast execution and advanced charting.", icon: <TileCfd size={44} /> },
      { name: "TradingView", desc: "Trade directly from TradingView charts.", icon: <TileTv size={44} /> },
    ],
  },
  exchange: {
    title: "Exchange",
    sub: "Go long or short on top crypto pairs with up to 50x leverage.",
    items: [
      { name: "DXN Futures", desc: "BTC, ETH, SOL and more perpetual futures.", icon: <TileDxn size={44} /> },
      { name: "Spot", desc: "Buy and sell crypto instantly.", icon: <TileDxn size={44} /> },
    ],
  },
  options: {
    title: "Options",
    sub: "Trade with defined risk on synthetic and real markets.",
    items: [
      { name: "Deriv Trader", desc: "Rise/Fall, Higher/Lower, Digits and more.", icon: <TileOptions size={44} /> },
      { name: "SmartTrader", desc: "Classic, fast and simple options trading.", icon: <TileSmartTrader size={44} /> },
    ],
  },
};

export function ProductPage({ kind }: { kind: keyof typeof DATA | string }) {
  const toast = useToast();
  const d = DATA[kind] ?? DATA.cfds;
  return (
    <div>
      <section className="rounded-b-[32px] bg-[#181c25] px-4 pb-8 pt-2 text-white">
        <h1 className="anim-fade-up text-[28px] font-bold tracking-tight">{d.title}</h1>
        <p className="anim-fade-up mt-1.5 max-w-[300px] text-[14.5px] leading-snug text-white/65" style={{ animationDelay: "80ms" }}>
          {d.sub}
        </p>
      </section>
      <div className="space-y-3 px-4 pb-8 pt-6">
        {d.items.map((it, i) => (
          <button
            key={it.name}
            onClick={() => toast("Demo clone — trading platforms are not available.")}
            className="press group anim-fade-up flex w-full items-center gap-4 rounded-3xl bg-[#f5f5f5] p-4 text-left hover:bg-[#eeeeee]"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <span className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full bg-white shadow-[0_4px_10px_rgba(0,0,0,.07)] transition-transform duration-300 group-hover:scale-110">
              {it.icon}
            </span>
            <span className="flex-1">
              <span className="block text-[17px] font-semibold">{it.name}</span>
              <span className="block text-[13.5px] leading-snug text-[#6c717b]">{it.desc}</span>
            </span>
            <IconChevronRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        ))}
      </div>
    </div>
  );
}
