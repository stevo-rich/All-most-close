import { useState } from "react";
import { IconBack, IconBell, IconEye, IconSearch, IconSparkle } from "../icons";

type Props = {
  avatar?: boolean;
  back?: boolean;
  eye?: boolean;
  amy?: boolean;
  initials?: string;
  unread: number;
  balanceHidden: boolean;
  bg?: string;
  onAvatar?: () => void;
  onBack?: () => void;
  onSearch: () => void;
  onBell: () => void;
  onAmy?: () => void;
  onToggleBalance?: () => void;
};

function Circle({ children, onClick, label, className = "" }: { children: React.ReactNode; onClick?: () => void; label: string; className?: string }) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={`press relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.14] text-white hover:bg-white/25 ${className}`}
    >
      {children}
    </button>
  );
}

export function HomeHeader(p: Props) {
  const [ring, setRing] = useState(false);
  return (
    <header
      className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 px-6 text-white transition-colors duration-300"
      style={{ background: p.bg ?? "#181c25" }}
    >
      {p.back && (
        <Circle label="Back" onClick={p.onBack}>
          <IconBack size={17} />
        </Circle>
      )}
      {p.avatar && (
        <Circle label="Profile" onClick={p.onAvatar} className="text-[9px] font-semibold">
          {p.initials ?? "JD"}
        </Circle>
      )}
      <Circle label="Search" onClick={p.onSearch}>
        <IconSearch size={17} />
      </Circle>

      <div className="flex-1" />

      {p.amy && (
        <button
          onClick={p.onAmy}
          className="amy-pill press anim-fade-in flex h-9 shrink-0 items-center gap-1.5 px-4"
          aria-label="Ask Amy"
        >
          <span className="flex shrink-0" style={{ animation: "sparkle-twinkle 3s ease-in-out infinite" }}>
            <IconSparkle size={20} />
          </span>
          <span className="amy-text whitespace-nowrap text-[13px] font-extrabold tracking-tight">Ask Amy</span>
        </button>
      )}

      {p.eye && (
        <Circle label="Toggle balance" onClick={p.onToggleBalance}>
          <IconEye size={18} off={p.balanceHidden} />
        </Circle>
      )}
      <Circle
        label="Notifications"
        onClick={() => {
          setRing(true);
          window.setTimeout(() => setRing(false), 900);
          p.onBell();
        }}
        className={`bell-ring ${ring ? "ringing" : ""}`}
      >
        <IconBell size={18} />
        {p.unread > 0 && (
          <span
            key={p.unread}
            className="anim-pop absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#ff444f] px-1 text-[8px] font-bold leading-none text-white"
          >
            {p.unread}
          </span>
        )}
      </Circle>
    </header>
  );
}
