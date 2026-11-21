import { useEffect, useState } from "react";
import { BotApp } from "./bot/BotApp";
import { HomeApp } from "./home/HomeApp";
import { ToastProvider } from "./ui";

type Site = "home" | "bot";
type BotTab = "dashboard" | "builder" | "chart" | "menu";
const fromHash = (): Site => (window.location.hash.startsWith("#/bot") ? "bot" : "home");

export default function App() {
  const [site, setSite] = useState<Site>(fromHash);
  const [botTab, setBotTab] = useState<BotTab>("dashboard");

  useEffect(() => {
    const onHash = () => setSite(fromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    document.title = site === "bot" ? "Deriv Bot – UI demo clone" : "Deriv – Home (UI demo clone)";
  }, [site]);

  const go = (s: Site, tab?: BotTab) => {
    if (tab) setBotTab(tab);
    window.location.hash = s === "bot" ? "#/bot" : "#/dashboard";
    setSite(s);
  };

  return (
    <div className="flex h-full items-center justify-center sm:p-4">
      <div className="relative flex h-full w-full max-w-[430px] flex-col overflow-hidden bg-white font-inter text-[#181c25] sm:max-h-[900px] sm:rounded-[32px] sm:shadow-[0_30px_80px_rgba(0,0,0,.25)]">
        {site === "home" ? (
          <ToastProvider key="home" bottom={92}>
            <HomeApp openBot={(tab) => go("bot", tab ?? "dashboard")} />
          </ToastProvider>
        ) : (
          <ToastProvider key="bot" bottom={118}>
            <BotApp onHome={() => go("home")} initialTab={botTab} />
          </ToastProvider>
        )}
      </div>
    </div>
  );
}
