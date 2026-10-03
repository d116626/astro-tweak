import type { Pt } from "@/labs/eletromagnetismo/quatro-leis/lib/field";

/** Um brinquedo: desenha num canvas 2D (px CSS) e reage ao ponteiro. */
export interface Scene {
  draw(ctx: CanvasRenderingContext2D, w: number, h: number, dt: number): void;
  pointerDown(p: Pt): void;
  pointerMove(p: Pt, pressed: boolean): void;
  pointerUp(): void;
  cursor(): string;
}

export const COLORS = {
  bg: "#050505",
  amber: "#ffb048",
  cyan: "#48c8ff",
  violet: "#b080ff",
  plus: "#ff6b5a",
  minus: "#4ea1ff",
  copper: "#d98c5f",
  text: "rgba(255,255,255,0.85)",
  dim: "rgba(255,255,255,0.45)",
};

/** Cuida do tamanho: posiciona na primeira vez e reescala quando a tela muda. */
export abstract class SceneBase implements Scene {
  protected w = 0;
  protected h = 0;
  private ready = false;

  protected abstract layout(): void;
  protected abstract rescale(sx: number, sy: number): void;
  protected abstract render(ctx: CanvasRenderingContext2D, dt: number): void;
  abstract pointerDown(p: Pt): void;
  abstract pointerMove(p: Pt, pressed: boolean): void;
  abstract pointerUp(): void;
  cursor() {
    return "default";
  }

  draw(ctx: CanvasRenderingContext2D, w: number, h: number, dt: number) {
    if (!this.ready) {
      this.w = w;
      this.h = h;
      this.layout();
      this.ready = true;
    } else if (w !== this.w || h !== this.h) {
      const sx = w / this.w;
      const sy = h / this.h;
      this.w = w;
      this.h = h;
      this.rescale(sx, sy);
    }
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, w, h);
    this.render(ctx, dt);
  }
}
