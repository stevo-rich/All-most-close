import type { ReactNode, SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 24, children, ...rest }: P & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconHome = ({ filled, ...p }: P & { filled?: boolean }) => (
  <Svg {...p} fill={filled ? "currentColor" : "none"}>
    <path d="M3.5 10.5 12 3.5l8.5 7v9a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-9Z" />
    {!filled && <path d="M9 20.5v-6h6v6" opacity={0} />}
  </Svg>
);
export const IconCfds = (p: P) => (
  <Svg {...p}>
    <path d="M4 4v16h16" />
    <path d="M8 8v8M8 10.5H6.5v3H8M8 10.5h1.5v3H8" />
    <path d="M12.5 6v12M11.2 9h2.6v6h-2.6z" />
    <path d="M17 9v8M15.8 11.5h2.4v3h-2.4z" />
  </Svg>
);
export const IconExchange = (p: P) => (
  <Svg {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="3" strokeWidth={1.8} />
    <text x="12" y="14.6" fontSize="7" fontWeight="800" textAnchor="middle" fill="currentColor" stroke="none" fontFamily="Inter, sans-serif" letterSpacing="-0.4">
      DXN
    </text>
  </Svg>
);
export const IconOptions = (p: P) => (
  // Two chunky diagonal arrows (rise up-right, fall down-left) with a gap —
  // the Deriv "Options" tab glyph. Solid fill, colours from currentColor.
  <svg width={p.size ?? 28} height={p.size ?? 28} viewBox="0 0 24 24" fill="currentColor" stroke="none" {...p}>
    <path d="M13.91 7.97 L16.03 10.09 L14.05 12.07 L11.93 9.95 Z" />
    <path d="M18.36 5.64 L16.52 11.16 L12.84 7.48 Z" />
    <path d="M10.09 16.03 L7.97 13.91 L9.95 11.93 L12.07 14.05 Z" />
    <path d="M5.64 18.36 L7.48 12.84 L11.16 16.52 Z" />
  </svg>
);
export const IconWallet = ({ filled, ...p }: P & { filled?: boolean }) => (
  <Svg {...p}>
    <path d="M6 7.5V6a2 2 0 0 1 2-2h9.5a1 1 0 0 1 1 1v2.5" />
    <rect x="3.5" y="7.5" width="17" height="12.5" rx="2.5" fill={filled ? "currentColor" : "none"} />
    <circle cx="16.5" cy="14" r="0.9" fill={filled ? "#fff" : "currentColor"} stroke="none" />
    <path d="M5.5 10.5h13" opacity={filled ? 0 : 0} />
  </Svg>
);
export const IconSearch = (p: P) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </Svg>
);
export const IconBack = (p: P) => (
  <Svg {...p} strokeWidth={2}>
    <path d="M20 12H4.5M11 5.5 4.5 12l6.5 6.5" />
  </Svg>
);
export const IconBell = (p: P) => (
  <Svg {...p}>
    <path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 1.5h-15L6 16.5Z" />
    <path d="M10 20.5a2.2 2.2 0 0 0 4 0" />
  </Svg>
);
export const IconEye = ({ off, ...p }: P & { off?: boolean }) => (
  <Svg {...p} strokeWidth={1.8}>
    <path d="M2 12s3.7-6.5 10-6.5S22 12 22 12s-3.7 6.5-10 6.5S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
    {off && <path d="M4 4l16 16" />}
  </Svg>
);
export const IconClose = (p: P) => (
  <Svg {...p} strokeWidth={1.8}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);
export const IconChevronDown = (p: P) => (
  <Svg {...p}>
    <path d="m5 9 7 7 7-7" />
  </Svg>
);
export const IconChevronUp = (p: P) => (
  <Svg {...p}>
    <path d="m5 15 7-7 7 7" />
  </Svg>
);
export const IconChevronLeft = (p: P) => (
  <Svg {...p}>
    <path d="m15 5-7 7 7 7" />
  </Svg>
);
export const IconChevronRight = (p: P) => (
  <Svg {...p}>
    <path d="m9 5 7 7-7 7" />
  </Svg>
);
export const IconRefresh = (p: P) => (
  <Svg {...p} strokeWidth={2}>
    <path d="M20 12a8 8 0 1 1-2.6-5.9" />
    <path d="M20.5 3.5v5h-5" />
  </Svg>
);
export const IconPlus = (p: P) => (
  <Svg {...p} strokeWidth={1.6}>
    <path d="M12 4v16M4 12h16" />
  </Svg>
);
export const IconMinus = (p: P) => (
  <Svg {...p} strokeWidth={1.6}>
    <path d="M4 12h16" />
  </Svg>
);
export const IconTransfer = (p: P) => (
  <Svg {...p} strokeWidth={1.6}>
    <path d="M4 8.5h15.5M15.5 4.5l4 4-4 4" />
    <path d="M20 15.5H4.5M8.5 11.5l-4 4 4 4" />
  </Svg>
);
export const IconUser = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 20.5c.8-4 3.7-6 7.5-6s6.7 2 7.5 6Z" />
  </Svg>
);
export const IconUserFilled = (p: P) => (
  <svg width={p.size ?? 24} height={p.size ?? 24} viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 3.2a3.3 3.3 0 1 1 0 6.6 3.3 3.3 0 0 1 0-6.6Zm0 13.4c-2.4 0-4.5-1.1-5.8-2.9 0-1.9 3.9-2.9 5.8-2.9s5.8 1 5.8 2.9c-1.3 1.8-3.4 2.9-5.8 2.9Z" />
  </svg>
);
export const IconDoc = (p: P) => (
  <Svg {...p}>
    <path d="M6 3.5h8l4 4v13H6z" />
    <path d="M14 3.5v4h4M9 12h6M9 15h6M9 18h4" />
  </Svg>
);
export const IconCopy = (p: P) => (
  <Svg {...p}>
    <rect x="8.5" y="8.5" width="11" height="12" rx="2" />
    <path d="M15.5 8.5V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v9.5a2 2 0 0 0 2 2h1.5" />
  </Svg>
);
export const IconDollar = (p: P) => (
  <Svg {...p} strokeWidth={1.6}>
    <circle cx="12" cy="12" r="9" />
    <path d="M14.5 9.2c-.4-1-1.3-1.5-2.5-1.5-1.5 0-2.5.8-2.5 1.9 0 2.8 5.2 1.3 5.2 4.2 0 1.2-1.1 2.1-2.7 2.1-1.3 0-2.3-.6-2.7-1.7M12 6v1.7M12 16.3V18" />
  </Svg>
);
export const IconKebab = (p: P) => (
  <svg width={p.size ?? 24} height={p.size ?? 24} viewBox="0 0 24 24" fill="currentColor" {...p}>
    <circle cx="12" cy="5" r="1.7" />
    <circle cx="12" cy="12" r="1.7" />
    <circle cx="12" cy="19" r="1.7" />
  </svg>
);
export const IconArrowCircle = (p: P) => (
  <svg width={p.size ?? 24} height={p.size ?? 24} viewBox="0 0 24 24" {...p}>
    <circle cx="12" cy="12" r="11" fill="#000" />
    <path d="m10 7.5 4.5 4.5-4.5 4.5" stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
/** Four-point sparkle cluster used by the Ask Amy pill. */
export const IconSparkle = ({ size = 22, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}>
    <defs>
      <linearGradient id="spark-big" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#a58bff" />
        <stop offset="55%" stopColor="#c98bff" />
        <stop offset="100%" stopColor="#ffb6c8" />
      </linearGradient>
      <linearGradient id="spark-small" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffe9a3" />
        <stop offset="100%" stopColor="#ffc46b" />
      </linearGradient>
    </defs>
    {/* large four-point star */}
    <path
      d="M9.5 2.5c.7 3.6 2.1 5 5.7 5.7-3.6.7-5 2.1-5.7 5.7-.7-3.6-2.1-5-5.7-5.7 3.6-.7 5-2.1 5.7-5.7Z"
      fill="url(#spark-big)"
    />
    {/* small star, upper right */}
    <path
      d="M18 3.2c.35 1.75 1.05 2.45 2.8 2.8-1.75.35-2.45 1.05-2.8 2.8-.35-1.75-1.05-2.45-2.8-2.8 1.75-.35 2.45-1.05 2.8-2.8Z"
      fill="url(#spark-small)"
    />
    {/* small star, lower left */}
    <path
      d="M16.6 15.4c.3 1.5.9 2.1 2.4 2.4-1.5.3-2.1.9-2.4 2.4-.3-1.5-.9-2.1-2.4-2.4 1.5-.3 2.1-.9 2.4-2.4Z"
      fill="url(#spark-small)"
    />
  </svg>
);

/* ---------- Bot app icons ---------- */
export const IconDashboard = (p: P) => (
  <Svg {...p} strokeWidth={1.4}>
    <rect x="4" y="3.5" width="6" height="6" rx="1.5" />
    <rect x="14" y="3.5" width="6" height="6" rx="1.5" />
    <rect x="4" y="14.5" width="6" height="6" rx="1.5" />
    <rect x="14" y="14.5" width="6" height="6" rx="1.5" />
  </Svg>
);
export const IconPuzzle = (p: P) => (
  <Svg {...p} strokeWidth={1.3}>
    <path d="M9.5 4.5a1.8 1.8 0 0 1 3.6 0V6H17v3.5h-1.5a1.8 1.8 0 0 0 0 3.6H17v3.9h-3.9v-1.5a1.8 1.8 0 0 0-3.6 0V17H5.6v-3.9h1.5a1.8 1.8 0 0 0 0-3.6H5.6V6H9.5V4.5Z" />
    <path d="M10 20.5h5" opacity={0} />
  </Svg>
);
export const IconChart = (p: P) => (
  <Svg {...p} strokeWidth={1.4}>
    <path d="M4 4v16h16" />
    <path d="m6.5 16.5 3.5-5 3 2.5 4.5-6.5V16.5h-11Z" />
  </Svg>
);
export const IconMenu = (p: P) => (
  <Svg {...p} strokeWidth={1.4}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);
export const IconPlay = (p: P) => (
  <svg width={p.size ?? 24} height={p.size ?? 24} viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M7 3.5v17l14-8.5L7 3.5Z" />
  </svg>
);
export const IconStop = (p: P) => (
  <svg width={p.size ?? 24} height={p.size ?? 24} viewBox="0 0 24 24" fill="currentColor" {...p}>
    <rect x="5" y="5" width="14" height="14" rx="2" />
  </svg>
);
export const IconFolder = (p: P) => (
  <Svg {...p} strokeWidth={1.4}>
    <path d="M3 18.5V6a1 1 0 0 1 1-1h5l2 2.5h7a1 1 0 0 1 1 1V10" />
    <path d="M3 18.5 5.5 11h16l-2.5 7.5H3Z" />
  </Svg>
);
export const IconSave = (p: P) => (
  <Svg {...p} strokeWidth={1.4}>
    <path d="M4 5.5a1.5 1.5 0 0 1 1.5-1.5h10l4.5 4.5v10a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13Z" />
    <path d="M8 4v4h6V4" />
    <circle cx="12" cy="14.5" r="2.5" />
  </Svg>
);
export const IconAlign = (p: P) => (
  <Svg {...p} strokeWidth={1.4}>
    <path d="M4 4v16" />
    <rect x="8" y="4.5" width="11" height="5" rx="1.5" />
    <rect x="8" y="13.5" width="8" height="5" rx="1.5" />
  </Svg>
);
export const IconUndo = (p: P) => (
  <Svg {...p} strokeWidth={1.5}>
    <path d="M4 12a8 8 0 1 1 2.6 5.9" />
    <path d="M3.5 3.5v5h5" />
  </Svg>
);
export const IconRedo = (p: P) => (
  <Svg {...p} strokeWidth={1.5}>
    <path d="M20 12a8 8 0 1 0-2.6 5.9" />
    <path d="M20.5 3.5v5h-5" />
  </Svg>
);
export const IconZoomIn = (p: P) => (
  <Svg {...p} strokeWidth={1.5}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 5 5M10.5 8v5M8 10.5h5" />
  </Svg>
);
export const IconZoomOut = (p: P) => (
  <Svg {...p} strokeWidth={1.5}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 5 5M8 10.5h5" />
  </Svg>
);
export const IconBasket = (p: P) => (
  <Svg {...p} strokeWidth={1.3}>
    <path d="M3.5 9.5h17l-1.8 9.5H5.3L3.5 9.5ZM8 9.5l2-5M16 9.5l-2-5M9 13v3M12 13v3M15 13v3" />
  </Svg>
);
export const IconList = (p: P) => (
  <Svg {...p} strokeWidth={1.2}>
    <rect x="5" y="3.5" width="14" height="17" rx="1.5" />
    <path d="M8 8h8M8 11h8M8 14h8M8 17h5" />
  </Svg>
);

export const IconArrowRight = (p: P) => (
  <Svg {...p} strokeWidth={1.7}>
    <path d="M4 12h15.5" />
    <path d="M13.5 5.5 20 12l-6.5 6.5" />
  </Svg>
);

/* ---------- Settings / profile icons ---------- */
const stroke = { strokeWidth: 1.5 } as const;

export const IconIdCard = (p: P) => (
  <Svg {...p} {...stroke}>
    <rect x="2.5" y="5" width="19" height="14" rx="2.2" />
    <circle cx="8.5" cy="11" r="1.9" />
    <path d="M5.5 16.2c.4-1.5 1.6-2.3 3-2.3s2.6.8 3 2.3M14.5 10h4.5M14.5 13.5h4.5" />
  </Svg>
);

export const IconHouse = (p: P) => (
  <Svg {...p} {...stroke}>
    <path d="M4 10.8 12 4l8 6.8V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9.2Z" />
  </Svg>
);

export const IconTax = (p: P) => (
  <Svg {...p} {...stroke}>
    <path d="M6.5 3.5h8.5l4 4v13H6.5z" />
    <path d="M15 3.5v4h4" />
    <path d="M12.4 9.8v7.4M14 11.3c-.3-.7-1-1.1-1.8-1.1-1 0-1.8.6-1.8 1.4 0 1.9 3.6 1 3.6 3 0 .9-.8 1.5-1.9 1.5-.9 0-1.6-.4-1.9-1.2" />
  </Svg>
);

export const IconIdBadge = (p: P) => (
  <Svg {...p} {...stroke}>
    <rect x="3" y="5.5" width="18" height="13" rx="2.2" />
    <circle cx="9" cy="11" r="1.8" />
    <path d="M6.2 16c.3-1.3 1.4-2 2.8-2s2.5.7 2.8 2M14.5 10.5h4M14.5 14h4" />
  </Svg>
);

export const IconAssessment = (p: P) => (
  <Svg {...p} {...stroke}>
    <circle cx="9" cy="8" r="2.6" />
    <path d="M4 18c.6-2.8 2.6-4.2 5-4.2s4.4 1.4 5 4.2" />
    <circle cx="17.5" cy="15.5" r="3.6" />
    <path d="M17.5 13.9v1.8l1.2.9" />
  </Svg>
);

export const IconPassword = (p: P) => (
  <Svg {...p} {...stroke}>
    <rect x="2.5" y="7.5" width="19" height="9.5" rx="2" />
    <path d="M6 11.5h1.2M9.4 11.5h1.2M12.8 11.5h1.2M16.2 11.5h1.6" />
  </Svg>
);

export const IconMobile = (p: P) => (
  <Svg {...p} {...stroke}>
    <rect x="7" y="2.5" width="10" height="19" rx="2.4" />
    <path d="M11 18.6h2" />
  </Svg>
);

export const IconPasskey = (p: P) => (
  <Svg {...p} {...stroke}>
    <path d="M4 18a8 8 0 1 1 13.2 2.2" />
    <path d="M7.6 15.4a4.4 4.4 0 1 1 7.2 1.2" />
    <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    <path d="M12 13.3v6.2M12 17h2.4M12 19h2" />
  </Svg>
);

export const IconLock = (p: P) => (
  <Svg {...p} {...stroke}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2.2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </Svg>
);

export const IconCloseAccount = (p: P) => (
  <Svg {...p} {...stroke}>
    <circle cx="9.5" cy="8.5" r="2.6" />
    <path d="M4.5 18.5c.6-2.8 2.6-4.2 5-4.2 1 0 1.9.2 2.7.6" />
    <circle cx="17" cy="16" r="4" />
    <path d="M15.2 14.2 18.8 17.8M18.8 14.2 15.2 17.8" />
  </Svg>
);

export const IconGrid4 = (p: P) => (
  <Svg {...p} {...stroke}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.4" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.4" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.4" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.4" />
  </Svg>
);

export const IconApiToken = (p: P) => (
  <Svg {...p} {...stroke}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 3.2v2.4M12 18.4v2.4M4.8 12H2.4M21.6 12h-2.4M6.9 6.9 5.2 5.2M18.8 18.8l-1.7-1.7M17.1 6.9l1.7-1.7M5.2 18.8l1.7-1.7" />
    <path d="M12 9.4v5.2M9.4 12h5.2" strokeWidth={1.1} />
  </Svg>
);

export const IconLaptop = (p: P) => (
  <Svg {...p} {...stroke}>
    <rect x="4" y="5" width="16" height="10.5" rx="1.8" />
    <path d="M2.5 18.5h19" />
  </Svg>
);

export const IconGlobe = (p: P) => (
  <Svg {...p} {...stroke}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.2 2.3 3.3 5.2 3.3 8.5S14.2 18.2 12 20.5c-2.2-2.3-3.3-5.2-3.3-8.5S9.8 5.8 12 3.5Z" />
  </Svg>
);

export const IconHelp = (p: P) => (
  <Svg {...p} {...stroke}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9.6 9.4c.2-1.3 1.2-2.2 2.5-2.2 1.4 0 2.4.9 2.4 2.1 0 1.7-2.4 1.9-2.4 3.7" />
    <circle cx="12" cy="16.6" r="0.9" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconChat = (p: P) => (
  <Svg {...p} {...stroke}>
    <path d="M3.5 6.5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8l-4.5 3v-11Z" />
    <path d="M18.5 8.5h.5a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-.5" />
  </Svg>
);

export const IconInfo = (p: P) => (
  <Svg {...p} {...stroke}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 10.8v5.4" />
    <circle cx="12" cy="7.9" r="0.9" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconPen = (p: P) => (
  <Svg {...p} {...stroke}>
    <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
    <path d="M14.5 6.5 17.5 9.5" />
  </Svg>
);

export const IconExternal = (p: P) => (
  <Svg {...p} strokeWidth={1.7}>
    <path d="M9 5h10v10" />
    <path d="M19 5 5.5 18.5" />
  </Svg>
);

/* ---------- Markets / dashboard extras ---------- */

/** Candlestick glyph inside a circle — the "Trade" action button */
export const IconTradeCircle = (p: P) => (
  <svg width={p.size ?? 28} height={p.size ?? 28} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeLinecap="round" {...p}>
    <path d="M8 9.5v3M8 17.5v3M8 12.5h0M8 17.5h0" strokeWidth={1.6} />
    <rect x="6.6" y="12.5" width="2.8" height="5" rx="0.7" fill="currentColor" stroke="none" />
    <path d="M14 6.5v3M14 18.5v3" strokeWidth={1.6} />
    <rect x="12.6" y="9.5" width="2.8" height="9" rx="0.7" fill="currentColor" stroke="none" />
    <path d="M20 8.5v4M20 21v2.5" strokeWidth={1.6} />
    <rect x="18.6" y="12.5" width="2.8" height="8.5" rx="0.7" fill="currentColor" stroke="none" />
  </svg>
);

/** Outline person with shoulders — avatar placeholder */
export const IconUserCircle = (p: P) => (
  <Svg {...p} strokeWidth={1.6}>
    <circle cx="12" cy="8.5" r="3.4" />
    <path d="M5 20.2c.9-3.6 3.6-5.4 7-5.4s6.1 1.8 7 5.4" />
  </Svg>
);

/** Diagonal expand arrows — the "maximise chart" button */
export const IconExpand = (p: P) => (
  <Svg {...p} strokeWidth={1.7}>
    <path d="M14 4h6v6" />
    <path d="M20 4 13.5 10.5" />
    <path d="M10 20H4v-6" />
    <path d="M4 20l6.5-6.5" />
  </Svg>
);

/* ---------- Product tiles (3D-ish rounded squares like deriv.com) ---------- */
type TileProps = { size?: number; className?: string };

export function TileOptions({ size = 46, className }: TileProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <defs>
        <linearGradient id="opt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff5a64" />
          <stop offset="1" stopColor="#d6212f" />
        </linearGradient>
      </defs>
      <g transform="rotate(-8 24 24)">
        <rect x="5" y="6" width="38" height="36" rx="9" fill="#a8131f" />
        <rect x="5" y="4" width="38" height="36" rx="9" fill="url(#opt)" />
        <path d="M24 13h9v9" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M33 13 22 24" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" />
        <path d="M24 31h-9v-9" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M15 31l11-11" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" />
      </g>
    </svg>
  );
}
export function TileDxn({ size = 46, className }: TileProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <defs>
        <linearGradient id="dxn" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff4a55" />
          <stop offset="1" stopColor="#c8182a" />
        </linearGradient>
      </defs>
      <g transform="rotate(-6 24 24)">
        <rect x="4" y="9" width="40" height="32" rx="8" fill="#8f0f1c" />
        <rect x="4" y="7" width="40" height="32" rx="8" fill="url(#dxn)" />
        <text x="24" y="29" fontSize="15" fontWeight="900" textAnchor="middle" fill="#fff" fontFamily="Inter, sans-serif" fontStyle="italic" letterSpacing="-1">
          DXN
        </text>
      </g>
    </svg>
  );
}
export function TileTv({ size = 46, className }: TileProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <g transform="rotate(-6 24 24)">
        <rect x="5" y="9" width="38" height="33" rx="8" fill="#000" />
        <rect x="5" y="6" width="38" height="33" rx="8" fill="#0b0b0e" stroke="#2a2a30" />
        <path d="M13 15h14v3h-5.5v9h-3v-9H13v-3Z" fill="#fff" />
        <circle cx="30" cy="16.4" r="2.2" fill="#fff" />
        <path d="M33 27h-3.4L35 15h3.4L33 27Z" fill="#fff" transform="translate(-1 0)" />
        <text x="24" y="34" fontSize="4.2" fontWeight="700" textAnchor="middle" fill="#fff" fontFamily="Inter, sans-serif">
          TradingView
        </text>
      </g>
    </svg>
  );
}
export function TileMt5({ size = 46, sub = "SWF", className }: TileProps & { sub?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <defs>
        <linearGradient id="mt5" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2c7bd6" />
          <stop offset="1" stopColor="#10459a" />
        </linearGradient>
      </defs>
      <g transform="rotate(-6 24 24)">
        <rect x="4" y="10" width="40" height="30" rx="8" fill="#0a2d66" />
        <rect x="4" y="8" width="40" height="30" rx="8" fill="url(#mt5)" />
        <text x="24" y="26" fontSize="15" fontWeight="900" textAnchor="middle" fill="#fff" fontFamily="Inter, sans-serif" fontStyle="italic" letterSpacing="-1">
          MT5
        </text>
        <text x="24" y="33.5" fontSize="5.2" fontWeight="800" textAnchor="middle" fill="#fff" fontFamily="Inter, sans-serif" fontStyle="italic">
          {sub}
        </text>
      </g>
    </svg>
  );
}
export function TileP2p({ size = 46, className }: TileProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <defs>
        <linearGradient id="p2p" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff5a64" />
          <stop offset="1" stopColor="#d6212f" />
        </linearGradient>
      </defs>
      <g transform="rotate(-6 24 24)">
        <rect x="4" y="10" width="40" height="30" rx="8" fill="#9b1220" />
        <rect x="4" y="8" width="40" height="30" rx="8" fill="url(#p2p)" />
        <text x="24" y="29" fontSize="15" fontWeight="900" textAnchor="middle" fill="#fff" fontFamily="Inter, sans-serif" fontStyle="italic" letterSpacing="-1">
          P2P
        </text>
      </g>
    </svg>
  );
}
export function TileMore({ size = 46, className }: TileProps) {
  const pts = [
    [8, 8, 1],
    [19, 8, 1],
    [30, 8, 0],
    [8, 19, 0],
    [19, 19, 1],
    [30, 19, 0],
    [8, 30, 1],
    [19, 30, 0],
    [30, 30, 1],
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <g transform="rotate(-8 24 24)">
        {pts.map(([x, y, red], i) => (
          <rect key={i} x={x} y={y} width="10" height="9" rx="3" fill={red ? "#ee2a3a" : "#fff"} stroke={red ? "#b8101f" : "#d8dadf"} strokeWidth="1" />
        ))}
      </g>
    </svg>
  );
}
export function TileBot({ size = 46, className }: TileProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <g transform="rotate(-6 24 24)">
        <rect x="5" y="10" width="38" height="30" rx="8" fill="#9b1220" />
        <rect x="5" y="8" width="38" height="30" rx="8" fill="#ee2a3a" />
        <rect x="12" y="15" width="24" height="16" rx="5" fill="#fff" />
        <circle cx="19" cy="23" r="2.4" fill="#ee2a3a" />
        <circle cx="29" cy="23" r="2.4" fill="#ee2a3a" />
        <path d="M24 15v-4M22 11h4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}
export function TileSmartTrader({ size = 46, className }: TileProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <g transform="rotate(-6 24 24)">
        <rect x="5" y="10" width="38" height="30" rx="8" fill="#9b1220" />
        <rect x="5" y="8" width="38" height="30" rx="8" fill="#ee2a3a" />
        <path d="M13 29l7-8 5 4 9-11" stroke="#fff" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
export function TileCfd({ size = 46, className }: TileProps) {
  return <TileMt5 size={size} sub="CFD" className={className} />;
}

/** Deriv bot logo (DB tile used in the bot header) */
export function DbLogo({ size = 44 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center bg-gradient-to-br from-[#ff4a55] to-[#e0303c] font-plex font-bold text-white"
      style={{
        width: size,
        height: size,
        borderRadius: "10px 14px 12px 10px",
        fontSize: size * 0.4,
        boxShadow: "inset -3px -3px 0 rgba(150,10,25,.25)",
      }}
    >
      DB
    </div>
  );
}

/** Restart-arrow cluster used by the bot's "Restart trading conditions" block. */
export const IconRestart = (p: P) => (
  <svg width={p.size ?? 24} height={p.size ?? 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.strokeWidth ?? 1.8} strokeLinecap="round" strokeLinejoin="round" className={p.className}>
    <path d="M4 9h4V5" />
    <path d="M4 9a8 8 0 1 1 1.5 8" />
  </svg>
);
