"use client";

/**
 * LiquidGlass — drop-in WebGL "obsidian glass" panel.
 *
 * Renders a small Three.js canvas behind its children with a custom GLSL
 * fragment shader. The shader procedurally generates a violet/black starfield
 * + nebula behind the panel and applies:
 *   - Animated 3D simplex-noise UV refraction (the "liquid" feel)
 *   - Radial chromatic aberration with edge falloff (purple/cyan fringing)
 *   - Edge fresnel for a 1px violet rim
 *
 * We do NOT capture the actual DOM behind the panel (would require html2canvas
 * or backdrop-filter shenanigans, both bad for perf). The procedural background
 * tracks the global aesthetic without that overhead.
 *
 * Each instance owns one Three.js context. Browsers cap WebGL contexts at
 * ~16 per page, so use sparingly — wrap an IntersectionObserver gate around
 * any list of more than ~6 panels.
 */

import { useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── GLSL ────────────────────────────────────────────────────────────────────

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uIntensity;     // 0..1 — refraction + chromatic strength
  uniform vec2  uResolution;

  // ── Hash + 2D simplex noise (Stefan Gustavson, public domain) ─────────────
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187,
                        0.366025403784439,
                       -0.577350269189626,
                        0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * snoise(p);
      p *= 2.03;
      a *= 0.5;
    }
    return v;
  }

  // Procedural starfield — bright dots from a hash function
  float stars(vec2 uv, float density, float brightness) {
    vec2 grid = floor(uv * density);
    vec2 gv = fract(uv * density) - 0.5;
    float h = fract(sin(dot(grid, vec2(127.1, 311.7))) * 43758.5453);
    float starOn = step(0.985, h);
    float d = length(gv);
    float twinkle = 0.5 + 0.5 * sin(uTime * (1.5 + h * 3.0) + h * 6.28);
    float core = smoothstep(0.06, 0.0, d) * starOn * brightness * twinkle;
    return core;
  }

  // Sample procedural background at a UV (used by RGB-split)
  vec3 sampleBg(vec2 uv) {
    // Base black with violet nebula
    vec2 nebUv = uv * 1.5 + vec2(uTime * 0.012, uTime * 0.008);
    float neb = fbm(nebUv) * 0.5 + 0.5;
    float neb2 = fbm(nebUv * 2.5 + 12.7) * 0.5 + 0.5;

    vec3 col = vec3(0.02, 0.01, 0.04);                       // deep space
    col += vec3(0.32, 0.18, 0.55) * pow(neb, 3.0) * 0.55;    // primary nebula (violet)
    col += vec3(0.15, 0.06, 0.32) * pow(neb2, 4.0) * 0.40;   // secondary (deeper)

    // Star layers
    col += vec3(1.0, 0.95, 1.0) * stars(uv + vec2(0.1, 0.2), 80.0, 1.0);
    col += vec3(0.8, 0.7, 1.0)  * stars(uv * 1.8 + vec2(2.0, 1.0), 140.0, 0.7);
    col += vec3(0.78, 0.5, 1.0) * stars(uv * 0.6 + vec2(5.0, 3.0), 30.0, 1.4) * 1.2;

    return col;
  }

  void main() {
    vec2 uv = vUv;

    // ── Refraction: animated noise displacement ───────────────────────────
    float n1 = snoise(uv * 3.0 + uTime * 0.08) * 0.5 + 0.5;
    float n2 = snoise(uv * 5.0 - uTime * 0.06 + 99.0) * 0.5 + 0.5;
    vec2 disp = vec2(n1 - 0.5, n2 - 0.5) * 0.04 * uIntensity;

    // ── Chromatic aberration: split RGB with edge falloff ─────────────────
    vec2 center = uv - 0.5;
    float edge = pow(length(center) * 1.6, 2.0);   // 0 at center, 1+ at corners
    float caStrength = 0.012 * uIntensity * edge;

    vec2 dir = normalize(center + 0.0001);
    vec3 col;
    col.r = sampleBg(uv + disp + dir *  caStrength).r;
    col.g = sampleBg(uv + disp                   ).g;
    col.b = sampleBg(uv + disp - dir *  caStrength).b;

    // ── Glass tint — slight purple wash + brightness lift toward edges ────
    col = mix(col, col * vec3(1.05, 0.95, 1.15), 0.35);

    // ── Edge fresnel — 1px violet rim ─────────────────────────────────────
    float rimX = min(uv.x, 1.0 - uv.x);
    float rimY = min(uv.y, 1.0 - uv.y);
    float rim = 1.0 - smoothstep(0.0, 0.012, min(rimX, rimY));
    col += vec3(0.55, 0.36, 1.0) * rim * 0.65;

    // ── Vignette inward — darken center slightly to feel "deep" ───────────
    float vig = 1.0 - pow(length(center) * 1.2, 2.5) * 0.25;
    col *= vig;

    gl_FragColor = vec4(col, 0.92);
  }
`;

// ─── The shader plane ────────────────────────────────────────────────────────

function GlassPlane({ intensity }: { intensity: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        transparent
        uniforms={{
          uTime:       { value: 0 },
          uIntensity:  { value: intensity },
          uResolution: { value: new THREE.Vector2(1, 1) },
        }}
      />
    </mesh>
  );
}

// ─── Public component ────────────────────────────────────────────────────────

export type LiquidGlassIntensity = "subtle" | "medium" | "strong";

interface LiquidGlassProps {
  children?: ReactNode;
  className?: string;
  intensity?: LiquidGlassIntensity;
  /** rounded corners on the host wrapper (panel content). Canvas itself fills the wrapper. */
  borderRadius?: number;
}

const INTENSITY_MAP: Record<LiquidGlassIntensity, number> = {
  subtle: 0.35,
  medium: 0.65,
  strong: 1.0,
};

export function LiquidGlass({
  children,
  className = "",
  intensity = "medium",
  borderRadius = 4,
}: LiquidGlassProps) {
  return (
    <div
      className={`relative isolate ${className}`}
      style={{
        borderRadius,
        overflow: "hidden",
        // 1px crisp border on top of the canvas
        boxShadow: "inset 0 0 0 1px rgba(167, 139, 250, 0.18)",
      }}
    >
      {/* Three.js canvas — background layer */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{ borderRadius }}
        aria-hidden="true"
      >
        <Canvas
          orthographic
          camera={{ position: [0, 0, 1], zoom: 1 }}
          dpr={[1, 1.5]}
          frameloop="always"
          gl={{
            alpha: true,
            antialias: false,
            preserveDrawingBuffer: false,
            powerPreference: "high-performance",
          }}
          style={{ display: "block", width: "100%", height: "100%" }}
        >
          <GlassPlane intensity={INTENSITY_MAP[intensity]} />
        </Canvas>
      </div>

      {/* Content sits above the glass */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
