# SciHub

Hub de **laboratórios interativos de ciência**. A página inicial leva a cada lab; cada lab é um
experimento onde você muda parâmetros e vê o que acontece. Site estático (Next.js) no GitHub Pages.

| Lab | Rota | O que é |
| --- | --- | --- |
| Astro Tweak | `/labs/astro-tweak` | Sandbox gravitacional do sistema solar (N corpos) |

## Estrutura

```
scihub/
  Justfile                     # atalhos (just --list)
  pyproject.toml               # deps Python (uv); Python só para dados
  data/
    raw/<lab>/                 # downloads brutos (fora do git)
    process/<lab>/             # intermediários e processados (fora do git)
  utils/                       # pipelines de dados em Python
    pipeline.py                # `just pipeline [lab...]`
    common/                    # paths, CamelModel (pydantic), export_dataset, http
    labs/<lab_name>/           # um pacote por lab: constantes, schemas, geração dos datasets
  frontend/
    app/
      page.tsx                 # hub (página inicial)
      labs/<slug>/page.tsx     # uma rota por lab
    components/
      hub/                     # componentes do hub (cards, órbitas decorativas)
      ui/                      # shadcn/ui compartilhado
    labs/
      registry.ts              # lista de labs exibidos no hub
      types.ts                 # tipo `Lab`
      <slug>/
        lab.ts                 # metadados do card (nome, descrição, cor, miniatura)
        preview.tsx            # miniatura animada do card
        components/            # UI e cena do lab
        lib/                   # física e utilitários (funções puras) do lab
    public/data/<lab>/         # JSONs finais do lab (no git)
  docs/<lab>.md                # notas de conceito de cada lab
  .github/workflows/           # deploy no GitHub Pages
```

Regra de ouro: **tudo o que é específico de um lab fica dentro da pasta do lab** (`labs/<slug>/`,
`utils/labs/<nome>/`, `data/*/<lab>/`, `public/data/<lab>/`). O que é compartilhado fica em
`components/`, `lib/` e `utils/common/`.

## Comandos

```
just run-frontend        # servidor de desenvolvimento
just pipeline            # roda o pipeline de todos os labs
just pipeline astro-tweak
just typecheck
just lint
```

## Criar um novo lab

1. **Dados (se precisar):** crie `utils/labs/<nome>/` com `run() -> list[Path]` (use
   `utils.common.export.export_dataset`) e registre em `utils/labs/__init__.py`. Os JSONs saem em
   `frontend/public/data/<slug>/`.
2. **Lab:** crie `frontend/labs/<slug>/` com `lab.ts` (metadados e `Preview`), `components/` e `lib/`.
3. **Rota:** crie `frontend/app/labs/<slug>/page.tsx` renderizando a vista principal. Inclua um link
   `href="/"` de volta ao hub.
4. **Hub:** adicione o lab em `frontend/labs/registry.ts`. O card aparece sozinho.

## Deploy

GitHub Actions publica `frontend/out` no GitHub Pages com `NEXT_PUBLIC_BASE_PATH=/scihub`.
