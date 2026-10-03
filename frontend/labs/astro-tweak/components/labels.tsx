"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const world = new THREE.Vector3();

/**
 * Rótulo tocável preso a um ponto da cena: foca a câmera no corpo.
 *
 * É um elemento DOM comum posicionado por projeção a cada quadro. O `Html` do drei
 * cria uma raiz React própria e a desmonta de forma síncrona, o que gera erro no React 19.
 */
export function FocusLabel({
  children,
  color,
  offset = -18,
  hidden = false,
  onClick,
}: {
  children: string;
  color: string;
  offset?: number;
  hidden?: boolean;
  onClick: () => void;
}) {
  const anchor = useRef<THREE.Group>(null);
  const el = useRef<HTMLButtonElement | null>(null);
  const hiddenRef = useRef(hidden);
  const onClickRef = useRef(onClick);
  const container = useThree((s) => s.gl.domElement.parentElement);

  useEffect(() => {
    hiddenRef.current = hidden;
    onClickRef.current = onClick;
  });

  useEffect(() => {
    if (!container) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className =
      "absolute left-0 top-0 flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white/80 backdrop-blur-sm active:bg-white/20";
    button.style.display = "none";
    const dot = document.createElement("span");
    dot.className = "size-1.5 rounded-full";
    dot.style.background = color;
    button.append(dot, children);
    button.addEventListener("click", () => onClickRef.current());
    container.appendChild(button);
    el.current = button;
    return () => {
      button.remove();
      el.current = null;
    };
  }, [container, color, children]);

  useFrame(({ camera, size }) => {
    const button = el.current;
    const group = anchor.current;
    if (!button || !group) return;
    group.getWorldPosition(world).project(camera);
    if (hiddenRef.current || world.z > 1) {
      button.style.display = "none";
      return;
    }
    const x = (world.x * 0.5 + 0.5) * size.width;
    const y = (-world.y * 0.5 + 0.5) * size.height;
    button.style.display = "";
    button.style.transform = `translate3d(${x}px, ${y + offset}px, 0) translate(-50%, -50%)`;
  });

  return <group ref={anchor} />;
}
