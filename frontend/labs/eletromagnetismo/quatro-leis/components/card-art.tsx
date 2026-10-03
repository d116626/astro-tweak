import type { Phase } from "@/labs/eletromagnetismo/quatro-leis/lib/phases";

const AMBER = "#ffb048";
const CYAN = "#48c8ff";
const PLUS = "#ff6b5a";
const MINUS = "#4ea1ff";

/** Onda senoidal de período 40, de x = −40 a 140: deslizar 40 px em loop emenda perfeitamente. */
const wave = (y: number, amp: number) => `M-40 ${y} q10 ${-amp * 2} 20 0 ${"t20 0 ".repeat(8)}`;

const RAYS = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2;
  return { x: 50 + Math.cos(a) * 24, y: 28 + Math.sin(a) * 24 };
});

function Gauss() {
  return (
    <>
      {RAYS.map((r, i) => (
        <line key={i} className="qa-flow" x1={50} y1={28} x2={r.x} y2={r.y} stroke={AMBER} strokeWidth={1.4} />
      ))}
      <circle cx={50} cy={28} r={17} fill="rgba(255,255,255,0.06)" stroke="#fff" strokeOpacity={0.8} strokeDasharray="3 3" />
      <circle className="qa-pulse" cx={50} cy={28} r={5.5} fill={PLUS} />
    </>
  );
}

function Magnet() {
  return (
    <g className="qa-wobble">
      <path className="qa-flow" d="M70 22 C70 2 30 2 30 22" fill="none" stroke={AMBER} strokeWidth={1.4} />
      <path className="qa-flow" d="M70 34 C70 54 30 54 30 34" fill="none" stroke={AMBER} strokeWidth={1.4} />
      <rect x={30} y={22} width={20} height={12} fill={MINUS} />
      <rect x={50} y={22} width={20} height={12} fill={PLUS} />
      <rect x={30} y={22} width={40} height={12} fill="none" stroke="#fff" strokeOpacity={0.7} />
    </g>
  );
}

function Faraday() {
  return (
    <>
      {[66, 72, 78].map((x) => (
        <ellipse key={x} cx={x} cy={26} rx={3.5} ry={13} fill="none" stroke="#d98c5f" strokeWidth={1.8} />
      ))}
      <g className="qa-slide">
        <rect x={20} y={20} width={14} height={12} fill={MINUS} />
        <rect x={34} y={20} width={14} height={12} fill={PLUS} />
      </g>
      <circle className="qa-glow" cx={72} cy={47} r={7} fill="#ffe082" />
      <circle cx={72} cy={47} r={4.5} fill="none" stroke="#fff" strokeOpacity={0.7} />
    </>
  );
}

function Ampere() {
  return (
    <>
      <line x1={0} y1={28} x2={100} y2={28} stroke="#fff" strokeOpacity={0.15} />
      <path className="qa-travel" d={wave(28, 6)} fill="none" stroke={CYAN} strokeWidth={1.6} strokeOpacity={0.9} />
      <path className="qa-travel" d={wave(28, 12)} fill="none" stroke={AMBER} strokeWidth={1.6} />
      <circle className="qa-bob" cx={10} cy={22} r={5} fill={PLUS} />
    </>
  );
}

const ART = { gauss: Gauss, ima: Magnet, faraday: Faraday, ampere: Ampere };

/** Miniatura animada de uma etapa do lab. */
export function CardArt({ id }: { id: Phase["id"] }) {
  const Art = ART[id];
  return (
    <svg viewBox="0 0 100 56" className="size-full" aria-hidden preserveAspectRatio="xMidYMid meet">
      <Art />
    </svg>
  );
}
