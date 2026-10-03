import { LabCard, SoonCard } from "@/components/hub/lab-card";
import { LABS } from "@/labs/registry";

export default function Hub() {
  return (
    <div className="grain relative isolate min-h-dvh overflow-x-clip">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_82%_8%,rgba(255,200,110,0.13),transparent),radial-gradient(60%_50%_at_10%_100%,rgba(70,110,255,0.10),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(70%_60%_at_50%_30%,black,transparent)]"
      />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <span className="font-display text-2xl">SciHub</span>
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
          {String(LABS.length).padStart(2, "0")} {LABS.length === 1 ? "laboratório" : "laboratórios"}
        </span>
      </header>

      <section id="labs" className="mx-auto max-w-6xl px-6 pb-20 pt-16 md:pt-24">
        <div className="mb-8 flex items-end justify-between border-b border-white/10 pb-4">
          <h2 className="font-display text-4xl md:text-5xl">Laboratórios</h2>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
            Escolha um e mexa
          </span>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {LABS.map((lab, i) => (
            <LabCard key={lab.slug} lab={lab} index={i} />
          ))}
          <SoonCard index={LABS.length} />
        </div>
      </section>

      <footer className="mx-auto max-w-6xl border-t border-white/10 px-6 py-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/30">
          SciHub · feito para brincar com a ciência
        </p>
      </footer>
    </div>
  );
}
