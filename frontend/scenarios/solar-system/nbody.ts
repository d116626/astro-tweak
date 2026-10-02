/**
 * Gravidade de N corpos (Sol + planetas), sem UI.
 * Unidades: UA, dias e massas solares. Referencial da cena (y para cima).
 * Integrador leapfrog (simplético): conserva bem a energia em órbitas longas.
 */
import { planetStateAu, SOLAR, daysSinceJ2000, type Vec3 } from "./orbits";

/** G·M_sol em UA³/dia² (constante gaussiana de Gauss ao quadrado). */
export const GM_SUN = 0.01720209895 ** 2;
const AU_KM = 149_597_870.7;
/** Evita singularidades em encontros muito próximos (UA²). */
const SOFTENING2 = 1e-8;
const SUN_ABSORB_AU = SOLAR.sunRadiusKm / AU_KM;
const EJECT_AU = 200;
const MAX_STEP_DAYS = 0.25;

export type LostReason = "sun" | "ejected";

export type Body = {
  id: string;
  /** Em massas solares. */
  mass: number;
  pos: Vec3;
  vel: Vec3;
  lost: LostReason | null;
};

/** Índice 0 é o Sol. */
export type NBodyState = Body[];

/** Massas em kg -> massas solares. */
export const kgToSolar = (kg: number) => kg / SOLAR.sunMassKg;

// --- vetores ---
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a: Vec3) => Math.hypot(a[0], a[1], a[2]);
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

/** Rodrigues: gira `v` em torno do eixo unitário `k`. */
function rotate(v: Vec3, k: Vec3, angle: number): Vec3 {
  const [c, s] = [Math.cos(angle), Math.sin(angle)];
  return add(
    add(mul(v, c), mul(cross(k, v), s)),
    mul(k, dot(k, v) * (1 - c)),
  );
}

/** Estado inicial: planetas reais em `date`, com o centro de massa parado na origem. */
export function initialState(date: Date): NBodyState {
  const days = daysSinceJ2000(date);
  const helio = SOLAR.planets.map((p) => ({
    p,
    ...planetStateAu(p, days, GM_SUN),
  }));
  const total = 1 + helio.reduce((sum, h) => sum + kgToSolar(h.p.massKg), 0);
  let pos: Vec3 = [0, 0, 0];
  let vel: Vec3 = [0, 0, 0];
  for (const h of helio) {
    const m = kgToSolar(h.p.massKg);
    pos = sub(pos, mul(h.pos, m / total));
    vel = sub(vel, mul(h.vel, m / total));
  }
  const sun: Body = { id: "sun", mass: 1, pos, vel, lost: null };
  const planets: Body[] = helio.map((h) => ({
    id: h.p.id,
    mass: kgToSolar(h.p.massKg),
    pos: add(pos, h.pos),
    vel: add(vel, h.vel),
    lost: null,
  }));
  return [sun, ...planets];
}

const accel = (bodies: NBodyState): Vec3[] =>
  bodies.map((bi) => {
    const a: Vec3 = [0, 0, 0];
    if (bi.lost) return a;
    for (const bj of bodies) {
      if (bj === bi || bj.lost) continue;
      const d = sub(bj.pos, bi.pos);
      const r2 = dot(d, d) + SOFTENING2;
      const k = (GM_SUN * bj.mass) / (r2 * Math.sqrt(r2));
      a[0] += d[0] * k;
      a[1] += d[1] * k;
      a[2] += d[2] * k;
    }
    return a;
  });

function stepOnce(bodies: NBodyState, dt: number) {
  let a = accel(bodies);
  bodies.forEach((b, i) => {
    if (!b.lost) b.vel = add(b.vel, mul(a[i], dt / 2));
  });
  bodies.forEach((b) => {
    if (!b.lost) b.pos = add(b.pos, mul(b.vel, dt));
  });
  a = accel(bodies);
  bodies.forEach((b, i) => {
    if (!b.lost) b.vel = add(b.vel, mul(a[i], dt / 2));
  });
}

/** Avança `days` dias. Devolve os corpos que se perderam (engolidos pelo Sol ou ejetados). */
export function advance(bodies: NBodyState, days: number): Body[] {
  const steps = Math.min(Math.max(1, Math.ceil(days / MAX_STEP_DAYS)), 400);
  const dt = days / steps;
  const lost: Body[] = [];
  for (let s = 0; s < steps; s++) {
    stepOnce(bodies, dt);
    const sun = bodies[0];
    for (const b of bodies.slice(1)) {
      if (b.lost) continue;
      const r = len(sub(b.pos, sun.pos));
      if (r < SUN_ABSORB_AU) b.lost = "sun";
      else if (r > EJECT_AU || Number.isNaN(r)) b.lost = "ejected";
      else continue;
      lost.push(b);
    }
  }
  return lost;
}

// --- órbita osculadora (a órbita que o corpo seguiria se só o Sol atuasse) ---

type Relative = { r: Vec3; v: Vec3; mu: number };

function relative(bodies: NBodyState, id: string): Relative | null {
  const b = bodies.find((x) => x.id === id);
  if (!b || b.lost) return null;
  return {
    r: sub(b.pos, bodies[0].pos),
    v: sub(b.vel, bodies[0].vel),
    mu: GM_SUN * (1 + b.mass),
  };
}

const semiMajor = ({ r, v, mu }: Relative) =>
  1 / (2 / len(r) - dot(v, v) / mu);

/** Posição heliocêntrica (UA) do corpo `id`, ou null se foi perdido. */
export function heliocentric(bodies: NBodyState, id: string): Vec3 | null {
  const rel = relative(bodies, id);
  return rel ? rel.r : null;
}

/** Pontos (UA, heliocêntricos) da elipse osculadora, ou null se a órbita não for ligada. */
export function orbitEllipse(
  bodies: NBodyState,
  id: string,
  segments = 128,
): Vec3[] | null {
  const rel = relative(bodies, id);
  if (!rel) return null;
  const { r, v, mu } = rel;
  const h = cross(r, v);
  const eVec = sub(mul(cross(v, h), 1 / mu), mul(r, 1 / len(r)));
  const e = len(eVec);
  const a = semiMajor(rel);
  if (!(a > 0) || e >= 1) return null;
  const P = e > 1e-9 ? mul(eVec, 1 / e) : mul(r, 1 / len(r));
  const Q = cross(mul(h, 1 / len(h)), P);
  const p = a * (1 - e * e);
  return Array.from({ length: segments }, (_, i) => {
    const nu = (i / segments) * Math.PI * 2;
    const rr = p / (1 + e * Math.cos(nu));
    return add(mul(P, rr * Math.cos(nu)), mul(Q, rr * Math.sin(nu)));
  });
}

// --- edição de parâmetros em tempo real ---

export function setMass(bodies: NBodyState, id: string, mass: number) {
  const b = bodies.find((x) => x.id === id);
  if (b) b.mass = mass;
}

/** Aplica uma transformação ao estado heliocêntrico do corpo. */
function transform(
  bodies: NBodyState,
  id: string,
  fn: (rel: Relative) => { r: Vec3; v: Vec3 },
) {
  const b = bodies.find((x) => x.id === id);
  const rel = relative(bodies, id);
  if (!b || !rel) return;
  const { r, v } = fn(rel);
  b.pos = add(bodies[0].pos, r);
  b.vel = add(bodies[0].vel, v);
}

/**
 * Muda o semieixo maior preservando a forma da órbita: escalar r por λ e v por λ^-1/2
 * multiplica `a` por λ e mantém excentricidade e orientação.
 */
export function setSemiMajorAxis(bodies: NBodyState, id: string, au: number) {
  transform(bodies, id, (rel) => {
    const a = semiMajor(rel);
    if (a > 0) {
      const lambda = au / a;
      return { r: mul(rel.r, lambda), v: mul(rel.v, 1 / Math.sqrt(lambda)) };
    }
    // Órbita aberta: recomeça circular no mesmo plano.
    const r = mul(rel.r, au / len(rel.r));
    const h = cross(rel.r, rel.v);
    const dir = cross(mul(h, 1 / len(h)), mul(rel.r, 1 / len(rel.r)));
    return { r, v: mul(dir, Math.sqrt(rel.mu / au)) };
  });
}

/** Inclinação da órbita em relação à eclíptica (graus, 0..180). */
export function inclinationDeg(bodies: NBodyState, id: string): number | null {
  const rel = relative(bodies, id);
  if (!rel) return null;
  const h = cross(rel.r, rel.v);
  return (Math.acos(h[1] / len(h)) * 180) / Math.PI;
}

/** Gira a órbita em torno da linha dos nós até a inclinação desejada. */
export function setInclination(bodies: NBodyState, id: string, deg: number) {
  const current = inclinationDeg(bodies, id);
  if (current === null) return;
  transform(bodies, id, ({ r, v }) => {
    const h = cross(r, v);
    const node = cross([0, 1, 0], h);
    const axis: Vec3 = len(node) < 1e-12 * len(h) ? [1, 0, 0] : mul(node, 1 / len(node));
    const delta = ((deg - current) * Math.PI) / 180;
    return { r: rotate(r, axis, delta), v: rotate(v, axis, delta) };
  });
}
