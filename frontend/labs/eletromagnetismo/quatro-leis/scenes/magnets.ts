import { buildLines, fieldAt, type Charge, type Pt } from "@/labs/eletromagnetismo/quatro-leis/lib/field";
import {
  polesOf,
  stepMagnets,
  THICK,
  type Magnet,
} from "@/labs/eletromagnetismo/quatro-leis/lib/magnetsim";
import { COLORS, SceneBase } from "@/labs/eletromagnetismo/quatro-leis/scenes/base";
import {
  arrowHead,
  barMagnet,
  hudText,
  strokeFieldLines,
} from "@/labs/eletromagnetismo/quatro-leis/scenes/draw";

type Drag = { kind: "move"; i: number; dx: number; dy: number } | { kind: "turn"; i: number; off: number };
export type MagnetTool = "mover" | "cortar";

const MIN_HALF = 15;
const MAX_MAGNETS = 12;
const TIP = 20;
const NEEDLE_GAP = 58;
const FILING_GAP = 15;
const FILING_LEN = 4.5;

/** Rampa da intensidade do campo (fraco → forte): azul-acinzentado, azul, ciano, branco-quente. */
const RAMP: [number, number, number][] = [
  [74, 93, 146],
  [63, 143, 216],
  [72, 200, 255],
  [255, 241, 201],
];
const B_WEAK = 0.0006; // |B| (unidades do campo) que vira a cor mais fraca
const B_STRONG = 0.03; // ...e a mais forte, colado num polo
const BANDS = 8;

const rampColor = (t: number) => {
  const x = t * (RAMP.length - 1);
  const i = Math.min(RAMP.length - 2, Math.floor(x));
  const f = x - i;
  const c = RAMP[i].map((v, k) => Math.round(v + (RAMP[i + 1][k] - v) * f));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};
const BAND_COLORS = Array.from({ length: BANDS }, (_, b) => rampColor(b / (BANDS - 1)));

/** Sem monopolo: cortar um ímã nunca separa os polos, só cria um ímã novo. */
export class MagnetsScene extends SceneBase {
  private magnets: Magnet[] = [];
  private tool: MagnetTool = "mover";
  private drag: Drag | null = null;
  private lines: Pt[][] = [];
  private dirty = true;
  private hover = "default";
  private notice = "";
  private noticeT = 0;
  private forces = false;
  private filings = true;
  private fx = new Float32Array(0);
  private fy = new Float32Array(0);
  private fa = new Float32Array(0);

  protected layout() {
    this.magnets = [this.make(this.w / 2, this.h / 2, 0, Math.min(90, this.w * 0.14))];
    this.dirty = true;
    this.scatterFilings();
  }

  protected rescale(sx: number, sy: number) {
    for (const m of this.magnets) {
      m.x *= sx;
      m.y *= sy;
    }
    this.dirty = true;
    this.scatterFilings();
  }

  /** Limalha: grade com tremida, orientações sorteadas (sempre o mesmo sorteio). */
  private scatterFilings() {
    const cols = Math.ceil(this.w / FILING_GAP);
    const rows = Math.ceil(this.h / FILING_GAP);
    const n = cols * rows;
    this.fx = new Float32Array(n);
    this.fy = new Float32Array(n);
    this.fa = new Float32Array(n);
    let seed = 12345;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    for (let i = 0; i < n; i++) {
      this.fx[i] = (i % cols) * FILING_GAP + rnd() * FILING_GAP;
      this.fy[i] = Math.floor(i / cols) * FILING_GAP + rnd() * FILING_GAP;
      this.fa[i] = rnd() * Math.PI;
    }
  }

  private make(x: number, y: number, a: number, half: number): Magnet {
    return { x, y, a, half, vx: 0, vy: 0, w: 0 };
  }

  setTool(t: MagnetTool) {
    this.tool = t;
  }

  setForces(on: boolean) {
    this.forces = on;
  }

  setFilings(on: boolean) {
    this.filings = on;
  }

  reset() {
    this.layout();
  }

  get count() {
    return this.magnets.length;
  }

  private local(m: Magnet, p: Pt): Pt {
    const dx = p.x - m.x;
    const dy = p.y - m.y;
    const c = Math.cos(m.a);
    const s = Math.sin(m.a);
    return { x: dx * c + dy * s, y: -dx * s + dy * c };
  }

  private hit(p: Pt): number {
    for (let i = this.magnets.length - 1; i >= 0; i--) {
      const m = this.magnets[i];
      const l = this.local(m, p);
      if (Math.abs(l.x) <= m.half + 8 && Math.abs(l.y) <= THICK / 2 + 8) return i;
    }
    return -1;
  }

  private cut(i: number, p: Pt) {
    const m = this.magnets[i];
    const lx = this.local(m, p).x;
    if (this.magnets.length >= MAX_MAGNETS) return this.say("Já são ímãs demais, recomece.");
    const h1 = (m.half + lx) / 2;
    const h2 = (m.half - lx) / 2;
    if (h1 < MIN_HALF || h2 < MIN_HALF) return this.say("Pedaço pequeno demais, corte mais perto do meio.");
    const ux = Math.cos(m.a);
    const uy = Math.sin(m.a);
    const c1 = (lx - m.half) / 2;
    const c2 = (lx + m.half) / 2;
    const a = this.make(m.x + ux * c1, m.y + uy * c1, m.a, h1);
    const b = this.make(m.x + ux * c2, m.y + uy * c2, m.a, h2);
    a.vx = -ux * 80;
    a.vy = -uy * 80;
    b.vx = ux * 80;
    b.vy = uy * 80;
    this.magnets.splice(i, 1, a, b);
    this.dirty = true;
  }

  private say(text: string) {
    this.notice = text;
    this.noticeT = 2.4;
  }

  pointerDown(p: Pt) {
    const i = this.hit(p);
    if (i < 0) return;
    if (this.tool === "cortar") return this.cut(i, p);
    const m = this.magnets[i];
    const l = this.local(m, p);
    if (Math.abs(Math.abs(l.x) - m.half) < TIP && Math.abs(l.x) > m.half * 0.4) {
      // o lado agarrado define de que ponta se gira
      const side = l.x > 0 ? 0 : Math.PI;
      this.drag = { kind: "turn", i, off: m.a - (Math.atan2(p.y - m.y, p.x - m.x) - side) };
    } else {
      this.drag = { kind: "move", i, dx: m.x - p.x, dy: m.y - p.y };
    }
  }

  pointerMove(p: Pt, pressed: boolean) {
    const d = this.drag;
    if (!pressed || !d) {
      this.hover = this.hoverCursor(p);
      return;
    }
    const m = this.magnets[d.i];
    if (d.kind === "move") {
      m.x = Math.min(this.w - 10, Math.max(10, p.x + d.dx));
      m.y = Math.min(this.h - 10, Math.max(10, p.y + d.dy));
    } else {
      const grabbedSouth = Math.cos(m.a - d.off) * (p.x - m.x) + Math.sin(m.a - d.off) * (p.y - m.y) < 0;
      const side = grabbedSouth ? Math.PI : 0;
      m.a = Math.atan2(p.y - m.y, p.x - m.x) - side + d.off;
    }
    this.dirty = true;
  }

  pointerUp() {
    this.drag = null;
  }

  private hoverCursor(p: Pt) {
    const i = this.hit(p);
    if (i < 0) return "default";
    if (this.tool === "cortar") return "crosshair";
    const l = this.local(this.magnets[i], p);
    return Math.abs(Math.abs(l.x) - this.magnets[i].half) < TIP ? "alias" : "grab";
  }

  cursor() {
    return this.drag ? "grabbing" : this.hover;
  }

  private poles(): Charge[] {
    return this.magnets.flatMap(polesOf);
  }

  private inBody(x: number, y: number) {
    return this.magnets.some((m) => {
      const l = this.local(m, { x, y });
      return Math.abs(l.x) <= m.half + 6 && Math.abs(l.y) <= THICK / 2 + 6;
    });
  }

  protected render(ctx: CanvasRenderingContext2D, dt: number) {
    const held = this.drag ? this.drag.i : -1;
    const sub = Math.min(8, Math.max(1, Math.ceil(dt * 240)));
    for (let k = 0; k < sub; k++) stepMagnets(this.magnets, dt / sub, this.forces, held);
    for (const m of this.magnets) {
      if (m.x < 10 || m.x > this.w - 10) m.vx = 0;
      if (m.y < 10 || m.y > this.h - 10) m.vy = 0;
      m.x = Math.min(this.w - 10, Math.max(10, m.x));
      m.y = Math.min(this.h - 10, Math.max(10, m.y));
      if (Math.abs(m.vx) + Math.abs(m.vy) > 0.15 || Math.abs(m.w) > 0.01) this.dirty = true;
    }
    const poles = this.poles();
    if (this.dirty) {
      this.lines = buildLines(poles, { w: this.w, h: this.h });
      this.dirty = false;
    }

    if (this.filings) this.drawFilings(ctx, poles, dt);
    else this.drawNeedles(ctx, poles);

    strokeFieldLines(ctx, this.lines, `rgba(255,176,72,${this.filings ? 0.35 : 0.55})`, 1.2);
    this.drawMagnets(ctx);
    this.drawHud(ctx, dt);
  }

  private drawFilings(ctx: CanvasRenderingContext2D, poles: Charge[], dt: number) {
    const k = Math.min(1, dt * 12);
    const buckets: number[][] = Array.from({ length: BANDS }, () => []);
    const span = Math.log(B_STRONG / B_WEAK);
    for (let i = 0; i < this.fx.length; i++) {
      const x = this.fx[i];
      const y = this.fy[i];
      if (this.inBody(x, y)) continue;
      const f = fieldAt(poles, x, y);
      const mag = Math.hypot(f.x, f.y);
      if (mag < 1e-9) continue;
      let diff = Math.atan2(f.y, f.x) - this.fa[i];
      diff = ((((diff + Math.PI / 2) % Math.PI) + Math.PI) % Math.PI) - Math.PI / 2; // eixo, sem sentido
      this.fa[i] += diff * k;
      const t = Math.max(0, Math.min(1, Math.log(mag / B_WEAK) / span));
      buckets[Math.min(BANDS - 1, Math.floor(t * BANDS))].push(i);
    }
    ctx.lineWidth = 1.2;
    ctx.lineCap = "round";
    ctx.globalAlpha = 0.75;
    buckets.forEach((ids, b) => {
      ctx.strokeStyle = BAND_COLORS[b];
      ctx.beginPath();
      for (const i of ids) {
        const dx = Math.cos(this.fa[i]) * FILING_LEN;
        const dy = Math.sin(this.fa[i]) * FILING_LEN;
        ctx.moveTo(this.fx[i] - dx, this.fy[i] - dy);
        ctx.lineTo(this.fx[i] + dx, this.fy[i] + dy);
      }
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
    this.drawLegend(ctx);
  }

  private drawLegend(ctx: CanvasRenderingContext2D) {
    const bw = 110;
    const x = this.w - 16 - bw;
    const y = this.h - 30;
    const g = ctx.createLinearGradient(x, 0, x + bw, 0);
    BAND_COLORS.forEach((c, i) => g.addColorStop(i / (BANDS - 1), c));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(x, y, bw, 5, 3);
    ctx.fill();
    hudText(ctx, [{ text: "campo fraco", size: 10 }], x, y + 9, "left");
    hudText(ctx, [{ text: "forte", size: 10 }], x + bw, y + 9, "right");
  }

  private drawNeedles(ctx: CanvasRenderingContext2D, poles: Charge[]) {
    const cols = Math.floor(this.w / NEEDLE_GAP);
    const rows = Math.floor(this.h / NEEDLE_GAP);
    const ox = (this.w - (cols - 1) * NEEDLE_GAP) / 2;
    const oy = (this.h - (rows - 1) * NEEDLE_GAP) / 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = ox + c * NEEDLE_GAP;
        const y = oy + r * NEEDLE_GAP;
        if (this.inBody(x, y)) continue;
        const f = fieldAt(poles, x, y);
        const mag = Math.hypot(f.x, f.y);
        if (mag < 1e-9) continue;
        const ang = Math.atan2(f.y, f.x);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(ang);
        ctx.fillStyle = COLORS.plus;
        ctx.beginPath();
        ctx.moveTo(11, 0);
        ctx.lineTo(0, -3.2);
        ctx.lineTo(0, 3.2);
        ctx.fill();
        ctx.fillStyle = COLORS.minus;
        ctx.beginPath();
        ctx.moveTo(-11, 0);
        ctx.lineTo(0, -3.2);
        ctx.lineTo(0, 3.2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  private drawMagnets(ctx: CanvasRenderingContext2D) {
    for (const m of this.magnets) {
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(m.a);
      barMagnet(ctx, m.half, THICK);
      // dentro do ímã o campo volta de S para N: nenhuma linha começa ou termina
      ctx.strokeStyle = "rgba(255,255,255,0.65)";
      ctx.fillStyle = "rgba(255,255,255,0.65)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      for (const y of [-THICK / 2 - 5, THICK / 2 + 5]) {
        ctx.beginPath();
        ctx.moveTo(-m.half, y);
        ctx.lineTo(m.half - 6, y);
        ctx.stroke();
        ctx.setLineDash([]);
        arrowHead(ctx, { x: m.half - 6, y }, 0, 4);
        ctx.setLineDash([4, 3]);
      }
      ctx.setLineDash([]);
      ctx.restore();
    }
  }

  private drawHud(ctx: CanvasRenderingContext2D, dt: number) {
    const n = this.magnets.length;
    hudText(
      ctx,
      [
        { text: "POLOS NO MUNDO", size: 10 },
        { text: `${n} N · ${n} S`, size: 34, weight: 600, color: COLORS.text },
        { text: "sempre aos pares", size: 13, color: COLORS.text },
      ],
      this.w - 16,
      16,
    );

    if (this.noticeT > 0) {
      this.noticeT -= dt;
      ctx.globalAlpha = Math.min(1, this.noticeT * 2);
      hudText(ctx, [{ text: this.notice, size: 14, color: COLORS.amber }], this.w / 2, this.h - 40, "center");
      ctx.globalAlpha = 1;
    }
  }
}
