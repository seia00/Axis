"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  speed: number;
  phase: number;
  isBright: boolean;
}

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    // Fewer, dimmer stars — premium not planetarium
    const starCount = isMobile ? 90 : 180;

    let stars: Star[] = [];

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
      generateStars();
    }

    function generateStars() {
      if (!canvas) return;
      stars = Array.from({ length: starCount }, (_, i) => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        // Smaller stars — more delicate
        size: Math.random() * 1.2 + 0.3,
        // Dimmer opacity range: 0.08 – 0.45
        baseOpacity: Math.random() * 0.37 + 0.08,
        speed: Math.random() * 0.012 + 0.002,
        phase: Math.random() * Math.PI * 2,
        // Only 4 bright accent stars
        isBright: i < 4,
      }));
    }

    resize();

    let lastTime = 0;
    const FPS_CAP = 30;
    const FRAME_TIME = 1000 / FPS_CAP;
    let animFrame: number;

    function animate(time: number) {
      animFrame = requestAnimationFrame(animate);
      if (time - lastTime < FRAME_TIME) return;
      lastTime = time;

      if (!canvas || !ctx) return;

      // Near-black radial gradient — center barely lighter than edges
      const grad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height * 0.35, 0,
        canvas.width / 2, canvas.height * 0.35, canvas.width * 0.75
      );
      grad.addColorStop(0, "#0d0d10"); // zinc-950 center — very slightly warmer
      grad.addColorStop(1, "#09090b"); // zinc-950 edge — pure near-black
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        const twinkle = Math.sin(time * star.speed + star.phase) * 0.18;
        const opacity = Math.max(0, Math.min(1, star.baseOpacity + twinkle));

        ctx.beginPath();
        ctx.arc(
          star.x,
          star.y,
          star.isBright ? star.size + 0.6 : star.size,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;

        if (star.isBright) {
          // Subtle violet-tinted glow on the 4 accent stars
          ctx.shadowBlur = 8;
          ctx.shadowColor = `rgba(180, 160, 255, ${opacity * 0.5})`;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.fill();
      });

      ctx.shadowBlur = 0;
    }

    animFrame = requestAnimationFrame(animate);

    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
