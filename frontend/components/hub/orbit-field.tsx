export type OrbitRing = {
  /** Raio no viewBox (centro em 400,400). */
  r: number;
  /** Raio do corpo que orbita. */
  size: number;
  color: string;
  /** Segundos por volta. */
  period: number;
  /** Posição inicial, de 0 a 1 da volta. */
  phase: number;
};

const C = 400;

/** Diagrama decorativo de órbitas animadas (só CSS). Pausa com prefers-reduced-motion. */
export function OrbitField({
  rings,
  sun = "#ffd98a",
  sunSize = 18,
  ringOpacity = 0.14,
  className,
}: {
  rings: OrbitRing[];
  sun?: string;
  sunSize?: number;
  ringOpacity?: number;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 800 800" aria-hidden className={className}>
      <defs>
        <radialGradient id="orbit-sun-glow">
          <stop offset="0%" stopColor={sun} stopOpacity="0.55" />
          <stop offset="100%" stopColor={sun} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={C} cy={C} r={sunSize * 4.5} fill="url(#orbit-sun-glow)" />
      <circle cx={C} cy={C} r={sunSize} fill={sun} />
      {rings.map((ring, i) => (
        <g key={i}>
          <circle
            cx={C}
            cy={C}
            r={ring.r}
            fill="none"
            stroke="white"
            strokeOpacity={ringOpacity}
            strokeWidth={1.2}
          />
          <g
            className="orbit"
            style={{
              animationDuration: `${ring.period}s`,
              animationDelay: `${-ring.phase * ring.period}s`,
            }}
          >
            <circle cx={C + ring.r} cy={C} r={ring.size} fill={ring.color} />
          </g>
        </g>
      ))}
    </svg>
  );
}
