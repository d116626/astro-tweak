"use client";

import {
  CircleMinus,
  CirclePlus,
  Hand,
  Repeat2,
  RotateCcw,
  Scissors,
  Snail,
  Undo2,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Panel } from "@/labs/eletromagnetismo/quatro-leis/components/panel";
import { Stage } from "@/labs/eletromagnetismo/quatro-leis/components/stage";
import {
  Divider,
  Pill,
  Toolbar,
} from "@/labs/eletromagnetismo/quatro-leis/components/toolbar";
import { GaussScene } from "@/labs/eletromagnetismo/quatro-leis/scenes/gauss";
import { InductionScene } from "@/labs/eletromagnetismo/quatro-leis/scenes/induction";
import {
  MagnetsScene,
  type MagnetTool,
} from "@/labs/eletromagnetismo/quatro-leis/scenes/magnets";
import {
  WaveScene,
  type WaveView,
} from "@/labs/eletromagnetismo/quatro-leis/scenes/wave";

/** As quatro cenas ficam vivas enquanto você troca de etapa. */
export function QuatroLeisView() {
  const scenes = useMemo(
    () => [
      new GaussScene(),
      new MagnetsScene(),
      new InductionScene(),
      new WaveScene(),
    ],
    [],
  );
  const [gauss, magnets, induction, wave] = scenes as [
    GaussScene,
    MagnetsScene,
    InductionScene,
    WaveScene,
  ];

  const [phase, setPhase] = useState(0);
  const [bubble, setBubble] = useState(true);
  const [tool, setTool] = useState<MagnetTool>("mover");
  const [auto, setAuto] = useState(true);
  const [continuous, setContinuous] = useState(false);
  const [slow, setSlow] = useState(false);
  const [view, setView] = useState<WaveView>("ambos");

  const pickTool = (t: MagnetTool) => {
    setTool(t);
    magnets.setTool(t);
  };

  return (
    <main className="fixed inset-0 flex flex-col overflow-hidden overscroll-none bg-black md:flex-row">
      <div className="relative min-h-0 flex-1">
        <Stage key={phase} scene={scenes[phase]} />
      </div>
      <Panel
        phase={phase}
        onPhase={setPhase}
        controls={
          <Toolbar>
            {phase === 0 && (
              <>
                <Pill
                  label="Adicionar carga positiva"
                  onClick={() => gauss.addCharge(1)}
                >
                  <CirclePlus /> Carga
                </Pill>
                <Pill
                  label="Adicionar carga negativa"
                  onClick={() => gauss.addCharge(-1)}
                >
                  <CircleMinus /> Carga
                </Pill>
                <Pill
                  label="Desfazer a última carga"
                  onClick={() => gauss.undo()}
                >
                  <Undo2 /> Desfazer
                </Pill>
                <Divider />
                <Pill
                  active={bubble}
                  onClick={() => {
                    setBubble((v) => !v);
                    gauss.toggleBubble();
                  }}
                >
                  Bolha
                </Pill>
                <Pill label="Reiniciar" onClick={() => gauss.reset()}>
                  <RotateCcw />
                </Pill>
              </>
            )}
            {phase === 1 && (
              <>
                <Pill
                  active={tool === "mover"}
                  onClick={() => pickTool("mover")}
                >
                  <Hand /> Mover
                </Pill>
                <Pill
                  active={tool === "cortar"}
                  onClick={() => pickTool("cortar")}
                >
                  <Scissors /> Cortar
                </Pill>
                <Pill label="Reiniciar" onClick={() => magnets.reset()}>
                  <RotateCcw />
                </Pill>
              </>
            )}
            {phase === 2 && (
              <>
                <Pill
                  active={auto}
                  onClick={() => {
                    setAuto((v) => !v);
                    induction.setAuto(!auto);
                  }}
                >
                  <Repeat2 /> Balançar sozinho
                </Pill>
                <Pill onClick={() => induction.flip()}>Virar o ímã</Pill>
                <Pill label="Reiniciar" onClick={() => induction.reset()}>
                  <RotateCcw />
                </Pill>
              </>
            )}
            {phase === 3 && (
              <>
                <Pill onClick={() => wave.firePulse()}>
                  <Zap /> Pulso
                </Pill>
                <Pill
                  active={continuous}
                  onClick={() => {
                    setContinuous((v) => !v);
                    wave.setContinuous(!continuous);
                  }}
                >
                  Onda contínua
                </Pill>
                <Pill
                  active={slow}
                  onClick={() => {
                    setSlow((v) => !v);
                    wave.setSlow(!slow);
                  }}
                >
                  <Snail /> Lenta
                </Pill>
                <Divider />
                {(["ambos", "E", "B"] as const).map((v) => (
                  <Pill
                    key={v}
                    active={view === v}
                    onClick={() => {
                      setView(v);
                      wave.setView(v);
                    }}
                  >
                    {v === "ambos" ? "E + B" : v}
                  </Pill>
                ))}
                <Pill label="Limpar a onda" onClick={() => wave.clear()}>
                  <RotateCcw />
                </Pill>
              </>
            )}
          </Toolbar>
        }
      />
    </main>
  );
}
