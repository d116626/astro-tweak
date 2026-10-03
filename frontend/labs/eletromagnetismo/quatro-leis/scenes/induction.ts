import { buildLines, magnetFlux, type Pt } from "@/labs/eletromagnetismo/quatro-leis/lib/field";
import { COLORS, SceneBase } from "@/labs/eletromagnetismo/quatro-leis/scenes/base";
import { barMagnet, hudText, strokeFieldLines } from "@/labs/eletromagnetismo/quatro-leis/scenes/draw";

const HALF = 50;
const THICK = 24;
const COIL_R = 60; // meia-altura da bobina (px)
const COIL_RX = 13;
const EMF_FULL = 8; // EMF (linhas/s) em que a lâmpada chega a ~63% do brilho
const ELECTRONS = 12;
const HIST = 240; // amostras do osciloscópio (4 s a 60 por segundo)
const PHI_RANGE = 8; // linhas, para cima e para baixo
const EMF_RANGE = 30;

/** Faraday: o que acende a lâmpada é o fluxo mudando, não o ímã perto. */
export class InductionScene extends SceneBase {
  private mx = 0;
  private cy = 0;
  private coilX = 0;
  private flipped = false;
  private auto = true;
  private dragging = false;
  private grabDx = 0;
  private phase = 0;
  private prevPhi: number | null = null;
  private phi = 0;
  private emf = 0;
  private bright = 0;
  private spin = 0;
  private hover = "default";
  private histPhi = new Float32Array(HIST);
  private histEmf = new Float32Array(HIST);
  private histAcc = 0;

  protected layout() {
    this.cy = this.h * 0.4;
    this.coilX = this.w * 0.64;
    this.mx = this.w * 0.26;
    this.phase = 0;
  }

  protected rescale(sx: number, sy: number) {
    this.cy *= sy;
    this.coilX *= sx;
    this.mx *= sx;
    this.prevPhi = null;
  }

  setAuto(on: boolean) {
    this.auto = on;
    if (on) this.syncPhase();
  }

  flip() {
    this.flipped = !this.flipped;
    this.prevPhi = null;
  }

  reset() {
    this.histPhi.fill(0);
    this.histEmf.fill(0);
    this.flipped = false;
    this.layout();
    this.prevPhi = null;
  }

  private syncPhase() {
    const a = this.amp();
    this.phase = Math.asin(Math.max(-1, Math.min(1, (this.mx - this.coilX) / a)));
  }

  private amp() {
    return Math.max(40, Math.min(230, this.coilX - HALF - 20));
  }

  private onTrack(p: Pt) {
    return Math.abs(p.y - this.cy) < 42;
  }

  pointerDown(p: Pt) {
    if (!this.onTrack(p)) return;
    this.dragging = true;
    const onBody = Math.abs(p.x - this.mx) <= HALF + 6;
    this.grabDx = onBody ? this.mx - p.x : 0;
    this.pointerMove(p, true);
    if (!onBody) this.prevPhi = null; // o ímã pulou até o dedo: isso não é indução
  }

  pointerMove(p: Pt, pressed: boolean) {
    if (pressed && this.dragging) {
      this.mx = Math.min(this.w - HALF - 10, Math.max(HALF + 10, p.x + this.grabDx));
    } else {
      this.hover = this.onTrack(p) ? "ew-resize" : "default";
    }
  }

  pointerUp() {
    if (!this.dragging) return;
    this.dragging = false;
    if (this.auto) this.syncPhase();
  }

  cursor() {
    return this.dragging ? "grabbing" : this.hover;
  }

  protected render(ctx: CanvasRenderingContext2D, dt: number) {
    const cy = this.cy;
    const cx = this.coilX;
    if (this.auto && !this.dragging) {
      this.phase += dt * 2.1;
      this.mx = cx + Math.sin(this.phase) * this.amp();
    }

    const dir = this.flipped ? -1 : 1;
    const phi = magnetFlux(
      { x: this.mx + dir * HALF, y: cy },
      { x: this.mx - dir * HALF, y: cy },
      cx,
      cy - COIL_R,
      cy + COIL_R,
    );
    if (this.prevPhi !== null && dt > 1e-4) {
      const emf = -(phi - this.prevPhi) / dt;
      this.emf += (emf - this.emf) * Math.min(1, dt * 20);
    } else if (this.prevPhi === null) {
      this.emf = 0;
    }
    this.prevPhi = phi;
    this.phi = phi;
    const target = 1 - Math.exp(-Math.abs(this.emf) / EMF_FULL);
    this.bright += (target - this.bright) * Math.min(1, dt * 10);
    this.spin = (this.spin + this.emf * 0.035 * dt) % 1;

    // trilha
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.lineWidth = 2;
    ctx.setLineDash([2, 7]);
    ctx.beginPath();
    ctx.moveTo(24, cy);
    ctx.lineTo(this.w - 24, cy);
    ctx.stroke();
    ctx.setLineDash([]);

    // linhas do ímã
    const poles = [
      { x: this.mx + dir * HALF, y: cy, q: 1 },
      { x: this.mx - dir * HALF, y: cy, q: -1 },
    ];
    strokeFieldLines(ctx, buildLines(poles, { w: this.w, h: this.h }), "rgba(255,176,72,0.4)", 1.1);

    this.drawCoil(ctx, "back");
    ctx.save();
    ctx.translate(this.mx, cy);
    if (this.flipped) ctx.rotate(Math.PI);
    barMagnet(ctx, HALF, THICK);
    ctx.restore();
    this.drawCoil(ctx, "front");
    this.drawLamp(ctx);

    this.histAcc = Math.min(this.histAcc + dt, 3 / 60);
    while (this.histAcc >= 1 / 60) {
      this.histAcc -= 1 / 60;
      this.histPhi.copyWithin(0, 1);
      this.histEmf.copyWithin(0, 1);
      this.histPhi[HIST - 1] = phi;
      this.histEmf[HIST - 1] = this.emf;
    }
    this.drawScope(ctx);

    const changing = Math.abs(this.emf) > 1.5;
    hudText(
      ctx,
      [
        { text: "LINHAS PELA BOBINA", size: 10 },
        { text: phi.toFixed(1), size: 38, weight: 600, color: COLORS.text },
        {
          text: changing ? "o fluxo está mudando → corrente" : "fluxo parado → sem corrente",
          size: 13,
          color: changing ? COLORS.amber : COLORS.dim,
        },
      ],
      this.w - 16,
      16,
    );
  }

  /** Osciloscópio: o fluxo Φ e, embaixo, a tensão, que é a inclinação do fluxo. */
  private drawScope(ctx: CanvasRenderingContext2D) {
    const gw = Math.min(300, this.w * 0.46);
    const gh = 48;
    const x0 = 16;
    const trace = (
      data: Float32Array,
      range: number,
      top: number,
      color: string,
      label: string,
    ) => {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x0, top, gw, gh, 8);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.beginPath();
      ctx.moveTo(x0, top + gh / 2);
      ctx.lineTo(x0 + gw, top + gh / 2);
      ctx.stroke();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.8;
      ctx.lineJoin = "round";
      ctx.beginPath();
      for (let i = 0; i < HIST; i++) {
        const v = Math.max(-1, Math.min(1, data[i] / range));
        const px = x0 + (i / (HIST - 1)) * gw;
        const py = top + gh / 2 - v * (gh / 2 - 5);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      hudText(ctx, [{ text: label, size: 10, color: color }], x0 + 8, top + 5, "left");
    };
    const top2 = this.h - 16 - gh;
    const top1 = top2 - gh - 8;
    trace(this.histPhi, PHI_RANGE, top1, COLORS.amber, "FLUXO Φ");
    trace(this.histEmf, EMF_RANGE, top2, COLORS.cyan, "TENSÃO ε = −dΦ/dt");
  }

  private drawCoil(ctx: CanvasRenderingContext2D, part: "back" | "front") {
    const cx = this.coilX;
    ctx.lineWidth = 4;
    ctx.strokeStyle = COLORS.copper;
    for (const off of [-18, 0, 18]) {
      ctx.beginPath();
      if (part === "back") ctx.ellipse(cx + off, this.cy, COIL_RX, COIL_R, 0, Math.PI / 2, (3 * Math.PI) / 2);
      else ctx.ellipse(cx + off, this.cy, COIL_RX, COIL_R, 0, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
    }
    if (part === "front") {
      ctx.fillStyle = "#ffe9a8";
      for (let i = 0; i < ELECTRONS; i++) {
        const a = (i / ELECTRONS + this.spin) * Math.PI * 2;
        ctx.globalAlpha = Math.min(1, 0.25 + Math.abs(this.emf) / 6);
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * COIL_RX, this.cy + Math.sin(a) * COIL_R, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }

  private drawLamp(ctx: CanvasRenderingContext2D) {
    const cx = this.coilX;
    const ly = this.cy + COIL_R + 120;
    ctx.strokeStyle = COLORS.copper;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 18, this.cy + COIL_R);
    ctx.lineTo(cx - 18, ly);
    ctx.lineTo(cx - 24, ly);
    ctx.moveTo(cx + 18, this.cy + COIL_R);
    ctx.lineTo(cx + 18, ly);
    ctx.lineTo(cx + 24, ly);
    ctx.stroke();

    const b = this.bright;
    if (b > 0.02) {
      const g = ctx.createRadialGradient(cx, ly, 8, cx, ly, 40 + 90 * b);
      g.addColorStop(0, `rgba(255,224,130,${0.75 * b})`);
      g.addColorStop(1, "rgba(255,224,130,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, ly, 40 + 90 * b, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = `rgb(${60 + 195 * b},${60 + 170 * b},${50 + 90 * b})`;
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, ly, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}
