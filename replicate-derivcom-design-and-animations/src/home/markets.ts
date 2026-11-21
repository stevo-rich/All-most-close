/** Shared market data for the Options tab (Deriv-style most traded markets). */

export type Market = {
  /** Volatility index number, e.g. 10 / 100 */
  vol: number;
  name: string;
  /** Live-looking quote */
  price: number;
  /** 5-minute percentage change */
  change: number;
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

export const MARKETS: Market[] = [
  { vol: 10, name: "Volatility 10 (1s) Index", price: 9622.89, change: 0.02, series: seedSeries(11, 1.1) },
  { vol: 100, name: "Volatility 100 (1s) Index", price: 1512.66, change: -0.24, series: seedSeries(7, -1.4) },
  { vol: 25, name: "Volatility 25 (1s) Index", price: 885237.7, change: 0.09, series: seedSeries(23, 0.9) },
  { vol: 75, name: "Volatility 75 (1s) Index", price: 4045.91, change: -0.14, series: seedSeries(31, -0.8) },
  { vol: 15, name: "Volatility 15 (1s) Index", price: 14574.24, change: 0.05, series: seedSeries(41, 0.7) },
  { vol: 50, name: "Volatility 50 (1s) Index", price: 245783.11, change: 0.11, series: seedSeries(53, 1.0) },
  { vol: 5, name: "Volatility 5 (1s) Index", price: 1234.56, change: -0.06, series: seedSeries(59, -0.5) },
];

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
