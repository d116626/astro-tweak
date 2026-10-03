const SOURCES = [
  { x: 250, y: 330, color: "#f6d860" },
  { x: 550, y: 470, color: "#6fd7ff" },
];

/** Miniatura do lab no hub: duas ondas se espalhando e se cruzando. */
export function QuatroLeisPreview() {
  return (
    <svg viewBox="0 0 800 800" className="size-full" aria-hidden>
      {SOURCES.map((s) => (
        <g key={s.color}>
          {Array.from({ length: 6 }, (_, k) => (
            <circle
              key={k}
              className="wave-ring"
              cx={s.x}
              cy={s.y}
              r={380}
              fill="none"
              stroke={s.color}
              strokeWidth={3}
              style={{ animationDelay: `${-k * (5 / 6)}s` }}
            />
          ))}
          <circle cx={s.x} cy={s.y} r={14} fill={s.color} />
        </g>
      ))}
    </svg>
  );
}
