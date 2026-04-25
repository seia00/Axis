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
    const starCount = isMobile ? 120 : 250;

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
        size: Math.random() * 2 + 0.5,
        baseOpacity: Math.random() * 0.6 + 0.2,
        speed: Math.random() * 0.015 + 0.003,
        phase: Math.random() * Math.PI * 2,
        isBright: i < 8,
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

      // Background gradient
      const grad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height * 0.3, 0,
        canvas.width / 2, canvas.height * 0.3, canvas.width * 0.8
      );
      grad.addColorStop(0, "#0c1425");
      grad.addColorStop(1, "#050a18");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        const twinkle = Math.sin(time * star.speed + star.phase) * 0.3;
        const opacity = Math.max(0, Math.min(1, star.baseOpacity + twinkle));

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.isBright ? star.size + 1 : star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;

        if (star.isBright) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = `rgba(180, 210, 255, ${opacity * 0.6})`;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.fill();
      });

      ctx.shadowBlur = 0;
    }

    animFrame = requestAnimationFrame(animate);

    // Resize debounce
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
