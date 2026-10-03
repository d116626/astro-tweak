import type { ComponentType } from "react";
import type { AreaId } from "@/labs/areas";

/** Metadados de um laboratório. Cada lab vive em `labs/<slug>/` e tem a rota `/labs/<slug>`. */
export type Lab = {
  slug: string;
  /** Área da física a que o lab pertence. */
  area: AreaId;
  name: string;
  tagline: string;
  description: string;
  tags: string[];
  /** Cor de destaque do lab (hex), usada no card do hub. */
  accent: string;
  /** Miniatura animada exibida no card do hub. */
  Preview: ComponentType;
};
