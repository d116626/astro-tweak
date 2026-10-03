export type Phase = {
  id: "gauss" | "ima" | "faraday" | "ampere";
  step: string;
  law: string;
  title: string;
  text: string;
  tryThis: string[];
  formula: string;
  formulaText: string;
  note?: string;
};

export const PHASES: Phase[] = [
  {
    id: "gauss",
    step: "Cargas",
    law: "Lei de Gauss",
    title: "Cargas são fontes de linhas",
    text: "Toda carga positiva solta linhas de campo; toda negativa recolhe. Feche uma bolha em volta de qualquer região e conte: linhas que saem menos linhas que entram dá a carga lá dentro, sem precisar ver o que há na bolha.",
    tryThis: [
      "Arraste a bolha sobre o + e depois sobre o −",
      "Engula as duas cargas: o total vira zero",
      "Adicione mais cargas e veja o número subir",
      "Estique a bolha pela alça branca",
      "Ligue a Prova e clique no mapa: a carga segue as linhas até a de sinal oposto",
      "Troque a prova para − e veja ela ir no sentido contrário",
    ],
    formula: "∮ E · dA = Q / ε₀",
    formulaText:
      "O fluxo do campo elétrico por uma superfície fechada é proporcional à carga dentro dela.",
    note: "Simplificação: o mundo aqui é plano (2D), então o campo cai como 1/r, e não 1/r². A contagem de linhas continua valendo.",
  },
  {
    id: "ima",
    step: "Ímãs",
    law: "Gauss do magnetismo",
    title: "Não existe ímã de um polo só",
    text: "Corte um ímã quantas vezes quiser: cada pedaço ganha um polo norte e um sul novos. As linhas do campo magnético nunca começam nem terminam, elas fecham em laço. Por isso há sempre tantos polos N quanto S.",
    tryThis: [
      "Escolha a tesoura e corte um ímã ao meio",
      "Ligue as forças e solte as metades: elas querem se juntar de novo",
      "Aproxime dois ímãs: polos iguais se afastam, opostos se grudam",
      "Gire um ímã pela ponta e veja a limalha acompanhar",
      "Desligue a limalha para ver as bússolas",
    ],
    formula: "∮ B · dA = 0",
    formulaText:
      "O fluxo magnético por qualquer superfície fechada é zero: não existe carga magnética isolada.",
    note: "Simplificação: o campo e as forças usam polos pontuais, em 2D. As linhas tracejadas mostram o caminho de volta por dentro.",
  },
  {
    id: "faraday",
    step: "Indução",
    law: "Lei de Faraday",
    title: "Fluxo mudando faz corrente",
    text: "Mexa o ímã perto da bobina: o número de linhas que a atravessam muda, e isso empurra os elétrons e acende a lâmpada. Quanto mais rápido, mais forte. Ímã parado, mesmo dentro da bobina, não faz nada.",
    tryThis: [
      "Arraste o ímã para dentro e para fora da bobina",
      "Deixe-o parado bem no meio: a luz apaga",
      "Vire o ímã e note o sentido dos elétrons",
      "Mexa devagar e depois rápido, e olhe o gráfico da tensão",
      "Compare: o fluxo sobe e a tensão aparece só enquanto ele muda",
    ],
    formula: "ε = −dΦ/dt",
    formulaText:
      "A tensão induzida é a rapidez com que o fluxo magnético pela bobina muda. O sinal de menos diz que ela se opõe à mudança (lei de Lenz).",
    note: "Simplificação: campo do ímã em 2D e brilho da lâmpada calibrado para ficar legível.",
  },
  {
    id: "ampere",
    step: "Ondas",
    law: "Ampère-Maxwell",
    title: "A luz se faz sozinha",
    text: "Uma carga que balança é corrente, e corrente cria campo magnético. Maxwell viu que um campo elétrico que varia também cria magnetismo, e um magnético que varia cria elétrico. Os dois se empurram adiante sem precisar de nada no meio: é a onda de luz. A carga da direita só se mexe quando ela chega.",
    tryThis: [
      "Dê um solavanco na carga da esquerda, ou use o pulso",
      "Ligue a onda contínua e veja a receptora balançar no ritmo",
      "Use a câmera lenta para ver E e B se revezando",
      "Desligue o termo de Maxwell e repita: o B aparece de uma vez e nada viaja",
      "Troque os campos para ver só E ou só B",
    ],
    formula: "∮ B · dl = μ₀ (I + ε₀ dΦE/dt)",
    formulaText:
      "Corrente e campo elétrico variável criam campo magnético ao redor. Junto com Faraday, é o que faz a onda andar.",
    note: "Simplificação: onda plana em 1D, e a luz leva segundos para cruzar a tela só para dar tempo de ver. Com o termo de Maxwell desligado, o B de uma folha de corrente aparece em todo lugar na hora, como era no Ampère original.",
  },
];
