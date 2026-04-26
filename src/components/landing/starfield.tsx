"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  speed: number;
  phase: number;
  // "white" | "purple" | "bright-purple"
  type: "white" | "purple" | "bright-purple";
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  opacity: number;
  // 0 = fading in, 1 = travelling, 2 = fading out
  phase: "in" | "travel" | "out";
  life: number;      // frames alive
  maxLife: number;   // total frames for travel phase
  tailOpacity: number;
}

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const starCount = isMobile ? 100 : 200;

    let stars: Star[] = [];
    let shootingStars: ShootingStar[] = [];
    let nextShootingStarIn = 180 + Math.random() * 240; // frames until next one (6–14 s at 30fps)

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
      generateStars();
    }

    function generateStars() {
      if (!canvas) return;
      stars = Array.from({ length: starCount }, (_, i) => {
        // ~20% purple stars, 4 large bright-purple accent stars
        let type: Star["type"] = "white";
        if (i < 4) type = "bright-purple";
        else if (i < starCount * 0.22) type = "purple";

        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: type === "bright-purple"
            ? Math.random() * 0.8 + 1.0
            : Math.random() * 1.0 + 0.3,
          baseOpacity: type === "bright-purple"
            ? Math.random() * 0.25 + 0.30   // 0.30–0.55
            : Math.random() * 0.30 + 0.08,  // 0.08–0.38
          speed: Math.random() * 0.010 + 0.002,
          phase: Math.random() * Math.PI * 2,
          type,
        };
      });
    }

    function spawnShootingStar() {
      if (!canvas) return;
      // Always travel diagonally down-right at a shallow angle
      const angle = (Math.random() * 25 + 15) * (Math.PI / 180); // 15°–40°
      const speed = Math.random() * 8 + 6; // px/frame at 30fps
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const length = Math.random() * 120 + 80;

      // Start from a random point in the top-left 70% of the screen
      const x = Math.random() * canvas.width * 0.70;
      const y = Math.random() * canvas.height * 0.35;

      shootingStars.push({
        x, y, vx, vy,
        length,
        opacity: 0,
        phase: "in",
        life: 0,
        maxLife: Math.floor(length / speed) + 20,
        tailOpacity: 0,
      });
    }

    function drawShootingStar(s: ShootingStar) {
      if (!canvas || !ctx) return;

      // Tail end
      const tx = s.x - s.vx / Math.hypot(s.vx, s.vy) * s.length;
      const ty = s.y - s.vy / Math.hypot(s.vx, s.vy) * s.length;

      const grad = ctx.createLinearGradient(tx, ty, s.x, s.y);
      grad.addColorStop(0, `rgba(255, 255, 255, 0)`);
      // Core: mostly white with a violet-tinted middle
      grad.addColorStop(0.5, `rgba(210, 190, 255, ${s.opacity * 0.4})`);
      grad.addColorStop(0.85, `rgba(230, 210, 255, ${s.opacity * 0.85})`);
      grad.addColorStop(1, `rgba(255, 255, 255, ${s.opacity})`);

      ctx.save();
      ctx.shadowBlur = 10;
      ctx.shadowColor = `rgba(180, 140, 255, ${s.opacity * 0.7})`;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(s.x, s.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      ctx.stroke();

      // Bright tip
      ctx.beginPath();
      ctx.arc(s.x, s.y, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
      ctx.shadowBlur = 14;
      ctx.shadowColor = `rgba(200, 170, 255, ${s.opacity})`;
      ctx.fill();
      ctx.restore();
    }

    resize();

    let lastTime = 0;
    const FPS_CAP = 30;
    const FRAME_TIME = 1000 / FPS_CAP;
    let animFrame: number;
    let frame = 0;

    function animate(time: number) {
      animFrame = requestAnimationFrame(animate);
      if (time - lastTime < FRAME_TIME) return;
      lastTime = time;
      frame++;

      if (!canvas || !ctx) return;

      // Background
      const grad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height * 0.35, 0,
        canvas.width / 2, canvas.height * 0.35, canvas.width * 0.75
      );
      grad.addColorStop(0, "#0e0b14"); // very slightly violet-tinted center
      grad.addColorStop(1, "#09090b");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      stars.forEach((star) => {
        const twinkle = Math.sin(time * star.speed + star.phase) * 0.15;
        const opacity = Math.max(0, Math.min(1, star.baseOpacity + twinkle));

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);

        if (star.type === "bright-purple") {
          ctx.fillStyle = `rgba(190, 155, 255, ${opacity})`;
          ctx.shadowBlur = 12;
          ctx.shadowColor = `rgba(160, 100, 255, ${opacity * 0.7})`;
        } else if (star.type === "purple") {
          ctx.fillStyle = `rgba(200, 170, 255, ${opacity})`;
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.shadowBlur = 0;
        }

        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Shooting star scheduler
      nextShootingStarIn--;
      if (nextShootingStarIn <= 0) {
        spawnShootingStar();
        // Next one in 8–20 seconds at 30fps
        nextShootingStarIn = 240 + Math.random() * 360;
      }

      // Update + draw shooting stars
      shootingStars = shootingStars.filter((s) => {
        s.life++;

        if (s.phase === "in") {
          s.opacity = Math.min(1, s.opacity + 0.12);
          if (s.opacity >= 0.95) s.phase = "travel";
        } else if (s.phase === "travel") {
          s.x += s.vx;
          s.y += s.vy;
          if (s.life > s.maxLife) s.phase = "out";
        } else {
          s.opacity = Math.max(0, s.opacity - 0.10);
          s.x += s.vx * 0.5;
          s.y += s.vy * 0.5;
          if (s.opacity <= 0) return false; // remove
        }

        // Also remove if it flies off canvas
        if (canvas && (s.x > canvas.width + 200 || s.y > canvas.height + 200)) {
          return false;
        }

        drawShootingStar(s);
        return true;
      });
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
