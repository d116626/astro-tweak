# Plano de labs

Ideias de laboratórios por área da física (as áreas ficam em `frontend/labs/areas.ts`).
Estados: **feito**, **próximo**, **na manga** (ideia guardada). Ao criar um lab, siga o passo a passo do
[README](README.md#criar-um-novo-lab) e atualize este arquivo.

## Astrofísica

- **feito:** Astro Tweak (`astrofisica/astro-tweak`): sandbox do sistema solar com gravidade de N corpos.
  Notas em `docs/astrofisica/astro-tweak.md`.
- **na manga (fases futuras do Astro Tweak):**
  - G e massa do Sol como constantes globais editáveis.
  - Luas, asteroides e planetas anões.

## Eletromagnetismo

- **feito:** As 4 leis (`eletromagnetismo/quatro-leis`): quatro brinquedos, um por lei de Maxwell
  (bolha de Gauss, ímãs sem monopolo, indução de Faraday, onda de Ampère-Maxwell).
  Notas em `docs/eletromagnetismo/quatro-leis.md`.
- **na manga: Maxwell ao vivo (FDTD avançado)** (`eletromagnetismo/ondas-fdtd`, nome provisório)
  - Resolve as equações numa grade 2D em tempo real (Yee, modo TM: Ez, Hx, Hy), com materiais reais
    (água, vidro, cobre, ferrite) e experimentos: antena de Hertz, fenda dupla, refração, gaiola de Faraday.
  - Foi tentado e descartado como primeira versão: sem base conceitual, a interação não ensinava nada.
    Só faz sentido depois de "As 4 leis", como camada avançada.
  - Dados reais (pipeline Python): ε, μ e σ de materiais. Valores de memória precisam ser conferidos
    na fonte (CRC, NIST).
- **na manga: Ímã caindo no tubo de cobre**
  - Experimento canônico de Faraday e Lenz: ímã de neodímio em tubos de cobre, alumínio, latão, PVC e
    até supercondutor; a corrente induzida freia a queda até a velocidade terminal.
  - Dados: resistividade dos metais, especificações de ímãs. Simples e lúdico, mas cobre só Faraday e Ampère.
- **na manga: Magnetosfera da Terra com dados ao vivo**
  - Partículas do vento solar presas no campo dipolar (cinturões de Van Allen, auroras).
  - Dados: modelo geomagnético da NOAA (WMM) e índice Kp ao vivo. Mais força de Lorentz e campo estático
    do que Maxwell.
- **na manga: Maxwell 1861, a luz é uma onda EM**
  - Reconstrução histórica: medir ε₀ e μ₀ com capacitor e solenoide (dados de Weber e Kohlrausch, 1856),
    calcular c = 1/√(μ₀ε₀) e comparar com a medida de Fizeau; depois a onda propaga.
  - Forte na história, mais leve na interação.

## Mecânica

- (sem ideias ainda)

## Ondas e óptica

- (sem ideias ainda)

## Termodinâmica

- (sem ideias ainda)

## Mecânica quântica

- (sem ideias ainda)

## Relatividade

- (sem ideias ainda)

## Física estatística

- (sem ideias ainda)

## Estado sólido

- (sem ideias ainda)

## Nuclear e partículas

- (sem ideias ainda)
