import { useState, type ReactNode } from "react";
import {
  IconAssessment,
  IconApiToken,
  IconArrowCircle,
  IconBack,
  IconBell,
  IconChat,
  IconChevronDown,
  IconChevronRight,
  IconClose,
  IconCloseAccount,
  IconCopy,
  IconExternal,
  IconGlobe,
  IconGrid4,
  IconHelp,
  IconHouse,
  IconIdBadge,
  IconIdCard,
  IconInfo,
  IconLaptop,
  IconLock,
  IconMobile,
  IconPasskey,
  IconPassword,
  IconPen,
  IconSearch,
  IconTax,
  IconUserFilled,
} from "../icons";
import { useToast } from "../ui";
import { fmtUsd, fullName, useProfile, type Profile } from "../account";
import phoneImg from "../assets/phone.jpg";

/* ------------------------------------------------------------------ */
/* Chrome shared by the settings screens                               */
/* ------------------------------------------------------------------ */
function SettingsHeader({ onBack, onSearch, unread, onBell }: { onBack: () => void; onSearch: () => void; unread: number; onBell: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 bg-[#1b2335] px-4 text-white">
      <button aria-label="Back" onClick={onBack} className="press flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.12] hover:bg-white/20">
        <IconBack size={18} />
      </button>
      <button aria-label="Search" onClick={onSearch} className="press flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.12] hover:bg-white/20">
        <IconSearch size={18} />
      </button>
      <span className="flex-1" />
      <button
        aria-label="Notifications"
        onClick={onBell}
        className="press relative flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.12] hover:bg-white/20"
      >
        <IconBell size={18} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#ff444f] px-1 text-[8px] font-bold leading-none text-white">
            {unread}
          </span>
        )}
      </button>
    </header>
  );
}

function Row({
  icon,
  label,
  sub,
  warning,
  info,
  external,
  onClick,
  delay = 0,
}: {
  icon: ReactNode;
  label: ReactNode;
  sub?: ReactNode;
  warning?: boolean;
  info?: boolean;
  external?: boolean;
  onClick: () => void;
  delay?: number;
}) {
  return (
    <li className="anim-fade-up border-b border-[#e6e8ea]" style={{ animationDelay: `${delay}ms` }}>
      <button onClick={onClick} className="group flex w-full items-center gap-5 py-[19px] text-left transition-colors hover:bg-black/[0.02]">
        <span className="flex w-7 shrink-0 justify-center text-[#181c25]">{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13.5px] leading-snug text-[#181c25]">{label}</span>
          {sub && (
            <span className={`mt-1 block text-[11.5px] leading-snug ${warning ? "text-[#b8860b]" : "text-[#8a8f99]"}`}>{sub}</span>
          )}
        </span>
        {info && (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#b8860b] text-[#b8860b]">
            <IconInfo size={15} />
          </span>
        )}
        <span className="shrink-0 text-[#181c25] transition-transform duration-300 group-hover:translate-x-1">
          {external ? <IconExternal size={17} /> : <IconChevronRight size={20} />}
        </span>
      </button>
    </li>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="px-4 pt-8">
      <h2 className="text-[16px] font-bold tracking-tight text-[#181c25]">{title}</h2>
      <ul className="mt-2">{children}</ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Editable text field                                                 */
/* ------------------------------------------------------------------ */
function Field({
  label,
  value,
  onChange,
  placeholder,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  suffix?: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[12px] text-[#333]">{label}</span>
      <span className="mt-2 flex items-center gap-2 rounded-xl border border-[#e0e2e6] bg-white px-4 py-[15px] focus-within:border-[#181c25]">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-[13px] text-[#181c25] outline-none placeholder:text-[#b5b9c2]"
        />
        {suffix}
      </span>
    </label>
  );
}

const COUNTRIES = ["Kenya", "Nigeria", "South Africa", "Ghana", "Tanzania", "Uganda", "United Kingdom", "Germany"];

const Flag = ({ country }: { country: string }) => {
  if (country === "Kenya")
    return (
      <svg width="24" height="16" viewBox="0 0 24 16" className="shrink-0 rounded-[2px]">
        <rect width="24" height="16" fill="#fff" />
        <rect width="24" height="4" fill="#000" />
        <rect y="12" width="24" height="4" fill="#006600" />
        <rect y="5.6" width="24" height="4.8" fill="#bb0000" />
      </svg>
    );
  return (
    <svg width="24" height="16" viewBox="0 0 24 16" className="shrink-0 rounded-[2px]">
      <rect width="24" height="16" fill="#d6d9dd" />
    </svg>
  );
};

function CountrySelect({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="block text-[12px] text-[#333]">{label}</span>
      <span className="relative mt-2 flex items-center gap-3 rounded-xl border border-[#e0e2e6] bg-white px-4 py-[15px]">
        <Flag country={value} />
        <span className="flex-1 text-[13px] text-[#181c25]">{value}</span>
        <span className="text-[#6c717b]">
          <IconChevronDown size={18} />
        </span>
        <select value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0">
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Personal details (editable + savable)                               */
/* ------------------------------------------------------------------ */
export function PersonalDetails({ onBack, unread, onBell }: { onBack: () => void; unread: number; onBell: () => void }) {
  const toast = useToast();
  const { profile, save } = useProfile();
  const [draft, setDraft] = useState<Profile>(profile);
  const [balanceText, setBalanceText] = useState(fmtUsd(profile.balance));

  const set = (patch: Partial<Profile>) => setDraft((d) => ({ ...d, ...patch }));
  const dirty =
    draft.firstName !== profile.firstName ||
    draft.lastName !== profile.lastName ||
    draft.dob !== profile.dob ||
    draft.country !== profile.country ||
    draft.citizenship !== profile.citizenship ||
    draft.nickname !== profile.nickname ||
    balanceText !== fmtUsd(profile.balance);

  const submit = () => {
    const parsed = Number.parseFloat(balanceText.replace(/,/g, "").trim());
    const balance = Number.isFinite(parsed) ? Math.max(0, Math.round(parsed * 100) / 100) : profile.balance;
    save({
      firstName: draft.firstName.trim() || profile.firstName,
      lastName: draft.lastName.trim() || profile.lastName,
      dob: draft.dob.trim(),
      country: draft.country,
      citizenship: draft.citizenship,
      nickname: draft.nickname.trim(),
      balance,
    });
    setBalanceText(fmtUsd(balance));
    toast({ message: "Personal details saved", action: { label: "Done", onClick: () => onBack() }, duration: 2600 });
  };

  return (
    <div>
      <div className="flex h-16 items-center px-4">
        <button aria-label="Back" onClick={onBack} className="press flex h-9 w-9 items-center justify-center rounded-full bg-[#f2f3f4]">
          <IconBack size={18} />
        </button>
        <span className="flex-1" />
        <button aria-label="Notifications" onClick={onBell} className="press relative flex h-9 w-9 items-center justify-center rounded-full bg-[#f2f3f4]">
          <IconBell size={18} />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#ff444f] px-1 text-[8px] font-bold leading-none text-white">
              {unread}
            </span>
          )}
        </button>
      </div>

      <div className="px-4 pb-40">
        <h1 className="text-[24px] font-extrabold tracking-tight text-[#181c25]">Personal details</h1>

        <div className="mt-7 space-y-5">
          <Field label="First name" value={draft.firstName} onChange={(v) => set({ firstName: v })} />
          <Field label="Last name" value={draft.lastName} onChange={(v) => set({ lastName: v })} />
          <Field label="Date of birth" value={draft.dob} onChange={(v) => set({ dob: v })} placeholder="DD/MM/YYYY" />
          <CountrySelect label="Country of birth" value={draft.country} onChange={(v) => set({ country: v })} />
          <CountrySelect label="Citizenship" value={draft.citizenship} onChange={(v) => set({ citizenship: v })} />
          <Field
            label="Nickname"
            value={draft.nickname}
            onChange={(v) => set({ nickname: v })}
            placeholder="client_xxxxxxxxxxxx"
            suffix={
              <span className="text-[#6c717b]">
                <IconPen size={19} />
              </span>
            }
          />

          {/* Balance — feeds the real account everywhere */}
          <div className="mt-2 rounded-2xl border border-[#e0e2e6] bg-[#f7f8f9] p-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-[#181c25]">Account balance</span>
              <span className="rounded-full bg-[#181c25] px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-wide text-white">Real</span>
            </div>
            <p className="mt-1 text-[10px] leading-snug text-[#6c717b]">
              Sets the real account balance used on Home, Options and in Deriv Bot trading.
            </p>
            <span className="mt-3 flex items-center gap-2 rounded-xl border border-[#e0e2e6] bg-white px-4 py-[13px] focus-within:border-[#181c25]">
              <input
                inputMode="decimal"
                value={balanceText}
                onChange={(e) => setBalanceText(e.target.value.replace(/[^0-9.,]/g, ""))}
                placeholder="0.00"
                className="min-w-0 flex-1 bg-transparent text-[15px] font-bold text-[#181c25] outline-none placeholder:text-[#b5b9c2]"
              />
              <span className="text-[11px] font-bold text-[#6c717b]">USD</span>
            </span>
            <div className="mt-2.5 flex gap-2">
              {[100, 500, 1000, 5000].map((v) => (
                <button
                  key={v}
                  onClick={() => setBalanceText(fmtUsd(v))}
                  className="press flex-1 rounded-lg bg-[#eceef0] py-1.5 text-[10px] font-semibold text-[#3c4652] hover:bg-[#e2e5e8]"
                >
                  {v.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-white via-white to-transparent px-4 pb-5 pt-8">
        <button
          onClick={submit}
          disabled={!dirty}
          className={`press w-full rounded-full py-[15px] text-[13.5px] font-bold transition-colors ${
            dirty ? "bg-[#ff444f] text-white hover:bg-[#ff5a64]" : "cursor-not-allowed bg-[#ffd0d3] text-white"
          }`}
        >
          Save
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Root profile / settings screen                                      */
/* ------------------------------------------------------------------ */
export function ProfilePage({ unread = 2, onBell, onBack }: { unread?: number; onBell?: () => void; onBack?: () => void }) {
  const toast = useToast();
  const { profile } = useProfile();
  const [showApp, setShowApp] = useState(true);
  const [copied, setCopied] = useState(false);
  const [screen, setScreen] = useState<"menu" | "personal">("menu");

  const soon = (what: string) => toast(`${what} — demo placeholder.`);
  const bell = onBell ?? (() => soon("Notifications"));

  if (screen === "personal") {
    return <PersonalDetails onBack={() => setScreen("menu")} unread={unread} onBell={bell} />;
  }

  return (
    <div className="pb-2">
      <SettingsHeader onBack={onBack ?? (() => soon("Back"))} onSearch={() => soon("Search")} unread={unread} onBell={bell} />

      {/* Hero */}
      <section className="flex flex-col items-center rounded-b-[40px] bg-gradient-to-b from-[#1b2335] via-[#10141f] to-[#0b0d14] pb-9 pt-7 text-white">
        <div className="anim-pop flex h-[92px] w-[92px] items-center justify-center rounded-full bg-[#3a4150]">
          <IconUserFilled size={44} className="text-white" />
        </div>
        <h1 className="anim-fade-up mt-5 px-6 text-center text-[17px] font-extrabold uppercase leading-tight tracking-tight">
          {fullName(profile) || "Your name"}
        </h1>
        <button
          onClick={() => {
            navigator.clipboard?.writeText("019e0000-0000-0000-0000-000000003014").catch(() => {});
            setCopied(true);
            toast({ message: "Account ID copied", duration: 1800 });
            window.setTimeout(() => setCopied(false), 1500);
          }}
          className="press anim-fade-up mt-4 flex items-center gap-3 rounded-full bg-white/[0.09] px-5 py-2.5 hover:bg-white/[0.14]"
          style={{ animationDelay: "180ms" }}
        >
          <span className="font-mono text-[11px] tracking-[0.12em] text-[#c9ccd3]">019e....3014</span>
          <span className={`transition-colors ${copied ? "text-[#00c390]" : "text-[#c9ccd3]"}`}>
            <IconCopy size={17} />
          </span>
        </button>
      </section>

      {/* Deriv is on mobile */}
      {showApp && (
        <div className="anim-fade-up px-5 pt-6">
          <div className="relative flex h-[145px] items-center overflow-hidden rounded-[20px] bg-[#f2f3f4]">
            <div className="z-10 pl-6">
              <h3 className="text-[14px] font-bold tracking-tight text-[#181c25]">Deriv is on mobile</h3>
              <button onClick={() => soon("App download")} className="press mt-2 flex items-center gap-2.5 text-[12px] text-[#181c25]">
                Get the Deriv app <IconArrowCircle size={25} />
              </button>
            </div>
            <img src={phoneImg} alt="" className="absolute -right-6 top-1/2 h-[190px] w-[190px] -translate-y-1/2 object-cover mix-blend-multiply" />
            <button aria-label="Dismiss" onClick={() => setShowApp(false)} className="press absolute right-4 top-3 z-10 text-[#181c25]">
              <IconClose size={20} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      )}

      <Group title="About you">
        <Row
          icon={<IconIdCard size={25} />}
          label="Personal details"
          onClick={() => setScreen("personal")}
          delay={0}
        />
        <Row icon={<IconHouse size={25} />} label="Home address" onClick={() => soon("Home address")} delay={40} />
        <Row icon={<IconIdCard size={25} />} label="Additional information" onClick={() => soon("Additional information")} delay={80} />
        <Row icon={<IconTax size={25} />} label="Tax information" onClick={() => soon("Tax information")} delay={120} />
      </Group>

      <Group title="Verification">
        <Row
          icon={<IconIdBadge size={25} />}
          label="Proof of identity"
          sub="Reverification needed"
          warning
          info
          onClick={() => soon("Proof of identity")}
          delay={0}
        />
        <Row
          icon={<IconHouse size={25} />}
          label="Proof of address"
          sub="Reverification needed"
          warning
          info
          onClick={() => soon("Proof of address")}
          delay={50}
        />
      </Group>

      <Group title="Assessment">
        <Row icon={<IconAssessment size={25} />} label="Financial assessment" sub="Incomplete" onClick={() => soon("Financial assessment")} />
      </Group>

      <Group title="Security">
        <Row icon={<IconPassword size={25} />} label="Change password" onClick={() => soon("Change password")} delay={0} />
        <Row icon={<IconMobile size={25} />} label="Change phone number" sub={profile.phone} onClick={() => soon("Change phone number")} delay={50} />
        <Row icon={<IconPasskey size={25} />} label="Passkeys" onClick={() => soon("Passkeys")} delay={100} />
        <Row icon={<IconLock size={25} />} label="Two-factor authentication" onClick={() => soon("Two-factor authentication")} delay={150} />
        <Row icon={<IconCloseAccount size={25} />} label="Close account" onClick={() => soon("Close account")} delay={200} />
      </Group>

      <Group title="API management">
        <Row icon={<IconGrid4 size={25} />} label="Connected apps" onClick={() => soon("Connected apps")} delay={0} />
        <Row icon={<IconApiToken size={25} />} label="API Token" onClick={() => soon("API Token")} delay={50} />
        <Row icon={<IconLaptop size={25} />} label="Explore Deriv API" external onClick={() => soon("Deriv API")} delay={100} />
      </Group>

      <Group title="Preferences">
        <Row icon={<IconGlobe size={25} />} label="Language" onClick={() => soon("Language")} />
      </Group>

      <Group title="Support">
        <Row icon={<IconHelp size={25} />} label="Help centre" external onClick={() => soon("Help centre")} delay={0} />
        <Row icon={<IconChat size={25} />} label="Live chat" onClick={() => soon("Live chat")} delay={50} />
      </Group>

      <div className="px-4 pb-10 pt-8">
        <button
          onClick={() => toast("Demo clone — log out is not available.")}
          className="press w-full rounded-full border-[1.5px] border-[#181c25] py-[14px] text-[14px] font-semibold text-[#181c25] hover:bg-[#181c25] hover:text-white"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
