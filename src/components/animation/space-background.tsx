"use client";

import { useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Star {
  ox: number;        // origin x (rest position)
  oy: number;        // origin y
  x: number;         // current rendered x (after cursor displacement + relax)
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

  // Cursor state — raw mouse position vs. smoothed lerped position used by the
  // displacement field. Lerping makes the warping feel buttery instead of jittery.
  const mouseRef = useRef({
    rawX: -9999, rawY: -9999,
    smoothX: -9999, smoothY: -9999,
    inWindow: false,
    velocity: 0,
  });

  // Warp jump state — triggered by triggerWarp() from warp-transition.tsx.
  // When active, stars accelerate radially outward from `originX, originY`
  // and the global drift gets a brief speed boost. Decays after `duration`.
  const warpRef = useRef({
    active: false,
    originX: 0, originY: 0,
    startTime: 0,
    duration: 700,
  });

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
    const purpleCount = Math.floor(count * 0.055);

    const stars: Star[] = [];

    for (let i = 0; i < count; i++) {
      const isPurple = i < purpleCount;
      const size = isPurple ? 1.6 + rng() * 2.2 : 0.4 + rng() * 1.6;
      const purpleHues = ["#c084fc", "#a78bfa", "#8b5cf6", "#ddd6fe", "#e9d5ff"];
      const color = isPurple
        ? purpleHues[Math.floor(rng() * purpleHues.length)]
        : `rgba(${220 + Math.floor(rng() * 35)},${220 + Math.floor(rng() * 35)},${240 + Math.floor(rng() * 15)},1)`;

      const ox = rng() * W;
      const oy = rng() * H;

      stars.push({
        ox, oy, x: ox, y: oy,
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

    stars.sort((a, b) => (a.isPurple ? 1 : 0) - (b.isPurple ? 1 : 0));
    starsRef.current = stars;
  }, []);

  const spawnShooter = useCallback(() => {
    const W = window.innerWidth;
    const H = window.innerHeight;

    // Default trajectory: top-left quadrant → down-right shallow angle
    let angle = (Math.PI / 180) * (18 + Math.random() * 22);

    // Cursor influence: if cursor is in window and moving, bias trajectory
    // 30% toward the cursor vector. Subtle "stars follow your motion" feel.
    const m = mouseRef.current;
    if (m.inWindow && m.velocity > 0.5) {
      const dx = m.smoothX - W * 0.4;
      const dy = m.smoothY - H * 0.3;
      const cursorAngle = Math.atan2(dy, dx);
      angle = angle * 0.7 + cursorAngle * 0.3;
    }

    const speed = 520 + Math.random() * 340;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const x = Math.random() * W * 0.85;
    const y = Math.random() * H * 0.55;

    shootersRef.current.push({
      x, y, vx, vy,
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
    let lastMouseX = 0, lastMouseY = 0;

    // ── Mouse event handlers ──────────────────────────────────────────────
    const onMove = (e: MouseEvent) => {
      const m = mouseRef.current;
      m.rawX = e.clientX;
      m.rawY = e.clientY;
      m.inWindow = true;
      // Track velocity from frame deltas
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      m.velocity = Math.hypot(dx, dy);
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };
    const onLeave = () => { mouseRef.current.inWindow = false; };
    const onEnter = () => { mouseRef.current.inWindow = true; };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("mouseenter", onEnter);

    // ── Warp jump handler ────────────────────────────────────────────────
    const onWarp = (e: Event) => {
      const ce = e as CustomEvent<{ x: number; y: number; duration: number }>;
      const w = warpRef.current;
      w.active = true;
      w.originX = ce.detail.x;
      w.originY = ce.detail.y;
      w.duration = ce.detail.duration;
      w.startTime = performance.now();
    };
    window.addEventListener("axis:warp", onWarp);

    // ── Render loop ───────────────────────────────────────────────────────
    const draw = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const W = window.innerWidth;
      const H = window.innerHeight;

      // ── Smooth cursor lerp (buttery feel) ─────────────────────────────
      const m = mouseRef.current;
      if (m.inWindow) {
        // Initialize on first frame
        if (m.smoothX === -9999) { m.smoothX = m.rawX; m.smoothY = m.rawY; }
        m.smoothX += (m.rawX - m.smoothX) * 0.10;
        m.smoothY += (m.rawY - m.smoothY) * 0.10;
      }
      // Decay velocity smoothly
      m.velocity *= 0.85;

      // ── Background — uniform purplish-black to match Spline scene ──────
      // Previously had two radial violet nebulae creating regional brightness
      // variance — removed because the bright spots made this canvas look
      // visibly different from the Spline scene's uniform dark backdrop.
      // Now: single flat color matching Spline's "purplish black" tone.
      ctx.fillStyle = "#0a0716";
      ctx.fillRect(0, 0, W, H);

      // ── Stars (with cursor displacement field) ────────────────────────
      const t = now * 0.001;
      const RADIUS = 240;          // displacement falloff radius (px)
      const RADIUS_SQ = RADIUS * RADIUS;
      const MAX_DISP = 18;         // max push (px)
      const RELAX = 0.12;          // how fast stars relax back to origin

      // Warp progress: 0..1 (1 = peak warp, decays back)
      const w = warpRef.current;
      let warpStrength = 0;
      if (w.active) {
        const progress = (now - w.startTime) / w.duration;
        if (progress >= 1) {
          w.active = false;
        } else {
          // Bell curve — peak at 30% through duration
          warpStrength = Math.sin(progress * Math.PI) * (1 - progress * 0.4);
        }
      }

      for (const star of starsRef.current) {
        // Compute target position based on cursor field + active warp
        let targetX = star.ox;
        let targetY = star.oy;

        if (m.inWindow && m.smoothX !== -9999) {
          const dx = star.ox - m.smoothX;
          const dy = star.oy - m.smoothY;
          const distSq = dx * dx + dy * dy;
          if (distSq < RADIUS_SQ && distSq > 1) {
            const dist = Math.sqrt(distSq);
            const t01 = dist / RADIUS;
            const force = (1 - t01 * t01) * MAX_DISP;
            const nx = dx / dist;
            const ny = dy / dist;
            targetX = star.ox + nx * force;
            targetY = star.oy + ny * force;
          }
        }

        // ── WARP jump: stars blast radially outward from origin ─────
        if (warpStrength > 0.001) {
          const wdx = star.ox - w.originX;
          const wdy = star.ox - w.originY; // intentional: use ox for symmetry
          const wDist = Math.hypot(star.ox - w.originX, star.oy - w.originY);
          if (wDist > 0.5) {
            const nx = (star.ox - w.originX) / wDist;
            const ny = (star.oy - w.originY) / wDist;
            // Closer stars get pushed harder (motion blur effect)
            const proximity = 1 - Math.min(1, wDist / Math.max(W, H));
            const blast = warpStrength * (60 + proximity * 200);
            targetX += nx * blast;
            targetY += ny * blast;
          }
          // Suppress unused linter warnings — wdx/wdy reserved for future tilt logic
          void wdx; void wdy;
        }

        // Spring toward target — faster relax during warp for kinetic feel
        const relax = warpStrength > 0.01 ? 0.30 : RELAX;
        star.x += (targetX - star.x) * relax;
        star.y += (targetY - star.y) * relax;

        // Twinkle
        star.opacity = star.baseOpacity * (0.62 + 0.38 * Math.sin(t * star.twinkleSpeed * 1000 + star.twinklePhase));

        // Purple glow halo
        if (star.isPurple) {
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

      // ── Cursor influence visualization (subtle) ───────────────────────
      // A very faint violet glow that follows the cursor
      if (m.inWindow && m.smoothX !== -9999) {
        const cursorGlow = ctx.createRadialGradient(m.smoothX, m.smoothY, 0, m.smoothX, m.smoothY, 90);
        cursorGlow.addColorStop(0, "rgba(167,139,250,0.06)");
        cursorGlow.addColorStop(0.5, "rgba(139,92,246,0.025)");
        cursorGlow.addColorStop(1, "transparent");
        ctx.fillStyle = cursorGlow;
        ctx.fillRect(m.smoothX - 90, m.smoothY - 90, 180, 180);
      }

      // ── Shooting stars ────────────────────────────────────────────────
      const activeCount = shootersRef.current.filter(s => s.active).length;
      if (activeCount < 2 && now - lastShootRef.current > 3000 + Math.random() * 4000) {
        spawnShooter();
        lastShootRef.current = now;
      }

      for (const s of shootersRef.current) {
        if (!s.active) continue;
        s.life -= dt * 0.75;
        if (s.life <= 0) { s.active = false; continue; }

        s.x += s.vx * dt;
        s.y += s.vy * dt;

        const tailX = s.x - (s.vx / Math.hypot(s.vx, s.vy)) * s.maxLen * (1 - s.life);
        const tailY = s.y - (s.vy / Math.hypot(s.vx, s.vy)) * s.maxLen * (1 - s.life);

        const trail = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        trail.addColorStop(0,    `rgba(255,255,255,0)`);
        trail.addColorStop(0.35, `rgba(192,132,252,${s.life * 0.25})`);
        trail.addColorStop(0.7,  `rgba(167,139,250,${s.life * 0.55})`);
        trail.addColorStop(0.88, `rgba(251,146,60,${s.life * 0.65})`);
        trail.addColorStop(1,    `rgba(255,255,255,${s.life * 0.9})`);

        ctx.save();
        ctx.strokeStyle = trail;
        ctx.lineWidth = 1.6 + s.life * 1.2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();

        const headGlow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 10 + s.life * 8);
        headGlow.addColorStop(0,   `rgba(255,255,255,${s.life * 0.9})`);
        headGlow.addColorStop(0.3, `rgba(251,191,36,${s.life * 0.45})`);
        headGlow.addColorStop(0.6, `rgba(192,132,252,${s.life * 0.22})`);
        headGlow.addColorStop(1, "transparent");
        ctx.fillStyle = headGlow;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 10 + s.life * 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (shootersRef.current.length > 12) {
        shootersRef.current = shootersRef.current.filter(s => s.active);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    const onResize = () => { resize(); buildStars(); };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mouseenter", onEnter);
      window.removeEventListener("axis:warp", onWarp);
    };
  }, [resize, buildStars, spawnShooter]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[-1]"
      aria-hidden="true"
      style={{ display: "block", background: "#0a0716" }}
    />
  );
}
