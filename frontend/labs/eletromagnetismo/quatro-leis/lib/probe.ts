import { fieldAt, type Charge, type Pt } from "@/labs/eletromagnetismo/quatro-leis/lib/field";

export type Probe = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** +1 ou −1. */
  q: number;
  trail: Pt[];
  /** Tempo de vida (s). */
  age: number;
  /** Capturada ou fora da tela: só resta o rastro sumindo. */
  dying: boolean;
  /** Segundos que faltam para o rastro sumir (só vale com `dying`). */
  fade: number;
};

const ACCEL = 24000; // campo → aceleração (px/s² por unidade de campo)
const DRAG = 0.7; // atrito leve (1/s)
const MAX_V = 520;
const CAPTURE = 10;
const MAX_AGE = 25;
const TRAIL = 80;
const FADE = 0.7;

export const newProbe = (x: number, y: number, q: number): Probe => ({
  x,
  y,
  vx: 0,
  vy: 0,
  q,
  trail: [{ x, y }],
  age: 0,
  dying: false,
  fade: FADE,
});

/**
 * Anda `h` segundos com a carga de prova: ela é empurrada pelo campo (a favor se for positiva,
 * contra se for negativa), e é capturada ao chegar numa carga de sinal oposto.
 */
export function stepProbe(p: Probe, charges: Charge[], h: number, w: number, hgt: number) {
  p.age += h;
  if (p.dying) {
    p.fade -= h;
    return;
  }
  const f = fieldAt(charges, p.x, p.y);
  p.vx += ACCEL * p.q * f.x * h;
  p.vy += ACCEL * p.q * f.y * h;
  const d = Math.exp(-DRAG * h);
  p.vx *= d;
  p.vy *= d;
  const v = Math.hypot(p.vx, p.vy);
  if (v > MAX_V) {
    p.vx *= MAX_V / v;
    p.vy *= MAX_V / v;
  }
  p.x += p.vx * h;
  p.y += p.vy * h;
  for (const c of charges) {
    if (c.q * p.q < 0 && Math.hypot(p.x - c.x, p.y - c.y) < CAPTURE) {
      p.x = c.x;
      p.y = c.y;
      p.dying = true;
      return;
    }
  }
  if (p.x < -120 || p.y < -120 || p.x > w + 120 || p.y > hgt + 120 || p.age > MAX_AGE) p.dying = true;
}

/** Guarda o ponto no rastro (chamar uma vez por quadro). */
export function trailPush(p: Probe) {
  if (p.dying) return;
  p.trail.push({ x: p.x, y: p.y });
  if (p.trail.length > TRAIL) p.trail.shift();
}

export const isDone = (p: Probe) => p.dying && p.fade <= 0;
