# Astro Tweak — notas de conceito

> **Direção atual:** sandbox do sistema solar inteiro, com gravidade de N corpos real (leapfrog, `frontend/scenarios/solar-system/nbody.ts`). Por planeta dá para mexer em massa, distância ao Sol, inclinação da órbita e do eixo e tamanho. Os cenários da Lua descritos abaixo foram removidos. Próximas fases: G, massa do Sol e outras constantes; luas, asteroides e planetas anões.

Nome: **Astro Tweak** (repo `astro-tweak`).

## Ideia em uma frase
Um simulador interativo de "e se" para a Terra: você mexe em um parâmetro (Lua, Sol, gravidade, eixo...) e vê, com números reais, o que muda no céu, no seu corpo e no mundo. Sem quiz, sem certo ou errado.

## Princípios
- **Experiência e conceito antes de técnica.** A parte técnica existe, mas fica em uma camada opcional ("quer saber como?").
- **Dados reais** como matéria-prima, não como prova.
- **Intuição:** o usuário sente a escala e as consequências, em vez de decorar fórmulas.
- Estimativas simplificadas, sempre sinalizadas como tal. Efeitos debatidos (ex.: Lua estabilizar o eixo da Terra) aparecem como debatidos.

## Duas câmeras, um mesmo slider
Cada cenário tem duas vistas sincronizadas:

- **Da Terra:** o que você vê e sente na superfície (céu, Sol e Lua com tamanho e cor certos, peso, marés).
- **De fora:** o sistema visto do espaço, que mostra o *porquê* (órbitas, zona habitável, comparação de mundos, globo).

### Assinatura: "afastar"
Um controle contínuo de zoom que leva da superfície ao espaço (horizonte, órbita, vista da Terra, sistema inteiro), sem corte, tipo "Powers of Ten" aplicado ao cenário. No celular resolve o problema de tela dividida, porque há uma vista só que se transforma.

### Escala
Na escala real tudo é minúsculo e ilegível. Botão **escala real / escala didática** (didática como padrão, real como opção). O modo real ensina o quanto o espaço é vazio.

## Camadas de resultado
| Camada | O que mostra |
|---|---|
| Você vê | Céu do seu local, tamanho e cor do Sol e da Lua |
| Você sente | Peso, duração do dia e do ano, temperatura |
| O mundo muda | Marés, estações, oceanos, habitabilidade |

## Cenários
| Cenário | Da Terra | De fora |
|---|---|---|
| **Lua** (mais perto, longe, sem Lua) | Tamanho no céu, marés, eclipses | Sistema Terra-Lua, órbita, "barriga" de maré exagerada |
| **Distância do Sol** | Brilho do céu, temperatura, ano | Sistema solar de cima com faixa de zona habitável |
| **Tipo de estrela** (anã vermelha, gigante azul) | Cor do céu, tamanho do Sol | Zona habitável encolhe ou se afasta |
| **Gravidade e tamanho** (Lua a Júpiter) | Quanto você pula e pesa, atmosfera | Terra, Lua, Marte e Júpiter lado a lado em escala |
| **Inclinação do eixo** | Estações, onde o Sol nasce | Globo em órbita com sombra de dia e noite |
| **Rotação** (dia de 6h ou 48h) | Vento e variação de temperatura | Globo girando, achatamento nos polos |
| **Nível do mar** (+5, +20, +70 m) | Mapa costeiro | Globo com a costa mudando |

## Ideias de interação
1. **Slider com âncoras reais.** Ex.: gravidade encaixa em Lua, Marte, Terra e Júpiter.
2. **Palpite antes da revelação (opcional).** O usuário marca "o que acho que acontece" e depois vê a diferença. Calibra intuição sem virar quiz.
3. **Frases compartilháveis.** Ex.: "Com a Lua à metade da distância, as marés seriam 8x maiores."
4. **Veredito de habitabilidade.** Selo simples: uma pessoa sobreviveria ali?
5. Presets de mundos reais como ponto de partida (Marte, Vênus, Kepler-452b, TRAPPIST-1e).

## Dados
- NASA Planetary Fact Sheet: massa, raio, gravidade, dia e inclinação de planetas e luas (pequeno, estático).
- Tabela de tipos estelares: temperatura, luminosidade, raio.
- NASA Exoplanet Archive: mundos reais como presets.
- DEM de elevação (terrarium, o mesmo do MapTap) para o cenário de nível do mar.

### Pipeline de dados (Python, igual ao MapTap)
O site é estático, então nada é baixado ou processado no navegador. Os dados são preparados offline por scripts Python:

1. **`data/raw/`**: downloads brutos das fontes (NASA, Exoplanet Archive, DEM etc.). Fica fora do git (`/data/` no `.gitignore`, só com `.gitkeep`).
2. **`data/process/`**: saídas intermediárias já limpas e normalizadas. Também fora do git.
3. **`utils/`**: scripts Python que fazem fetch, processamento e exportação (`fetchers/`, `processors/`, `pipeline.py`, `schemas.py`, `constants.py`).
4. **`frontend/public/data/`**: só os JSONs finais, pequenos, que o site realmente consome. Esses vão para o git e para o GitHub Pages.

Fluxo: `fetch -> data/raw -> process -> data/process -> export -> frontend/public/data`.

- **`pyproject.toml` na raiz** (gerenciado com `uv`, `package = false`), com dependências como `requests`, `pandas`, `pydantic` e `numpy`. Adicionar `geopandas` e `shapely` só se o cenário de nível do mar exigir.
- **`Justfile`** com os atalhos: `just pipeline` (roda `uv run python -m utils.pipeline`), `just py-sync`, `just run-frontend`, `just typecheck` e `just lint`.
- Cada script deve ser **idempotente**: só baixa se o arquivo bruto ainda não existe (como o `fetch_file_if_missing` do MapTap).
- Validar os dados com **schemas pydantic** antes de exportar, e limitar o tamanho dos JSONs finais (o site é estático e precisa carregar rápido).

## Stack (mesma do MapTap)
- **Site estático no GitHub Pages**, TypeScript.
- Next.js com `output: "export"`, `trailingSlash: true`, `basePath` por env (`NEXT_PUBLIC_BASE_PATH`, padrão `/astro-tweak` em produção) e `images.unoptimized`.
- Tailwind v4 + shadcn/ui (base-ui) + lucide-react.
- Workflow de deploy no GitHub Actions reaproveitando o `nextjs.yml` do MapTap.
- Scripts: `typecheck` (`tsc --noEmit`) e `lint`.
- **Da Terra:** Canvas 2D (discos de Sol e Lua, gradientes de céu).
- **De fora (MVP):** esquemas 2D de cima em Canvas/SVG.
- **Globos** (eixo, rotação, nível do mar): projeção em globo do MapLibre. Three.js só se o "afastar" 3D valer o custo.
- Física em funções puras de TypeScript (uma por cenário), separadas da UI, fáceis de testar.
- **Python (`uv`) só para dados**, na pasta `utils/`, fora do bundle do site.

### Estrutura sugerida
```
astro-tweak/
  pyproject.toml          # deps Python (uv)
  Justfile                # atalhos: pipeline, run-frontend, typecheck, lint
  notes.md
  data/
    raw/                  # downloads brutos (fora do git)
    process/              # intermediários (fora do git)
  utils/                  # scripts Python de dados
    pipeline.py
    constants.py
    schemas.py
    fetchers/
    processors/
  frontend/
    public/data/          # JSONs finais consumidos pelo site (no git)
    app/                  # rotas Next (sem src/, igual ao MapTap)
    scenarios/<nome>/     # física (funções puras), dados e config do cenário
    components/           # sliders, vistas Da Terra / De fora, afastar
    lib/                  # escala, formatação, frases compartilháveis
  .github/workflows/      # deploy no GitHub Pages
```

## Roadmap
1. **MVP:** 3 cenários com as duas vistas: **Lua**, **distância do Sol**, **gravidade**. Começar pela Lua (efeito visual forte das marés).
2. **Fase 2:** "afastar" contínuo e inclinação do eixo (depende de globo).
3. **Fase 3:** rotação, nível do mar, tipo de estrela

## Riscos
- **Precisão:** manter "estimativa simplificada" visível e tratar efeitos debatidos como tal.
- **Escopo:** muitos cenários. Melhor poucos bem feitos do que muitos rasos.
- **Escala:** legibilidade contra realismo (resolvido com o botão de escala).

- Layout: vista que se transforma ao afastar?
- Tom: mais lúdico e científico?
- MObile first mas que tbm funcione em desktop?
