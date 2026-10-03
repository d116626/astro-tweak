"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ChevronDown, Pause, Play, RotateCcw } from "lucide-react";
import { BODY_COLORS } from "@/labs/astro-tweak/components/planet-looks";
import { SimClockDisplay } from "@/labs/astro-tweak/components/sim-clock";
import { Slider } from "@/components/ui/slider";
import { formatPeriod, formatValue } from "@/labs/astro-tweak/lib/format";
import type { LostReason } from "@/labs/astro-tweak/lib/nbody";
import { SOLAR } from "@/labs/astro-tweak/lib/orbits";
import {
  DEFAULT_PARAMS,
  density,
  escapeVelocity,
  orbitalPeriodDays,
  PARAM_DEFS,
  paramToT,
  radiusKm,
  surfaceGravity,
  tToParam,
  type BodyParams,
} from "@/labs/astro-tweak/lib/params";

const LOST_TEXT: Record<LostReason, string> = {
  sun: "engolido pelo Sol",
  ejected: "ejetado do sistema",
};

export type ControlPanelProps = {
  focus: string;
  onFocus: (id: string) => void;
  params: Record<string, BodyParams>;
  onParam: (key: keyof BodyParams, value: number) => void;
  lost: Record<string, LostReason>;
  paused: boolean;
  onTogglePause: () => void;
  speeds: number[];
  speedIdx: number;
  onSpeed: (index: number) => void;
  onReset: () => void;
};

const BODIES = [{ id: "sun", name: "Sistema" }, ...SOLAR.planets];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[10px] font-medium uppercase tracking-widest text-white/40">
      {children}
    </h2>
  );
}

function RoundButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 active:bg-white/25 [&_svg]:size-4"
    >
      {children}
    </button>
  );
}

function TimeControls({
  paused,
  onTogglePause,
  speeds,
  speedIdx,
  onSpeed,
  onReset,
}: Pick<
  ControlPanelProps,
  "paused" | "onTogglePause" | "speeds" | "speedIdx" | "onSpeed" | "onReset"
>) {
  return (
    <div className="flex items-center gap-2">
      <RoundButton label={paused ? "Continuar" : "Pausar"} onClick={onTogglePause}>
        {paused ? <Play /> : <Pause />}
      </RoundButton>
      <div
        role="group"
        aria-label="Dias simulados por segundo"
        className="flex min-w-0 flex-1 items-center rounded-full bg-white/10 p-0.5"
      >
        {speeds.map((s, i) => (
          <button
            key={s}
            type="button"
            aria-pressed={i === speedIdx}
            onClick={() => onSpeed(i)}
            className="h-8 min-w-0 flex-1 rounded-full text-[11px] text-white/60 transition-colors aria-pressed:bg-white aria-pressed:font-medium aria-pressed:text-black"
          >
            {String(s).replace(".", ",")}
          </button>
        ))}
      </div>
      <span className="text-[10px] text-white/40">d/s</span>
      <RoundButton label="Reiniciar o sistema real" onClick={onReset}>
        <RotateCcw />
      </RoundButton>
    </div>
  );
}

function BodySelector({
  focus,
  onFocus,
  lost,
}: Pick<ControlPanelProps, "focus" | "onFocus" | "lost">) {
  return (
    <div
      role="tablist"
      aria-label="Corpos do sistema solar"
      className="-mx-4 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] md:flex-wrap md:overflow-visible"
    >
      {BODIES.map((b) => (
        <button
          key={b.id}
          type="button"
          role="tab"
          aria-selected={focus === b.id}
          disabled={!!lost[b.id]}
          onClick={() => onFocus(b.id)}
          className="flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-white/10 px-3 text-xs text-white/70 transition-colors hover:bg-white/10 aria-selected:border-white/40 aria-selected:bg-white/15 aria-selected:text-white disabled:line-through disabled:opacity-40"
        >
          <span
            className="size-2 rounded-full"
            style={{ background: BODY_COLORS[b.id] }}
          />
          {b.name}
        </button>
      ))}
    </div>
  );
}

/** Visão geral: todos os planetas lado a lado. */
function SystemOverview({
  params,
  lost,
  onFocus,
}: Pick<ControlPanelProps, "params" | "lost" | "onFocus">) {
  return (
    <section>
      <SectionTitle>Planetas</SectionTitle>
      <div className="mt-2 grid grid-cols-[1fr_auto_auto_auto] gap-x-3 text-[11px]">
        <span />
        {["Sol", "Ano", "Massa"].map((h) => (
          <span key={h} className="text-right text-white/40">
            {h}
          </span>
        ))}
        {SOLAR.planets.map((planet) => {
          const p = params[planet.id];
          const reason = lost[planet.id];
          return (
            <button
              key={planet.id}
              type="button"
              disabled={!!reason}
              onClick={() => onFocus(planet.id)}
              className="col-span-4 grid grid-cols-subgrid items-center rounded-lg py-2 text-left hover:bg-white/10 disabled:opacity-40 md:-mx-2 md:px-2"
            >
              <span className="flex items-center gap-2 text-xs">
                <span
                  className="size-2 rounded-full"
                  style={{ background: BODY_COLORS[planet.id] }}
                />
                {planet.name}
              </span>
              {reason ? (
                <span className="col-span-3 text-right text-red-300">
                  {LOST_TEXT[reason]}
                </span>
              ) : (
                <>
                  <span className="text-right font-mono">
                    {formatValue(p.semiMajorAu)} UA
                  </span>
                  <span className="text-right font-mono">
                    {formatPeriod(orbitalPeriodDays(p.semiMajorAu))}
                  </span>
                  <span className="text-right font-mono">
                    {formatValue(p.massEarth)} M⊕
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-white/40">
        Escolha um planeta para mudar massa, distância, inclinação e tamanho e ver
        a gravidade reagir.
      </p>
    </section>
  );
}

function Sliders({
  id,
  values,
  onParam,
}: {
  id: string;
  values: BodyParams;
  onParam: ControlPanelProps["onParam"];
}) {
  const defaults = DEFAULT_PARAMS[id];
  return (
    <section>
      <SectionTitle>Ajustar</SectionTitle>
      <div className="mt-2 space-y-3">
        {PARAM_DEFS.map((d) => {
          const value = values[d.key];
          const changed = value !== defaults[d.key];
          return (
            <div key={d.key}>
              <div className="flex h-5 items-center justify-between text-xs">
                <span className="text-white/60">{d.label}</span>
                <span className="flex items-center gap-1.5">
                  <span className={`font-mono ${changed ? "text-amber-300" : ""}`}>
                    {formatValue(value)}
                    {d.unit === "°" ? "°" : ` ${d.unit}`}
                  </span>
                  {changed && (
                    <button
                      type="button"
                      aria-label={`Restaurar ${d.label}`}
                      title="Restaurar o valor real"
                      onClick={() => onParam(d.key, defaults[d.key])}
                      className="-m-2 p-2 text-white/60 active:text-white"
                    >
                      <RotateCcw className="size-3.5" />
                    </button>
                  )}
                </span>
              </div>
              <Slider
                className="mt-1.5"
                min={0}
                max={1}
                step={0.001}
                value={[paramToT(d, value)]}
                onValueChange={(v) =>
                  onParam(d.key, tToParam(d, Array.isArray(v) ? v[0] : v))
                }
                aria-label={d.label}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Details({ id, values }: { id: string; values: BodyParams }) {
  const planet = SOLAR.planets.find((p) => p.id === id)!;
  const stats: [string, string][] = [
    ["Raio", `${formatValue(radiusKm(values))} km`],
    ["Gravidade", `${formatValue(surfaceGravity(values))} m/s²`],
    ["Densidade", `${formatValue(density(values))} g/cm³`],
    ["Velocidade de escape", `${formatValue(escapeVelocity(values))} km/s`],
    ["Ano", formatPeriod(orbitalPeriodDays(values.semiMajorAu))],
    ["Dia", formatPeriod(planet.rotationPeriodHours / 24)],
    ["Temperatura", `${formatValue(planet.meanTemperatureC)} °C`],
    ["Luas conhecidas", String(planet.moons)],
  ];
  return (
    <section>
      <SectionTitle>Detalhes</SectionTitle>
      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2.5">
        {stats.map(([k, v]) => (
          <div key={k}>
            <dt className="text-[11px] text-white/40">{k}</dt>
            <dd className="font-mono text-sm">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-[10px] leading-tight text-white/30">
        Temperatura média; nos gigantes, a 1 bar.
      </p>
    </section>
  );
}

/** Painel único: tempo, seleção de planeta, ajustes e detalhes. */
export function ControlPanel(props: ControlPanelProps) {
  const { focus, onFocus, params, onParam, lost } = props;
  const [open, setOpen] = useState(true);
  const planet = SOLAR.planets.find((p) => p.id === focus);

  return (
    <aside className="flex max-h-[52dvh] shrink-0 flex-col border-t border-white/10 bg-zinc-950 text-white pb-[env(safe-area-inset-bottom)] md:max-h-none md:w-[22rem] md:pb-0 md:border-l md:border-t-0">
      <div className="space-y-3 px-4 pb-3 pt-3 md:pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest">
            <Link
              href="/"
              className="-m-2 flex items-center gap-1.5 p-2 text-white/40 transition-colors hover:text-white"
            >
              <ArrowLeft className="size-3" />
              SciHub
            </Link>
            <span className="text-white/20">/</span>
            <span className="text-white/70">Astro Tweak</span>
          </div>
          <button
            type="button"
            aria-label={open ? "Recolher painel" : "Expandir painel"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="-m-2 p-2 text-white/50 md:hidden"
          >
            <ChevronDown className={`size-4 transition-transform ${open ? "" : "rotate-180"}`} />
          </button>
        </div>
        <SimClockDisplay />
        <TimeControls {...props} />
        <BodySelector focus={focus} onFocus={onFocus} lost={lost} />
      </div>

      <div
        className={`min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain border-t border-white/10 px-4 pb-4 pt-4 md:block ${open ? "" : "hidden"}`}
      >
        {planet ? (
          <>
            <div className="flex items-center gap-2">
              <span
                className="size-3 rounded-full"
                style={{ background: BODY_COLORS[planet.id] }}
              />
              <h1 className="text-lg font-medium">{planet.name}</h1>
              <span className="ml-auto text-xs text-white/40">
                Sol a {formatValue(params[planet.id].semiMajorAu)} UA
              </span>
            </div>
            <Sliders id={planet.id} values={params[planet.id]} onParam={onParam} />
            <Details id={planet.id} values={params[planet.id]} />
          </>
        ) : (
          <SystemOverview params={params} lost={lost} onFocus={onFocus} />
        )}
      </div>
    </aside>
  );
}
