import type { Charge, Pt } from "@/labs/eletromagnetismo/quatro-leis/lib/field";

export const THICK = 24;

export type Magnet = {
  x: number;
  y: number;
  a: number;
  half: number;
  vx: number;
  vy: number;
  w: number;
};

const SOFT2 = 20 * 20; // suavização da força entre polos (px²)
const FORCE = 42000; // força entre polos → aceleração (px/s² por 1/px)
const CONTACT = 2400; // aceleração de contato quando dois ímãs se tocam
const FRICTION = 5; // atrito com a mesa (1/s)
const SPIN_FRICTION = 6;
const MAX_V = 420;
const MAX_W = 9;
const SAMPLES = [-0.9, -0.45, 0, 0.45, 0.9];

export const polesOf = (m: Magnet): Charge[] => {
  const ux = Math.cos(m.a) * m.half;
  const uy = Math.sin(m.a) * m.half;
  return [
    { x: m.x + ux, y: m.y + uy, q: 1 },
    { x: m.x - ux, y: m.y - uy, q: -1 },
  ];
};

type Load = { fx: number; fy: number; torque: number };

const push = (load: Load, m: Magnet, at: Pt, fx: number, fy: number) => {
  load.fx += fx;
  load.fy += fy;
  load.torque += (at.x - m.x) * fy - (at.y - m.y) * fx;
};

/**
 * Um passo de física dos ímãs: polos iguais se repelem, opostos se atraem (1/r, como o campo),
 * e dois ímãs nunca se atravessam. `held` é o ímã preso pela mão (não se move sozinho).
 */
export function stepMagnets(magnets: Magnet[], h: number, forces: boolean, held: number) {
  const loads: Load[] = magnets.map(() => ({ fx: 0, fy: 0, torque: 0 }));
  const poles = magnets.map(polesOf);

  for (let i = 0; i < magnets.length; i++) {
    for (let j = i + 1; j < magnets.length; j++) {
      if (forces) {
        for (const pi of poles[i]) {
          for (const pj of poles[j]) {
            const dx = pi.x - pj.x;
            const dy = pi.y - pj.y;
            const k = (FORCE * pi.q * pj.q) / (dx * dx + dy * dy + SOFT2);
            push(loads[i], magnets[i], pi, k * dx, k * dy);
            push(loads[j], magnets[j], pj, -k * dx, -k * dy);
          }
        }
      }
      // contato: pontos ao longo dos eixos que ficam mais perto que a espessura se afastam
      for (const si of SAMPLES) {
        const pi = { x: magnets[i].x + Math.cos(magnets[i].a) * magnets[i].half * si, y: magnets[i].y + Math.sin(magnets[i].a) * magnets[i].half * si };
        for (const sj of SAMPLES) {
          const pj = { x: magnets[j].x + Math.cos(magnets[j].a) * magnets[j].half * sj, y: magnets[j].y + Math.sin(magnets[j].a) * magnets[j].half * sj };
          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;
          const d = Math.hypot(dx, dy);
          if (d >= THICK || d < 1e-6) continue;
          const k = (CONTACT * (THICK - d)) / THICK / d;
          push(loads[i], magnets[i], pi, k * dx, k * dy);
          push(loads[j], magnets[j], pj, -k * dx, -k * dy);
        }
      }
    }
  }

  magnets.forEach((m, i) => {
    if (i === held) {
      m.vx = m.vy = m.w = 0;
      return;
    }
    const inertia = (m.half * m.half) / 3 + 80;
    m.vx += loads[i].fx * h;
    m.vy += loads[i].fy * h;
    m.w += ((loads[i].torque * 14) / inertia) * h;
    const f = Math.exp(-FRICTION * h);
    m.vx *= f;
    m.vy *= f;
    m.w *= Math.exp(-SPIN_FRICTION * h);
    const v = Math.hypot(m.vx, m.vy);
    if (v > MAX_V) {
      m.vx *= MAX_V / v;
      m.vy *= MAX_V / v;
    }
    m.w = Math.max(-MAX_W, Math.min(MAX_W, m.w));
    m.x += m.vx * h;
    m.y += m.vy * h;
    m.a += m.w * h;
  });
}
