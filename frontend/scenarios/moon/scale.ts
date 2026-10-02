/**
 * Escala da cena 3D (1 unidade = 1 raio da Terra).
 * Os tamanhos da Terra e da Lua são sempre reais entre si.
 * - "real": distâncias também reais (tudo minúsculo e muito vazio).
 * - "didactic": distâncias comprimidas para caber na tela.
 */
export type ScaleMode = "didactic" | "real";

/** Distância ao centro da Terra, em raios terrestres -> unidades da cena. */
export function sceneRadius(earthRadii: number, mode: ScaleMode): number {
  if (mode === "real") return earthRadii;
  return 1 + 0.9 * Math.pow(Math.max(earthRadii - 1, 0), 0.35);
}
