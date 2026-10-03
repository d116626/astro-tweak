import { Wave1D } from "@/labs/eletromagnetismo/quatro-leis/lib/wave1d";

export const CELLS = 300;
export const SRC_CELL = 30;
export const RECV_CELL = 262;
/** Passos por segundo a 1×: a onda cruza as 300 células em 4 s. */
export const STEPS_PER_SEC = 75;
export const PERIOD_STEPS = 56;

const K = 0.02; // corrente injetada por px de deslocamento da carga
const PULSE_AMP = 70;
const SINE_AMP = 55;
const MAX_OFF = 110;
const OMEGA2 = (2 * Math.PI / 90) ** 2; // mola do receptor
const DAMP = 0.07;
const GAIN = 5;

/**
 * Carga-fonte (movida à mão, em pulso ou em onda contínua) → campo 1D → carga-receptora
 * presa a uma mola. A carga é sempre puxada de volta ao eixo: o deslocamento total é zero,
 * então sobra só a onda, sem campo estático.
 */
export class WaveSim {
  readonly wave = new Wave1D(CELLS);
  off = 0; // deslocamento vertical da fonte (px, + para baixo)
  recvY = 0;
  recvV = 0;
  continuous = false;
  /** Com `false`, vale só o Ampère antigo: o campo elétrico que varia não gera magnetismo. */
  maxwell = true;
  dragging = false;
  pointerOff = 0;
  private simT = 0;
  private pulse = -1;

  /** Reinicia a onda e as cargas. */
  clear() {
    this.wave.clear();
    this.off = this.recvY = this.recvV = this.pointerOff = 0;
    this.pulse = -1;
    this.simT = 0;
  }

  setContinuous(on: boolean) {
    this.continuous = on;
    if (on) {
      const a = Math.asin(Math.max(-1, Math.min(1, -this.off / SINE_AMP)));
      this.simT = (a / (2 * Math.PI)) * PERIOD_STEPS;
    }
  }

  /** Liga ou desliga o termo de Maxwell (recomeça a onda, para não herdar o que já viajava). */
  setMaxwell(on: boolean) {
    this.maxwell = on;
    this.wave.clear();
    this.recvY = this.recvV = 0;
  }

  firePulse() {
    this.pulse = 0;
  }

  /**
   * Sem o termo de Maxwell, o B de uma corrente aparece em todo lugar ao mesmo tempo
   * (proporcional à corrente de agora), e nenhum E se propaga: não existe onda.
   */
  private instantField(current: number) {
    const { e, b, n } = this.wave;
    e.fill(0);
    for (let i = 0; i < n; i++) b[i] = i === SRC_CELL ? 0 : (i < SRC_CELL ? 0.5 : -0.5) * current;
  }

  /** Avança `steps` passos de simulação. */
  advance(steps: number) {
    for (let i = 1; i <= steps; i++) {
      let next: number;
      if (this.dragging) next = this.off + (this.pointerOff - this.off) / (steps - i + 1);
      else if (this.pulse >= 0) {
        next = PULSE_AMP * Math.exp(-(((this.pulse - 22) / 7) ** 2));
        if (++this.pulse > 70) this.pulse = -1;
      } else if (this.continuous) {
        this.simT++;
        next = -SINE_AMP * Math.sin((2 * Math.PI * this.simT) / PERIOD_STEPS);
      } else next = this.off * 0.95;
      const current = K * (next - this.off);
      if (this.maxwell) this.wave.step(SRC_CELL, current);
      else this.instantField(current);
      this.off = next;

      const e = this.wave.e[RECV_CELL];
      this.recvV += GAIN * e * -1 - OMEGA2 * this.recvY - DAMP * this.recvV;
      this.recvY = Math.max(-MAX_OFF, Math.min(MAX_OFF, this.recvY + this.recvV));
    }
  }
}

export { MAX_OFF };
