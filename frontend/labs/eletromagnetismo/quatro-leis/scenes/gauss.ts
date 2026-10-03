import {
  buildLines,
  countCrossings,
  type Charge,
  type Pt,
} from "@/labs/eletromagnetismo/quatro-leis/lib/field";
import { COLORS, SceneBase } from "@/labs/eletromagnetismo/quatro-leis/scenes/base";
import {
  chargeDot,
  hudText,
  signed,
  strokeFieldLines,
} from "@/labs/eletromagnetismo/quatro-leis/scenes/draw";

const MAX_CHARGES = 8;
const GRAB = 20;

type Drag =
  | { kind: "charge"; i: number; dx: number; dy: number }
  | { kind: "move"; dx: number; dy: number }
  | { kind: "size" };

/** Lei de Gauss: as linhas que saem de uma bolha contam a carga que está dentro. */
export class GaussScene extends SceneBase {
  private charges: Charge[] = [];
  private bubble = { x: 0, y: 0, r: 70 };
  private bubbleOn = true;
  private lines: Pt[][] = [];
  private dirty = true;
  private drag: Drag | null = null;
  private hover = "default";

  protected layout() {
    const m = Math.min(this.w, this.h);
    this.charges = [
      { x: this.w * 0.36, y: this.h * 0.5, q: 1 },
      { x: this.w * 0.64, y: this.h * 0.5, q: -1 },
    ];
    this.bubble = { x: this.w * 0.36, y: this.h * 0.5, r: m * 0.15 };
  }

  protected rescale(sx: number, sy: number) {
    for (const c of this.charges) {
      c.x *= sx;
      c.y *= sy;
    }
    this.bubble.x *= sx;
    this.bubble.y *= sy;
    this.bubble.r *= Math.min(sx, sy);
    this.dirty = true;
  }

  addCharge(q: 1 | -1) {
    if (this.charges.length >= MAX_CHARGES) return;
    const m = Math.min(this.w, this.h);
    const n = this.charges.length;
    const a = n * 2.4;
    const r = m * (0.1 + 0.025 * n);
    this.charges.push({
      x: Math.min(this.w - 20, Math.max(20, this.w / 2 + Math.cos(a) * r)),
      y: Math.min(this.h - 20, Math.max(20, this.h / 2 + Math.sin(a) * r)),
      q,
    });
    this.dirty = true;
  }

  undo() {
    this.charges.pop();
    this.dirty = true;
  }

  reset() {
    this.layout();
    this.dirty = true;
  }

  toggleBubble() {
    this.bubbleOn = !this.bubbleOn;
  }

  pointerDown(p: Pt) {
    let best = -1;
    let bestD = GRAB;
    this.charges.forEach((c, i) => {
      const d = Math.hypot(p.x - c.x, p.y - c.y);
      if (d <= bestD) {
        best = i;
        bestD = d;
      }
    });
    if (best >= 0) {
      const c = this.charges[best];
      this.drag = { kind: "charge", i: best, dx: c.x - p.x, dy: c.y - p.y };
      return;
    }
    if (!this.bubbleOn) return;
    const b = this.bubble;
    const d = Math.hypot(p.x - b.x, p.y - b.y);
    if (Math.abs(d - b.r) < 16) this.drag = { kind: "size" };
    else if (d < b.r) this.drag = { kind: "move", dx: b.x - p.x, dy: b.y - p.y };
  }

  pointerMove(p: Pt, pressed: boolean) {
    const d = this.drag;
    if (!pressed || !d) {
      this.hover = this.hitCursor(p);
      return;
    }
    if (d.kind === "charge") {
      const c = this.charges[d.i];
      c.x = Math.min(this.w - 8, Math.max(8, p.x + d.dx));
      c.y = Math.min(this.h - 8, Math.max(8, p.y + d.dy));
      this.dirty = true;
    } else if (d.kind === "move") {
      this.bubble.x = p.x + d.dx;
      this.bubble.y = p.y + d.dy;
    } else {
      const max = Math.min(this.w, this.h) * 0.45;
      this.bubble.r = Math.min(max, Math.max(25, Math.hypot(p.x - this.bubble.x, p.y - this.bubble.y)));
    }
  }

  pointerUp() {
    this.drag = null;
  }

  private hitCursor(p: Pt) {
    if (this.charges.some((c) => Math.hypot(p.x - c.x, p.y - c.y) <= GRAB)) return "grab";
    if (!this.bubbleOn) return "default";
    const d = Math.hypot(p.x - this.bubble.x, p.y - this.bubble.y);
    if (Math.abs(d - this.bubble.r) < 16) return "nwse-resize";
    return d < this.bubble.r ? "move" : "default";
  }

  cursor() {
    return this.drag ? (this.drag.kind === "size" ? "nwse-resize" : "grabbing") : this.hover;
  }

  protected render(ctx: CanvasRenderingContext2D) {
    if (this.dirty) {
      this.lines = buildLines(this.charges, { w: this.w, h: this.h });
      this.dirty = false;
    }
    const b = this.bubble;

    if (this.bubbleOn) {
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    }
    strokeFieldLines(ctx, this.lines, "rgba(255,176,72,0.8)");
    for (const c of this.charges) chargeDot(ctx, c.x, c.y, c.q);

    if (!this.bubbleOn) {
      hudText(ctx, [{ text: "Ligue a bolha para contar as linhas.", size: 12 }], this.w - 16, 16);
      return;
    }

    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 6]);
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    const hx = b.x + Math.cos(-0.785) * b.r;
    const hy = b.y + Math.sin(-0.785) * b.r;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(hx, hy, 5, 0, Math.PI * 2);
    ctx.fill();

    const inside = this.charges.reduce(
      (s, c) => s + (Math.hypot(c.x - b.x, c.y - b.y) < b.r ? c.q : 0),
      0,
    );
    const { out, in: inn } = countCrossings(this.lines, b.x, b.y, b.r);
    hudText(
      ctx,
      [
        { text: "CARGA DENTRO DA BOLHA", size: 10, color: COLORS.dim },
        {
          text: signed(inside),
          size: 44,
          weight: 600,
          color: inside > 0 ? COLORS.plus : inside < 0 ? COLORS.minus : COLORS.text,
        },
        { text: `${out} linhas saem · ${inn} entram`, size: 13, color: COLORS.text },
        { text: `saem − entram = ${signed(out - inn)}`, size: 12, color: COLORS.dim },
      ],
      this.w - 16,
      16,
    );
  }
}
