import { AreaGlyph } from "@/components/hub/area-glyph";
import type { Area } from "@/labs/areas";

/** Entrada do índice de áreas (hero): nome no topo e glifo animado centralizado abaixo. */
export function AreaTile({ area, index }: { area: Area; index: number }) {
  return (
    <a
      href={`#area-${area.id}`}
      className="rise group relative flex aspect-[5/4] flex-col items-center gap-2 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors duration-300 hover:border-white/30 hover:bg-white/[0.06] md:aspect-[4/3]"
      style={
        {
          "--delay": `${0.3 + index * 0.05}s`,
          color: area.accent,
        } as React.CSSProperties
      }
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[58%] size-32 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-15 blur-3xl transition-opacity duration-300 group-hover:opacity-40"
        style={{ background: area.accent }}
      />
      <p className="relative text-center text-xs font-medium text-white/80">
        {area.name}
      </p>
      <div className="relative flex min-h-0 flex-1 items-center justify-center">
        <AreaGlyph
          id={area.id}
          className="h-full w-auto transition-transform duration-500 group-hover:scale-110"
        />
      </div>
    </a>
  );
}
