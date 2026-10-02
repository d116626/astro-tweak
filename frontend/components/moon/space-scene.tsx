"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { makeEarthTexture, makeMoonTexture } from "@/lib/procedural-textures";
import { C, D } from "@/scenarios/moon/physics";
import { sceneRadius, type ScaleMode } from "@/scenarios/moon/scale";

const EARTH_TILT = THREE.MathUtils.degToRad(23.44);
/** Tempo da simulação: 1 dia = 4 segundos. */
const SIM_SECONDS_PER_DAY = 4;
const SUN_DISTANCE = 5000;
const SUN_RADIUS =
  SUN_DISTANCE * Math.tan(THREE.MathUtils.degToRad(D.sunAngularDiameterDeg / 2));
const MOON_RADIUS = C.moonRadiusKm / C.earthRadiusKm;
const NO_MOON_FRAMING = 3;

type Props = {
  /** null = sem Lua */
  distanceKm: number | null;
  orbitalPeriodDays: number;
  lunarTideRatio: number;
  belowRoche: boolean;
  scale: ScaleMode;
  paused: boolean;
  /** Incrementa para alinhar a Lua entre a Terra e o Sol. */
  alignSignal: number;
};

function unitCircle(segments = 256): THREE.BufferGeometry {
  const points = Array.from({ length: segments }, (_, i) => {
    const a = (i / segments) * Math.PI * 2;
    return new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
  });
  return new THREE.BufferGeometry().setFromPoints(points);
}

/** Anel de detritos (Lua desfeita abaixo do limite de Roche). */
function debrisGeometry(count = 2500): THREE.BufferGeometry {
  let seed = 12345;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2;
    const r = 0.9 + rand() * 0.2;
    positions[i * 3] = Math.cos(a) * r;
    positions[i * 3 + 1] = (rand() - 0.5) * 0.05;
    positions[i * 3 + 2] = Math.sin(a) * r;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return geometry;
}

function Label({ children, offset = -18 }: { children: string; offset?: number }) {
  return (
    <Html center style={{ pointerEvents: "none" }}>
      <span
        className="whitespace-nowrap text-[10px] font-medium uppercase tracking-wider text-white/70"
        style={{ display: "block", transform: `translateY(${offset}px)` }}
      >
        {children}
      </span>
    </Html>
  );
}

function EarthMoonSystem({
  distanceKm,
  orbitalPeriodDays,
  lunarTideRatio,
  belowRoche,
  scale,
  paused,
  alignSignal,
}: Props) {
  const earthTexture = useMemo(() => makeEarthTexture(), []);
  const moonTexture = useMemo(() => makeMoonTexture(), []);
  const orbitGeometry = useMemo(() => unitCircle(), []);
  const debris = useMemo(() => debrisGeometry(), []);

  const earthRef = useRef<THREE.Mesh>(null);
  const oceanRef = useRef<THREE.Mesh>(null);
  const moonRef = useRef<THREE.Group>(null);
  const debrisRef = useRef<THREE.Points>(null);
  const sim = useRef({ moonAngle: 0, spin: 0 });

  const hasMoon = distanceKm !== null;
  const orbitR = hasMoon ? sceneRadius(distanceKm / C.earthRadiusKm, scale) : 0;
  const rocheR = sceneRadius(D.rocheLimitKm / C.earthRadiusKm, scale);
  // Exagero visual: a maré real é minúscula perto do raio da Terra.
  const bulge = 0.2 * Math.tanh(lunarTideRatio / 4);

  useEffect(() => {
    if (alignSignal > 0) sim.current.moonAngle = 0;
  }, [alignSignal]);

  useFrame((_, delta) => {
    const s = sim.current;
    if (!paused) {
      const days = Math.min(delta, 0.05) / SIM_SECONDS_PER_DAY;
      s.spin += 2 * Math.PI * days;
      if (orbitalPeriodDays > 0) {
        s.moonAngle += (2 * Math.PI * days) / orbitalPeriodDays;
      }
    }
    const cos = Math.cos(s.moonAngle);
    const sin = Math.sin(s.moonAngle);

    earthRef.current?.rotation.set(0, s.spin, 0);
    const squeeze = 1 / Math.sqrt(1 + bulge);
    oceanRef.current?.rotation.set(0, s.moonAngle, 0);
    oceanRef.current?.scale.set(1 + bulge, squeeze, squeeze);
    moonRef.current?.position.set(cos * orbitR, 0, -sin * orbitR);
    // Rotação síncrona: sempre a mesma face voltada para a Terra.
    moonRef.current?.rotation.set(0, s.moonAngle + Math.PI, 0);
    debrisRef.current?.rotation.set(0, s.moonAngle, 0);
  });

  return (
    <>
      <group rotation={[EARTH_TILT, 0, 0]}>
        <mesh ref={earthRef}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshStandardMaterial map={earthTexture} roughness={0.85} />
        </mesh>
      </group>
      {/* Água: a "barriga" de maré aponta para a Lua (exagerada). */}
      <mesh ref={oceanRef}>
        <sphereGeometry args={[1.012, 64, 64]} />
        <meshStandardMaterial
          color="#2f78e0"
          transparent
          opacity={0.35}
          depthWrite={false}
          roughness={0.3}
        />
      </mesh>

      <lineLoop geometry={orbitGeometry} scale={rocheR}>
        <lineBasicMaterial color="#ff5a4a" transparent opacity={0.55} />
      </lineLoop>
      <group position={[rocheR, 0, 0]}>
        <Label>Roche</Label>
      </group>

      {hasMoon && (
        <lineLoop geometry={orbitGeometry} scale={orbitR}>
          <lineBasicMaterial color="#ffffff" transparent opacity={0.3} />
        </lineLoop>
      )}

      {hasMoon && !belowRoche && (
        <group ref={moonRef}>
          <mesh>
            <sphereGeometry args={[MOON_RADIUS, 48, 48]} />
            <meshStandardMaterial map={moonTexture} roughness={1} />
          </mesh>
          <Label offset={-22}>Lua</Label>
        </group>
      )}

      {hasMoon && belowRoche && (
        <points ref={debrisRef} geometry={debris} scale={orbitR}>
          <pointsMaterial
            color="#d8cdc2"
            size={2}
            sizeAttenuation={false}
            transparent
            opacity={0.85}
          />
        </points>
      )}
    </>
  );
}

function Sun() {
  return (
    <group position={[SUN_DISTANCE, 0, 0]}>
      <mesh>
        <sphereGeometry args={[SUN_RADIUS, 32, 32]} />
        <meshBasicMaterial color="#fff5cf" toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[SUN_RADIUS * 3, 32, 32]} />
        <meshBasicMaterial
          color="#ffd98a"
          transparent
          opacity={0.18}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** Mantém o sistema inteiro enquadrado conforme a órbita muda. */
function CameraRig({ radius }: { radius: number }) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  useFrame((_, delta) => {
    const persp = camera as THREE.PerspectiveCamera;
    const half = Math.tan(THREE.MathUtils.degToRad(persp.fov) / 2);
    const aspect = size.width / size.height;
    const target = Math.max(5, (1.35 * radius) / (half * Math.min(aspect, 1)));
    const current = camera.position.length();
    const k = 1 - Math.exp(-Math.min(delta, 0.1) * 4);
    const next = Math.exp(
      Math.log(current) + (Math.log(target) - Math.log(current)) * k,
    );
    camera.position.setLength(next);
  });

  return null;
}

export function SpaceScene(props: Props) {
  const framing =
    props.distanceKm === null
      ? NO_MOON_FRAMING
      : sceneRadius(props.distanceKm / C.earthRadiusKm, props.scale);

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov: 40, near: 0.1, far: 30000, position: [0, 3, 8] }}
    >
      <color attach="background" args={["#02030a"]} />
      <ambientLight intensity={0.12} />
      <directionalLight position={[SUN_DISTANCE, 0, 0]} intensity={3} />
      <Stars radius={9000} depth={400} count={5000} factor={30} fade />
      <Sun />
      <EarthMoonSystem {...props} />
      <CameraRig radius={framing} />
      <OrbitControls
        makeDefault
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.6}
      />
    </Canvas>
  );
}
