import { buildLines, fieldAt, type Charge, type Pt } from "@/labs/eletromagnetismo/quatro-leis/lib/field";
import { COLORS, SceneBase } from "@/labs/eletromagnetismo/quatro-leis/scenes/base";
import {
  arrowHead,
  barMagnet,
  hudText,
  strokeFieldLines,
} from "@/labs/eletromagnetismo/quatro-leis/scenes/draw";

type Magnet = { x: number; y: number; a: number; half: number; tx: number; ty: number };
type Drag = { kind: "move"; i: number; dx: number; dy: number } | { kind: "turn"; i: number; off: number };
export type MagnetTool = "mover" | "cortar";

const THICK = 24;
const MIN_HALF = 15;
const MAX_MAGNETS = 12;
const TIP = 20;
const NEEDLE_GAP = 58;

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

  protected layout() {
    this.magnets = [this.make(this.w / 2, this.h / 2, 0, Math.min(90, this.w * 0.14))];
    this.dirty = true;
  }

  protected rescale(sx: number, sy: number) {
    for (const m of this.magnets) {
      m.x *= sx;
      m.y *= sy;
      m.tx *= sx;
      m.ty *= sy;
    }
    this.dirty = true;
  }

  private make(x: number, y: number, a: number, half: number): Magnet {
    return { x, y, a, half, tx: x, ty: y };
  }

  setTool(t: MagnetTool) {
    this.tool = t;
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
    a.tx = a.x - ux * 14;
    a.ty = a.y - uy * 14;
    b.tx = b.x + ux * 14;
    b.ty = b.y + uy * 14;
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
      m.x = m.tx = Math.min(this.w - 10, Math.max(10, p.x + d.dx));
      m.y = m.ty = Math.min(this.h - 10, Math.max(10, p.y + d.dy));
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
    return this.magnets.flatMap((m) => {
      const ux = Math.cos(m.a) * m.half;
      const uy = Math.sin(m.a) * m.half;
      return [
        { x: m.x + ux, y: m.y + uy, q: 1 },
        { x: m.x - ux, y: m.y - uy, q: -1 },
      ];
    });
  }

  private inBody(x: number, y: number) {
    return this.magnets.some((m) => {
      const l = this.local(m, { x, y });
      return Math.abs(l.x) <= m.half + 6 && Math.abs(l.y) <= THICK / 2 + 6;
    });
  }

  protected render(ctx: CanvasRenderingContext2D, dt: number) {
    for (const m of this.magnets) {
      const k = Math.min(1, dt * 9);
      if (Math.abs(m.tx - m.x) > 0.1 || Math.abs(m.ty - m.y) > 0.1) {
        m.x += (m.tx - m.x) * k;
        m.y += (m.ty - m.y) * k;
        this.dirty = true;
      }
    }
    const poles = this.poles();
    if (this.dirty) {
      this.lines = buildLines(poles, { w: this.w, h: this.h });
      this.dirty = false;
    }

    // agulhas de bússola
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

    strokeFieldLines(ctx, this.lines, "rgba(255,176,72,0.55)", 1.2);

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
