# SciHub

Hub de **laboratórios interativos de física**. A página inicial é organizada por área da física; cada
lab é um experimento onde você muda parâmetros e vê o que acontece. Site estático (Next.js) no
GitHub Pages. Ideias de próximos labs: [`plan.md`](plan.md).

| Área | Lab | Rota | O que é |
| --- | --- | --- | --- |
| Astrofísica | Astro Tweak | `/labs/astrofisica/astro-tweak` | Sandbox gravitacional do sistema solar (N corpos) |
| Eletromagnetismo | As 4 leis | `/labs/eletromagnetismo/quatro-leis` | Quatro brinquedos, um por lei de Maxwell |

## Estrutura

Tudo segue a hierarquia **área → lab (experimento)**, na mesma ordem e com os mesmos ids no frontend,
no Python e nos dados (`astrofisica`, `astro-tweak`; no Python, pacotes usam `_`: `astro_tweak`).
Os ids das áreas ficam em `frontend/labs/areas.ts` (ex.: `mecanica`, `eletromagnetismo`, `estado-solido`).

```
scihub/
  Justfile                          # atalhos (just --list)
  pyproject.toml                    # deps Python (uv); Python só para dados
  plan.md                           # ideias de labs por área
  data/
    raw/<area>/<lab>/               # downloads brutos (fora do git)
    process/<area>/<lab>/           # intermediários e processados (fora do git)
  utils/                            # pipelines de dados em Python
    pipeline.py                     # `just pipeline [area | area/lab ...]`
    common/                         # paths, CamelModel (pydantic), export_dataset, http
    labs/<area>/<lab_name>/         # um pacote por lab: constantes, schemas, datasets
  frontend/
    app/
      page.tsx                      # hub (hero com as áreas + seções por área)
      labs/<area>/<lab>/page.tsx    # uma rota por lab
    components/
      hub/                          # componentes do hub (tiles, seções, cards, glifos animados)
      ui/                           # shadcn/ui compartilhado
    labs/
      areas.ts                      # áreas da física (nome, cor, id)
      registry.ts                   # lista de labs exibidos no hub
      types.ts                      # tipo `Lab`
      <area>/<lab>/
        lab.ts                      # metadados do card (nome, área, descrição, cor, miniatura)
        preview.tsx                 # miniatura animada do card
        components/                 # UI e cena do lab
        lib/                        # física e utilitários (funções puras) do lab
    public/data/<area>/<lab>/       # JSONs finais do lab (no git)
  docs/<area>/<lab>.md              # notas de conceito de cada lab
  .github/workflows/                # deploy no GitHub Pages
```

Regra de ouro: **tudo o que é específico de um lab fica dentro da pasta dele**
(`labs/<area>/<lab>/`, `utils/labs/<area>/<lab_name>/`, `data/*/<area>/<lab>/`,
`public/data/<area>/<lab>/`). O que é compartilhado fica em `components/`, `lib/` e `utils/common/`.

## Comandos

```
just run-frontend                     # servidor de desenvolvimento
just pipeline                         # roda o pipeline de todos os labs
just pipeline astrofisica             # todos os labs de uma área
just pipeline astrofisica/astro-tweak # um lab
just typecheck
just lint
```

## Criar um novo lab

Exemplo: lab `meu-lab` da área `eletromagnetismo` (a área precisa existir em `frontend/labs/areas.ts`).

1. **Dados (se precisar):** crie `utils/labs/eletromagnetismo/meu_lab/` com `AREA`, `SLUG` e
   `run() -> list[Path]` (use `utils.common.export.export_dataset(AREA, SLUG, nome, dataset)`). Se a área
   é nova no Python, crie também `utils/labs/<area>/__init__.py` (com `_` no lugar de `-`). Registre o lab
   em `utils/labs/__init__.py`. Os JSONs saem em `frontend/public/data/eletromagnetismo/meu-lab/`.
2. **Lab:** crie `frontend/labs/eletromagnetismo/meu-lab/` com `lab.ts` (metadados, `area` e `Preview`),
   `components/` e `lib/`.
3. **Rota:** crie `frontend/app/labs/eletromagnetismo/meu-lab/page.tsx` renderizando a vista principal.
   Inclua um link `href="/"` de volta ao hub.
4. **Hub:** adicione o lab em `frontend/labs/registry.ts`. O card aparece sozinho na seção da sua `area`
   (áreas sem lab mostram "em breve"), e a área sobe para o topo do hub.
5. **Docs:** notas de conceito em `docs/eletromagnetismo/meu-lab.md` e a ideia riscada de `plan.md`.

## Deploy

GitHub Actions publica `frontend/out` no GitHub Pages com `NEXT_PUBLIC_BASE_PATH=/scihub`.
