import { QuatroLeisPreview } from "@/labs/eletromagnetismo/quatro-leis/preview";
import type { Lab } from "@/labs/types";

export const quatroLeis: Lab = {
  slug: "quatro-leis",
  area: "eletromagnetismo",
  name: "As 4 leis",
  tagline: "Maxwell na ponta dos dedos.",
  description:
    "Quatro brinquedos, uma lei cada: conte linhas numa bolha, tente cortar um polo, acenda uma lâmpada com um ímã e faça a luz andar sozinha.",
  tags: ["Maxwell", "Campos", "Interativo"],
  accent: "#f6d860",
  Preview: QuatroLeisPreview,
};
