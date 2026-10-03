import type { CSSProperties, ReactNode } from "react";
import { OrbitField, type OrbitRing } from "@/components/hub/orbit-field";
import type { AreaId } from "@/labs/areas";

const SINE = "cubic-bezier(0.37, 0, 0.63, 1)";

const vars = (v: Record<string, string>) => v as CSSProperties;

/** Ponto que gira numa elipse (rx, ry) centrada na origem local. */
function Orbiter({
  rx,
  ry,
  t,
  d = 0,
  r = 2.5,
}: {
  rx: number;
  ry: number;
  t: number;
  d?: number;
  r?: number;
}) {
  return (
    <g
      className="g-x"
      style={vars({
        "--dx": `${rx}px`,
        "--t": `${t}s`,
        "--d": `${d}s`,
        "--ease": SINE,
      })}
    >
      <g
        className="g-y"
        style={vars({
          "--dy": `${ry}px`,
          "--t": `${t}s`,
          "--d": `${d - t / 2}s`,
          "--ease": SINE,
        })}
      >
        <circle r={r} fill="currentColor" stroke="none" />
      </g>
    </g>
  );
}

function Mecanica() {
  return (
    <>
      <line x1="20" y1="18" x2="80" y2="18" strokeOpacity="0.5" />
      {[30, 40, 50, 60, 70].map((x, i) => {
        const cls = i === 0 ? "g-cradle-l" : i === 4 ? "g-cradle-r" : "";
        return (
          <g key={x} className={cls} style={{ transformOrigin: `${x}px 18px` }}>
            <line
              x1={x}
              y1="18"
              x2={x}
              y2="62"
              strokeOpacity="0.6"
              strokeWidth="0.8"
            />
            <circle
              cx={x}
              cy="67"
              r="5"
              fill="currentColor"
              fillOpacity="0.85"
            />
          </g>
        );
      })}
    </>
  );
}

function Ondas() {
  const wave =
    "M0 50 C10 28 30 28 40 50 S70 72 80 50 S110 28 120 50 S150 72 160 50 S190 28 200 50 S230 72 240 50";
  return (
    <>
      <g className="g-wave" style={vars({ "--t": "3s" })}>
        <path d={wave} strokeWidth="2" />
      </g>
      <g
        className="g-wave"
        style={vars({ "--t": "4.5s", animationDirection: "reverse" })}
      >
        <path d={wave} strokeOpacity="0.4" />
      </g>
    </>
  );
}

function Eletromagnetismo() {
  const lines = [
    "M37 50 H63",
    "M34 45 C42 22 58 22 66 45",
    "M34 55 C42 78 58 78 66 55",
    "M31 41 C38 4 62 4 69 41",
    "M31 59 C38 96 62 96 69 59",
  ];
  return (
    <>
      {lines.map((d) => (
        <path key={d} d={d} className="g-dash" strokeOpacity="0.7" />
      ))}
      <circle cx="28" cy="50" r="6.5" fill="currentColor" stroke="none" />
      <path d="M25 50h6M28 47v6" stroke="#06080f" strokeWidth="1.6" />
      <circle cx="72" cy="50" r="6.5" strokeWidth="1.6" />
      <path d="M69 50h6" strokeWidth="1.6" />
    </>
  );
}

const GAS: [
  x: number,
  y: number,
  r: number,
  dx: number,
  dy: number,
  tx: number,
  ty: number,
  d: number,
][] = [
  [30, 32, 3, 8, 10, 1.9, 2.6, 0],
  [60, 28, 2.5, 12, 6, 2.3, 1.7, -0.7],
  [45, 50, 3.2, 16, 14, 2.9, 2.2, -1.3],
  [70, 62, 2.8, 6, 12, 1.6, 2.8, -0.4],
  [30, 68, 2.6, 10, 8, 2.1, 1.5, -1.1],
  [52, 72, 3, 14, 5, 2.6, 1.9, -0.2],
  [75, 44, 2.4, 5, 16, 1.8, 2.4, -0.9],
];

function Termodinamica() {
  return (
    <>
      <rect x="16" y="16" width="68" height="68" rx="4" strokeOpacity="0.45" />
      {GAS.map(([x, y, r, dx, dy, tx, ty, d], i) => (
        <g
          key={i}
          className="g-x"
          style={vars({ "--dx": `${dx}px`, "--t": `${tx}s`, "--d": `${d}s` })}
        >
          <g
            className="g-y"
            style={vars({ "--dy": `${dy}px`, "--t": `${ty}s`, "--d": `${d}s` })}
          >
            <circle cx={x} cy={y} r={r} fill="currentColor" stroke="none" />
          </g>
        </g>
      ))}
    </>
  );
}

function Quantica() {
  return (
    <>
      <line x1="18" y1="20" x2="18" y2="80" strokeOpacity="0.5" />
      <line x1="82" y1="20" x2="82" y2="80" strokeOpacity="0.5" />
      <line
        x1="18"
        y1="50"
        x2="82"
        y2="50"
        strokeOpacity="0.25"
        strokeDasharray="2 3"
      />
      <path
        className="g-flip"
        d="M18 50 C34 10 66 10 82 50"
        strokeWidth="2"
        style={vars({ "--t": "1.6s" })}
      />
      <path
        className="g-flip"
        d="M18 50 C28 12 42 12 50 50 S72 88 82 50"
        strokeOpacity="0.5"
        style={vars({ "--t": "1.05s" })}
      />
    </>
  );
}

function Relatividade() {
  const k = [18, 34, 50, 66, 82];
  const bend = (v: number) => 50 + (v - 50) * 0.2;
  return (
    <>
      {k.map((v) => (
        <g key={v} strokeOpacity="0.35" strokeWidth="0.9">
          <path d={`M8 ${v} Q50 ${bend(v)} 92 ${v}`} />
          <path d={`M${v} 8 Q${bend(v)} 50 ${v} 92`} />
        </g>
      ))}
      <circle className="g-ring" cx="50" cy="50" r="40" strokeOpacity="0.8" />
      <circle cx="50" cy="50" r="4.5" fill="currentColor" stroke="none" />
      <g transform="translate(50 50)">
        <Orbiter rx={20} ry={20} t={2.4} r={2.2} />
      </g>
    </>
  );
}

const BARS = [8, 16, 28, 42, 52, 42, 28, 16, 8];

function Estatistica() {
  return (
    <>
      {BARS.map((h, i) => (
        <rect
          key={i}
          className="g-bar"
          x={14 + i * 8.5}
          y={84 - h}
          width="6"
          height={h}
          rx="1"
          fill="currentColor"
          fillOpacity="0.8"
          stroke="none"
          style={vars({
            "--d": `${(i * 0.37) % 1.6}s`,
            "--t": `${1.2 + (i % 3) * 0.3}s`,
          })}
        />
      ))}
      <path
        d="M10 84 C26 84 34 30 50 30 S74 84 90 84"
        strokeOpacity="0.4"
        strokeDasharray="2 3"
      />
    </>
  );
}

function EstadoSolido() {
  const pos = [22, 36, 50, 64, 78];
  return (
    <>
      {pos.map((p) => (
        <g key={p} strokeOpacity="0.15" strokeWidth="0.8">
          <line x1="22" y1={p} x2="78" y2={p} />
          <line x1={p} y1="22" x2={p} y2="78" />
        </g>
      ))}
      {pos.map((y) =>
        pos.map((x, c) => (
          <g
            key={`${x}-${y}`}
            className="g-x"
            style={vars({
              "--dx": "2.6px",
              "--t": "0.9s",
              "--d": `${-c * 0.18}s`,
              "--ease": SINE,
            })}
          >
            <circle
              cx={x}
              cy={y}
              r="3.2"
              fill="currentColor"
              stroke="none"
              fillOpacity="0.9"
            />
          </g>
        )),
      )}
    </>
  );
}

function Nuclear() {
  const tilts = [0, 60, 120];
  return (
    <>
      {tilts.map((a, i) => (
        <g key={a} transform={`rotate(${a} 50 50)`}>
          <ellipse cx="50" cy="50" rx="38" ry="14" strokeOpacity="0.35" />
          <g transform="translate(50 50)">
            <Orbiter rx={38} ry={14} t={1.5 + i * 0.35} d={-i * 0.6} r={2.4} />
          </g>
        </g>
      ))}
      <circle cx="47.5" cy="48.5" r="3.6" fill="currentColor" stroke="none" />
      <circle
        cx="52.5"
        cy="49"
        r="3.6"
        fill="currentColor"
        fillOpacity="0.6"
        stroke="none"
      />
      <circle
        cx="50"
        cy="53.5"
        r="3.6"
        fill="currentColor"
        fillOpacity="0.8"
        stroke="none"
      />
    </>
  );
}

const ASTRO_RINGS: OrbitRing[] = [
  { r: 110, size: 20, color: "#c9b79c", period: 4, phase: 0.1 },
  { r: 190, size: 26, color: "#6fb1ff", period: 8, phase: 0.55 },
  { r: 280, size: 32, color: "#e6a77a", period: 14, phase: 0.8 },
];

const GLYPHS: Record<Exclude<AreaId, "astrofisica">, () => ReactNode> = {
  mecanica: Mecanica,
  ondas: Ondas,
  eletromagnetismo: Eletromagnetismo,
  termodinamica: Termodinamica,
  quantica: Quantica,
  relatividade: Relatividade,
  estatistica: Estatistica,
  "estado-solido": EstadoSolido,
  nuclear: Nuclear,
};

/** Emblema animado (só CSS) de uma área da física. Usa `currentColor` como cor. */
export function AreaGlyph({
  id,
  className,
}: {
  id: AreaId;
  className?: string;
}) {
  if (id === "astrofisica") {
    return (
      <OrbitField
        rings={ASTRO_RINGS}
        sunSize={34}
        ringOpacity={0.3}
        className={className}
      />
    );
  }
  const Glyph = GLYPHS[id];
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      className={className}
    >
      <Glyph />
    </svg>
  );
}
