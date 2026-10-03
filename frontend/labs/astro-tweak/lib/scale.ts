/**
 * Escala didática do sistema solar na cena 3D.
 * Distâncias e raios são comprimidos (o real não cabe numa tela).
 * A ordem de grandeza e as proporções relativas são preservadas.
 */
import type { Vec3 } from "./orbits";

const EARTH_RADIUS_KM = 6371;

export const SUN_SCENE_RADIUS = 3;
export const EARTH_SCENE_RADIUS = 0.35;

/** UA -> unidades da cena. */
export const sceneDistance = (au: number) => 12 * Math.pow(au, 0.55);

/** Raio em km -> unidades da cena. */
export const sceneRadiusOf = (radiusKm: number) =>
  EARTH_SCENE_RADIUS * Math.pow(radiusKm / EARTH_RADIUS_KM, 0.45);

/** Posição em UA -> posição na cena, comprimindo só a distância ao Sol. */
export function compressPosition([x, y, z]: Vec3): Vec3 {
  const r = Math.hypot(x, y, z);
  if (r === 0) return [0, 0, 0];
  const k = sceneDistance(r) / r;
  return [x * k, y * k, z * k];
}
