/**
 * Shared market data for the Options tab and the Deriv Bot builder.
 *
 * Mirrors the volatility indices real Deriv lists under
 * Derived › Continuous Indices and Derived › 1s Indices, including the
 * per-market payout percentage Deriv quotes on Rise/Fall contracts.
 */

export type Market = {
  /** Volatility index number, e.g. 10 / 100 */
  vol: number;
  /** Full display name as Deriv shows it */
  name: string;
  /** Short ticker, e.g. "1HZ100V" */
  code: string;
  /** Tick interval the index updates on */
  tick: string;
  /** Live-looking quote */
  price: number;
  /** 5-minute percentage change */
  change: number;
  /** Payout percentage Deriv quotes on a winning Rise/Fall contract */
  payout: number;
  /** Sparkline series (normalised 0..1 but we keep raw points) */
  series: number[];
};

const seedSeries = (seed: number, trend: number, n = 26): number[] => {
  let v = 50;
  let s = seed;
  const rand = () => {
    // deterministic pseudo-random so the sparkline doesn't reshuffle on re-render
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  return Array.from({ length: n }, (_, i) => {
    v += (rand() - 0.5) * 9 + trend * (i / n) * 1.6;
    return Math.max(6, Math.min(94, v));
  });
};

/** Continuous Indices — tick every 2 seconds. */
export const CONTINUOUS: Market[] = [
  { vol: 10, name: "Volatility 10 Index", code: "R_10", tick: "2s", price: 6543.21, change: 0.02, payout: 95.0, series: seedSeries(3, 0.6) },
  { vol: 25, name: "Volatility 25 Index", code: "R_25", tick: "2s", price: 2754.63, change: -0.04, payout: 95.2, series: seedSeries(13, -0.7) },
  { vol: 50, name: "Volatility 50 Index", code: "R_50", tick: "2s", price: 249721.4, change: 0.06, payout: 95.4, series: seedSeries(29, 1.1) },
  { vol: 75, name: "Volatility 75 Index", code: "R_75", tick: "2s", price: 104327.8, change: -0.11, payout: 95.6, series: seedSeries(37, -1.0) },
  { vol: 100, name: "Volatility 100 Index", code: "R_100", tick: "2s", price: 1594.72, change: 0.08, payout: 95.8, series: seedSeries(47, 1.3) },
];

/** 1s Indices — tick every second. */
export const ONE_SECOND: Market[] = [
  { vol: 10, name: "Volatility 10 (1s) Index", code: "1HZ10V", tick: "1s", price: 9651.81, change: -0.01, payout: 95.1, series: seedSeries(11, -1.2) },
  { vol: 15, name: "Volatility 15 (1s) Index", code: "1HZ15V", tick: "1s", price: 14574.24, change: 0.05, payout: 95.3, series: seedSeries(41, 0.7) },
  { vol: 25, name: "Volatility 25 (1s) Index", code: "1HZ25V", tick: "1s", price: 883087.11, change: 0.04, payout: 95.5, series: seedSeries(23, 0.9) },
  { vol: 30, name: "Volatility 30 (1s) Index", code: "1HZ30V", tick: "1s", price: 7213.05, change: -0.03, payout: 95.6, series: seedSeries(53, -0.6) },
  { vol: 50, name: "Volatility 50 (1s) Index", code: "1HZ50V", tick: "1s", price: 214490.51, change: -0.07, payout: 95.7, series: seedSeries(31, -0.9) },
  { vol: 75, name: "Volatility 75 (1s) Index", code: "1HZ75V", tick: "1s", price: 4045.91, change: -0.14, payout: 95.8, series: seedSeries(43, -0.8) },
  { vol: 90, name: "Volatility 90 (1s) Index", code: "1HZ90V", tick: "1s", price: 1823.44, change: 0.07, payout: 95.9, series: seedSeries(61, 0.8) },
  { vol: 100, name: "Volatility 100 (1s) Index", code: "1HZ100V", tick: "1s", price: 1613.46, change: 0.09, payout: 96.0, series: seedSeries(7, 1.4) },
  { vol: 150, name: "Volatility 150 (1s) Index", code: "1HZ150V", tick: "1s", price: 3542.18, change: -0.16, payout: 96.2, series: seedSeries(67, -1.4) },
  { vol: 200, name: "Volatility 200 (1s) Index", code: "1HZ200V", tick: "1s", price: 2287.90, change: 0.13, payout: 96.3, series: seedSeries(71, 1.5) },
  { vol: 250, name: "Volatility 250 (1s) Index", code: "1HZ250V", tick: "1s", price: 1978.36, change: -0.19, payout: 96.4, series: seedSeries(79, -1.6) },
  { vol: 300, name: "Volatility 300 (1s) Index", code: "1HZ300V", tick: "1s", price: 1455.02, change: 0.21, payout: 96.5, series: seedSeries(83, 1.7) },
];

/** Every Derived › Volatility index, in the order Deriv's picker lists them. */
export const ALL_VOLATILITY: Market[] = [...CONTINUOUS, ...ONE_SECOND];

/** The subset the Options tab leads with (Deriv's "most traded"). */
export const MARKETS: Market[] = [
  ONE_SECOND[0], // V10 (1s)
  ONE_SECOND[7], // V100 (1s)
  ONE_SECOND[2], // V25 (1s)
  ONE_SECOND[4], // V50 (1s)
  ONE_SECOND[5], // V75 (1s)
  ONE_SECOND[1], // V15 (1s)
  CONTINUOUS[4], // V100
];

export const marketByName = (name: string): Market | undefined => ALL_VOLATILITY.find((m) => m.name === name);

/** Tailwind-free colours reused across the Options screens. */
export const GREEN = "#00a870";
export const RED = "#e0313d";

export const fmtPrice = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtChange = (n: number) => `${n > 0 ? "+" : "-"}${Math.abs(n).toFixed(2)}%`;

/** Build an SVG path string from a normalised series within a w×h box. */
export function sparkPath(series: number[], w: number, h: number, pad = 2): string {
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  return series
    .map((v, i) => {
      const x = pad + (i / (series.length - 1)) * (w - pad * 2);
      const y = pad + (1 - (v - min) / span) * (h - pad * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}
