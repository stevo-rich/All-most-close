import { useEffect, useRef, useState, type ReactNode } from "react";
import {
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
import { fullName, useProfile } from "../account";
import { type CashierRoute } from "../cashier/CashierHub";
import { DepositFlow } from "../cashier/DepositFlow";
import { WithdrawFlow } from "../cashier/WithdrawFlow";
import { TransferFlow } from "../cashier/TransferFlow";
import { DTraderPage } from "../cashier/DTraderPage";
import { HomeHeader } from "./HomeHeader";
import { HomePage, type HomeTab } from "./HomePage";
import { PortfolioPage } from "./PortfolioPage";
import { OptionsPage } from "./OptionsPage";
import { ProductPage } from "./ProductPage";
import { ProfilePage } from "./ProfilePage";
import { NotificationsPanel, SEED_NOTIFICATIONS, type Notif } from "./Notifications";

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

export function HomeApp({ openBot }: { openBot: (tab?: "dashboard" | "builder" | "chart" | "menu") => void }) {
  const toast = useToast();
  const { profile } = useProfile();
  const initials =
    fullName(profile)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "DT";
  const [tab, setTab] = useState<HomeTab>("home");
  const [prev, setPrev] = useState<HomeTab>("home");
  const [hidden, setHidden] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>(SEED_NOTIFICATIONS);
  const unread = notifs.filter((n) => !n.read).length;
  const [overlay, setOverlay] = useState<null | "search" | "bell" | "more">(null);
  const [query, setQuery] = useState("");
  const [cashier, setCashier] = useState<CashierRoute>(null);
  // Which market + pocket the trader was opened with.
  const [trader, setTrader] = useState<{ symbol?: string; account?: "real" | "demo" }>({});
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
        {tab !== "options" && !isProfile && (
          <HomeHeader
            avatar={tab !== "portfolio"}
            initials={initials}
            amy
            onAmy={() => toast("Amy, your AI assistant, is a demo placeholder here.")}
            eye={!isProfile}
            unread={unread}
            balanceHidden={hidden}
            bg={headerBg}
            onAvatar={() => go("profile")}
            onBack={() => go(prev === "profile" ? "home" : prev)}
            onSearch={() => setOverlay("search")}
            onBell={() => setOverlay("bell")}
            onToggleBalance={() => setHidden((h) => !h)}
          />
        )}
        <div key={tab} className="page-enter">
          {tab === "home" && (
            <HomePage
              balanceHidden={hidden}
              go={go}
              openMore={() => setOverlay("more")}
              onDeposit={() => setCashier("deposit")}
            />
          )}
          {tab === "portfolio" && <PortfolioPage balanceHidden={hidden} />}
          {isProfile && <ProfilePage unread={unread} onBell={() => setOverlay("bell")} onBack={() => go("home")} />}
          {(tab === "cfds" || tab === "exchange") && <ProductPage kind={tab} />}
        </div>
        {tab === "options" && (
          <OptionsPage
            onOpenTrader={(symbol, account) => {
              setTrader({ symbol, account });
              setCashier("trader");
            }}
            onOpenBot={() => openBot("builder")}
            onTransfer={() => setCashier("transfer")}
            hidden={hidden}
            unread={unread}
            onBell={() => setOverlay("bell")}
            onProfile={() => go("profile")}
          />
        )}
      </div>

      <nav className="relative z-30 flex h-[76px] shrink-0 border-t border-[#e6e8ea] bg-white px-1">
        {NAV.map((n) => {
          const active = tab === n.id;
          return (
            <button key={n.id} onClick={() => go(n.id)} className="press group flex flex-1 flex-col items-center justify-center gap-1">
              <span key={String(active)} className={`${active ? "nav-bounce text-[#ff444f]" : "text-[#181c25]"} transition-colors duration-300 group-hover:scale-105`}>
                <NavIcon id={n.id} active={active} />
              </span>
              <span className={`text-[10px] font-semibold transition-colors duration-300 ${active ? "text-[#ff444f]" : "text-[#181c25]"}`}>{n.label}</span>
            </button>
          );
        })}
      </nav>

      {cashier && (
        <div className="absolute inset-0 z-[55]">
          {cashier === "deposit" && (
            <DepositFlow onClose={() => setCashier(null)} onTransfer={() => setCashier("transfer")} />
          )}
          {cashier === "withdraw" && (
            <WithdrawFlow onClose={() => setCashier(null)} onTransfer={() => setCashier("transfer")} />
          )}
          {cashier === "transfer" && (
            <TransferFlow
              onClose={() => setCashier(null)}
              onStartTrading={() => setCashier("trader")}
              onDeposit={() => setCashier("deposit")}
            />
          )}
          {cashier === "trader" && (
            <DTraderPage symbol={trader.symbol} account={trader.account} onClose={() => setCashier(null)} />
          )}
        </div>
      )}

      {overlay === "search" && (
        <div className="anim-fade-in absolute inset-0 z-50 flex flex-col bg-white">
          <div className="flex items-center gap-3 border-b border-[#eceef0] px-4 py-3">
            <IconSearch size={20} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products and settings"
              className="flex-1 bg-transparent text-[12px] outline-none"
            />
            <button
              onClick={() => {
                setOverlay(null);
                setQuery("");
              }}
              className="text-[11px] font-semibold text-[#ff444f]"
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
                  <span className="flex-1 text-[12px]">{s.label}</span>
                  <IconChevronRight size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {overlay === "bell" && (
        <Sheet title="Notifications" onClose={() => setOverlay(null)} full>
          <NotificationsPanel
            items={notifs}
            onRead={(id) => setNotifs((l) => l.map((n) => (n.id === id ? { ...n, read: true } : n)))}
            onDismiss={(id) => setNotifs((l) => l.filter((n) => n.id !== id))}
            onMarkAll={() => setNotifs((l) => l.map((n) => ({ ...n, read: true })))}
            onAction={(n) => {
              if (n.kind === "promo" || n.kind === "announcement") {
                setOverlay(null);
                go("options");
              }
            }}
          />
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
                <span className="mt-2 text-[10.5px]">{x.l}</span>
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </>
  );
}

