/**
 * Onda eletromagnética plana em 1D: E (vertical) e B (para dentro/fora da tela).
 *
 *   ∂B/∂t = −∂E/∂x                 (Faraday)
 *   ∂E/∂t = −∂B/∂x − J            (Ampère-Maxwell: corrente J e campo E que varia)
 *
 * Passo de Courant 1 (sem dispersão): a onda anda exatamente uma célula por passo.
 * As bordas absorvem a onda (condição de Mur).
 */
export class Wave1D {
  readonly e: Float32Array;
  readonly b: Float32Array;

  constructor(readonly n: number) {
    this.e = new Float32Array(n);
    this.b = new Float32Array(n);
  }

  /** `current` é injetado em E em torno da célula `at` (a carga em movimento é uma corrente). */
  step(at: number, current: number) {
    const { e, b, n } = this;
    const e1 = e[1];
    const eN = e[n - 2];
    for (let i = 0; i < n - 1; i++) b[i] -= e[i + 1] - e[i];
    for (let i = 1; i < n; i++) e[i] -= b[i] - b[i - 1];
    e[0] = e1;
    e[n - 1] = eN;
    // fonte espalhada em 3 células (¼, ½, ¼): sem energia no modo xadrez, que a grade não propaga
    e[at - 1] -= current * 0.25;
    e[at] -= current * 0.5;
    e[at + 1] -= current * 0.25;
  }

  clear() {
    this.e.fill(0);
    this.b.fill(0);
  }
}
