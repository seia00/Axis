"use client";

import { useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Star {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
  isPurple: boolean;
  glowRadius: number;
  color: string;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;       // 0–1, decreasing
  maxLen: number;
  active: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootersRef = useRef<ShootingStar[]>([]);
  const rafRef = useRef<number>(0);
  const lastShootRef = useRef<number>(0);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);
  }, []);

  const buildStars = useCallback(() => {
    const rng = seededRng(0xdeadbeef);
    const W = window.innerWidth;
    const H = window.innerHeight;
    const count = Math.min(520, Math.floor((W * H) / 3800));
    const purpleCount = Math.floor(count * 0.055); // ~5-6% purple accent stars

    const stars: Star[] = [];

    for (let i = 0; i < count; i++) {
      const isPurple = i < purpleCount;
      const size = isPurple
        ? 1.6 + rng() * 2.2   // purple stars: 1.6–3.8px
        : 0.4 + rng() * 1.6;  // regular: 0.4–2px

      // Purple accent tones: cooler lilac → deep violet
      const purpleHues = ["#c084fc", "#a78bfa", "#8b5cf6", "#ddd6fe", "#e9d5ff"];
      const color = isPurple
        ? purpleHues[Math.floor(rng() * purpleHues.length)]
        : `rgba(${220 + Math.floor(rng() * 35)},${220 + Math.floor(rng() * 35)},${240 + Math.floor(rng() * 15)},1)`;

      stars.push({
        x: rng() * W,
        y: rng() * H,
        size,
        baseOpacity: isPurple ? 0.55 + rng() * 0.45 : 0.18 + rng() * 0.72,
        opacity: 1,
        twinkleSpeed: 0.0004 + rng() * 0.0016,
        twinklePhase: rng() * Math.PI * 2,
        isPurple,
        glowRadius: isPurple ? size * 4.5 : size * 2.2,
        color,
      });
    }

    // Sort so purple stars render on top
    stars.sort((a, b) => (a.isPurple ? 1 : 0) - (b.isPurple ? 1 : 0));
    starsRef.current = stars;
  }, []);

  const spawnShooter = useCallback(() => {
    const W = window.innerWidth;
    const H = window.innerHeight;

    // Come from top-left quadrant, travel down-right at shallow angle
    const angle = (Math.PI / 180) * (18 + Math.random() * 22);
    const speed = 520 + Math.random() * 340; // px/s
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    // Start from a random point along the top 60% of the screen
    const x = Math.random() * W * 0.85;
    const y = Math.random() * H * 0.55;

    shootersRef.current.push({
      x,
      y,
      vx,
      vy,
      life: 1,
      maxLen: 120 + Math.random() * 180,
      active: true,
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    resize();
    buildStars();

    let lastTime = performance.now();

    const draw = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05); // cap at 50 ms
      lastTime = now;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const W = window.innerWidth;
      const H = window.innerHeight;

      // ── Background ────────────────────────────────────────────────────────
      ctx.fillStyle = "#05020b";
      ctx.fillRect(0, 0, W, H);

      // Deep-space radial nebula hint — purple cloud near center
      const nebula = ctx.createRadialGradient(W * 0.62, H * 0.38, 0, W * 0.62, H * 0.38, W * 0.45);
      nebula.addColorStop(0, "rgba(109,40,217,0.055)");
      nebula.addColorStop(0.5, "rgba(76,29,149,0.028)");
      nebula.addColorStop(1, "transparent");
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, W, H);

      // Secondary fainter nebula — top-left
      const nebula2 = ctx.createRadialGradient(W * 0.18, H * 0.22, 0, W * 0.18, H * 0.22, W * 0.32);
      nebula2.addColorStop(0, "rgba(139,92,246,0.035)");
      nebula2.addColorStop(1, "transparent");
      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, W, H);

      // ── Stars ─────────────────────────────────────────────────────────────
      const t = now * 0.001;
      for (const star of starsRef.current) {
        star.opacity = star.baseOpacity * (0.62 + 0.38 * Math.sin(t * star.twinkleSpeed * 1000 + star.twinklePhase));

        if (star.isPurple) {
          // Glow halo
          const grd = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.glowRadius);
          grd.addColorStop(0, `${star.color}${Math.round(star.opacity * 0.55 * 255).toString(16).padStart(2, "0")}`);
          grd.addColorStop(0.4, `${star.color}${Math.round(star.opacity * 0.18 * 255).toString(16).padStart(2, "0")}`);
          grd.addColorStop(1, "transparent");
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.glowRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Star core
        ctx.globalAlpha = star.opacity;
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // ── Shooting stars ────────────────────────────────────────────────────
      // Spawn logic: 1 every 3-7 seconds, up to 2 active at once
      const activeCount = shootersRef.current.filter(s => s.active).length;
      if (activeCount < 2 && now - lastShootRef.current > 3000 + Math.random() * 4000) {
        spawnShooter();
        lastShootRef.current = now;
      }

      for (const s of shootersRef.current) {
        if (!s.active) continue;

        s.life -= dt * 0.75; // decay speed
        if (s.life <= 0) {
          s.active = false;
          continue;
        }

        s.x += s.vx * dt;
        s.y += s.vy * dt;

        const tailX = s.x - (s.vx / Math.hypot(s.vx, s.vy)) * s.maxLen * (1 - s.life);
        const tailY = s.y - (s.vy / Math.hypot(s.vx, s.vy)) * s.maxLen * (1 - s.life);

        // Core trail gradient: bright-white head → violet → purple → burnt-orange tail
        const trail = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        trail.addColorStop(0, `rgba(255,255,255,0)`);
        trail.addColorStop(0.35, `rgba(192,132,252,${s.life * 0.25})`);   // violet
        trail.addColorStop(0.7,  `rgba(167,139,250,${s.life * 0.55})`);   // lavender
        trail.addColorStop(0.88, `rgba(251,146,60,${s.life * 0.65})`);    // fire-orange
        trail.addColorStop(1,    `rgba(255,255,255,${s.life * 0.9})`);    // bright head

        ctx.save();
        ctx.strokeStyle = trail;
        ctx.lineWidth = 1.6 + s.life * 1.2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();

        // Fiery head glow
        const headGlow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 10 + s.life * 8);
        headGlow.addColorStop(0, `rgba(255,255,255,${s.life * 0.9})`);
        headGlow.addColorStop(0.3, `rgba(251,191,36,${s.life * 0.45})`);  // amber
        headGlow.addColorStop(0.6, `rgba(192,132,252,${s.life * 0.22})`); // purple
        headGlow.addColorStop(1, "transparent");
        ctx.fillStyle = headGlow;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 10 + s.life * 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Prune finished shooters (keep array from growing unboundedly)
      if (shootersRef.current.length > 12) {
        shootersRef.current = shootersRef.current.filter(s => s.active);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    const onResize = () => {
      resize();
      buildStars();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [resize, buildStars, spawnShooter]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[-1]"
      aria-hidden="true"
      style={{ display: "block", background: "#05020b" }}
    />
  );
}
