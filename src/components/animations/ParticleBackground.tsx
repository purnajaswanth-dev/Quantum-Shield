'use client';
import { useEffect, useRef } from 'react';

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let mouse = { x: -1000, y: -1000 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);

    // Particles
    type Particle = {
      x: number; y: number; vx: number; vy: number; size: number; alpha: number; color: string;
      originalX: number; originalY: number;
    };

    const colors = ['#00d4ff', '#a855f7', '#22d3ee', '#7c3aed'];
    const particles: Particle[] = Array.from({ length: 100 }, () => {
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      return {
        x, y, originalX: x, originalY: y,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    });

    // Hexagonal Grid points
    const hexGrid: {x: number, y: number, r: number}[] = [];
    const spacing = 100;
    for (let x = 0; x < window.innerWidth + spacing; x += spacing) {
      for (let y = 0; y < window.innerHeight + spacing; y += spacing) {
        hexGrid.push({ x, y, r: 2 });
      }
    }

    const draw = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw faint scanlines
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.02)';
      ctx.lineWidth = 1;
      for (let y = 0; y < canvas.height; y += 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw grid points (static background)
      ctx.fillStyle = 'rgba(0, 212, 255, 0.15)';
      for (const p of hexGrid) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.1 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw & Update particles
      for (const p of particles) {
        // Mouse interact
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          const force = (200 - dist) / 200;
          p.vx -= (dx / dist) * force * 0.2;
          p.vy -= (dy / dist) * force * 0.2;
        }

        // Friction
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Base movement
        p.vx += (Math.random() - 0.5) * 0.01;
        p.vy += (Math.random() - 0.5) * 0.01;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        
        // Pulsate alpha
        const pulse = (Math.sin(time / 1000 + p.x) + 1) / 2;
        ctx.globalAlpha = p.alpha * (0.5 + pulse * 0.5);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Draw floating "3D" objects (rects/triangles)
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const offset = i * 2000;
        const x = (time / 20 + offset) % (canvas.width + 200) - 100;
        const y = (Math.sin(time / 1000 + i) * 100) + (canvas.height / 2);
        ctx.strokeStyle = i % 2 === 0 ? 'rgba(0, 212, 255, 0.1)' : 'rgba(168, 85, 247, 0.1)';
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(time / 2000 + i);
        ctx.strokeRect(-20, -20, 40, 40);
        ctx.restore();
      }

      animFrameId = requestAnimationFrame(draw);
    };

    draw(0);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.8,
        filter: 'blur(0.5px)',
      }}
    />
  );
}
