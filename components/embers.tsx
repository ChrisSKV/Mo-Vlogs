"use client";

import { useEffect, useRef } from "react";

/**
 * Rising embers behind the first place block.
 *
 * Canvas rather than a stack of animated divs: a few hundred particles with
 * glow would be a few hundred composited layers in CSS, and on the mid range
 * Android that most of this traffic arrives on that is the difference between
 * a warm background and a janky one.
 *
 * Three things keep it from being a battery tax:
 *  - it stops completely when the section is off screen,
 *  - it stops when the tab is hidden,
 *  - prefers-reduced-motion paints one still frame and never animates.
 */

type Ember = {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  life: number;
  maxLife: number;
  hue: number;
};

const COUNT_PER_MP = 130; // embers per megapixel, so density reads the same on any size

export function Embers({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let embers: Ember[] = [];
    let raf = 0;
    let running = false;

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    function spawn(initial = false): Ember {
      // Long lives and slow rise: at the previous speed they read as rain
      // going the wrong way rather than as embers hanging in the air.
      const maxLife = rand(420, 900);
      return {
        x: rand(0, w),
        // Respawn anywhere in the panel, not along the floor. Rising from the
        // bottom edge left the top two thirds empty, and the section is tall
        // enough that the emptiness was the thing you noticed.
        y: rand(-20, h + 20),
        r: rand(0.5, 2),
        vy: -rand(0.04, 0.16),
        vx: rand(-0.05, 0.05),
        life: initial ? rand(0, maxLife) : 0,
        maxLife,
        hue: rand(28, 46), // amber through gold
      };
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.round(((w * h) / 1_000_000) * COUNT_PER_MP);
      embers = Array.from({ length: Math.max(40, Math.min(240, target)) }, () => spawn(true));
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h);
      ctx!.globalCompositeOperation = "lighter";
      for (const e of embers) {
        const t = e.life / e.maxLife;
        // Fade in over the first fifth, hold, then fade out: an ember that
        // pops into existence at full brightness reads as a dead pixel.
        const alpha = (t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8) * 0.85;
        if (alpha > 0) {
          ctx!.beginPath();
          ctx!.arc(e.x, e.y, e.r, 0, Math.PI * 2);
          ctx!.fillStyle = `hsla(${e.hue}, 92%, ${58 + e.r * 6}%, ${alpha})`;
          ctx!.shadowBlur = 10 + e.r * 5;
          ctx!.shadowColor = `hsla(${e.hue}, 96%, 60%, ${alpha * 0.9})`;
          ctx!.fill();
        }
      }
      ctx!.shadowBlur = 0;
      ctx!.globalCompositeOperation = "source-over";
    }

    function step() {
      for (let i = 0; i < embers.length; i++) {
        const e = embers[i];
        e.life += 1;
        e.y += e.vy;
        // A very slow sine on the drift so they wander rather than track up.
        e.x += e.vx + Math.sin((e.life + i * 37) / 140) * 0.05;
        if (e.life >= e.maxLife || e.y < -30) embers[i] = spawn();
      }
      draw();
      raf = requestAnimationFrame(step);
    }

    function start() {
      if (running || reduced) return;
      running = true;
      raf = requestAnimationFrame(step);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    resize();
    draw(); // one frame immediately, so it is never an empty box

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 },
    );
    io.observe(canvas);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={className} />;
}
