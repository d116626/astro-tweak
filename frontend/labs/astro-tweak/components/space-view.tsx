"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { ControlPanel } from "@/labs/astro-tweak/components/control-panel";
import type { LostReason } from "@/labs/astro-tweak/lib/nbody";
import { DEFAULT_PARAMS, type BodyParams } from "@/labs/astro-tweak/lib/params";

const SpaceScene = dynamic(
  () => import("@/labs/astro-tweak/components/space-scene").then((m) => m.SpaceScene),
  { ssr: false },
);

/** Dias simulados por segundo. */
const SPEEDS = [0.25, 1, 5, 30, 120, 365];
const DEFAULT_SPEED = 3;

export function SpaceView() {
  const [focus, setFocus] = useState("sun");
  const [speedIdx, setSpeedIdx] = useState(DEFAULT_SPEED);
  const [paused, setPaused] = useState(false);
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [lost, setLost] = useState<Record<string, LostReason>>({});
  const [resetSignal, setResetSignal] = useState(0);

  const setParam = (key: keyof BodyParams, value: number) =>
    setParams((prev) => ({ ...prev, [focus]: { ...prev[focus], [key]: value } }));

  const handleLost = (id: string, reason: LostReason) => {
    setLost((prev) => (prev[id] ? prev : { ...prev, [id]: reason }));
    setFocus((f) => (f === id ? "sun" : f));
  };

  const reset = () => {
    setParams(DEFAULT_PARAMS);
    setLost({});
    setResetSignal((n) => n + 1);
  };

  return (
    <main className="fixed inset-0 flex flex-col overflow-hidden overscroll-none bg-black md:flex-row">
      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-0 pt-[env(safe-area-inset-top)] md:pt-0">
          <SpaceScene
            focus={focus}
            onFocus={setFocus}
            timeScale={SPEEDS[speedIdx]}
            paused={paused}
            params={params}
            resetSignal={resetSignal}
            lost={lost}
            onLost={handleLost}
          />
        </div>
      </div>
      <ControlPanel
        focus={focus}
        onFocus={setFocus}
        params={params}
        onParam={setParam}
        lost={lost}
        paused={paused}
        onTogglePause={() => setPaused((v) => !v)}
        speeds={SPEEDS}
        speedIdx={speedIdx}
        onSpeed={setSpeedIdx}
        onReset={reset}
      />
    </main>
  );
}
