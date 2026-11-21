import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  IconBell,
  IconCfds,
  IconChevronRight,
  IconExchange,
  IconHome,
  IconOptions,
  IconSearch,
  IconWallet,
  TileBot,
  TileDxn,
  TileMt5,
  TileOptions,
  TileP2p,
  TileSmartTrader,
  TileTv,
} from "../icons";
import { Sheet, useToast } from "../ui";
import { HomeHeader } from "./HomeHeader";
import { HomePage, type HomeTab } from "./HomePage";
import { PortfolioPage } from "./PortfolioPage";
import { ProductPage } from "./ProductPage";
import { ProfileHero, ProfilePage } from "./ProfilePage";

const NAV: { id: HomeTab; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "cfds", label: "CFDs" },
  { id: "exchange", label: "Exchange" },
  { id: "options", label: "Options" },
  { id: "portfolio", label: "Portfolio" },
];

function NavIcon({ id, active }: { id: HomeTab; active: boolean }) {
  const p = { size: 28, strokeWidth: 1.4 };
  switch (id) {
    case "home":
      return <IconHome {...p} filled={active} />;
    case "cfds":
      return <IconCfds {...p} />;
    case "exchange":
      return <IconExchange {...p} />;
    case "options":
      return <IconOptions {...p} />;
    default:
      return <IconWallet {...p} filled={active} />;
  }
}

const SEARCH_ITEMS: { label: string; tab: HomeTab; icon: ReactNode }[] = [
  { label: "MT5 | Standard", tab: "cfds", icon: <TileMt5 size={30} /> },
  { label: "TradingView", tab: "cfds", icon: <TileTv size={30} /> },
  { label: "DXN Futures", tab: "exchange", icon: <TileDxn size={30} /> },
  { label: "Options", tab: "options", icon: <TileOptions size={30} /> },
  { label: "Deposit", tab: "portfolio", icon: <IconWallet size={26} /> },
  { label: "Personal details", tab: "profile", icon: <IconSearch size={22} /> },
];

export function HomeApp({ openBot }: { openBot: () => void }) {
  const toast = useToast();
  const [tab, setTab] = useState<HomeTab>("home");
  const [prev, setPrev] = useState<HomeTab>("home");
  const [hidden, setHidden] = useState(false);
  const [unread, setUnread] = useState(2);
  const [overlay, setOverlay] = useState<null | "search" | "bell" | "more">(null);
  const [query, setQuery] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  const go = (t: HomeTab) => {
    setPrev(tab);
    setTab(t);
    setOverlay(null);
  };
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [tab]);

  const isProfile = tab === "profile";
  const headerBg = isProfile ? "#1b2335" : "#181c25";

  return (
    <>
      <div ref={scroller} className="flex-1 overflow-y-auto bg-white">
        <HomeHeader
          avatar={tab === "home" || tab === "cfds" || tab === "exchange" || tab === "options"}
          back={isProfile}
          amy={!isProfile}
          eye={!isProfile}
          unread={unread}
          balanceHidden={hidden}
          bg={headerBg}
          onAvatar={() => go("profile")}
          onBack={() => go(prev === "profile" ? "home" : prev)}
          onSearch={() => setOverlay("search")}
          onBell={() => setOverlay("bell")}
          onAmy={() => toast("Amy, your AI assistant, is a demo placeholder here.")}
          onToggleBalance={() => setHidden((h) => !h)}
        />
        <div key={tab} className="page-enter">
          {tab === "home" && <HomePage balanceHidden={hidden} go={go} openMore={() => setOverlay("more")} />}
          {tab === "portfolio" && <PortfolioPage balanceHidden={hidden} />}
          {isProfile && <ProfilePage />}
          {(tab === "cfds" || tab === "exchange" || tab === "options") && <ProductPage kind={tab} />}
        </div>
      </div>

      <nav className="relative z-30 flex h-[76px] shrink-0 border-t border-[#e6e8ea] bg-white px-1">
        {NAV.map((n) => {
          const active = tab === n.id;
          return (
            <button key={n.id} onClick={() => go(n.id)} className="press group flex flex-1 flex-col items-center justify-center gap-1">
              <span key={String(active)} className={`${active ? "nav-bounce text-[#ff444f]" : "text-[#181c25]"} transition-colors duration-300 group-hover:scale-105`}>
                <NavIcon id={n.id} active={active} />
              </span>
              <span className={`text-[13px] font-semibold transition-colors duration-300 ${active ? "text-[#ff444f]" : "text-[#181c25]"}`}>{n.label}</span>
            </button>
          );
        })}
      </nav>

      {overlay === "search" && (
        <div className="anim-fade-in absolute inset-0 z-50 flex flex-col bg-white">
          <div className="flex items-center gap-3 border-b border-[#eceef0] px-4 py-3">
            <IconSearch size={20} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products and settings"
              className="flex-1 bg-transparent text-[16px] outline-none"
            />
            <button
              onClick={() => {
                setOverlay(null);
                setQuery("");
              }}
              className="text-[15px] font-semibold text-[#ff444f]"
            >
              Cancel
            </button>
          </div>
          <ul className="flex-1 overflow-y-auto p-2">
            {SEARCH_ITEMS.filter((s) => s.label.toLowerCase().includes(query.toLowerCase())).map((s, i) => (
              <li key={s.label} className="anim-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                <button
                  onClick={() => {
                    setQuery("");
                    go(s.tab);
                  }}
                  className="flex w-full items-center gap-4 rounded-2xl px-3 py-3 text-left hover:bg-[#f5f5f5]"
                >
                  <span className="flex h-10 w-10 items-center justify-center">{s.icon}</span>
                  <span className="flex-1 text-[16px]">{s.label}</span>
                  <IconChevronRight size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {overlay === "bell" && (
        <Sheet title="Notifications" onClose={() => setOverlay(null)}>
          {unread === 0 && (
            <div className="flex flex-col items-center py-10 text-[#8a8f99]">
              <IconBell size={40} />
              <p className="mt-2 text-[15px]">You're all caught up</p>
            </div>
          )}
          {unread > 0 && (
            <ul className="space-y-3">
              {["Welcome to Deriv — this is a demo notification.", "New: ANT CFDs are now available to explore."].slice(0, unread).map((n, i) => (
                <li key={n} className="anim-fade-up rounded-2xl bg-[#f5f5f5] p-4 text-[14.5px]" style={{ animationDelay: `${i * 70}ms` }}>
                  {n}
                </li>
              ))}
              <button onClick={() => setUnread(0)} className="press w-full rounded-full bg-[#181c25] py-3 text-[15px] font-bold text-white">
                Mark all as read
              </button>
            </ul>
          )}
        </Sheet>
      )}

      {overlay === "more" && (
        <Sheet title="More from Deriv" onClose={() => setOverlay(null)}>
          <div className="grid grid-cols-3 gap-y-5 pt-2">
            {[
              { l: "Deriv Bot", i: <TileBot size={46} />, on: () => (setOverlay(null), openBot()) },
              { l: "SmartTrader", i: <TileSmartTrader size={46} />, on: () => go("options") },
              { l: "P2P", i: <TileP2p size={46} />, on: () => go("portfolio") },
              { l: "Exchange", i: <TileDxn size={46} />, on: () => go("exchange") },
              { l: "MT5", i: <TileMt5 size={46} />, on: () => go("cfds") },
              { l: "TradingView", i: <TileTv size={46} />, on: () => go("cfds") },
            ].map((x, i) => (
              <button key={x.l} onClick={x.on} className="group anim-fade-up flex flex-col items-center" style={{ animationDelay: `${i * 50}ms` }}>
                <span className="flex h-[66px] w-[66px] items-center justify-center rounded-full bg-[#f3f3f4] shadow-[0_6px_14px_rgba(0,0,0,.07)] transition-transform duration-300 group-hover:scale-110 group-active:scale-90">
                  {x.i}
                </span>
                <span className="mt-2 text-[14px]">{x.l}</span>
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </>
  );
}

export { ProfileHero };
