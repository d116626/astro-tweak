import { CanvasTexture, SRGBColorSpace } from "three";

/** Hash determinístico -> [0, 1). */
function hash3(x: number, y: number, z: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

const smooth = (t: number) => t * t * (3 - 2 * t);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Value noise 3D. */
function noise3(x: number, y: number, z: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fx = smooth(x - ix);
  const fy = smooth(y - iy);
  const fz = smooth(z - iz);
  const c = (dx: number, dy: number, dz: number) =>
    hash3(ix + dx, iy + dy, iz + dz);
  return mix(
    mix(mix(c(0, 0, 0), c(1, 0, 0), fx), mix(c(0, 1, 0), c(1, 1, 0), fx), fy),
    mix(mix(c(0, 0, 1), c(1, 0, 1), fx), mix(c(0, 1, 1), c(1, 1, 1), fx), fy),
    fz,
  );
}

function fbm(x: number, y: number, z: number, octaves = 5): number {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise3(x * freq, y * freq, z * freq);
    amp /= 2;
    freq *= 2;
  }
  return sum;
}

type Rgb = [number, number, number];

function paint(
  width: number,
  height: number,
  color: (x: number, y: number, z: number, lat: number) => Rgb,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(width, height);
  for (let j = 0; j < height; j++) {
    const lat = (0.5 - (j + 0.5) / height) * Math.PI;
    for (let i = 0; i < width; i++) {
      const lon = ((i + 0.5) / width) * Math.PI * 2;
      const x = Math.cos(lat) * Math.cos(lon);
      const y = Math.sin(lat);
      const z = Math.cos(lat) * Math.sin(lon);
      const [r, g, b] = color(x, y, z, lat);
      const k = (j * width + i) * 4;
      img.data[k] = r;
      img.data[k + 1] = g;
      img.data[k + 2] = b;
      img.data[k + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

function toTexture(canvas: HTMLCanvasElement): CanvasTexture {
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** Continentes e oceanos procedurais (estilizados, não são dados reais). */
export function makeEarthTexture(): CanvasTexture {
  return toTexture(
    paint(512, 256, (x, y, z, lat) => {
      const n = fbm(x * 1.7 + 5, y * 1.7, z * 1.7);
      const ice = Math.abs(lat) > 1.25 + (n - 0.5) * 0.3;
      if (ice) return [236, 242, 248];
      if (n > 0.54) {
        const t = Math.min(1, (n - 0.54) * 4);
        return [mix(60, 150, t), mix(130, 120, t), mix(60, 80, t)];
      }
      const depth = n / 0.54;
      return [mix(10, 30, depth), mix(40, 90, depth), mix(100, 170, depth)];
    }),
  );
}

/** Superfície cinza com crateras para a Lua. */
export function makeMoonTexture(): CanvasTexture {
  const canvas = paint(512, 256, (x, y, z) => {
    const n = fbm(x * 3 + 11, y * 3, z * 3, 6);
    const v = mix(95, 195, n);
    return [v, v, v * 1.02];
  });
  const ctx = canvas.getContext("2d")!;
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < 70; i++) {
    const cx = rand() * canvas.width;
    const cy = canvas.height * (0.15 + 0.7 * rand());
    const r = 2 + rand() * rand() * 14;
    ctx.fillStyle = "rgba(40,40,45,0.35)";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(235,235,240,0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  return toTexture(canvas);
}
