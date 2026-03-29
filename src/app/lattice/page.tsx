'use client';
import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThreeDCard from '@/components/animations/ThreeDCard';

type Point = { x: number; y: number };

function jitter(val: number, range: number) {
  return val + (Math.random() - 0.5) * range * 2;
}

export default function LatticeVisualizerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animating, setAnimating] = useState(false);
  const [noiseLevel, setNoiseLevel] = useState(1.5);
  const [showLabels, setShowLabels] = useState(true);
  const [noiseAdded, setNoiseAdded] = useState(false);
  const [recovered, setRecovered] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const animRef = useRef<number>(0);
  const noiseRef = useRef(noiseLevel);
  const [noisedPoints, setNoisedPoints] = useState<Point[]>([]);
  const [selected, setSelected] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => { noiseRef.current = noiseLevel; }, [noiseLevel]);

  const handleAddNoise = useCallback(async () => {
    setTransitioning(true);
    setRecovered(false);
    setSelected(false);
    setNoisedPoints([]);

    await new Promise(r => setTimeout(r, 300));
    setNoiseAdded(true);
    setTransitioning(false);
    if (!animating) setAnimating(true);
  }, [animating]);

  const handleRecover = useCallback(async () => {
    setTransitioning(true);
    setAnimating(false);
    await new Promise(r => setTimeout(r, 300));
    setNoiseAdded(false);
    setNoisedPoints([]);
    setSelected(false);
    setRecovered(true);
    setTransitioning(false);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const GRID = 48;
    const COLS = Math.floor(W / GRID);
    const ROWS = Math.floor(H / GRID);
    const OX = (W - COLS * GRID) / 2;
    const OY = (H - ROWS * GRID) / 2;

    ctx.clearRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = 'rgba(0, 245, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let col = 0; col <= COLS; col++) {
      ctx.beginPath();
      ctx.moveTo(OX + col * GRID, OY);
      ctx.lineTo(OX + col * GRID, OY + ROWS * GRID);
      ctx.stroke();
    }
    for (let row = 0; row <= ROWS; row++) {
      ctx.beginPath();
      ctx.moveTo(OX, OY + row * GRID);
      ctx.lineTo(OX + COLS * GRID, OY + row * GRID);
      ctx.stroke();
    }

    // Lattice points
    for (let col = 0; col <= COLS; col++) {
      for (let row = 0; row <= ROWS; row++) {
        const px = OX + col * GRID;
        const py = OY + row * GRID;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 245, 255, 0.15)';
        ctx.fill();
        
        // Add subtle glow to grid points
        if ((col + row) % 5 === 0) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = 'rgba(0, 245, 255, 0.3)';
          ctx.fillStyle = 'rgba(0, 245, 255, 0.4)';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }

    const secretCol = Math.round(COLS / 2);
    const secretRow = Math.round(ROWS / 2);
    const secretX = OX + secretCol * GRID;
    const secretY = OY + secretRow * GRID;

    // Noised points
    if (noiseAdded) {
      // Use dynamic points if animating and not selected, else use static points
      const pts = (animating && !selected) 
        ? Array.from({ length: 8 }, () => ({
            x: jitter(secretX, noiseRef.current * GRID),
            y: jitter(secretY, noiseRef.current * GRID),
          }))
        : noisedPoints;

      for (const pt of pts) {
        ctx.setLineDash([8, 8]);
        ctx.strokeStyle = selected ? 'rgba(0, 245, 255, 0.4)' : 'rgba(124, 58, 237, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(secretX, secretY);
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 7, 0, Math.PI * 2);
        ctx.fillStyle = selected ? 'rgba(0, 245, 255, 0.2)' : 'rgba(124, 58, 237, 0.2)';
        ctx.fill();
        ctx.strokeStyle = selected ? 'var(--neon-blue)' : '#a78bfa';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = selected ? 'var(--neon-blue)' : '#8b5cf6';
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      if (showLabels && pts.length > 0) {
        ctx.fillStyle = selected ? 'var(--neon-blue)' : '#f5f3ff';
        ctx.font = "800 14px 'Space Grotesk', sans-serif";
        ctx.fillText(selected ? 'LWE_SAMPLE_SELECTED' : 'DYNAMIC_NOISE_VECTOR', pts[0].x + 15, pts[0].y - 10);
      }
    }

    // Secret point (always drawn, changes color if recovered)
    const ptColor = recovered ? '#00f5ff' : '#22c55e';
    ctx.beginPath();
    ctx.arc(secretX, secretY, 15, 0, Math.PI * 2);
    ctx.fillStyle = recovered ? 'rgba(0, 245, 255, 0.1)' : 'rgba(34, 197, 94, 0.1)';
    ctx.fill();
    ctx.strokeStyle = ptColor;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 25;
    ctx.shadowColor = ptColor;
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    ctx.beginPath();
    ctx.arc(secretX, secretY, 6, 0, Math.PI * 2);
    ctx.fillStyle = ptColor;
    ctx.fill();

    // Pulse ring on recover
    if (recovered) {
      ctx.beginPath();
      ctx.arc(secretX, secretY, 25 + ((tick % 30) / 30) * 20, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 245, 255, ${0.5 - ((tick % 30) / 30) * 0.5})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    if (showLabels) {
      ctx.fillStyle = recovered ? '#00f5ff' : '#22c55e';
      ctx.font = "800 16px 'Space Grotesk', sans-serif";
      ctx.shadowBlur = 10;
      ctx.shadowColor = recovered ? 'rgba(0, 245, 255, 0.5)' : 'rgba(34, 197, 94, 0.5)';
      ctx.fillText(recovered ? 'RECOVERED_VECTOR ✓' : 'SECRET_COORD_ORIGIN', secretX + 24, secretY - 14);
      ctx.shadowBlur = 0;
      
      ctx.fillStyle = 'rgba(226, 232, 240, 0.5)';
      ctx.font = "700 13px 'JetBrains Mono', monospace";
      ctx.fillText(`COORD_SPACE: [ ${secretCol}, ${secretRow} ]`, secretX + 24, secretY + 10);
    }

    ctx.fillStyle = 'rgba(226, 232, 240, 0.3)';
    ctx.font = "600 12px 'JetBrains Mono', monospace";
    ctx.fillText('ENGINE: LWE_NOISE_RADIUS_SAMPLER v2.4.0', 32, H - 32);

  }, [showLabels, noiseAdded, recovered, tick, noisedPoints, animating, selected]);

  useEffect(() => {
    if (!animating) { draw(); return; }
    const loop = () => {
      draw();
      setTick(t => t + 1);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [animating, draw]);

  useEffect(() => { draw(); }, [noiseLevel, showLabels, draw, noiseAdded, recovered, tick, noisedPoints, animating, selected]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 60, textAlign: 'center' }}
      >
        <div className="badge-quantum" style={{ 
          marginBottom: 24, 
          padding: '8px 20px',
          background: 'rgba(0, 245, 255, 0.1)',
          borderColor: 'rgba(0, 245, 255, 0.3)',
          letterSpacing: '0.2em',
          borderRadius: '16px'
        }}>
          🔷 LATTICE_DYNAMICS_V1
        </div>
        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900,
          fontSize: 'clamp(40px, 6vw, 72px)',
          letterSpacing: '-0.04em',
          lineHeight: 1,
          background: 'linear-gradient(135deg, #fff 0%, #00f5ff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          LATTICE VECTOR <br/> VISUALIZER
        </h1>
        <p style={{ color: 'rgba(226, 232, 240, 0.6)', marginTop: 24, fontSize: 20, lineHeight: 1.6, maxWidth: 800, margin: '24px auto 0' }}>
          Visualizing the hardness of the <strong className="shimmer-text">Module Learning With Errors (M-LWE)</strong> problem. <br/>
          Finding the secret lattice point amidst gaussian noise is the barrier protecting future communication.
        </p>
      </motion.div>


      {/* Controls */}
      <ThreeDCard intensity={5}>
        <div className="qs-card glass-premium no-hover-transform" style={{ marginBottom: 40, background: 'rgba(10, 10, 26, 0.4)', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 300 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: 'rgba(226, 232, 240, 0.6)', fontWeight: 700, letterSpacing: '0.15em' }}>
                  ERROR_OFFSET_BOUND
                </label>
                <div style={{ fontSize: 15, background: 'rgba(0, 245, 255, 0.1)', color: 'var(--neon-blue)', padding: '4px 12px', borderRadius: '8px', border: '1px solid rgba(0, 245, 255, 0.2)', fontWeight: 800 }}>
                  {noiseLevel.toFixed(1)}σ
                </div>
              </div>
              <input
                type="range" min={0.5} max={3.5} step={0.1} value={noiseLevel}
                onChange={e => setNoiseLevel(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--neon-blue)', height: 6, borderRadius: 3 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <button
                className="btn-danger"
                onClick={handleAddNoise}
                disabled={transitioning}
                style={{ height: 48, padding: '0 24px', borderRadius: '14px', fontSize: 14, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
              >
                🔀 INJECT_NOISE
              </button>
              <button
                className="btn-neon"
                onClick={handleRecover}
                disabled={!noiseAdded || transitioning}
                style={{ height: 48, padding: '0 24px', borderRadius: '14px', fontSize: 14 }}
              >
                🔓 RECOVER_ORIGIN
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  if (animating && !selected) {
                    // STOP & SELECT functionality
                    const canvas = canvasRef.current;
                    if (canvas) {
                      const W = canvas.width;
                      const H = canvas.height;
                      const GRID = 48;
                      const COLS = Math.floor(W / GRID);
                      const ROWS = Math.floor(H / GRID);
                      const OX = (W - COLS * GRID) / 2;
                      const OY = (H - ROWS * GRID) / 2;
                      const secretCol = Math.round(COLS / 2);
                      const secretRow = Math.round(ROWS / 2);
                      const secretX = OX + secretCol * GRID;
                      const secretY = OY + secretRow * GRID;
                      
                      const pts = Array.from({ length: 8 }, () => ({
                        x: jitter(secretX, noiseLevel * GRID),
                        y: jitter(secretY, noiseLevel * GRID),
                      }));
                      setNoisedPoints(pts);
                      setSelected(true);
                    }
                    setAnimating(false);
                  } else {
                    setAnimating(!animating);
                    if (!animating) setSelected(false);
                  }
                }}
                disabled={!noiseAdded && animating}
                style={{ height: 48, padding: '0 24px', borderRadius: '14px', fontSize: 13, 
                  borderColor: animating ? 'rgba(0, 245, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                  color: (animating && !selected) ? 'var(--neon-blue)' : '#fff',
                  fontWeight: (animating && !selected) ? 800 : 500
                }}
              >
                {(animating && !selected) ? '⏹ STOP & SELECT' : (selected ? '▶ RE-SCAN' : '▶ RUN_SIM')}
              </button>
              <button
                className="btn-secondary"
                onClick={() => setShowLabels(!showLabels)}
                style={{ height: 48, padding: '0 24px', borderRadius: '14px', fontSize: 20 }}
                title={showLabels ? 'Hide Labels' : 'Show Labels'}
              >
                {showLabels ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
          
          <AnimatePresence>
            {noiseAdded && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: 24, padding: '16px 20px', borderRadius: '16px', background: 'rgba(94, 0, 255, 0.05)', border: '1px solid rgba(94, 0, 255, 0.15)', fontSize: 15, color: '#d8b4fe', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 16 }}
              >
                <span style={{ fontSize: 24 }}>📡</span>
                <span>SIGNAL_LOSS_DETECTED: Attacker perspective synchronized. Resolution requires secret private-key trapdoor.</span>
              </motion.div>
            )}
            {recovered && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: 24, padding: '16px 20px', borderRadius: '16px', background: 'rgba(0, 245, 255, 0.05)', border: '1px solid rgba(0, 245, 255, 0.15)', fontSize: 15, color: 'var(--neon-blue)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 16 }}
              >
                <span style={{ fontSize: 24 }}>✅</span>
                <span>DECRYPTION_COMPLETE: Trapdoor logic applied. Recovered secret lattice vector from noisy observation set.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ThreeDCard>


      {/* Canvas */}
      <ThreeDCard intensity={5} style={{ marginBottom: 32 }}>
        <div className="lattice-canvas-wrap neon-border-blue" style={{ overflow: 'hidden', background: 'rgba(2,2,10,0.6)', backdropFilter: 'blur(20px)' }}>
          <canvas
            ref={canvasRef}
            width={1200}
            height={600}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      </ThreeDCard>

    {/* Legend + Info */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
      <ThreeDCard intensity={15}>
        <div className="qs-card h-full glass-premium" style={{ borderColor: 'rgba(34, 197, 94, 0.2)', background: 'rgba(34, 197, 94, 0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 16, height: 16, borderRadius: '6px', background: '#22c55e', boxShadow: '0 0 15px #22c55e' }} />
            <span style={{ fontWeight: 800, color: '#fff', fontSize: 18, letterSpacing: '0.05em' }}>SECRET_POINT</span>
          </div>
          <p style={{ fontSize: 15, color: 'rgba(226, 232, 240, 0.6)', lineHeight: 1.6, margin: 0 }}>
            The high-dimensional vector encoding the sensitive material. Recoverable only via the mathematical trapdoor hidden in the private key.
          </p>
        </div>
      </ThreeDCard>

      <ThreeDCard intensity={15}>
        <div className="qs-card h-full glass-premium" style={{ borderColor: 'rgba(124, 58, 237, 0.2)', background: 'rgba(124, 58, 237, 0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 16, height: 16, borderRadius: '6px', background: '#a78bfa', boxShadow: '0 0 15px #a78bfa' }} />
            <span style={{ fontWeight: 800, color: '#fff', fontSize: 18, letterSpacing: '0.05em' }}>ERROR_VECTORS</span>
          </div>
          <p style={{ fontSize: 15, color: 'rgba(226, 232, 240, 0.6)', lineHeight: 1.6, margin: 0 }}>
            Controlled perturbation applied to the secret. Without the key, an observer cannot distinguish between signal and intentional noise.
          </p>
        </div>
      </ThreeDCard>

      <ThreeDCard intensity={15}>
        <div className="qs-card h-full glass-premium" style={{ borderColor: 'rgba(0, 245, 255, 0.15)', background: 'rgba(0, 245, 255, 0.02)' }}>
          <div style={{ marginBottom: 20, fontSize: 32 }}>🌌</div>
          <span style={{ fontWeight: 800, color: '#fff', fontSize: 18, letterSpacing: '0.05em' }}>DIMENSIONAL_SCALING</span>
          <p style={{ fontSize: 15, color: 'rgba(226, 232, 240, 0.6)', lineHeight: 1.6, marginTop: 8, margin: 0 }}>
            Modern standards use 1024-dimensional space. This 2D slice is a microscopic view of a problem lattice whose volume exceeds the observable universe.
          </p>
        </div>
      </ThreeDCard>
    </div>

    </div>
  );
}
