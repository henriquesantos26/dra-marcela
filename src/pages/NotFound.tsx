import { useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

const GLITCH_WORDS = [
  "ERRO", "FALHA", "NULL", "VOID", "CRASH", "BUG", "LOST", "GONE",
  "BREAK", "HACK", "GLITCH", "DEAD", "EXIT", "PANIC", "ABORT",
  "SYSTEM", "DENIED", "FATAL", "CORRUPT", "OVERFLOW", "TIMEOUT",
  "404", "NOT_FOUND", "UNDEFINED", "NaN", "SEGFAULT", "KERNEL",
];

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  hue: number;
}

const NotFound = () => {
  const location = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [glitchTitle, setGlitchTitle] = useState("404");
  const animRef = useRef<number>(0);
  const particlesRef = useRef<FloatingText[]>([]);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  // Glitch title effect
  useEffect(() => {
    const chars = "!@#$%^&*()_+-=[]{}|;':\",./<>?01";
    const original = "404";
    let interval: NodeJS.Timeout;

    const glitch = () => {
      const shouldGlitch = Math.random() > 0.7;
      if (shouldGlitch) {
        let result = "";
        for (let i = 0; i < original.length; i++) {
          result += Math.random() > 0.5 ? chars[Math.floor(Math.random() * chars.length)] : original[i];
        }
        setGlitchTitle(result);
        setTimeout(() => setGlitchTitle(original), 100 + Math.random() * 150);
      }
    };

    interval = setInterval(glitch, 300);
    return () => clearInterval(interval);
  }, []);

  // Canvas floating text animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize particles
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 60; i++) {
        particlesRef.current.push({
          id: i,
          text: GLITCH_WORDS[Math.floor(Math.random() * GLITCH_WORDS.length)],
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          size: 10 + Math.random() * 18,
          opacity: 0.03 + Math.random() * 0.15,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.02,
          hue: Math.random() > 0.5 ? 270 + Math.random() * 30 : 0,
        });
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        // Wrap around
        if (p.x < -100) p.x = canvas.width + 100;
        if (p.x > canvas.width + 100) p.x = -100;
        if (p.y < -50) p.y = canvas.height + 50;
        if (p.y > canvas.height + 50) p.y = -50;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.font = `900 ${p.size}px monospace`;
        ctx.fillStyle = p.hue > 200
          ? `hsla(${p.hue}, 80%, 60%, ${p.opacity})`
          : `hsla(0, 80%, 50%, ${p.opacity})`;
        ctx.fillText(p.text, 0, 0);
        ctx.restore();
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0a]">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Scan lines overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-10"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.8) 100%)" }}
      />

      {/* Content */}
      <div className="relative z-20 text-center px-6 select-none">
        {/* Glitch 404 */}
        <div className="relative mb-6">
          <h1
            className="text-[12rem] md:text-[18rem] font-black leading-none tracking-tighter"
            style={{
              color: "transparent",
              WebkitTextStroke: "2px rgba(139, 92, 246, 0.6)",
              textShadow: "0 0 80px rgba(139, 92, 246, 0.3), 0 0 160px rgba(139, 92, 246, 0.1)",
              fontFamily: "monospace",
            }}
          >
            {glitchTitle}
          </h1>
          {/* Glitch layers */}
          <h1
            className="absolute inset-0 text-[12rem] md:text-[18rem] font-black leading-none tracking-tighter animate-pulse"
            style={{
              color: "transparent",
              WebkitTextStroke: "1px rgba(239, 68, 68, 0.3)",
              transform: "translate(3px, -2px)",
              fontFamily: "monospace",
            }}
          >
            {glitchTitle}
          </h1>
        </div>

        <p className="text-lg md:text-2xl font-bold text-white/30 mb-2 uppercase tracking-[0.5em] font-mono">
          PÁGINA NÃO ENCONTRADA
        </p>
        <p className="text-sm text-white/15 font-mono mb-12 tracking-widest">
          {location.pathname}
        </p>

        <a
          href="/"
          className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(239, 68, 68, 0.1))",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            color: "rgba(139, 92, 246, 0.8)",
          }}
        >
          <span className="relative z-10">← Voltar ao início</span>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      </div>
    </div>
  );
};

export default NotFound;
