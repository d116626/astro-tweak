"use client";

import { ChevronDown, House } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { CardArt } from "@/labs/eletromagnetismo/quatro-leis/components/card-art";
import { PHASES } from "@/labs/eletromagnetismo/quatro-leis/lib/phases";

/** Painel lateral: etapas, a lei em palavras simples, o que tentar e a fórmula. */
export function Panel({
  phase,
  onPhase,
  controls,
}: {
  phase: number;
  onPhase: (i: number) => void;
  controls: ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const p = PHASES[phase];

  return (
    <aside className="flex max-h-[52dvh] shrink-0 flex-col border-t border-white/10 bg-zinc-950 pb-[env(safe-area-inset-bottom)] text-white md:max-h-none md:w-[22rem] md:border-l md:border-t-0 md:pb-0">
      <div className="space-y-3 px-4 pb-3 pt-3 md:pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              aria-label="Voltar ao SciHub"
              title="Voltar ao SciHub"
              className="flex size-8 items-center justify-center rounded-full border border-white/15 text-white/60 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white"
            >
              <House className="size-4" />
            </Link>
            <span className="text-[10px] font-medium uppercase tracking-widest text-white/70">
              As 4 leis
            </span>
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

        <div className="grid grid-cols-4 gap-1.5 md:grid-cols-2 md:gap-2">
          {PHASES.map((ph, i) => (
            <button
              key={ph.id}
              type="button"
              aria-pressed={i === phase}
              aria-label={`${i + 1}. ${ph.step}: ${ph.law}`}
              onClick={() => onPhase(i)}
              className={`flex flex-col overflow-hidden rounded-xl border text-left transition-colors ${
                i === phase
                  ? "border-white/50 bg-white/10 text-white"
                  : "border-white/10 text-white/50 hover:border-white/30 hover:text-white"
              }`}
            >
              <div className="h-11 bg-black/50 md:h-[4.5rem]">
                <CardArt id={ph.id} />
              </div>
              <div className="px-1 py-1.5 text-center md:px-2.5 md:py-2 md:text-left">
                <span className="text-[10px] font-medium md:hidden">{ph.step}</span>
                <span
                  className={`hidden text-[10px] font-medium uppercase tracking-widest md:block ${i === phase ? "text-amber-200/80" : "text-white/45"}`}
                >
                  {i + 1} · {ph.law}
                </span>
                <span className="mt-1 hidden break-words font-mono text-[11px] leading-snug text-white/80 md:block">
                  {ph.formula}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          <h2 className="text-[10px] font-medium uppercase tracking-widest text-white/40">
            Controles
          </h2>
          {controls}
        </div>
      </div>

      <div
        className={`min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain border-t border-white/10 px-4 pb-5 pt-4 md:block ${open ? "" : "hidden"}`}
      >
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-amber-200/70">
            {p.law}
          </p>
          <h1 className="mt-1 font-display text-3xl leading-tight">{p.title}</h1>
        </div>
        <p className="text-sm leading-relaxed text-white/75">{p.text}</p>

        <section className="space-y-2">
          <h2 className="text-[10px] font-medium uppercase tracking-widest text-white/40">
            Tente isto
          </h2>
          <ul className="space-y-1.5 text-sm text-white/70">
            {p.tryThis.map((t) => (
              <li key={t} className="flex gap-2">
                <span className="text-amber-200/70">→</span>
                {t}
              </li>
            ))}
          </ul>
        </section>

        <details className="group rounded-xl border border-white/10 px-3 py-2">
          <summary className="cursor-pointer text-xs font-medium text-white/60 marker:text-white/30">
            O que a fórmula diz
          </summary>
          <p className="mt-2 text-xs leading-relaxed text-white/55">{p.formulaText}</p>
        </details>

        {p.note && <p className="text-xs leading-relaxed text-white/40">{p.note}</p>}
      </div>
    </aside>
  );
}
