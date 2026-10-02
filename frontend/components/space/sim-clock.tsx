"use client";

import { useEffect, useRef } from "react";
import { simTime } from "@/lib/sim-time";
import { formatPeriod } from "@/lib/format";

/** Ano simulado e tempo decorrido. Atualiza o DOM direto, sem re-render do React. */
export function SimClockDisplay() {
  const yearRef = useRef<HTMLSpanElement>(null);
  const elapsedRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const update = () => {
      const { ms, startMs } = simTime;
      if (!ms || !yearRef.current || !elapsedRef.current) return;
      yearRef.current.textContent = String(new Date(ms).getUTCFullYear());
      const days = (ms - startMs) / 86_400_000;
      elapsedRef.current.textContent =
        Math.abs(days) < 0.05 ? "agora" : `+${formatPeriod(days)}`;
    };
    update();
    const id = setInterval(update, 100);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-baseline gap-2">
      <span ref={yearRef} className="font-mono text-2xl font-light tabular-nums">
        —
      </span>
      <span ref={elapsedRef} className="text-xs text-white/40" />
    </div>
  );
}
