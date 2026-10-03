/**
 * Campos 2D de "cargas-linha" (a 1/r), usados nos brinquedos de Gauss e de ímãs.
 * Em 2D o campo de uma carga cai como 1/r e as linhas saem dela em todas as direções.
 * Um ímã é um par de polos de sinais opostos; o miolo do ímã (que fecha as linhas) é
 * desenhado à parte.
 */
export type Pt = { x: number; y: number };
export type Charge = Pt & { q: number };
export type Bounds = { w: number; h: number };

/** Linhas desenhadas por unidade de carga. */
export const LINES_PER_CHARGE = 10;

const CAPTURE = 9; // a linha termina ao chegar a esta distância de uma carga (px)
const SOFT2 = 16; // suavização do campo perto da carga (px²)
const STEP = 5;
const MAX_STEPS = 2500;
const MARGIN = 450; // as linhas seguem além da tela, para a contagem numa bolha grande ficar exata

export function fieldAt(charges: Charge[], x: number, y: number): Pt {
  let ex = 0;
  let ey = 0;
  for (const c of charges) {
    const dx = x - c.x;
    const dy = y - c.y;
    const r2 = dx * dx + dy * dy + SOFT2;
    ex += (c.q * dx) / r2;
    ey += (c.q * dy) / r2;
  }
  return { x: ex, y: ey };
}

type Trace = { points: Pt[]; endCharge: number };

/** Segue o campo a partir de `start` (sign +1: a favor do campo; −1: contra). */
export function traceLine(charges: Charge[], start: Pt, sign: 1 | -1, b: Bounds): Trace {
  const points: Pt[] = [start];
  let p = start;
  const dir = (at: Pt): Pt | null => {
    const f = fieldAt(charges, at.x, at.y);
    const m = Math.hypot(f.x, f.y);
    return m < 1e-9 ? null : { x: (sign * f.x) / m, y: (sign * f.y) / m };
  };
  for (let s = 0; s < MAX_STEPS; s++) {
    const d1 = dir(p);
    if (!d1) break;
    const d2 = dir({ x: p.x + (d1.x * STEP) / 2, y: p.y + (d1.y * STEP) / 2 });
    if (!d2) break;
    p = { x: p.x + d2.x * STEP, y: p.y + d2.y * STEP };
    const hit = charges.findIndex((c) => Math.hypot(p.x - c.x, p.y - c.y) < CAPTURE);
    if (hit >= 0) {
      points.push({ x: charges[hit].x, y: charges[hit].y });
      return { points, endCharge: hit };
    }
    points.push(p);
    if (p.x < -MARGIN || p.y < -MARGIN || p.x > b.w + MARGIN || p.y > b.h + MARGIN) break;
  }
  return { points, endCharge: -1 };
}

/**
 * Linhas de campo, no sentido do campo (de + para −). Cada carga positiva solta
 * `q · LINES_PER_CHARGE` linhas. Cada negativa recebe esse mesmo número: as que vêm de uma
 * positiva já foram traçadas, e só as que faltam (vindas do "infinito") partem dela, de
 * trás para frente. Assim a contagem de linhas bate sempre com a carga.
 */
export function buildLines(charges: Charge[], b: Bounds): Pt[][] {
  const lines: Pt[][] = [];
  const arrivals = new Array<number>(charges.length).fill(0);

  charges.forEach((c, ci) => {
    if (c.q <= 0) return;
    const n = Math.round(c.q * LINES_PER_CHARGE);
    for (let k = 0; k < n; k++) {
      const a = ((k + 0.5) / n) * Math.PI * 2 + ci * 0.37;
      const start = { x: c.x + Math.cos(a) * 6, y: c.y + Math.sin(a) * 6 };
      const t = traceLine(charges, start, 1, b);
      if (t.endCharge >= 0) arrivals[t.endCharge]++;
      lines.push([{ x: c.x, y: c.y }, ...t.points]);
    }
  });

  charges.forEach((c, ci) => {
    if (c.q >= 0) return;
    const n = Math.round(-c.q * LINES_PER_CHARGE);
    const missing = n - arrivals[ci];
    if (missing <= 0) return;
    const free: Pt[][] = [];
    const scan = n * 6; // varre fino: as linhas livres são poucas e podem estar entre as outras
    for (let k = 0; k < scan; k++) {
      const a = ((k + 0.5) / scan) * Math.PI * 2 + ci * 0.37;
      const start = { x: c.x + Math.cos(a) * 6, y: c.y + Math.sin(a) * 6 };
      const t = traceLine(charges, start, -1, b);
      const endsOnPositive = t.endCharge >= 0 && charges[t.endCharge].q > 0;
      if (!endsOnPositive) free.push([...t.points].reverse().concat([{ x: c.x, y: c.y }]));
    }
    for (let k = 0; k < Math.min(missing, free.length); k++) {
      lines.push(free[Math.floor(((k + 0.5) * free.length) / Math.min(missing, free.length))]);
    }
  });
  return lines;
}

/** Quantas linhas saem e quantas entram num círculo. */
export function countCrossings(lines: Pt[][], cx: number, cy: number, r: number) {
  let out = 0;
  let inn = 0;
  for (const line of lines) {
    let inside = Math.hypot(line[0].x - cx, line[0].y - cy) < r;
    for (let i = 1; i < line.length; i++) {
      const now = Math.hypot(line[i].x - cx, line[i].y - cy) < r;
      if (inside && !now) out++;
      else if (!inside && now) inn++;
      inside = now;
    }
  }
  return { out, in: inn };
}

/** Posição ao longo do caminho em que cada linha recebe uma seta (a cada `every` px). */
export function arrowPoints(line: Pt[], every = 110): { p: Pt; angle: number }[] {
  const out: { p: Pt; angle: number }[] = [];
  let acc = every / 2;
  for (let i = 1; i < line.length; i++) {
    const dx = line[i].x - line[i - 1].x;
    const dy = line[i].y - line[i - 1].y;
    acc += Math.hypot(dx, dy);
    if (acc >= every) {
      acc = 0;
      out.push({ p: line[i], angle: Math.atan2(dy, dx) });
    }
  }
  return out;
}

/**
 * Número de linhas (em unidades de LINES_PER_CHARGE) que atravessam, no sentido +x, o
 * segmento vertical x = `x`, y ∈ [y1, y2], vindas de uma carga-linha `q` em `p`.
 */
function poleFlux(q: number, p: Pt, x: number, y1: number, y2: number) {
  const d = Math.max(Math.abs(x - p.x), 1e-6);
  const side = x >= p.x ? 1 : -1;
  return ((q * side * (Math.atan((y2 - p.y) / d) - Math.atan((y1 - p.y) / d))) / (2 * Math.PI)) * LINES_PER_CHARGE;
}

/**
 * Fluxo magnético de um ímã (N em `n`, S em `s`, ambos sobre o eixo horizontal) pelo segmento
 * vertical x = `x`, y ∈ [y1, y2], no sentido +x. Os polos dão o campo de fora; dentro do ímã
 * o campo volta de S para N, o que soma uma linha inteira por polo ("degrau" que mantém o
 * fluxo contínuo e faz o total tender a zero para uma bobina enorme: ∇·B = 0).
 */
export function magnetFlux(n: Pt, s: Pt, x: number, y1: number, y2: number) {
  const outside = poleFlux(1, n, x, y1, y2) + poleFlux(-1, s, x, y1, y2);
  const between = x >= Math.min(n.x, s.x) && x < Math.max(n.x, s.x);
  const dir = n.x >= s.x ? 1 : -1;
  return outside + (between ? dir * LINES_PER_CHARGE : 0);
}
