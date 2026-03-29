'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThreeDCard from '@/components/animations/ThreeDCard';

const ROWS = [
  {
    category: 'QUANTUM_SECURITY',
    rsa: { value: '❌ CRITICAL_VULN', note: 'Shor\'s algorithm Breaks bit-strength in O(n³) time', color: '#fca5a5', bg: 'rgba(239,68,68,0.1)' },
    kyber: { value: '✅ SHIELDED', note: 'LWE-hardness exponential against QC adversaries', color: '#86efac', bg: 'rgba(34,197,94,0.1)' },
  },
  {
    category: 'PRIMITIVE_BASIS',
    rsa: { value: 'INT_FACTORIZATION', note: 'Factoring N = p × q (Classically hard, Quantum easy)', color: '#fde68a', bg: 'rgba(234,179,8,0.1)' },
    kyber: { value: 'MODULE-LWE (LATTICE)', note: 'Closest Vector Problem in 1024-dimensional space', color: '#c4b5fd', bg: 'rgba(168,85,247,0.1)' },
  },
  {
    category: 'PUBKEY_FOOTPRINT',
    rsa: { value: '256 BYTES (2048)', note: 'Compact but lacks entropy for quantum resistance', color: '#94a3b8', bg: 'rgba(255,255,255,0.05)' },
    kyber: { value: '1,184 BYTES (k=3)', note: 'Larger overhead required for grid complexity', color: '#67e8f9', bg: 'rgba(34,211,238,0.1)' },
  },
  {
    category: 'CIPHERTEXT_OVERHEAD',
    rsa: { value: '256 BYTES', note: 'OAEP padding overhead included', color: '#94a3b8', bg: 'rgba(255,255,255,0.05)' },
    kyber: { value: '1,088 BYTES', note: 'Encapsulating secret in lattice noise', color: '#67e8f9', bg: 'rgba(34,211,238,0.1)' },
  },
  {
    category: 'KEYGEN_LATENCY',
    rsa: { value: '~50ms (SLOW)', note: 'Expensive primality tests and RSA-CRT math', color: '#fde68a', bg: 'rgba(234,179,8,0.1)' },
    kyber: { value: '~0.04ms (ULTRA)', note: 'High-speed polynomial ops via NTT vectors', color: '#86efac', bg: 'rgba(34,197,94,0.1)' },
  },
  {
    category: 'NIST_FIPS_STATUS',
    rsa: { value: 'DEPRECATED 2030', note: 'NIST SP 800-131A mandates future transition', color: '#fde68a', bg: 'rgba(234,179,8,0.1)' },
    kyber: { value: 'ML-KEM (FIPS 203)', note: 'Globally standardized primary PQC standard', color: '#86efac', bg: 'rgba(34,197,94,0.1)' },
  },
  {
    category: 'THREAT_VECTOR',
    rsa: { value: '⚠️ HARVEST_NOW', note: 'Encrypted data store-and-crack risk is high', color: '#fca5a5', bg: 'rgba(239,68,68,0.1)' },
    kyber: { value: '✅ PERSISTENT', note: 'Protects today\'s data against tomorrow\'s computers', color: '#86efac', bg: 'rgba(34,197,94,0.1)' },
  },
];

const SCORE_ITEMS = [
  { label: 'QUANTUM_LEVEL_PERSISTENCE', rsa: 5, kyber: 100 },
  { label: 'VECTOR_COMPUTATION_SPEED', rsa: 30, kyber: 98 },
  { label: 'LEGACY_SUPPORT_MATURITY', rsa: 100, kyber: 70 },
  { label: 'GRID_COMPLEXITY_ENTROPY', rsa: 15, kyber: 99 },
  { label: 'NIST_STRATEGIC_ALIGNMENT', rsa: 20, kyber: 100 },
];

function ScoreBar({ rsa, kyber, label }: { rsa: number; kyber: number; label: string }) {
  const [filled, setFilled] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setFilled(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const w = filled ? 1 : 0;

  return (
    <div ref={ref} style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: 'rgba(148,163,184,0.7)', fontWeight: 800, letterSpacing: '0.1em' }}>{label}</span>
        <div style={{ display: 'flex', gap: 16 }}>
          <span style={{ fontSize: 12, color: 'var(--neon-pink)', fontWeight: 700 }}>RSA {rsa}%</span>
          <span style={{ fontSize: 12, color: 'var(--neon-blue)', fontWeight: 700 }}>KYBER {kyber}%</span>
        </div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(148,163,184,0.4)', marginBottom: 5 }}>
          <span style={{ fontWeight: 600 }}>CLASSICAL_RSA</span><span style={{ color: 'var(--neon-pink)' }}>{rsa}%</span>
        </div>
        <div style={{ position: 'relative', height: 10, borderRadius: 5, background: 'rgba(0,0,0,0.4)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${rsa * w}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: 'var(--neon-pink)', borderRadius: 5, boxShadow: '0 0 10px var(--neon-pink)' }} 
          />
        </div>
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(148,163,184,0.4)', marginBottom: 5 }}>
          <span style={{ fontWeight: 600 }}>PQC_CRYSTALS_KYBER</span><span style={{ color: 'var(--neon-blue)' }}>{kyber}%</span>
        </div>
        <div style={{ position: 'relative', height: 10, borderRadius: 5, background: 'rgba(0,0,0,0.4)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
          <motion.div 
             initial={{ width: 0 }}
             animate={{ width: `${kyber * w}%` }}
             transition={{ duration: 1.8, ease: "easeOut" }}
            style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: 'linear-gradient(to right, var(--neon-blue), var(--neon-purple))', borderRadius: 5, boxShadow: '0 0 15px var(--neon-blue)' }} 
          />
        </div>
      </div>
    </div>
  );
}

export default function ComparisonPage() {
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const [hoverRow, setHoverRow] = useState<number | null>(null);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 80, textAlign: 'center' }}
      >
        <div className="badge-quantum" style={{ 
          marginBottom: 24, 
          padding: '8px 20px',
          background: 'rgba(0, 245, 255, 0.1)',
          borderColor: 'rgba(0, 245, 255, 0.3)',
          letterSpacing: '0.2em',
          borderRadius: '16px'
        }}>
          📊 ANALYTICS_ENGINE_V1.1
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
          ALGORITHM <br/> DYNAMICS MATRIX
        </h1>
        <p style={{ color: 'rgba(226, 232, 240, 0.6)', marginTop: 24, fontSize: 20, lineHeight: 1.6, maxWidth: 800, margin: '24px auto 0' }}>
          High-resolution comparison between Legacy RSA and Post-Quantum CRYSTALS-Kyber. <br/>
          As we approach the quantum parity point, the shift to lattice-based systems is critical.
        </p>
      </motion.div>


      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 32, marginBottom: 60 }}>
        {/* RSA summary card */}
        <ThreeDCard intensity={15}>
          <div className="qs-card h-full glass-premium" style={{ borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.03)' }}>
            <motion.div 
              animate={{ rotateY: [0, 360] }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              style={{ fontSize: 48, marginBottom: 24, textAlign: 'center' }}
            >
              🔓
            </motion.div>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900, fontSize: 28, color: '#fca5a5', marginBottom: 16, letterSpacing: '-0.02em' }}>
              LEGACY_RSA_2048
            </h2>
            <div className="badge-danger" style={{ marginBottom: 20, fontWeight: 800, letterSpacing: '0.1em' }}>VULN_STATUS: CRITICAL</div>
            <p style={{ fontSize: 16, color: 'rgba(226, 232, 240, 0.6)', lineHeight: 1.7, margin: 0 }}>
              Factoring hardness is rendered obsolete by Shor&apos;s algorithm. RSA provides zero resistance in a post-parity environment. HARVEST_NOW_CRACK_LATER risk.
            </p>
          </div>
        </ThreeDCard>

        {/* Kyber summary card */}
        <ThreeDCard intensity={15}>
          <div className="qs-card h-full glass-premium" style={{ borderColor: 'rgba(0, 245, 255, 0.2)', background: 'rgba(0, 245, 255, 0.03)' }}>
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
              style={{ fontSize: 48, marginBottom: 24, textAlign: 'center' }}
            >
              🛡️
            </motion.div>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900, fontSize: 28, color: 'var(--neon-blue)', marginBottom: 16, letterSpacing: '-0.02em' }}>
              ML-KEM (KYBER)
            </h2>
            <div className="badge-quantum" style={{ marginBottom: 20, fontWeight: 800, letterSpacing: '0.1em' }}>VULN_STATUS: SHIELDED</div>
            <p style={{ fontSize: 16, color: 'rgba(226, 232, 240, 0.6)', lineHeight: 1.7, margin: 0 }}>
              Module-LWE primitives offer a super-polynomial barrier to quantum solvers. NIST-certified primary defense for the year 2035 and beyond.
            </p>
          </div>
        </ThreeDCard>
      </div>


      {/* Comparison Table */}
      <ThreeDCard intensity={2}>
        <div className="qs-card glass-premium" style={{ marginBottom: 80, padding: 0, overflow: 'hidden', background: 'rgba(10, 10, 26, 0.4)' }}>
          <div style={{ padding: '32px 40px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900, fontSize: 24, letterSpacing: '-0.02em', color: '#fff' }}>
              PROTOCOL_CAPABILITY_MATRIX
            </h2>
          </div>
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr',
            padding: '20px 40px', background: 'rgba(0,0,0,0.5)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            <span style={{ fontSize: 13, color: 'rgba(226, 232, 240, 0.4)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>CAPABILITY</span>
            <span style={{ fontSize: 13, color: '#fca5a5', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>RSA_LEGACY</span>
            <span style={{ fontSize: 13, color: 'var(--neon-blue)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>KYBER_PQC</span>
          </div>
          {ROWS.map((row, i) => {
            const isActive = activeRow === i;
            const isHovered = hoverRow === i;
            return (
              <div
                key={i}
                onClick={() => setActiveRow(isActive ? null : i)}
                onMouseEnter={() => setHoverRow(i)}
                onMouseLeave={() => setHoverRow(null)}
                style={{
                  display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr',
                  padding: isActive ? '32px 40px' : '24px 40px',
                  borderBottom: i < ROWS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  cursor: 'pointer',
                  background: isActive ? 'rgba(0, 245, 255, 0.05)' : isHovered ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 16, paddingRight: 24, display: 'flex', alignItems: 'center', gap: 16, color: isActive ? 'var(--neon-blue)' : '#fff' }}>
                  <motion.span 
                    animate={{ rotate: isActive ? 90 : 0 }}
                    style={{ color: 'var(--neon-purple)', fontSize: 12, display: 'inline-block' }}
                  >
                    ▶
                  </motion.span>
                  {row.category}
                </div>
                <div style={{ paddingRight: 24 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 800, color: row.rsa.color,
                    padding: '8px 16px', borderRadius: '10px', background: row.rsa.bg,
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                    border: `1px solid ${isActive ? row.rsa.color : 'rgba(255,255,255,0.05)'}`,
                    transition: 'all 0.3s ease',
                    boxShadow: isHovered ? `0 0 20px ${row.rsa.color}22` : 'none',
                  }}>
                    {row.rsa.value}
                  </div>
                  <AnimatePresence>
                    {isActive && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ fontSize: 14, color: 'rgba(226, 232, 240, 0.5)', marginTop: 16, lineHeight: 1.6, overflow: 'hidden' }}
                      >
                        {row.rsa.note}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div>
                  <div style={{
                    fontSize: 14, fontWeight: 800, color: row.kyber.color,
                    padding: '8px 16px', borderRadius: '10px', background: row.kyber.bg,
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                    border: `1px solid ${isActive ? row.kyber.color : 'rgba(255,255,255,0.05)'}`,
                    transition: 'all 0.3s ease',
                    boxShadow: isHovered ? `0 0 20px ${row.kyber.color}22` : 'none',
                  }}>
                    {row.kyber.value}
                  </div>
                  <AnimatePresence>
                    {isActive && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ fontSize: 14, color: 'rgba(226, 232, 240, 0.5)', marginTop: 16, lineHeight: 1.6, overflow: 'hidden' }}
                      >
                        {row.kyber.note}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
          <div style={{ padding: '16px 40px', fontSize: 12, color: 'rgba(226, 232, 240, 0.3)', borderTop: '1px solid rgba(255,255,255,0.08)', fontWeight: 700, letterSpacing: '0.1em' }}>
            [SYSTEM_INFO]: CORE_COMPARISON_MATRIX v4.2 // SELECT_ROW_FOR_TECHNICAL_OVERVIEW
          </div>
        </div>
      </ThreeDCard>


      {/* Score bars */}
      <ThreeDCard intensity={5}>
        <div className="qs-card glass-premium" style={{ marginBottom: 80, borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(10, 10, 26, 0.4)', padding: '48px' }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900, fontSize: 28, marginBottom: 40, letterSpacing: '-0.02em', color: '#fff' }}>
            PERFORMANCE_BENCHMARKS
          </h2>
          <div style={{ marginBottom: 48, display: 'flex', gap: 32, fontSize: 14, fontWeight: 800, letterSpacing: '0.1em' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 14, height: 6, borderRadius: 3, background: '#ef4444', boxShadow: '0 0 10px #ef4444' }} />
              <span style={{ color: '#ef4444' }}>LEGACY_RSA</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 14, height: 6, borderRadius: 3, background: 'var(--gradient-premium)', boxShadow: '0 0 12px var(--neon-blue)' }} />
              <span style={{ color: 'var(--neon-blue)' }}>CRYSTALS_KYBER</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SCORE_ITEMS.map(item => (
              <ScoreBar key={item.label} {...item} />
            ))}
          </div>
        </div>
      </ThreeDCard>

      {/* Call to action */}
      <ThreeDCard intensity={15}>
        <div className="qs-card glass-premium" style={{
          marginTop: 40, textAlign: 'center',
          background: 'rgba(124, 58, 237, 0.05)',
          borderColor: 'rgba(124, 58, 237, 0.3)',
          padding: '80px 40px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle background glow for CTA */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(124, 58, 237, 0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
          
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            style={{ fontSize: 72, marginBottom: 32, position: 'relative' }}
          >
            ⚛️
          </motion.div>
          <h2 style={{ 
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900, 
            fontSize: 'clamp(32px, 5vw, 48px)', marginBottom: 24,
            background: 'linear-gradient(135deg, #fff 0%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.04em'
          }}>
            SECURE THE FUTURE_
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(226, 232, 240, 0.6)', maxWidth: 720, margin: '0 auto', lineHeight: 1.8, fontWeight: 500 }}>
            NIST has finalized the first set of Post-Quantum Cryptographic standards. ML-KEM (Kyber) is the new gold standard for encryption. 
            Integrate quantum-safe primitives today to ensure your data remains secure in the era of quantum advantage.
          </p>
          <button className="btn-neon" style={{ marginTop: 48, height: 64, padding: '0 60px', borderRadius: '16px', fontSize: 18, fontWeight: 800 }}>
            UPGRADE TO PQC CHANNEL
          </button>
        </div>
      </ThreeDCard>

    </div>
  );
}
