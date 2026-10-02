/**
 * Cenário Lua: física simplificada, funções puras (sem UI).
 * Todas as estimativas são aproximações de primeira ordem.
 * Distâncias em km, tempos em dias, ângulos em graus.
 */

import moonData from "../../public/data/moon.json";

// Constantes e valores derivados vêm do pipeline Python (utils/physics/moon.py).
export const { constants: C, derived: D, anchors: ANCHORS } = moonData;

const SECONDS_PER_DAY = 86_400;

export type MoonScenario = {
  /** null = sem Lua */
  distanceKm: number | null;
  /** Diâmetro angular da Lua no céu, em graus. */
  moonAngularDiameterDeg: number;
  /** Diâmetro angular da Lua em relação ao de hoje (1 = hoje). */
  moonSizeRatio: number;
  /** Maré lunar em relação à de hoje (cai com o cubo da distância). */
  lunarTideRatio: number;
  /** Maré de sizígia (Lua + Sol alinhados) em relação à de hoje. */
  springTideRatio: number;
  /** Período orbital (mês sideral), em dias. */
  orbitalPeriodDays: number;
  /** Ciclo de fases (mês sinódico), em dias. */
  synodicPeriodDays: number;
  /** Eclipse solar visto da Terra. */
  solarEclipse: "total" | "annular" | "mixed" | "none";
  /** Distância abaixo do limite de Roche: a Lua se desfaria em anel. */
  belowRoche: boolean;
};

export const angularDiameterDeg = (radiusKm: number, distanceKm: number) =>
  (2 * Math.atan(radiusKm / distanceKm) * 180) / Math.PI;

/** Terceira lei de Kepler. */
export const orbitalPeriodDays = (distanceKm: number) =>
  (2 * Math.PI * Math.sqrt(distanceKm ** 3 / C.muEarthMoon)) / SECONDS_PER_DAY;

/** 1/T_sinódico = 1/T_sideral - 1/T_ano. */
export const synodicPeriodDays = (siderealDays: number) =>
  1 / (1 / siderealDays - 1 / C.yearDays);

const TODAY_SIZE_DEG = D.moonAngularDiameterDeg;
const SUN_SIZE_DEG = D.sunAngularDiameterDeg;

/** Hoje a Lua oscila ao redor do tamanho do Sol: há eclipses totais e anulares ("mixed"). */
function solarEclipseType(distanceKm: number): MoonScenario["solarEclipse"] {
  const nearest = angularDiameterDeg(
    C.moonRadiusKm,
    distanceKm * (1 - C.moonEccentricity),
  );
  const farthest = angularDiameterDeg(
    C.moonRadiusKm,
    distanceKm * (1 + C.moonEccentricity),
  );
  if (farthest >= SUN_SIZE_DEG) return "total";
  if (nearest < SUN_SIZE_DEG) return "annular";
  return "mixed";
}

/**
 * @param distanceRatio distância Terra-Lua / distância atual (1 = hoje). null = sem Lua.
 */
export function computeMoonScenario(
  distanceRatio: number | null,
): MoonScenario {
  if (distanceRatio === null) {
    return {
      distanceKm: null,
      moonAngularDiameterDeg: 0,
      moonSizeRatio: 0,
      lunarTideRatio: 0,
      springTideRatio: C.solarTideRatio / (1 + C.solarTideRatio),
      orbitalPeriodDays: 0,
      synodicPeriodDays: 0,
      solarEclipse: "none",
      belowRoche: false,
    };
  }

  const distanceKm = C.moonDistanceKm * distanceRatio;
  const moonAngularDiameterDeg = angularDiameterDeg(
    C.moonRadiusKm,
    distanceKm,
  );
  const lunarTideRatio = distanceRatio ** -3;
  const siderealDays = orbitalPeriodDays(distanceKm);

  return {
    distanceKm,
    moonAngularDiameterDeg,
    moonSizeRatio: moonAngularDiameterDeg / TODAY_SIZE_DEG,
    lunarTideRatio,
    springTideRatio:
      (lunarTideRatio + C.solarTideRatio) / (1 + C.solarTideRatio),
    orbitalPeriodDays: siderealDays,
    synodicPeriodDays: synodicPeriodDays(siderealDays),
    solarEclipse: solarEclipseType(distanceKm),
    belowRoche: distanceKm < D.rocheLimitKm,
  };
}
