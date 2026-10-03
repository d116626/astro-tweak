import type { PlanetLook } from "@/labs/astro-tweak/lib/procedural-textures";

/** Aparência dos planetas (cores e textura procedural). A Terra tem textura própria. */
export const PLANET_LOOKS: Record<string, PlanetLook> = {
  mercury: { base: [120, 115, 110], accent: [175, 170, 165], bands: 0, noise: 4 },
  venus: { base: [215, 185, 130], accent: [240, 220, 170], bands: 5, noise: 2.5 },
  mars: { base: [150, 70, 40], accent: [205, 125, 80], bands: 0, noise: 3 },
  jupiter: { base: [150, 100, 65], accent: [235, 215, 185], bands: 22, noise: 2 },
  saturn: { base: [190, 165, 115], accent: [235, 220, 175], bands: 16, noise: 1.5 },
  uranus: { base: [150, 205, 215], accent: [185, 225, 230], bands: 6, noise: 1 },
  neptune: { base: [40, 70, 170], accent: [90, 130, 220], bands: 8, noise: 1.5 },
};

/** Cor de destaque (chips e rótulos). */
export const BODY_COLORS: Record<string, string> = {
  sun: "#ffd98a",
  mercury: "#a8a29e",
  venus: "#e5c98f",
  earth: "#4f9cff",
  mars: "#d9774a",
  jupiter: "#e0b98f",
  saturn: "#e8d3a0",
  uranus: "#9fdce4",
  neptune: "#4a6fe0",
};
