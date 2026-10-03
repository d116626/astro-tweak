import { astroTweak } from "@/labs/astro-tweak/lab";
import type { Lab } from "@/labs/types";

/** Todos os laboratórios do SciHub, na ordem em que aparecem no hub. */
export const LABS: Lab[] = [astroTweak];

export const labHref = (lab: Lab) => `/labs/${lab.slug}/`;
