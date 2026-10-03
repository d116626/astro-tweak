import type { Pt } from "@/labs/eletromagnetismo/quatro-leis/lib/field";
import {
  CELLS,
  MAX_OFF,
  RECV_CELL,
  SRC_CELL,
  STEPS_PER_SEC,
  WaveSim,
} from "@/labs/eletromagnetismo/quatro-leis/lib/wavesim";
import { COLORS, SceneBase } from "@/labs/eletromagnetismo/quatro-leis/scenes/base";
import { arrowHead, chargeDot, hudText } from "@/labs/eletromagnetismo/quatro-leis/scenes/draw";

export type WaveView = "ambos" | "E" | "B";

const SCALE = 450; // px por unidade de campo
const EVERY = 5; // uma seta a cada 5 células
const GRAB = 38;
const BX = -0.62; // projeção de B (que aponta para fora da tela)
const BY = 0.46;

/** Ampère-Maxwell: E que varia faz B, B que varia faz E, e a onda anda sozinha. */
export class WaveScene extends SceneBase {
  private sim = new WaveSim();
  private view: WaveView = "ambos";
  private slow = false;
  private acc = 0;
  private grabbing = false;
  private hover = "default";

  protected layout() {}
  protected rescale() {}

  firePulse() {
    this.sim.firePulse();
  }

  setContinuous(on: boolean) {
    this.sim.setContinuous(on);
  }

  setSlow(on: boolean) {
    this.slow = on;
  }

  setView(v: WaveView) {
    this.view = v;
  }

  clear() {
    this.sim.clear();
  }

  private x(cell: number) {
    return (cell / (CELLS - 1)) * this.w;
  }

  private srcPt(): Pt {
    return { x: this.x(SRC_CELL), y: this.h / 2 + this.sim.off };
  }

  private limit(y: number) {
    return Math.max(-MAX_OFF, Math.min(MAX_OFF, y - this.h / 2));
  }

  pointerDown(p: Pt) {
    const s = this.srcPt();
    if (Math.hypot(p.x - s.x, p.y - s.y) > GRAB) return;
    this.grabbing = true;
    this.sim.dragging = true;
    this.sim.pointerOff = this.limit(p.y);
  }

  pointerMove(p: Pt, pressed: boolean) {
    if (pressed && this.grabbing) {
      this.sim.pointerOff = this.limit(p.y);
      return;
    }
    const s = this.srcPt();
    this.hover = Math.hypot(p.x - s.x, p.y - s.y) <= GRAB ? "ns-resize" : "default";
  }

  pointerUp() {
    if (!this.grabbing) return;
    this.grabbing = false;
    this.sim.dragging = false;
    if (this.sim.continuous) this.sim.setContinuous(true);
  }

  cursor() {
    return this.grabbing ? "grabbing" : this.hover;
  }

  protected render(ctx: CanvasRenderingContext2D, dt: number) {
    this.acc += dt * STEPS_PER_SEC * (this.slow ? 0.25 : 1);
    const steps = Math.min(6, Math.floor(this.acc));
    this.acc = Math.min(this.acc - steps, 1);
    if (steps > 0) this.sim.advance(steps);

    const axisY = this.h / 2;
    const { e, b } = this.sim.wave;
    const lim = this.h * 0.36;
    const showE = this.view !== "B";
    const showB = this.view !== "E";

    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, axisY);
    ctx.lineTo(this.w, axisY);
    ctx.stroke();

    const clampLen = (v: number) => Math.max(-lim, Math.min(lim, v));
    if (showB) this.drawField(ctx, b, COLORS.cyan, (v) => ({ x: BX * clampLen(v * SCALE), y: BY * clampLen(v * SCALE) }), axisY);
    if (showE) this.drawField(ctx, e, COLORS.amber, (v) => ({ x: 0, y: -clampLen(v * SCALE) }), axisY);

    // carga receptora e carga-fonte
    const rx = this.x(RECV_CELL);
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rx, axisY - MAX_OFF);
    ctx.lineTo(rx, axisY + MAX_OFF);
    ctx.stroke();
    chargeDot(ctx, rx, axisY + this.sim.recvY, -1, 11);
    const s = this.srcPt();
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.beginPath();
    ctx.moveTo(s.x, axisY - MAX_OFF);
    ctx.lineTo(s.x, axisY + MAX_OFF);
    ctx.stroke();
    chargeDot(ctx, s.x, s.y, 1, 13);

    hudText(ctx, [{ text: "ARRASTE", size: 10, color: COLORS.text }], s.x, axisY - MAX_OFF - 20, "center");
    hudText(ctx, [{ text: "RECEPTORA", size: 10 }], rx, axisY - MAX_OFF - 20, "center");

    const delay = (RECV_CELL - SRC_CELL) / STEPS_PER_SEC;
    hudText(
      ctx,
      [
        { text: "ATRASO DA LUZ", size: 10 },
        { text: `${delay.toFixed(1)} s`, size: 34, weight: 600, color: COLORS.text },
        { text: "a receptora só sente depois", size: 13, color: COLORS.text },
      ],
      this.w - 16,
      16,
    );
    hudText(
      ctx,
      [
        ...(showE ? [{ text: "● campo elétrico E", size: 12, color: COLORS.amber }] : []),
        ...(showB ? [{ text: "● campo magnético B", size: 12, color: COLORS.cyan }] : []),
      ],
      16,
      this.h - (showE && showB ? 52 : 34),
      "left",
    );
  }

  private drawField(
    ctx: CanvasRenderingContext2D,
    f: Float32Array,
    color: string,
    vec: (v: number) => Pt,
    axisY: number,
  ) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let i = 0; i < CELLS; i++) {
      const v = vec(f[i]);
      const px = this.x(i) + v.x;
      const py = axisY + v.y;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.globalAlpha = 0.85;
    ctx.stroke();
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 1.2;
    for (let i = EVERY; i < CELLS - 1; i += EVERY) {
      const v = vec(f[i]);
      const len = Math.hypot(v.x, v.y);
      if (len < 3) continue;
      const x0 = this.x(i);
      ctx.beginPath();
      ctx.moveTo(x0, axisY);
      ctx.lineTo(x0 + v.x, axisY + v.y);
      ctx.stroke();
      arrowHead(ctx, { x: x0 + v.x, y: axisY + v.y }, Math.atan2(v.y, v.x), 4.5);
    }
    ctx.globalAlpha = 1;
  }
}
