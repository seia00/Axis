"use client";

import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

function getLayerMotion(index: number, time: number) {
  return {
    x: Math.sin(time * 0.7 + index * 0.45) * 0.035,
    y: -index * 0.34 + Math.sin(time * 0.85 + index * 0.35) * 0.025,
    zRotation: Math.sin(time * 0.45 + index * 0.2) * 0.01,
  };
}

function Layer({ index, total }: { index: number; total: number }) {
  const groupRef = useRef<THREE.Group>(null);

  const layerColor = useMemo(() => {
    const t = index / Math.max(total - 1, 1);
    return new THREE.Color().lerpColors(
      new THREE.Color("#f4a261"),
      new THREE.Color("#2a9fd6"),
      t
    );
  }, [index, total]);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group || !group.position || !group.rotation) return;

    const motion = getLayerMotion(index, clock.getElapsedTime());
    group.position.x = motion.x;
    group.position.y = motion.y;
    group.rotation.z = motion.zRotation;
  });

  return (
    <group ref={groupRef} position={[0, -index * 0.34, -index * 0.11]}>
      <RoundedBox args={[4.15, 2.55, 0.12]} radius={0.18} smoothness={18}>
        <meshPhysicalMaterial
          color={layerColor}
          roughness={0.22}
          metalness={0.02}
          transparent
          opacity={Math.max(0.22, 0.92 - index * 0.075)}
          clearcoat={1}
          clearcoatRoughness={0.12}
          side={THREE.DoubleSide}
        />
      </RoundedBox>
    </group>
  );
}

function Stack() {
  const groupRef = useRef<THREE.Group>(null);
  const layers = useMemo(() => Array.from({ length: 8 }), []);

  useFrame(({ clock, pointer }) => {
    const group = groupRef.current;
    if (!group || !group.position || !group.rotation) return;

    const t = clock.getElapsedTime();
    group.rotation.x = -0.72 + pointer.y * 0.12 + Math.sin(t * 0.45) * 0.025;
    group.rotation.y = 0.36 + pointer.x * 0.16 + Math.cos(t * 0.35) * 0.025;
    group.rotation.z = -0.14 + Math.sin(t * 0.28) * 0.018;
    group.position.y = 0.85 + Math.sin(t * 0.7) * 0.08;
  });

  return (
    <group ref={groupRef} position={[0, 0.85, 0]}>
      {layers.map((_, index) => (
        <Layer key={index} index={index} total={layers.length} />
      ))}
    </group>
  );
}

function GlowPlane() {
  return (
    <mesh position={[0, -0.55, -1.35]}>
      <planeGeometry args={[6.5, 5.2]} />
      <meshBasicMaterial color="#071522" transparent opacity={0.42} />
    </mesh>
  );
}

export function Animated3DStackBackground() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-black overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_40%,rgba(23,92,130,0.32),transparent_46%),radial-gradient(circle_at_34%_28%,rgba(255,133,54,0.16),transparent_33%)] blur-2xl" />
      <Canvas
        camera={{ position: [0.25, 0.25, 6.5], fov: 34 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.18} />
        <directionalLight position={[-3.8, 4.5, 3]} intensity={2.8} color="#ff9a4a" />
        <pointLight position={[3.2, -0.4, 3.8]} intensity={8} color="#2bb4ff" distance={8} />
        <pointLight position={[-2.8, -2.4, 2.5]} intensity={2.1} color="#ff7b3d" distance={7} />
        <GlowPlane />
        <Stack />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
