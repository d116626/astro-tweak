import { AreaGlyph } from "@/components/hub/area-glyph";
import { LabCard, SoonCard } from "@/components/hub/lab-card";
import type { Area } from "@/labs/areas";
import type { Lab } from "@/labs/types";

/** Seção de uma área: emblema, nome e os labs (ou "em breve" se ainda não houver). */
export function AreaSection({ area, labs }: { area: Area; labs: Lab[] }) {
  return (
    <section id={`area-${area.id}`} className="scroll-mt-6">
      <div className="mb-5 flex items-end justify-between gap-4 border-b border-white/10 pb-3">
        <div className="flex items-center gap-4">
          <span className="size-12 shrink-0" style={{ color: area.accent }}>
            <AreaGlyph id={area.id} className="size-full" />
          </span>
          <h2 className="font-display text-3xl md:text-4xl">{area.name}</h2>
        </div>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
          {labs.length
            ? `${labs.length} ${labs.length === 1 ? "lab" : "labs"}`
            : "em breve"}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {labs.map((lab, i) => (
          <LabCard key={lab.slug} lab={lab} index={i} />
        ))}
        {labs.length === 0 && <SoonCard index={0} accent={area.accent} />}
      </div>
    </section>
  );
}
