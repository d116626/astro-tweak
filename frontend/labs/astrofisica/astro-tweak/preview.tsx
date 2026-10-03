import { OrbitField, type OrbitRing } from "@/components/hub/orbit-field";
import { BODY_COLORS } from "@/labs/astrofisica/astro-tweak/components/planet-looks";

// Raios comprimidos (a^0,45) e períodos pela 3ª lei de Kepler, só para ilustrar.
const PLANETS: [id: string, r: number, size: number][] = [
  ["mercury", 58, 5],
  ["venus", 76, 8],
  ["earth", 92, 8.5],
  ["mars", 112, 6.5],
  ["jupiter", 170, 17],
  ["saturn", 218, 14],
  ["uranus", 292, 11],
  ["neptune", 360, 11],
];

const RINGS: OrbitRing[] = PLANETS.map(([id, r, size], i) => ({
  r,
  size,
  color: BODY_COLORS[id],
  period: 7 * Math.pow(r / 58, 1.5),
  phase: (i * 0.37) % 1,
}));

/** Miniatura do lab no hub: o sistema solar girando. */
export function AstroTweakPreview() {
  return <OrbitField rings={RINGS} sunSize={22} className="size-full" />;
}
