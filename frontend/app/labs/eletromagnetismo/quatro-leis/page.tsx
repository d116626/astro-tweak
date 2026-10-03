import type { Metadata } from "next";
import { QuatroLeisView } from "@/labs/eletromagnetismo/quatro-leis/components/view";

export const metadata: Metadata = {
  title: "As 4 leis · SciHub",
  description:
    "As equações de Maxwell em quatro brinquedos: Gauss, ímãs sem monopolo, Faraday e a onda de luz.",
};

export default function QuatroLeisPage() {
  return <QuatroLeisView />;
}
