"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { BODY_COLORS } from "@/components/space/planet-looks";
import { formatPeriod, formatValue } from "@/lib/format";
import type { LostReason } from "@/scenarios/solar-system/nbody";
import { SOLAR } from "@/scenarios/solar-system/orbits";
import {
  DEFAULT_PARAMS,
  orbitalPeriodDays,
  PARAM_DEFS,
  radiusKm,
  surfaceGravity,
  type BodyParams,
  type ParamDef,
} from "@/scenarios/solar-system/params";

const SpaceScene = dynamic(
  () => import("@/components/space/space-scene").then((m) => m.SpaceScene),
  { ssr: false },
);

/** Dias simulados por segundo. */
const SPEEDS = [0.25, 1, 5, 30, 120, 365];
const DEFAULT_SPEED = 3;
const THUMB_PX = 24;

const LOST_TEXT: Record<LostReason, string> = {
  sun: "engolido pelo Sol",
  ejected: "ejetado do sistema",
};

const glass = "border border-white/10 bg-black/35 text-white backdrop-blur-md";

const tToValue = (d: ParamDef, t: number) =>
  d.log ? d.min * Math.pow(d.max / d.min, t) : d.min + t * (d.max - d.min);
const valueToT = (d: ParamDef, v: number) =>
  d.log ? Math.log(v / d.min) / Math.log(d.max / d.min) : (v - d.min) / (d.max - d.min);

const withUnit = (d: ParamDef, v: number) =>
  d.unit === "°" ? `${formatValue(v)}°` : `${formatValue(v)} ${d.unit}`;

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`size-11 rounded-full ${glass} hover:bg-black/55 hover:text-white`}
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

/** Controle de um parâmetro do corpo, com marca "Real" no valor original. */
function ParamControl({
  def,
  value,
  onChange,
}: {
  def: ParamDef;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-white/60">{def.label}</span>
        <span className="font-mono">{withUnit(def, value)}</span>
      </div>
      <Slider
        className="mt-3"
        min={0}
        max={1}
        step={0.001}
        value={[valueToT(def, value)]}
        onValueChange={(v) => onChange(tToValue(def, Array.isArray(v) ? v[0] : v))}
        aria-label={def.label}
      />
    </div>
  );
}

export function SpaceView() {
  const [focus, setFocus] = useState("sun");
  const [speedIdx, setSpeedIdx] = useState(DEFAULT_SPEED);
  const [paused, setPaused] = useState(false);
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [lost, setLost] = useState<Record<string, LostReason>>({});
  const [resetSignal, setResetSignal] = useState(0);
  const [paramKey, setParamKey] = useState<keyof BodyParams>("massEarth");

  const planet = SOLAR.planets.find((p) => p.id === focus);
  const current = planet ? params[planet.id] : null;
  const def = PARAM_DEFS.find((d) => d.key === paramKey)!;

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
    <main className="fixed inset-0 overflow-hidden overscroll-none bg-black">
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

      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex flex-col items-start gap-2">
          <span className="px-1 text-xs font-medium uppercase tracking-widest text-white/60">
            Astro Tweak
          </span>
          {focus === "sun" && <Chip>Toque em um planeta</Chip>}
          {planet && current && (
            <>
              <Chip>Massa {formatValue(current.massEarth)} M⊕</Chip>
              <Chip>Sol a {formatValue(current.semiMajorAu)} UA</Chip>
              <Chip>Ano {formatPeriod(orbitalPeriodDays(current.semiMajorAu))}</Chip>
              <Chip>Gravidade {formatValue(surfaceGravity(current))} m/s²</Chip>
              <Chip>Raio {formatValue(radiusKm(current))} km</Chip>
            </>
          )}
          {Object.entries(lost).map(([id, reason]) => (
            <Chip key={id} warn>
              {SOLAR.planets.find((p) => p.id === id)?.name} {LOST_TEXT[reason]}
            </Chip>
          ))}
        </div>

        <div className="pointer-events-auto flex flex-col gap-2">
          <IconButton
            label={paused ? "Continuar" : "Pausar"}
            onClick={() => setPaused((v) => !v)}
          >
            {paused ? <Play /> : <Pause />}
          </IconButton>
          <IconButton
            label="Velocidade do tempo"
            onClick={() => setSpeedIdx((i) => (i + 1) % SPEEDS.length)}
          >
            <span className="text-[10px] font-medium leading-none">
              {String(SPEEDS[speedIdx]).replace(".", ",")}
              <br />
              d/s
            </span>
          </IconButton>
          <IconButton label="Reiniciar o sistema real" onClick={reset}>
            <RotateCcw />
          </IconButton>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {planet && current && (
          <div className={`mx-auto w-full max-w-xl rounded-3xl px-5 pb-3 pt-3 ${glass}`}>
            <div
              role="tablist"
              className="-mx-2 flex gap-1 overflow-x-auto px-2 pb-3 [scrollbar-width:none]"
            >
              {PARAM_DEFS.map((d) => {
                const changed = current[d.key] !== DEFAULT_PARAMS[planet.id][d.key];
                return (
                  <button
                    key={d.key}
                    type="button"
                    role="tab"
                    aria-selected={paramKey === d.key}
                    onClick={() => setParamKey(d.key)}
                    className={`h-9 shrink-0 rounded-full px-3 text-xs aria-selected:bg-white/25 ${changed ? "text-amber-300" : "text-white/70"}`}
                  >
                    {d.short}
                  </button>
                );
              })}
            </div>
            <ParamControl
              def={def}
              value={current[paramKey]}
              onChange={(v) => setParam(paramKey, v)}
            />
            <div className="relative h-9">
              <button
                type="button"
                onClick={() => setParam(paramKey, DEFAULT_PARAMS[planet.id][paramKey])}
                className="absolute top-0 flex h-9 -translate-x-1/2 flex-col items-center justify-center px-2 text-[10px] uppercase tracking-wider text-white/60 active:text-white"
                style={{
                  left: `calc(${THUMB_PX / 2}px + (100% - ${THUMB_PX}px) * ${valueToT(def, DEFAULT_PARAMS[planet.id][paramKey])})`,
                }}
              >
                <span className="mb-0.5 h-1.5 w-px bg-white/40" />
                Real
              </button>
            </div>
          </div>
        )}

        <nav
          aria-label="Corpos do sistema solar"
          className="-mx-3 flex snap-x gap-2 overflow-x-auto overscroll-x-contain px-3 pb-1 [scrollbar-width:none] md:mx-auto md:max-w-3xl md:flex-wrap md:justify-center md:overflow-visible"
        >
          {[{ id: "sun", name: "Sistema" }, ...SOLAR.planets].map((b) => (
            <button
              key={b.id}
              type="button"
              aria-pressed={focus === b.id}
              disabled={!!lost[b.id]}
              onClick={() => setFocus(b.id)}
              className={`flex h-10 shrink-0 snap-start items-center gap-2 rounded-full px-4 text-xs disabled:opacity-40 disabled:line-through ${glass} aria-pressed:bg-white/25`}
            >
              <span
                className="size-2 rounded-full"
                style={{ background: BODY_COLORS[b.id] }}
              />
              {b.name}
            </button>
          ))}
        </nav>
      </div>
    </main>
  );
}
