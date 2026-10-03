# As 4 leis: notas de conceito

Lab do **SciHub** (rota `/labs/eletromagnetismo/quatro-leis`). Não usa dados externos nem pipeline Python.

## Ideia
Cada equação de Maxwell vira um brinquedo que dá para mexer, com a lei dita em palavras simples antes
da fórmula. Quem não sabe física deve sair com a ideia, e quem sabe, com a fórmula certa no lugar certo.
Uma versão anterior (FDTD 2D, "Maxwell ao vivo") foi descartada: bonita, mas sem nada que explicasse
o que se via.

## Os quatro brinquedos
| Etapa | Lei | Brinquedo | O que mostra |
|---|---|---|---|
| 1 Cargas | Gauss | Cargas arrastáveis e uma bolha que conta linhas | saem − entram = carga dentro |
| 2 Ímãs | Gauss do magnetismo | Tesoura nos ímãs, bússolas | cortar nunca separa um polo; sempre N = S |
| 3 Indução | Faraday | Ímã numa trilha, bobina, lâmpada | só o fluxo *mudando* acende; parado não |
| 4 Ondas | Ampère-Maxwell | Carga que balança, onda 1D, carga receptora | E variável faz B e vice-versa; a luz tem atraso |

## Como funciona por dentro
- **Linhas de campo (1 e 2):** cargas-linha em 2D (campo ∝ 1/r), traçadas com RK2. Cada carga solta
  10 linhas; as de uma carga negativa que não vêm de uma positiva partem dela "de trás para frente".
  Assim a contagem na bolha dá exatamente a carga. Código: `lib/field.ts`.
- **Fluxo do ímã (3):** número de linhas que cruzam a bobina, somando os dois polos mais o miolo do ímã
  (o "degrau" que mantém Φ contínuo e faz o total tender a zero para uma bobina enorme).
  EMF = −dΦ/dt, suavizada; o brilho da lâmpada é `1 − exp(−|EMF|/8)`.
- **Onda (4):** leapfrog 1D com passo de Courant 1 (sem dispersão), bordas absorventes (Mur) e fonte
  espalhada em 3 células (¼, ½, ¼) para não excitar o modo xadrez da grade. A carga é puxada de volta
  ao eixo, então o deslocamento total é zero e sobra só a onda. Código: `lib/wave1d.ts`, `lib/wavesim.ts`.

## Interações extras
- **Cargas (1):** o botão "Prova" (desligada → + → −) solta, a cada clique, uma carga de prova em
  repouso. Ela é empurrada pelo campo (a favor se for +, contra se for −), com atrito leve, deixa
  rastro e some ao ser capturada por uma carga de sinal oposto ou ao sair da tela. Até 6 ao mesmo
  tempo. Não altera o campo nem a contagem da bolha (`lib/probe.ts`).
- **Ímãs (2):** polos de ímãs diferentes interagem com a mesma lei 1/r do campo (iguais se repelem,
  opostos se atraem), com atrito, torque e um contato que impede que se atravessem
  (`lib/magnetsim.ts`). A limalha é uma grade de segmentos que giram até o eixo do campo local.
- **Indução (3):** osciloscópio com os últimos 4 s de Φ e de ε = −dΦ/dt.
- **Ondas (4):** o botão "Maxwell" tira o termo ∂E/∂t. Sem ele, o B de uma corrente aparece em todo
  lugar ao mesmo tempo (proporcional à corrente de agora), não há E propagando e a receptora não sente nada.

## Simplificações (sinalizadas no painel)
- Mundo plano: o campo cai como 1/r, e não 1/r².
- O campo fora do ímã usa polos pontuais; dentro, o caminho de volta é só desenhado.
- Brilho da lâmpada calibrado para ser legível, não em volts.
- A luz leva segundos para cruzar a tela, só para dar tempo de ver.

## Ideias futuras
Ver `plan.md`: FDTD com materiais como camada avançada, ímã no tubo de cobre (Faraday e Lenz).
