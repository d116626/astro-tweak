"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Ban, Eclipse, Info, Pause, Play, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  ANCHORS,
  C,
  computeMoonScenario,
  D,
  type MoonScenario,
} from "@/scenarios/moon/physics";
import type { ScaleMode } from "@/scenarios/moon/scale";
import { formatDays, formatDegrees, formatKm, formatTimes } from "@/lib/format";

const SpaceScene = dynamic(
  () => import("@/components/moon/space-scene").then((m) => m.SpaceScene),
  { ssr: false },
);

/** Slider logarítmico: de um pouco abaixo do limite de Roche até 4x a distância atual. */
const MIN_RATIO = 0.03;
const MAX_RATIO = 4;
const LOG_MIN = Math.log(MIN_RATIO);
const LOG_SPAN = Math.log(MAX_RATIO) - LOG_MIN;

const ratioToT = (ratio: number) => (Math.log(ratio) - LOG_MIN) / LOG_SPAN;
const tToRatio = (t: number) => Math.exp(LOG_MIN + t * LOG_SPAN);

const THUMB_PX = 24;
const TICK_LABEL: Record<string, string> = {
  roche: "Roche",
  geostationary: "Geo",
  today: "Hoje",
};

const ECLIPSE_TEXT: Record<MoonScenario["solarEclipse"], string> = {
  total: "Todo eclipse solar seria total.",
  annular: "Eclipses solares seriam sempre anulares (anel de fogo).",
  mixed: "Mistura de eclipses totais e anulares, como hoje.",
  none: "Sem eclipses solares.",
};

const glass = "border border-white/10 bg-black/35 text-white backdrop-blur-md";

function headline(s: MoonScenario, noMoon: boolean): string {
  if (noMoon) return "Sem Lua, só o Sol mexe nas marés: menos de um terço da maré de hoje.";
  if (s.belowRoche) return "Perto demais: a gravidade da Terra despedaçaria a Lua em um anel.";
  if (Math.abs(s.lunarTideRatio - 1) < 0.05) return "Esta é a Lua de hoje.";
  return `Com a Lua a ${formatTimes(s.distanceKm! / C.moonDistanceKm)} da distância, a maré lunar seria ${formatTimes(s.lunarTideRatio)} a de hoje.`;
}

function IconButton({
  label,
  pressed,
  onClick,
  children,
}: {
  label: string;
  pressed?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={`size-11 rounded-full ${glass} hover:bg-black/55 hover:text-white aria-pressed:bg-white/25`}
    >
      {children}
    </Button>
  );
}

function Chip({ children, warn }: { children: React.ReactNode; warn?: boolean }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs ${glass} ${warn ? "border-red-400/50 text-red-300" : ""}`}
    >
      {children}
    </span>
  );
}

function Layer({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[10px] font-medium uppercase tracking-wider text-white/50">
        {title}
      </h2>
      <div className="mt-0.5 space-y-0.5 text-sm">{children}</div>
    </section>
  );
}

export function MoonScenarioView() {
  const [t, setT] = useState(ratioToT(1));
  const [noMoon, setNoMoon] = useState(false);
  const [paused, setPaused] = useState(false);
  const [alignSignal, setAlignSignal] = useState(0);
  const [scale, setScale] = useState<ScaleMode>("didactic");
  const [showInfo, setShowInfo] = useState(false);

  const ratio = tToRatio(t);
  const s = useMemo(
    () => computeMoonScenario(noMoon ? null : ratio),
    [noMoon, ratio],
  );

  return (
    <main className="fixed inset-0 overflow-hidden overscroll-none bg-black">
      <SpaceScene
        distanceKm={s.distanceKm}
        orbitalPeriodDays={s.orbitalPeriodDays}
        lunarTideRatio={s.lunarTideRatio}
        belowRoche={s.belowRoche}
        scale={scale}
        paused={paused}
        alignSignal={alignSignal}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex flex-col items-start gap-2">
          <span className="px-1 text-xs font-medium uppercase tracking-widest text-white/60">
            Astro Tweak
          </span>
          <Chip>
            Maré {formatTimes(s.springTideRatio)}
          </Chip>
          <Chip>
            {noMoon ? "Sem fases" : `Mês ${formatDays(s.synodicPeriodDays)}`}
          </Chip>
          {s.belowRoche && <Chip warn>Abaixo de Roche</Chip>}
        </div>

        <div className="pointer-events-auto flex flex-col gap-2">
          <IconButton
            label={paused ? "Continuar" : "Pausar"}
            onClick={() => setPaused((v) => !v)}
          >
            {paused ? <Play /> : <Pause />}
          </IconButton>
          <IconButton
            label="Alinhar eclipse"
            onClick={() => {
              setNoMoon(false);
              setAlignSignal((n) => n + 1);
            }}
          >
            <Eclipse />
          </IconButton>
          <IconButton
            label="Sem Lua"
            pressed={noMoon}
            onClick={() => setNoMoon((v) => !v)}
          >
            <Ban />
          </IconButton>
          <IconButton
            label="Escala real das distâncias"
            pressed={scale === "real"}
            onClick={() => setScale((v) => (v === "real" ? "didactic" : "real"))}
          >
            <Ruler />
          </IconButton>
          <IconButton
            label="O que muda"
            pressed={showInfo}
            onClick={() => setShowInfo((v) => !v)}
          >
            <Info />
          </IconButton>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {showInfo && (
          <div className={`mx-auto w-full max-w-xl space-y-3 rounded-2xl p-4 ${glass}`}>
            <p className="text-sm font-medium leading-snug">{headline(s, noMoon)}</p>
            <Layer title="Você vê">
              {noMoon ? (
                <p>Sem Lua no céu.</p>
              ) : (
                <>
                  <p>
                    Lua com {formatDegrees(s.moonAngularDiameterDeg)} no céu (
                    {formatTimes(s.moonSizeRatio)} o tamanho de hoje; o Sol tem{" "}
                    {formatDegrees(D.sunAngularDiameterDeg)}).
                  </p>
                  <p className="text-white/60">{ECLIPSE_TEXT[s.solarEclipse]}</p>
                </>
              )}
            </Layer>
            <Layer title="O mundo muda">
              <p>
                Maré de sizígia {formatTimes(s.springTideRatio)} a de hoje (a
                barriga azul na Terra é exagerada).
              </p>
            </Layer>
            <p className="text-xs text-white/50">
              Tamanhos da Terra e da Lua são reais. Na escala didática as
              distâncias são comprimidas. Estimativas simplificadas: órbita
              circular, maré em razão relativa a hoje.
            </p>
          </div>
        )}

        <div className={`mx-auto w-full max-w-xl rounded-3xl px-5 pb-2 pt-3 ${glass}`}>
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-white/60">Distância da Lua</span>
            <span className="font-mono">
              {s.distanceKm === null
                ? "sem Lua"
                : `${formatKm(s.distanceKm)} · ${formatTimes(ratio)}`}
            </span>
          </div>
          <Slider
            className="mt-3"
            min={0}
            max={1}
            step={0.001}
            value={[t]}
            disabled={noMoon}
            onValueChange={(v) => setT(Array.isArray(v) ? v[0] : v)}
            aria-label="Distância da Lua"
          />
          <div className="relative h-9">
            {ANCHORS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  setNoMoon(false);
                  setT(ratioToT(a.distanceRatio));
                }}
                className="absolute top-0 flex h-9 -translate-x-1/2 flex-col items-center justify-center px-2 text-[10px] uppercase tracking-wider text-white/60 active:text-white"
                style={{
                  left: `calc(${THUMB_PX / 2}px + (100% - ${THUMB_PX}px) * ${ratioToT(a.distanceRatio)})`,
                }}
              >
                <span className="mb-0.5 h-1.5 w-px bg-white/40" />
                {TICK_LABEL[a.id] ?? a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
