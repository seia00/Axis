"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import * as THREE from "three";

type NeuralSphereHeroProps = {
  className?: string;
  nodeCount?: number;
  innerParticleCount?: number;
  radius?: number;
  seed?: number;
};

type NetworkData = {
  nodeGeometry: THREE.BufferGeometry;
  innerGeometry: THREE.BufferGeometry;
  rimGeometry: THREE.BufferGeometry;
  lineGeometry: THREE.BufferGeometry;
};

const LAVENDER = new THREE.Color("#efe7ff");
const VIOLET = new THREE.Color("#a78bfa");
const LOOP_DURATION = 80;
const ROTATION_SPEED = (Math.PI * 2) / LOOP_DURATION;
const PULSE_SPEED = (Math.PI * 2) / 4;

function createSeededRandom(seed: number) {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function createNetworkData({
  nodeCount,
  innerParticleCount,
  radius,
  seed,
}: Required<Pick<NeuralSphereHeroProps, "nodeCount" | "innerParticleCount" | "radius" | "seed">>): NetworkData {
  const random = createSeededRandom(seed);
  const positions: THREE.Vector3[] = [];
  const nodeArray = new Float32Array(nodeCount * 3);
  const nodePhase = new Float32Array(nodeCount);
  const nodeSize = new Float32Array(nodeCount);
  const nodeIntensity = new Float32Array(nodeCount);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let index = 0; index < nodeCount; index += 1) {
    const y = 1 - (index / Math.max(1, nodeCount - 1)) * 2;
    const radial = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = index * goldenAngle + (random() - 0.5) * 0.22;
    const shellJitter = radius * (0.94 + random() * 0.1);
    const position = new THREE.Vector3(
      Math.cos(theta) * radial * shellJitter,
      y * shellJitter,
      Math.sin(theta) * radial * shellJitter,
    );

    positions.push(position);
    nodeArray[index * 3] = position.x;
    nodeArray[index * 3 + 1] = position.y;
    nodeArray[index * 3 + 2] = position.z;
    nodePhase[index] = random() * Math.PI * 2;
    nodeSize[index] = 28 + random() * 24;
    nodeIntensity[index] = 0.7 + random() * 0.3;
  }

  const nodeGeometry = new THREE.BufferGeometry();
  nodeGeometry.setAttribute("position", new THREE.BufferAttribute(nodeArray, 3));
  nodeGeometry.setAttribute("aPhase", new THREE.BufferAttribute(nodePhase, 1));
  nodeGeometry.setAttribute("aSize", new THREE.BufferAttribute(nodeSize, 1));
  nodeGeometry.setAttribute("aIntensity", new THREE.BufferAttribute(nodeIntensity, 1));

  const innerArray = new Float32Array(innerParticleCount * 3);
  const innerPhase = new Float32Array(innerParticleCount);
  const innerSize = new Float32Array(innerParticleCount);

  for (let index = 0; index < innerParticleCount; index += 1) {
    const theta = Math.PI * 2 * random();
    const phi = Math.acos(2 * random() - 1);
    const innerRadius = radius * Math.cbrt(random()) * 0.78;

    innerArray[index * 3] = Math.sin(phi) * Math.cos(theta) * innerRadius;
    innerArray[index * 3 + 1] = Math.cos(phi) * innerRadius;
    innerArray[index * 3 + 2] = Math.sin(phi) * Math.sin(theta) * innerRadius;
    innerPhase[index] = random() * Math.PI * 2;
    innerSize[index] = 10 + random() * 14;
  }

  const innerGeometry = new THREE.BufferGeometry();
  innerGeometry.setAttribute("position", new THREE.BufferAttribute(innerArray, 3));
  innerGeometry.setAttribute("aPhase", new THREE.BufferAttribute(innerPhase, 1));
  innerGeometry.setAttribute("aSize", new THREE.BufferAttribute(innerSize, 1));
  innerGeometry.setAttribute(
    "aIntensity",
    new THREE.BufferAttribute(new Float32Array(innerParticleCount).fill(0.34), 1),
  );

  const rimCount = Math.round(nodeCount * 0.8);
  const rimArray = new Float32Array(rimCount * 3);
  const rimPhase = new Float32Array(rimCount);
  const rimSize = new Float32Array(rimCount);

  for (let index = 0; index < rimCount; index += 1) {
    const theta = (index / rimCount) * Math.PI * 2 + (random() - 0.5) * 0.05;
    const rimRadius = radius * (1.01 + random() * 0.03);

    rimArray[index * 3] = Math.cos(theta) * rimRadius;
    rimArray[index * 3 + 1] = Math.sin(theta) * rimRadius;
    rimArray[index * 3 + 2] = (random() - 0.5) * radius * 0.1;
    rimPhase[index] = random() * Math.PI * 2;
    rimSize[index] = 32 + random() * 28;
  }

  const rimGeometry = new THREE.BufferGeometry();
  rimGeometry.setAttribute("position", new THREE.BufferAttribute(rimArray, 3));
  rimGeometry.setAttribute("aPhase", new THREE.BufferAttribute(rimPhase, 1));
  rimGeometry.setAttribute("aSize", new THREE.BufferAttribute(rimSize, 1));
  rimGeometry.setAttribute(
    "aIntensity",
    new THREE.BufferAttribute(new Float32Array(rimCount).fill(1), 1),
  );

  const edgePairs: number[] = [];
  const edgeCounts = new Array<number>(nodeCount).fill(0);
  const connectionDistance = radius * 0.43;

  for (let i = 0; i < nodeCount; i += 1) {
    const candidates: { index: number; distance: number }[] = [];

    for (let j = i + 1; j < nodeCount; j += 1) {
      const distance = positions[i].distanceTo(positions[j]);
      if (distance < connectionDistance) {
        candidates.push({ index: j, distance });
      }
    }

    candidates
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5)
      .forEach((candidate) => {
        if (edgeCounts[i] >= 4 || edgeCounts[candidate.index] >= 4) return;
        edgePairs.push(i, candidate.index);
        edgeCounts[i] += 1;
        edgeCounts[candidate.index] += 1;
      });
  }

  const lineArray = new Float32Array(edgePairs.length * 3);

  edgePairs.forEach((nodeIndex, edgeIndex) => {
    const position = positions[nodeIndex];
    lineArray[edgeIndex * 3] = position.x;
    lineArray[edgeIndex * 3 + 1] = position.y;
    lineArray[edgeIndex * 3 + 2] = position.z;
  });

  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute("position", new THREE.BufferAttribute(lineArray, 3));

  return { nodeGeometry, innerGeometry, rimGeometry, lineGeometry };
}

function ParticleMaterial({ opacity = 0.9, baseSize = 1 }: { opacity?: number; baseSize?: number }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  return (
    <shaderMaterial
      ref={materialRef}
      transparent
      depthWrite={false}
      blending={THREE.AdditiveBlending}
      uniforms={{
        uTime: { value: 0 },
        uColorA: { value: LAVENDER },
        uColorB: { value: VIOLET },
        uOpacity: { value: opacity },
        uBaseSize: { value: baseSize },
      }}
      vertexShader={`
        attribute float aPhase;
        attribute float aSize;
        attribute float aIntensity;
        varying float vPulse;
        varying float vIntensity;
        uniform float uTime;
        uniform float uBaseSize;

        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vPulse = 0.72 + 0.28 * sin(uTime * ${PULSE_SPEED.toFixed(8)} + aPhase);
          vIntensity = aIntensity;
          gl_PointSize = aSize * uBaseSize * vPulse * (1.0 / max(0.35, -mvPosition.z));
          gl_Position = projectionMatrix * mvPosition;
        }
      `}
      fragmentShader={`
        varying float vPulse;
        varying float vIntensity;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform float uOpacity;

        void main() {
          vec2 uv = gl_PointCoord - vec2(0.5);
          float distanceToCenter = length(uv);
          float core = smoothstep(0.2, 0.0, distanceToCenter);
          float halo = smoothstep(0.5, 0.0, distanceToCenter) * 0.5;
          float alpha = (core + halo) * uOpacity * vPulse * vIntensity;
          vec3 color = mix(uColorB, uColorA, core + 0.25);
          gl_FragColor = vec4(color, alpha);
        }
      `}
    />
  );
}

function NeuralSphereScene({
  nodeCount,
  innerParticleCount,
  radius,
  seed,
}: Required<Pick<NeuralSphereHeroProps, "nodeCount" | "innerParticleCount" | "radius" | "seed">>) {
  const groupRef = useRef<THREE.Group>(null);
  const lineMaterialRef = useRef<THREE.LineBasicMaterial>(null);
  const haloMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const data = useMemo(
    () => createNetworkData({ nodeCount, innerParticleCount, radius, seed }),
    [innerParticleCount, nodeCount, radius, seed],
  );

  useFrame(({ clock }) => {
    const elapsed = clock.elapsedTime;

    if (groupRef.current) {
      groupRef.current.rotation.y = elapsed * ROTATION_SPEED;
      groupRef.current.rotation.x = -0.08;
      groupRef.current.rotation.z = 0.02;
    }

    if (lineMaterialRef.current) {
      lineMaterialRef.current.opacity = 0.34 + Math.sin(elapsed * PULSE_SPEED) * 0.055;
    }

    if (haloMaterialRef.current) {
      haloMaterialRef.current.opacity = 0.12 + Math.sin(elapsed * PULSE_SPEED) * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh scale={[1.018, 1.018, 1.018]}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshBasicMaterial
          ref={haloMaterialRef}
          color="#c4b5fd"
          transparent
          opacity={0.12}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>

      <lineSegments geometry={data.lineGeometry}>
        <lineBasicMaterial
          ref={lineMaterialRef}
          color="#ddd6fe"
          transparent
          opacity={0.34}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      <points geometry={data.innerGeometry}>
        <ParticleMaterial opacity={0.36} baseSize={0.9} />
      </points>
      <points geometry={data.nodeGeometry}>
        <ParticleMaterial opacity={1} baseSize={1.04} />
      </points>
      <points geometry={data.rimGeometry}>
        <ParticleMaterial opacity={1} baseSize={1.18} />
      </points>
    </group>
  );
}

export function NeuralSphereHero({
  className = "",
  nodeCount = 420,
  innerParticleCount = 180,
  radius = 2.08,
  seed = 20260502,
}: NeuralSphereHeroProps) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden bg-[#05020b] ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 6.2], fov: 40 }}
        dpr={[1, 1.55]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#05020b"]} />
        <fog attach="fog" args={["#05020b", 5.8, 9.5]} />
        <ambientLight intensity={0.28} />
        <pointLight position={[0, 0, 3.2]} intensity={2.2} color="#c4b5fd" distance={7} />
        <Suspense fallback={null}>
          <NeuralSphereScene
            nodeCount={Math.min(Math.max(nodeCount, 250), 500)}
            innerParticleCount={innerParticleCount}
            radius={radius}
            seed={seed}
          />
        </Suspense>
        <Preload all />
      </Canvas>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(88,28,135,0.08)_38%,rgba(12,5,24,0.5)_78%,rgba(3,1,8,0.94)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,4,18,0.24)_0%,transparent_42%,rgba(9,4,18,0.68)_100%)]" />
    </div>
  );
}
