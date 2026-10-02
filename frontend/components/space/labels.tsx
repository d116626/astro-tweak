"use client";

import { Html } from "@react-three/drei";

/** Rótulo de texto preso a um ponto da cena. */
export function Label({
  children,
  offset = -18,
}: {
  children: string;
  offset?: number;
}) {
  return (
    <Html center style={{ pointerEvents: "none" }}>
      <span
        className="block whitespace-nowrap text-[10px] font-medium uppercase tracking-wider text-white/70"
        style={{ transform: `translateY(${offset}px)` }}
      >
        {children}
      </span>
    </Html>
  );
}

/** Rótulo tocável: foca a câmera no corpo. */
export function FocusLabel({
  children,
  color,
  offset = -18,
  onClick,
}: {
  children: string;
  color: string;
  offset?: number;
  onClick: () => void;
}) {
  return (
    <Html center style={{ pointerEvents: "none" }}>
      <button
        type="button"
        onClick={onClick}
        className="pointer-events-auto flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white/80 backdrop-blur-sm active:bg-white/20"
        style={{ transform: `translateY(${offset}px)` }}
      >
        <span className="size-1.5 rounded-full" style={{ background: color }} />
        {children}
      </button>
    </Html>
  );
}
