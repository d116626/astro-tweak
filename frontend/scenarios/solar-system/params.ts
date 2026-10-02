/** Parâmetros editáveis de cada planeta e suas definições para a UI. */
import { SOLAR, type PlanetData } from "./orbits";

const EARTH_RADIUS_KM = 6371;
const earth = SOLAR.planets.find((p) => p.id === "earth")!;
export const EARTH_MASS_KG = earth.massKg;

export type BodyParams = {
  /** Em massas da Terra. */
  massEarth: number;
  /** Em raios da Terra. */
  radiusEarth: number;
  axialTiltDeg: number;
  /** Distância média ao Sol (semieixo maior), em UA. */
  semiMajorAu: number;
  /** Inclinação da órbita em relação à eclíptica. */
  inclinationDeg: number;
};

export const defaultParams = (p: PlanetData): BodyParams => ({
  massEarth: p.massKg / EARTH_MASS_KG,
  radiusEarth: p.radiusKm / EARTH_RADIUS_KM,
  axialTiltDeg: p.axialTiltDeg,
  semiMajorAu: p.semiMajorAxisAu,
  inclinationDeg: p.inclinationDeg,
});

export const DEFAULT_PARAMS: Record<string, BodyParams> = Object.fromEntries(
  SOLAR.planets.map((p) => [p.id, defaultParams(p)]),
);

export type ParamDef = {
  key: keyof BodyParams;
  label: string;
  /** Rótulo curto para as abas. */
  short: string;
  unit: string;
  min: number;
  max: number;
  /** Slider logarítmico (para grandezas que variam por ordens de grandeza). */
  log: boolean;
};

export const PARAM_DEFS: ParamDef[] = [
  { key: "massEarth", label: "Massa", short: "Massa", unit: "M⊕", min: 0.01, max: 30000, log: true },
  { key: "semiMajorAu", label: "Distância ao Sol", short: "Distância", unit: "UA", min: 0.1, max: 60, log: true },
  { key: "inclinationDeg", label: "Inclinação da órbita", short: "Órbita", unit: "°", min: 0, max: 180, log: false },
  { key: "axialTiltDeg", label: "Inclinação do eixo", short: "Eixo", unit: "°", min: 0, max: 180, log: false },
  { key: "radiusEarth", label: "Tamanho", short: "Tamanho", unit: "R⊕", min: 0.1, max: 40, log: true },
];

/** Gravidade na superfície (m/s²) a partir de massa e raio. */
export const surfaceGravity = ({ massEarth, radiusEarth }: BodyParams) =>
  (SOLAR.gravitationalConstant * massEarth * EARTH_MASS_KG) /
  (radiusEarth * EARTH_RADIUS_KM * 1000) ** 2;

/** Período orbital em dias (3ª lei de Kepler). */
export const orbitalPeriodDays = (semiMajorAu: number) =>
  365.256 * Math.pow(semiMajorAu, 1.5);

/** Raio em km. */
export const radiusKm = (p: BodyParams) => p.radiusEarth * EARTH_RADIUS_KM;
