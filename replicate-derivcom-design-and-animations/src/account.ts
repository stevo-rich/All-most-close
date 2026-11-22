import { useCallback, useEffect, useState } from "react";

/**
 * Shared demo account state: the profile details and the single real-account
 * balance. Everything that shows or spends money reads from here, so editing
 * the balance in Personal details immediately affects the Home hero, the
 * Portfolio totals, the Options hero and the Deriv Bot trading account.
 */

export type Profile = {
  firstName: string;
  lastName: string;
  dob: string;
  country: string;
  citizenship: string;
  nickname: string;
  /** Real account balance in USD — the trading (Options) balance */
  balance: number;
  /** Wallet balance in USD — where deposits land before moving to trading */
  wallet: number;
  email: string;
  phone: string;
};

const KEY = "deriv-demo-account-v1";

export const DEFAULT_PROFILE: Profile = {
  firstName: "JOHN KAGECHU",
  lastName: "GACHUHI",
  dob: "03/09/2004",
  country: "Kenya",
  citizenship: "Kenya",
  nickname: "client_mq88g8gax6il",
  balance: 0,
  wallet: 0,
  email: "stephengachuhi178@gmail.com",
  phone: "+254106135124",
};

const read = (): Profile => {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PROFILE;
    const p = JSON.parse(raw) as Partial<Profile>;
    return {
      ...DEFAULT_PROFILE,
      ...p,
      balance: typeof p.balance === "number" && Number.isFinite(p.balance) ? Math.max(0, p.balance) : 0,
      wallet: typeof p.wallet === "number" && Number.isFinite(p.wallet) ? Math.max(0, p.wallet) : 0,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
};

const listeners = new Set<(p: Profile) => void>();
let current: Profile | null = null;

const get = (): Profile => {
  if (!current) current = read();
  return current;
};

const write = (next: Profile) => {
  current = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — keep in memory */
  }
  listeners.forEach((l) => l(next));
};

/** Imperative access for non-React call sites (e.g. the bot engine). */
export const accountStore = {
  get,
  set: (patch: Partial<Profile>) => write({ ...get(), ...patch }),
  setBalance: (balance: number) => write({ ...get(), balance: Math.max(0, Math.round(balance * 100) / 100) }),
  adjustBalance: (delta: number) => write({ ...get(), balance: Math.max(0, Math.round((get().balance + delta) * 100) / 100) }),
  setWallet: (wallet: number) => write({ ...get(), wallet: Math.max(0, Math.round(wallet * 100) / 100) }),
  adjustWallet: (delta: number) => write({ ...get(), wallet: Math.max(0, Math.round((get().wallet + delta) * 100) / 100) }),
};

/** Subscribe a component to profile + balance changes. */
export function useProfile() {
  const [profile, setProfile] = useState<Profile>(get);

  useEffect(() => {
    const l = (p: Profile) => setProfile(p);
    listeners.add(l);
    // resync in case another tab changed it
    setProfile(get());
    return () => {
      listeners.delete(l);
    };
  }, []);

  const save = useCallback((patch: Partial<Profile>) => accountStore.set(patch), []);
  const setBalance = useCallback((n: number) => accountStore.setBalance(n), []);
  const setWallet = useCallback((n: number) => accountStore.setWallet(n), []);

  return { profile, save, setBalance, setWallet };
}

export const fullName = (p: Profile) => `${p.firstName} ${p.lastName}`.trim();
export const fmtUsd = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
