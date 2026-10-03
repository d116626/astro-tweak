import type { ComponentType } from "react";

/** Metadados de um laboratório. Cada lab vive em `labs/<slug>/` e tem a rota `/labs/<slug>`. */
export type Lab = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  tags: string[];
  /** Cor de destaque do lab (hex), usada no card do hub. */
  accent: string;
  /** Miniatura animada exibida no card do hub. */
  Preview: ComponentType;
};
