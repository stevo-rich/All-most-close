import { useState } from "react";
import { IconArrowCircle, IconChevronRight, IconClose, IconCopy, IconDoc, IconHome, IconUser, IconUserFilled } from "../icons";
import { useToast } from "../ui";
import phoneImg from "../assets/phone.jpg";

const SECTIONS: { title: string; rows: { label: string; icon: "user" | "home" | "doc" }[] }[] = [
  {
    title: "About you",
    rows: [
      { label: "Personal details", icon: "user" },
      { label: "Home address", icon: "home" },
      { label: "Additional information", icon: "doc" },
    ],
  },
  {
    title: "Security and safety",
    rows: [
      { label: "Login and security", icon: "user" },
      { label: "Trading limits", icon: "doc" },
    ],
  },
];

export function ProfileHero({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();
  return (
    <section className="flex flex-col items-center rounded-b-[40px] bg-gradient-to-b from-[#1b2335] via-[#10141f] to-[#0b0d14] pb-9 pt-8 text-white">
      <div className="anim-pop flex h-[82px] w-[82px] items-center justify-center rounded-full bg-[#343a4a]">
        <IconUserFilled size={38} className="text-white" />
      </div>
      <h1 className="anim-fade-up mt-5 text-[22px] font-bold uppercase tracking-tight" style={{ animationDelay: "100ms" }}>
        {name}
      </h1>
      <button
        onClick={() => {
          navigator.clipboard?.writeText("019e0000-0000-0000-0000-00000000" + "3014").catch(() => {});
          setCopied(true);
          toast({ message: "Account ID copied", duration: 1800 });
          window.setTimeout(() => setCopied(false), 1500);
        }}
        className="press anim-fade-up mt-4 flex items-center gap-3 rounded-full bg-white/10 px-4 py-2.5 hover:bg-white/15"
        style={{ animationDelay: "180ms" }}
      >
        <span className="font-mono text-[14px] tracking-[0.12em] text-[#c9ccd3]">019e....3014</span>
        <span className={`transition-colors ${copied ? "text-[#00c390]" : "text-[#c9ccd3]"}`}>
          <IconCopy size={17} />
        </span>
      </button>
    </section>
  );
}

export function ProfilePage() {
  const [showApp, setShowApp] = useState(true);
  const toast = useToast();
  return (
    <div>
      <ProfileHero name="Jane Doe" />
      {showApp && (
        <div className="anim-fade-up px-4 pt-6">
          <div className="relative flex h-[145px] items-center overflow-hidden rounded-[28px] bg-[#f2f3f4]">
            <div className="z-10 pl-8">
              <h3 className="text-[19px] font-bold tracking-tight">Deriv is on mobile</h3>
              <button onClick={() => toast("Demo clone — no app download available.")} className="press mt-2 flex items-center gap-2.5 text-[16px] text-[#181c25]">
                Get the Deriv app <IconArrowCircle size={25} />
              </button>
            </div>
            <img src={phoneImg} alt="" className="absolute -right-6 top-1/2 h-[190px] w-[190px] -translate-y-1/2 object-cover mix-blend-multiply" />
            <button aria-label="Dismiss" onClick={() => setShowApp(false)} className="press absolute right-8 top-7 z-10">
              <IconClose size={20} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      )}
      {SECTIONS.map((s, si) => (
        <section key={s.title} className="px-4 pt-9">
          <h2 className="text-[20px] font-bold tracking-tight">{s.title}</h2>
          <ul className="mt-3">
            {s.rows.map((r, i) => (
              <li key={r.label} className="anim-fade-up border-b border-[#e6e8ea]" style={{ animationDelay: `${si * 100 + i * 60}ms` }}>
                <button onClick={() => toast("Demo clone — this form is not available.")} className="group flex w-full items-center gap-5 py-[22px] text-left transition-colors hover:bg-black/[0.02]">
                  <span className="w-7 text-[#181c25]">
                    {r.icon === "user" ? <IconUser size={26} /> : r.icon === "home" ? <IconHome size={26} /> : <IconDoc size={26} />}
                  </span>
                  <span className="flex-1 text-[18px]">{r.label}</span>
                  <span className="text-[#181c25] transition-transform duration-300 group-hover:translate-x-1">
                    <IconChevronRight size={20} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className="px-4 pb-8 pt-6 text-center text-[12px] text-[#8a8f99]">Demo clone for UI practice · not affiliated with Deriv · no real data</p>
    </div>
  );
}
