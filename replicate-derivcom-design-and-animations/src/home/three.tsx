import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from "react";

/**
 * CSS-3D motion for the Home page, standing in for the 3D illustrations
 * home.deriv.com renders (floating candles, the orbiting tick ring and the
 * parallax tilt on the promo cards).
 *
 * Everything here is pure CSS transforms: nothing depends on WebGL, so it
 * works in the single-file build and degrades to a static illustration when
 * the user asks for reduced motion (see the media query in index.css).
 */

const finePointer = () =>
  typeof window !== "undefined" && !!window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;

const reducedMotion = () =>
  typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Pointer-parallax tilt: writes --rx / --ry on the element itself. */
export function useTilt(max = 9) {
  const onPointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    if (!finePointer() || reducedMotion()) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ry", `${(px * max).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${(-py * max).toFixed(2)}deg`);
  };

  const onPointerLeave = (e: ReactPointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
  };

  return { onPointerMove, onPointerLeave };
}

/** Tiltable surface used by the 3D hero scene. */
export function TiltSurface({ className = "", children }: { className?: string; children: ReactNode }) {
  const tilt = useTilt(10);
  return (
    <div className={`tilt ${className}`} onPointerMove={tilt.onPointerMove} onPointerLeave={tilt.onPointerLeave}>
      {children}
    </div>
  );
}

/** Tiltable <button>, so the promo cards keep their button semantics. */
export function TiltButton({
  className = "",
  style,
  onClick,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  children: ReactNode;
}) {
  const tilt = useTilt(7);
  return (
    <button
      onClick={onClick}
      className={`tilt ${className}`}
      style={style}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
    >
      {children}
    </button>
  );
}

/** Bar heights are fixed so the scene is deterministic across renders. */
const BARS = [
  { h: 42, up: false, z: -18 },
  { h: 58, up: true, z: 6 },
  { h: 34, up: false, z: 24 },
  { h: 76, up: true, z: 40 },
  { h: 52, up: true, z: 18 },
  { h: 64, up: false, z: -4 },
  { h: 88, up: true, z: 30 },
];

export function Scene3D() {
  const tilt = useTilt(12);

  return (
    <section className="mt-6 px-4">
      <div
        className="scene3d tilt relative h-[208px] overflow-hidden rounded-[26px] bg-[#0e1218] text-white shadow-[0_18px_44px_rgba(9,13,20,.35)]"
        onPointerMove={tilt.onPointerMove}
        onPointerLeave={tilt.onPointerLeave}
      >
        {/* depth lighting */}
        <span className="scene3d__glow" aria-hidden />
        <span className="scene3d__floor" aria-hidden />
        <span className="scene3d__ring" aria-hidden />
        <span className="scene3d__ring scene3d__ring--inner" aria-hidden />

        <div className="scene3d__stage" aria-hidden>
          <div className="scene3d__bars">
            {BARS.map((b, i) => (
              <span
                key={i}
                className={`scene3d__bar ${b.up ? "scene3d__bar--up" : "scene3d__bar--down"}`}
                style={{ height: b.h, ["--z" as string]: `${b.z}px`, animationDelay: `${i * 0.22}s` }}
              />
            ))}
          </div>

          <span className="scene3d__coin">$</span>
          <span className="scene3d__chip scene3d__chip--a">Rise</span>
          <span className="scene3d__chip scene3d__chip--b">Fall</span>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 bg-gradient-to-t from-[#0e1218] via-[#0e1218]/85 to-transparent px-4 pb-4 pt-8">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#4bb4b3]">Live market, in 3D</p>
            <p className="mt-1 text-[12px] font-bold leading-tight">Prices move in every dimension</p>
            <p className="mt-1 text-[9.5px] leading-snug text-white/55">Tilt the card to look around the scene.</p>
          </div>
          <span className="scene3d__live shrink-0 rounded-full bg-white/10 px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-white/80">
            Live
          </span>
        </div>
      </div>
    </section>
  );
}
