/**
 * Sistema solar: posições keplerianas (funções puras, sem UI).
 * Elementos vêm do pipeline Python (utils/labs/astrofisica/astro_tweak/solar_system.py).
 * Referencial da cena: y para cima (polo norte da eclíptica), distâncias em UA.
 */
import solarData from "@/public/data/astrofisica/astro-tweak/solar-system.json";

export const SOLAR = solarData;
export type PlanetData = (typeof solarData.planets)[number];
export type Vec3 = [number, number, number];

const rad = (deg: number) => (deg * Math.PI) / 180;
/** J2000: 2000-01-01 12:00 UTC. */
const J2000_MS = Date.UTC(2000, 0, 1, 12);

export const daysSinceJ2000 = (date: Date) =>
  (date.getTime() - J2000_MS) / 86_400_000;

/** Resolve a equação de Kepler E - e·sin(E) = M (Newton). */
function eccentricAnomaly(meanAnomaly: number, e: number): number {
  let E = meanAnomaly + e * Math.sin(meanAnomaly);
  for (let i = 0; i < 8; i++) {
    E -= (E - e * Math.sin(E) - meanAnomaly) / (1 - e * Math.cos(E));
  }
  return E;
}

/** Posição no plano orbital (x', y') -> eclíptica -> eixos da cena (x, z, -y). */
function toScene(p: PlanetData, xp: number, yp: number): Vec3 {
  const node = rad(p.longitudeAscendingNodeDeg);
  const inc = rad(p.inclinationDeg);
  const w = rad(p.longitudePerihelionDeg - p.longitudeAscendingNodeDeg);
  const [cw, sw, cn, sn, ci, si] = [
    Math.cos(w),
    Math.sin(w),
    Math.cos(node),
    Math.sin(node),
    Math.cos(inc),
    Math.sin(inc),
  ];
  const X = (cw * cn - sw * sn * ci) * xp + (-sw * cn - cw * sn * ci) * yp;
  const Y = (cw * sn + sw * cn * ci) * xp + (-sw * sn + cw * cn * ci) * yp;
  const Z = sw * si * xp + cw * si * yp;
  return [X, Z, -Y];
}

/**
 * Posição (UA) e velocidade (UA/dia) heliocêntricas `days` dias após J2000.
 * `gm` (UA³/dia²) define a velocidade orbital via 3ª lei de Kepler.
 */
export function planetStateAu(
  p: PlanetData,
  days: number,
  gm: number,
): { pos: Vec3; vel: Vec3 } {
  const { semiMajorAxisAu: a, eccentricity: e } = p;
  const meanMotion = 360 / p.orbitalPeriodDays; // °/dia
  const M = rad(p.meanLongitudeDeg - p.longitudePerihelionDeg + meanMotion * days);
  const E = eccentricAnomaly(M, e);
  const b = a * Math.sqrt(1 - e * e);
  const eDot = Math.sqrt(gm / a ** 3) / (1 - e * Math.cos(E));
  return {
    pos: toScene(p, a * (Math.cos(E) - e), b * Math.sin(E)),
    vel: toScene(p, -a * Math.sin(E) * eDot, b * Math.cos(E) * eDot),
  };
}
