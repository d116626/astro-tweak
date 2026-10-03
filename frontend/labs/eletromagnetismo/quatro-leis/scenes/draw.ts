import { arrowPoints, type Pt } from "@/labs/eletromagnetismo/quatro-leis/lib/field";
import { COLORS } from "@/labs/eletromagnetismo/quatro-leis/scenes/base";

export function arrowHead(ctx: CanvasRenderingContext2D, p: Pt, angle: number, size: number) {
  ctx.beginPath();
  ctx.moveTo(p.x + Math.cos(angle) * size, p.y + Math.sin(angle) * size);
  ctx.lineTo(p.x + Math.cos(angle + 2.5) * size, p.y + Math.sin(angle + 2.5) * size);
  ctx.lineTo(p.x + Math.cos(angle - 2.5) * size, p.y + Math.sin(angle - 2.5) * size);
  ctx.closePath();
  ctx.fill();
}

/** Linhas de campo com setas ao longo do caminho. */
export function strokeFieldLines(
  ctx: CanvasRenderingContext2D,
  lines: Pt[][],
  color: string,
  width = 1.4,
) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = "round";
  for (const line of lines) {
    ctx.beginPath();
    ctx.moveTo(line[0].x, line[0].y);
    for (let i = 1; i < line.length; i++) ctx.lineTo(line[i].x, line[i].y);
    ctx.stroke();
    for (const a of arrowPoints(line)) arrowHead(ctx, a.p, a.angle, 5);
  }
}

export function chargeDot(ctx: CanvasRenderingContext2D, x: number, y: number, q: number, r = 13) {
  const color = q > 0 ? COLORS.plus : COLORS.minus;
  const glow = ctx.createRadialGradient(x, y, r * 0.4, x, y, r * 2.6);
  glow.addColorStop(0, color + "88");
  glow.addColorStop(1, color + "00");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, r * 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(x - r * 0.45, y);
  ctx.lineTo(x + r * 0.45, y);
  if (q > 0) {
    ctx.moveTo(x, y - r * 0.45);
    ctx.lineTo(x, y + r * 0.45);
  }
  ctx.stroke();
}

/** Ímã de barra horizontal (no referencial local, N à direita); gire o contexto antes. */
export function barMagnet(ctx: CanvasRenderingContext2D, half: number, thick: number) {
  const t = thick / 2;
  ctx.fillStyle = COLORS.minus;
  ctx.fillRect(-half, -t, half, thick);
  ctx.fillStyle = COLORS.plus;
  ctx.fillRect(0, -t, half, thick);
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-half, -t, half * 2, thick);
  ctx.fillStyle = "#fff";
  ctx.font = "600 13px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("S", -half / 2, 0);
  ctx.fillText("N", half / 2, 0);
}

export function hudText(
  ctx: CanvasRenderingContext2D,
  lines: { text: string; size?: number; color?: string; weight?: number }[],
  x: number,
  y: number,
  align: CanvasTextAlign = "right",
) {
  ctx.textAlign = align;
  ctx.textBaseline = "top";
  let yy = y;
  for (const l of lines) {
    const size = l.size ?? 12;
    ctx.font = `${l.weight ?? 400} ${size}px system-ui, sans-serif`;
    ctx.fillStyle = l.color ?? COLORS.dim;
    ctx.fillText(l.text, x, yy);
    yy += size + 6;
  }
}

export const signed = (n: number) => (n > 0 ? "+" : n < 0 ? "−" : "") + Math.abs(n);
