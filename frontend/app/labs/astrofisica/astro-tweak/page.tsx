import type { Metadata } from "next";
import { SpaceView } from "@/labs/astrofisica/astro-tweak/components/space-view";

export const metadata: Metadata = {
  title: "Astro Tweak · SciHub",
  description:
    "Sandbox do sistema solar: mude massa, distância, inclinação e tamanho dos planetas e veja a gravidade reagir.",
};

export default function AstroTweakPage() {
  return <SpaceView />;
}
