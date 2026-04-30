"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, RoundedBox } from "@react-three/drei";
import { motion, type Transition } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronDown, Compass, Layers3 } from "lucide-react";
import * as THREE from "three";
import { useLanguage } from "@/contexts/language-context";

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: EASE } satisfies Transition,
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.7, delay, ease: EASE } satisfies Transition,
});

function TerrainRibbon({
  index,
  color,
}: {
  index: number;
  color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const points = useMemo(() => {
    return Array.from({ length: 54 }, (_, i) => {
      const x = -4.2 + i * 0.16;
      const y =
        Math.sin(i * 0.34 + index * 0.7) * 0.16 +
        Math.cos(i * 0.12 + index) * 0.08;
      return new THREE.Vector3(x, y, 0);
    });
  }, [index]);

  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    mesh.position.x = Math.sin(clock.elapsedTime * 0.35 + index) * 0.035;
    mesh.rotation.z = Math.sin(clock.elapsedTime * 0.2 + index) * 0.01;
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, -0.95 + index * 0.34, -0.55 - index * 0.22]}
      rotation={[0.08, -0.1, -0.05]}
    >
      <tubeGeometry args={[curve, 88, 0.012, 8, false]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.52}
        roughness={0.38}
      />
    </mesh>
  );
}

function RenderViewport() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock, pointer }) => {
    const group = groupRef.current;
    if (!group) return;

    group.rotation.x = -0.22 + pointer.y * 0.05;
    group.rotation.y = -0.42 + pointer.x * 0.08;
    group.position.y = Math.sin(clock.elapsedTime * 0.45) * 0.05;
  });

  return (
    <Float speed={1.15} rotationIntensity={0.15} floatIntensity={0.32}>
      <group
        ref={groupRef}
        position={[1.72, -0.34, 0]}
        rotation={[-0.24, -0.42, 0.02]}
        scale={[1.16, 1.16, 1.16]}
      >
        <RoundedBox args={[4.4, 2.72, 0.08]} radius={0.08} smoothness={10}>
          <meshPhysicalMaterial
            color="#dbeafe"
            transparent
            opacity={0.18}
            roughness={0.16}
            metalness={0.02}
            clearcoat={1}
            clearcoatRoughness={0.12}
            side={THREE.DoubleSide}
          />
        </RoundedBox>

        <RoundedBox args={[4.55, 2.86, 0.05]} radius={0.11} smoothness={12} position={[0, 0, -0.05]}>
          <meshStandardMaterial color="#08111d" transparent opacity={0.34} roughness={0.25} />
        </RoundedBox>

        {["#d9f99d", "#7dd3fc", "#bfdbfe", "#fef3c7", "#ffffff"].map((color, index) => (
          <TerrainRibbon key={color} index={index} color={color} />
        ))}

        <mesh position={[0.3, -0.6, -0.2]} rotation={[-Math.PI / 2.6, 0, 0.14]}>
          <planeGeometry args={[4.2, 1.65, 32, 12]} />
          <meshStandardMaterial
            color="#9cc8a8"
            transparent
            opacity={0.34}
            roughness={0.5}
            wireframe
          />
        </mesh>

        <mesh position={[-1.75, 0.95, 0.1]}>
          <sphereGeometry args={[0.045, 18, 18]} />
          <meshStandardMaterial color="#f8fafc" emissive="#c7d2fe" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[1.9, -0.8, 0.1]}>
          <sphereGeometry args={[0.055, 18, 18]} />
          <meshStandardMaterial color="#e0f2fe" emissive="#7dd3fc" emissiveIntensity={0.38} />
        </mesh>
      </group>
    </Float>
  );
}

function LandscapeRenderView() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1] opacity-[0.32] sm:opacity-90">
      <Canvas
        camera={{ position: [0.2, 0.08, 6.2], fov: 36 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[-3.8, 4.2, 4]} intensity={3.1} color="#fff2d8" />
        <pointLight position={[3.2, 1.2, 3.8]} intensity={7.2} color="#bae6fd" distance={8} />
        <Suspense fallback={null}>
          <RenderViewport />
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>
    </div>
  );
}

export function HeroSection() {
  const { t, toggle, lang } = useLanguage();

  return (
    <section className="relative z-10 flex min-h-[100svh] items-center overflow-hidden px-4 pt-20 pb-24 text-center">
      <Image
        src="/hero-landscape.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 -z-30 object-cover"
      />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(4,8,13,0.18)_0%,rgba(4,8,13,0.58)_58%,rgba(9,9,11,0.98)_100%)]" />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_74%_42%,rgba(191,219,254,0.2),transparent_34%),linear-gradient(90deg,rgba(4,8,13,0.78)_0%,rgba(4,8,13,0.42)_44%,rgba(4,8,13,0.22)_100%)]" />
      <LandscapeRenderView />

      {/* Language toggle — top right */}
      <motion.button
        {...fadeIn(0.05)}
        onClick={toggle}
        className="absolute right-4 top-5 z-20 inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-black/20 px-3 py-1.5 text-xs font-medium text-white/70 backdrop-blur-md transition-all duration-200 hover:border-white/25 hover:text-white sm:right-6 sm:top-6"
        aria-label="Toggle language"
      >
        <span className="text-[10px]">{lang === "en" ? "🇯🇵" : "🇬🇧"}</span>
        {t("lang.toggle")}
      </motion.button>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center">
        {/* Badge — sits above the logo */}
        <motion.div
          {...fadeUp(0.18)}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-1 text-xs tracking-wide text-white/72 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-md"
        >
          <Compass className="h-3.5 w-3.5 text-sky-100" />
          {t("hero.badge")}
        </motion.div>

        {/* Logo */}
        <motion.div {...fadeIn(0.1)} className="mb-8">
          <Image
            src="/AXISLOGO.png"
            alt="AXIS"
            width={480}
            height={240}
            className="h-auto w-48 select-none object-contain drop-shadow-[0_18px_38px_rgba(0,0,0,0.55)] sm:w-64 lg:w-[310px]"
            priority
          />
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...fadeUp(0.42)}
          className="mb-5 max-w-4xl text-5xl font-bold leading-[1.05] tracking-normal text-white drop-shadow-[0_18px_50px_rgba(0,0,0,0.65)] sm:text-6xl lg:text-7xl"
        >
          {lang === "en" ? (
            <>
              Where ambition meets{" "}
              <span className="text-sky-100">opportunity.</span>
            </>
          ) : (
            <>
              野心と機会が
              <span className="text-sky-100">出会う場所。</span>
            </>
          )}
        </motion.h1>

        {/* Sub */}
        <motion.p
          {...fadeUp(0.54)}
          className="mx-auto mb-10 max-w-[560px] text-base leading-relaxed text-white/74 drop-shadow-[0_10px_26px_rgba(0,0,0,0.6)] sm:text-lg"
        >
          {t("hero.subtext")}{" "}
          <span className="text-white">{t("hero.subtext.free")}</span>
        </motion.p>

        {/* CTAs */}
        <motion.div
          {...fadeUp(0.64)}
          className="mb-20 flex flex-col items-center gap-3 sm:flex-row"
        >
          {/* Primary — white on dark */}
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-black shadow-[0_18px_45px_rgba(0,0,0,0.32)] transition-colors duration-150 hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            {t("hero.cta.primary")}
            <ArrowRight className="h-4 w-4" />
          </Link>

          {/* Secondary — glass */}
          <a
            href="#axis-diagram"
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-black/18 px-6 py-3 text-sm font-medium text-white/76 backdrop-blur-md transition-all duration-200 hover:border-white/30 hover:text-white"
          >
            <Layers3 className="h-4 w-4" />
            {t("hero.cta.secondary")}
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        {...fadeIn(1.05)}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.25em] text-white/45">{t("hero.scroll")}</span>
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: EASE, delay: 1.2 } satisfies Transition}
        >
          <ChevronDown className="h-4 w-4 text-white/55" />
        </motion.div>
      </motion.div>
    </section>
  );
}
