"use client";

import { useEffect, useRef } from "react";
import type { Scene } from "@/labs/eletromagnetismo/quatro-leis/scenes/base";

/** Canvas 2D que roda uma cena: DPR, loop de animação e ponteiro (mouse e toque). */
export function Stage({ scene }: { scene: Scene }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (w > 0 && h > 0) scene.draw(ctx, w, h, dt);
      canvas.style.cursor = scene.cursor();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const pt = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const down = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      scene.pointerDown(pt(e));
    };
    const move = (e: PointerEvent) => scene.pointerMove(pt(e), e.buttons > 0);
    const up = (e: PointerEvent) => {
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
      scene.pointerUp();
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
    };
  }, [scene]);

  return <canvas ref={canvasRef} className="absolute inset-0 size-full touch-none select-none" />;
}
