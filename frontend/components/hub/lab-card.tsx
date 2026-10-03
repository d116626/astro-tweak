import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AREAS } from "@/labs/areas";
import { labHref } from "@/labs/registry";
import type { Lab } from "@/labs/types";

/** Cartão compacto de um laboratório: miniatura animada, nome, descrição e tags. */
export function LabCard({ lab, index }: { lab: Lab; index: number }) {
  const { Preview } = lab;
  const area = AREAS.find((a) => a.id === lab.area)!;
  return (
    <Link
      href={labHref(lab)}
      className="rise group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors duration-500 hover:border-white/25"
      style={{ "--delay": `${0.1 + index * 0.08}s` } as React.CSSProperties}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(70% 50% at 50% 0%, ${lab.accent}26, transparent)`,
        }}
      />

      <div className="relative aspect-[4/3] overflow-hidden border-b border-white/10 [perspective:700px]">
        <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_50%,rgba(255,255,255,0.05),transparent)]" />
        <div className="absolute inset-[-10%] [transform:rotateX(58deg)_rotateZ(-18deg)] transition-transform duration-700 group-hover:[transform:rotateX(50deg)_rotateZ(-8deg)_scale(1.05)]">
          <Preview />
        </div>
      </div>

      <div className="relative flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
          <span style={{ color: area.accent }}>{area.name}</span>
          <span className="flex items-center gap-1.5">
            <span
              className="size-1.5 rounded-full"
              style={{ background: lab.accent }}
            />
            Disponível
          </span>
        </div>
        <h3 className="font-display text-3xl leading-none">{lab.name}</h3>
        <p className="line-clamp-3 text-xs leading-relaxed text-white/55">
          {lab.description}
        </p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <ul className="flex flex-wrap gap-1">
            {lab.tags.slice(0, 2).map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white/50"
              >
                {tag}
              </li>
            ))}
          </ul>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/70 transition-all duration-300 group-hover:border-transparent group-hover:bg-white group-hover:text-black">
            <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:rotate-12" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Espaço reservado para um laboratório que ainda não existe. */
export function SoonCard({ index, accent }: { index: number; accent: string }) {
  return (
    <div
      className="rise flex min-h-52 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 p-4 text-center"
      style={{ "--delay": `${0.1 + index * 0.08}s` } as React.CSSProperties}
    >
      <span
        className="size-1.5 rounded-full opacity-60"
        style={{ background: accent }}
      />
      <span className="font-display text-2xl italic text-white/40">
        em breve
      </span>
      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/25">
        Próximo experimento
      </span>
    </div>
  );
}
