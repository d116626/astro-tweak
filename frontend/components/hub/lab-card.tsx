import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { labHref } from "@/labs/registry";
import type { Lab } from "@/labs/types";

/** Cartão de um laboratório: miniatura animada, nome, descrição e tags. */
export function LabCard({ lab, index }: { lab: Lab; index: number }) {
  const { Preview } = lab;
  return (
    <Link
      href={labHref(lab)}
      className="rise group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition-colors duration-500 hover:border-white/25"
      style={{ "--delay": `${0.5 + index * 0.12}s` } as React.CSSProperties}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(70% 55% at 50% 0%, ${lab.accent}26, transparent)`,
        }}
      />

      <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10 [perspective:900px]">
        <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_50%,rgba(255,255,255,0.05),transparent)]" />
        <div className="absolute inset-[-8%] [transform:rotateX(58deg)_rotateZ(-18deg)] transition-transform duration-700 group-hover:[transform:rotateX(50deg)_rotateZ(-8deg)_scale(1.04)]">
          <Preview />
        </div>
      </div>

      <div className="relative flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
          <span>Lab {String(index + 1).padStart(2, "0")}</span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full" style={{ background: lab.accent }} />
            Disponível
          </span>
        </div>
        <h3 className="font-display text-4xl leading-none">{lab.name}</h3>
        <p className="text-sm leading-relaxed text-white/60">{lab.description}</p>
        <div className="mt-auto flex items-end justify-between gap-4 pt-3">
          <ul className="flex flex-wrap gap-1.5">
            {lab.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white/50"
              >
                {tag}
              </li>
            ))}
          </ul>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/70 transition-all duration-300 group-hover:border-transparent group-hover:bg-white group-hover:text-black">
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-12" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Espaço reservado para o próximo laboratório. */
export function SoonCard({ index }: { index: number }) {
  return (
    <div
      className="rise flex min-h-72 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/15 p-6 text-center"
      style={{ "--delay": `${0.5 + index * 0.12}s` } as React.CSSProperties}
    >
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/30">
        Lab {String(index + 1).padStart(2, "0")}
      </span>
      <span className="font-display text-3xl italic text-white/40">em breve</span>
      <span className="max-w-[16rem] text-xs leading-relaxed text-white/30">
        O próximo experimento está sendo montado.
      </span>
    </div>
  );
}
