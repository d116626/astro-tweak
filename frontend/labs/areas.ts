/** Grandes áreas da física. Cada lab pertence a uma; áreas sem lab aparecem como "em breve". */
type AreaDef = {
  id: string;
  name: string;
  /** Cor de destaque (hex). */
  accent: string;
};

export const AREAS = [
  { id: "mecanica", name: "Mecânica", accent: "#ff9f6b" },
  { id: "ondas", name: "Ondas e óptica", accent: "#5fd4c8" },
  { id: "eletromagnetismo", name: "Eletromagnetismo", accent: "#f6d860" },
  { id: "termodinamica", name: "Termodinâmica", accent: "#ff6b5a" },
  { id: "quantica", name: "Mecânica quântica", accent: "#b79cff" },
  { id: "relatividade", name: "Relatividade", accent: "#7aa7ff" },
  { id: "estatistica", name: "Física estatística", accent: "#8be28b" },
  { id: "estado-solido", name: "Estado sólido", accent: "#6fd7ff" },
  { id: "nuclear", name: "Nuclear e partículas", accent: "#ff7ad9" },
  { id: "astrofisica", name: "Astrofísica", accent: "#ffd98a" },
] as const satisfies readonly AreaDef[];

export type Area = (typeof AREAS)[number];
export type AreaId = Area["id"];
