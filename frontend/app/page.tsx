import { AreaSection } from "@/components/hub/area-section";
import { AreaTile } from "@/components/hub/area-tile";
import { AREAS } from "@/labs/areas";
import { LABS, labsByArea } from "@/labs/registry";

// Áreas com conteúdo primeiro; a ordem original é mantida dentro de cada grupo.
const AREAS_SORTED = [...AREAS].sort(
  (a, b) =>
    Number(labsByArea(b.id).length > 0) - Number(labsByArea(a.id).length > 0),
);

export default function Hub() {
  return (
    <div className="grain relative isolate min-h-dvh overflow-x-clip">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(45%_35%_at_85%_5%,rgba(255,200,110,0.12),transparent),radial-gradient(50%_40%_at_8%_30%,rgba(90,130,255,0.10),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(75%_45%_at_50%_15%,black,transparent)]"
      />

      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <span className="font-display text-2xl">SciHub</span>
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
          {String(LABS.length).padStart(2, "0")}{" "}
          {LABS.length === 1 ? "laboratório" : "laboratórios"}
        </span>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-14 md:pb-28 md:pt-24">
        <p
          className="rise font-mono text-[11px] uppercase tracking-[0.3em] text-amber-200/70"
          style={{ "--delay": "0.05s" } as React.CSSProperties}
        >
          Laboratórios interativos de física
        </p>
        <h1
          className="rise mt-5 max-w-4xl font-display text-5xl leading-[0.95] tracking-tight md:text-8xl"
          style={{ "--delay": "0.15s" } as React.CSSProperties}
        >
          Cada área da física, um{" "}
          <em className="text-amber-200">laboratório</em>.
        </h1>
        <nav
          aria-label="Áreas da física"
          className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
        >
          {AREAS_SORTED.map((area, i) => (
            <AreaTile key={area.id} area={area} index={i} />
          ))}
        </nav>
      </section>

      <div className="mx-auto max-w-7xl space-y-14 px-6 pb-24">
        {AREAS_SORTED.map((area) => (
          <AreaSection key={area.id} area={area} labs={labsByArea(area.id)} />
        ))}
      </div>

      <footer className="mx-auto max-w-7xl border-t border-white/10 px-6 py-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/30">
          SciHub · feito para brincar com a física
        </p>
      </footer>
    </div>
  );
}
