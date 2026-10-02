"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { FocusLabel } from "@/components/space/labels";
import { BODY_COLORS, PLANET_LOOKS } from "@/components/space/planet-looks";
import { makeEarthTexture, makePlanetTexture } from "@/lib/procedural-textures";
import {
  advance,
  initialState,
  kgToSolar,
  orbitEllipse,
  setInclination,
  setMass,
  setSemiMajorAxis,
  type LostReason,
  type NBodyState,
} from "@/scenarios/solar-system/nbody";
import { SOLAR, type PlanetData } from "@/scenarios/solar-system/orbits";
import {
  DEFAULT_PARAMS,
  EARTH_MASS_KG,
  radiusKm,
  type BodyParams,
} from "@/scenarios/solar-system/params";
import {
  compressPosition,
  sceneDistance,
  sceneRadiusOf,
  SUN_SCENE_RADIUS,
} from "@/scenarios/solar-system/scale";

/** Velocidade visual máxima de rotação (voltas por segundo). */
const MAX_REV_PER_SECOND = 0.4;
const ORBIT_SEGMENTS = 128;
/** A elipse osculadora é recalculada a cada tanto (s), não a cada quadro. */
const ORBIT_REFRESH_S = 0.12;

type Positions = Record<string, THREE.Vector3>;
type AllParams = Record<string, BodyParams>;

export type SpaceSceneProps = {
  /** "sun" = visão geral do sistema; ou o id de um planeta. */
  focus: string;
  onFocus: (id: string) => void;
  /** Dias simulados por segundo. */
  timeScale: number;
  paused: boolean;
  params: AllParams;
  /** Muda para reiniciar a simulação com o sistema real. */
  resetSignal: number;
  lost: Record<string, LostReason>;
  onLost: (id: string, reason: LostReason) => void;
};

const createPositions = (): Positions =>
  Object.fromEntries(
    ["sun", ...SOLAR.planets.map((p) => p.id)].map((id) => [
      id,
      new THREE.Vector3(),
    ]),
  );

/** Raio que a câmera deve enquadrar para cada foco. */
function focusRadius(
  focus: string,
  params: AllParams,
  lost: Record<string, LostReason>,
): number {
  if (focus === "sun") {
    const farthest = Math.max(
      ...SOLAR.planets
        .filter((p) => !lost[p.id])
        .map((p) => params[p.id].semiMajorAu),
    );
    return sceneDistance(farthest) * 1.1;
  }
  const planet = SOLAR.planets.find((p) => p.id === focus);
  if (!planet) return 10;
  const ring = planet.id === "saturn" ? 2.4 : 1;
  return sceneRadiusOf(radiusKm(params[focus])) * ring * 1.8;
}

/** Elipse da órbita atual do corpo (osculadora), atualizada ao longo da simulação. */
function OrbitLine({
  id,
  active,
  stateRef,
}: {
  id: string;
  active: boolean;
  stateRef: RefObject<NBodyState | null>;
}) {
  const lineRef = useRef<THREE.LineLoop>(null);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(ORBIT_SEGMENTS * 3), 3),
    );
    return g;
  }, []);
  const elapsed = useRef(Infinity);

  useFrame((_, delta) => {
    const line = lineRef.current;
    const state = stateRef.current;
    if (!line || !state) return;
    elapsed.current += delta;
    if (elapsed.current < ORBIT_REFRESH_S) return;
    elapsed.current = 0;
    const points = orbitEllipse(state, id, ORBIT_SEGMENTS);
    line.visible = points !== null;
    if (!points) return;
    const attr = geometry.getAttribute("position") as THREE.BufferAttribute;
    points.forEach((pt, i) => attr.setXYZ(i, ...compressPosition(pt)));
    attr.needsUpdate = true;
  });

  return (
    <lineLoop ref={lineRef} geometry={geometry} frustumCulled={false}>
      <lineBasicMaterial
        color={active ? BODY_COLORS[id] : "#ffffff"}
        transparent
        opacity={active ? 0.6 : 0.16}
      />
    </lineLoop>
  );
}

function PlanetNode({
  planet,
  params,
  positionsRef,
  timeScale,
  paused,
  focused,
  onFocus,
}: {
  planet: PlanetData;
  params: BodyParams;
  positionsRef: RefObject<Positions>;
  timeScale: number;
  paused: boolean;
  focused: boolean;
  onFocus: () => void;
}) {
  const look = PLANET_LOOKS[planet.id];
  const texture = useMemo(
    () => (look ? makePlanetTexture(look) : makeEarthTexture()),
    [look],
  );
  const groupRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Mesh>(null);
  const spin = useRef(0);

  const radius = sceneRadiusOf(radiusKm(params));
  const tilt = THREE.MathUtils.degToRad(params.axialTiltDeg);
  const rotationDays = planet.rotationPeriodHours / 24;

  useFrame((_, delta) => {
    groupRef.current?.position.copy(positionsRef.current[planet.id]);
    if (!paused) {
      const rev = Math.min(timeScale / rotationDays, MAX_REV_PER_SECOND);
      spin.current += 2 * Math.PI * rev * Math.min(delta, 0.05);
    }
    spinRef.current?.rotation.set(0, spin.current, 0);
  }, -2);

  return (
    <group ref={groupRef}>
      <group rotation={[0, 0, tilt]}>
        <mesh ref={spinRef}>
          <sphereGeometry args={[radius, 48, 48]} />
          <meshStandardMaterial map={texture} roughness={0.9} />
        </mesh>
        {planet.id === "saturn" && (
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius * 1.3, radius * 2.3, 128]} />
            <meshStandardMaterial
              color="#d9c9a0"
              side={THREE.DoubleSide}
              transparent
              opacity={0.7}
            />
          </mesh>
        )}
      </group>
      {!focused && (
        <FocusLabel
          color={BODY_COLORS[planet.id]}
          offset={-18}
          onClick={onFocus}
        >
          {planet.name}
        </FocusLabel>
      )}
    </group>
  );
}

function Sun({ focused, onFocus }: { focused: boolean; onFocus: () => void }) {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[SUN_SCENE_RADIUS, 48, 48]} />
        <meshBasicMaterial color="#ffe9a8" toneMapped={false} />
      </mesh>
      {[1.35, 2].map((k, i) => (
        <mesh key={k}>
          <sphereGeometry args={[SUN_SCENE_RADIUS * k, 32, 32]} />
          <meshBasicMaterial
            color="#ffd98a"
            transparent
            opacity={i === 0 ? 0.22 : 0.1}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      ))}
      {!focused && (
        <FocusLabel color={BODY_COLORS.sun} offset={-28} onClick={onFocus}>
          Sol
        </FocusLabel>
      )}
    </group>
  );
}

/** Roda a simulação N-corpos e publica as posições (antes dos demais componentes). */
function SimClock({
  timeScale,
  paused,
  params,
  resetSignal,
  stateRef,
  positionsRef,
  onLost,
}: {
  timeScale: number;
  paused: boolean;
  params: AllParams;
  resetSignal: number;
  stateRef: RefObject<NBodyState | null>;
  positionsRef: RefObject<Positions>;
  onLost: (id: string, reason: LostReason) => void;
}) {
  const applied = useRef<{ signal: number; params: AllParams } | null>(null);

  useFrame((_, delta) => {
    if (!stateRef.current || applied.current?.signal !== resetSignal) {
      stateRef.current = initialState(new Date());
      applied.current = { signal: resetSignal, params: DEFAULT_PARAMS };
    }
    const state = stateRef.current;
    const was = applied.current!.params;
    // Aplica só o que o usuário mudou desde o último quadro.
    for (const { id } of SOLAR.planets) {
      const [want, had] = [params[id], was[id]];
      if (want.massEarth !== had.massEarth) {
        setMass(state, id, kgToSolar(want.massEarth * EARTH_MASS_KG));
      }
      if (want.semiMajorAu !== had.semiMajorAu) {
        setSemiMajorAxis(state, id, want.semiMajorAu);
      }
      if (want.inclinationDeg !== had.inclinationDeg) {
        setInclination(state, id, want.inclinationDeg);
      }
    }
    applied.current!.params = params;

    if (!paused) {
      const lost = advance(state, Math.min(delta, 0.05) * timeScale);
      for (const b of lost) onLost(b.id, b.lost!);
    }

    const sun = state[0].pos;
    for (const b of state.slice(1)) {
      const [x, y, z] = compressPosition([
        b.pos[0] - sun[0],
        b.pos[1] - sun[1],
        b.pos[2] - sun[2],
      ]);
      positionsRef.current[b.id].set(x, y, z);
    }
  }, -3);

  return null;
}

/** Segue o corpo focado e ajusta a distância da câmera, com transição suave. */
function CameraRig({
  focus,
  radius,
  positionsRef,
}: {
  focus: string;
  radius: number;
  positionsRef: RefObject<Positions>;
}) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const controls = useThree((s) => s.controls) as unknown as {
    target: THREE.Vector3;
    addEventListener: (type: "start", listener: () => void) => void;
    removeEventListener: (type: "start", listener: () => void) => void;
  } | null;
  const scratch = useMemo(
    () => ({ move: new THREE.Vector3(), offset: new THREE.Vector3() }),
    [],
  );
  const last = useRef({ focus, goal: new THREE.Vector3() });
  /** Enquadra automaticamente até o usuário mexer na câmera. */
  const fitting = useRef(true);
  const fitKey = `${focus}|${radius.toFixed(2)}`;
  const lastFitKey = useRef(fitKey);

  useEffect(() => {
    if (!controls) return;
    const stopFitting = () => {
      fitting.current = false;
    };
    controls.addEventListener("start", stopFitting);
    return () => controls.removeEventListener("start", stopFitting);
  }, [controls]);

  useFrame((_, delta) => {
    if (!controls) return;
    const dt = Math.min(delta, 0.1);
    const goal = positionsRef.current[focus];
    const { move, offset } = scratch;

    if (lastFitKey.current !== fitKey) {
      lastFitKey.current = fitKey;
      fitting.current = true;
    }
    if (last.current.focus !== focus) {
      last.current.focus = focus;
      last.current.goal.copy(goal);
    }
    // Acompanha o corpo rigidamente...
    move.copy(goal).sub(last.current.goal);
    controls.target.add(move);
    camera.position.add(move);
    last.current.goal.copy(goal);
    // ...e dissolve aos poucos o deslocamento deixado pela troca de foco.
    move.copy(controls.target).sub(goal).multiplyScalar(1 - Math.exp(-dt * 4));
    controls.target.sub(move);
    camera.position.sub(move);

    if (!fitting.current) return;
    const persp = camera as THREE.PerspectiveCamera;
    const half = Math.tan(THREE.MathUtils.degToRad(persp.fov) / 2);
    const aspect = size.width / size.height;
    const wanted = (1.35 * radius) / (half * Math.min(aspect, 1));
    offset.copy(camera.position).sub(controls.target);
    const current = offset.length();
    const k = 1 - Math.exp(-dt * 3);
    offset.setLength(
      Math.exp(Math.log(current) + (Math.log(wanted) - Math.log(current)) * k),
    );
    camera.position.copy(controls.target).add(offset);
  }, -1.5);

  return null;
}

export function SpaceScene({
  focus,
  onFocus,
  timeScale,
  paused,
  params,
  resetSignal,
  lost,
  onLost,
}: SpaceSceneProps) {
  const positionsRef = useRef(createPositions());
  const stateRef = useRef<NBodyState | null>(null);

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov: 40, near: 0.02, far: 10000, position: [0, 280, 620] }}
    >
      <color attach="background" args={["#02030a"]} />
      <ambientLight intensity={0.12} />
      <pointLight intensity={4} decay={0} />
      <Stars radius={3000} depth={300} count={6000} factor={14} fade />

      <SimClock
        timeScale={timeScale}
        paused={paused}
        params={params}
        resetSignal={resetSignal}
        stateRef={stateRef}
        positionsRef={positionsRef}
        onLost={onLost}
      />
      <Sun focused={focus === "sun"} onFocus={() => onFocus("sun")} />

      {SOLAR.planets
        .filter((planet) => !lost[planet.id])
        .map((planet) => (
          <group key={planet.id}>
            <OrbitLine
              id={planet.id}
              active={focus === planet.id}
              stateRef={stateRef}
            />
            <PlanetNode
              planet={planet}
              params={params[planet.id]}
              positionsRef={positionsRef}
              timeScale={timeScale}
              paused={paused}
              focused={focus === planet.id}
              onFocus={() => onFocus(planet.id)}
            />
          </group>
        ))}

      <CameraRig
        focus={focus}
        radius={focusRadius(focus, params, lost)}
        positionsRef={positionsRef}
      />
      <OrbitControls
        makeDefault
        enablePan={false}
        rotateSpeed={0.6}
        zoomSpeed={0.8}
        minDistance={0.05}
        maxDistance={3000}
      />
    </Canvas>
  );
}
