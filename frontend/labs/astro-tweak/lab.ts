import { AstroTweakPreview } from "@/labs/astro-tweak/preview";
import type { Lab } from "@/labs/types";

export const astroTweak: Lab = {
  slug: "astro-tweak",
  area: "astrofisica",
  name: "Astro Tweak",
  tagline: "O sistema solar na sua mão.",
  description:
    "Mude a massa, a distância, a inclinação e o tamanho de cada planeta e veja a gravidade de N corpos reorganizar as órbitas.",
  tags: ["Gravidade", "N corpos", "3D"],
  accent: "#ffd98a",
  Preview: AstroTweakPreview,
};
