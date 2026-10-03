import { astroTweak } from "@/labs/astrofisica/astro-tweak/lab";
import { quatroLeis } from "@/labs/eletromagnetismo/quatro-leis/lab";
import type { AreaId } from "@/labs/areas";
import type { Lab } from "@/labs/types";

/** Todos os laboratórios do SciHub, na ordem em que aparecem no hub. */
export const LABS: Lab[] = [astroTweak, quatroLeis];

export const labHref = (lab: Lab) => `/labs/${lab.area}/${lab.slug}/`;

export const labsByArea = (area: AreaId) => LABS.filter((lab) => lab.area === area);
