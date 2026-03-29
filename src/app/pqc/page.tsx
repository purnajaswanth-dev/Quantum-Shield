'use client';
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '@/services/api';
import ThreeDCard from '@/components/animations/ThreeDCard';

const GLITCH_CHARS = '█▓▒░<>?!@#$%^&*ABCDEFGHIJKLMNabcdefghijklmn0123456789';
function glitch(len = 24) {
  return Array.from({ length: len }, () => GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]).join('');
}

const ENC_STEPS = [
  { label: 'Generating lattice public key…', icon: '⚙️', color: '#c4b5fd' },
  { label: 'Adding structured noise (LWE)…', icon: '🔀', color: '#a78bfa' },
  { label: 'Mapping into high-dimensional lattice…', icon: '📐', color: '#818cf8' },
  { label: 'Encoding plaintext into lattice point…', icon: '🔢', color: '#7dd3fc' },
  { label: 'Applying NTT (Number Theoretic Transform)…', icon: '🧮', color: '#67e8f9' },
  { label: 'Ciphertext encapsulation complete!', icon: '✅', color: '#86efac' },
];

type Phase = 'idle' | 'encrypting' | 'encrypted' | 'decrypting' | 'decrypted';

export default function PQCPage() {
  const [message, setMessage] = useState('SECURE_PAYMENT_ID_882910');
  const [phase, setPhase] = useState<Phase>('idle');
  const [activeStep, setActiveStep] = useState(-1);
  const [ciphertext, setCiphertext] = useState('');
  const [noisedVector, setNoisedVector] = useState('');
  const [decrypted, setDecrypted] = useState('');
  const [noiseChars, setNoiseChars] = useState('');
  const [revealProgress, setRevealProgress] = useState(0);

  // Animate noise characters during encryption
  useEffect(() => {
    if (phase !== 'encrypting') return;
    const iv = setInterval(() => setNoiseChars(glitch(32)), 80);
    return () => clearInterval(iv);
  }, [phase]);

  // Animate noise removal during decryption
  useEffect(() => {
    if (phase !== 'decrypting') { setRevealProgress(0); return; }
    let p = 0;
    const iv = setInterval(() => {
      p += 5;
      setRevealProgress(p);
      if (p >= 100) clearInterval(iv);
    }, 40);
    return () => clearInterval(iv);
  }, [phase]);

  const handleEncrypt = useCallback(async () => {
    if (!message.trim()) return;
    setPhase('encrypting');
    setActiveStep(-1);
    setCiphertext('');
    setNoisedVector('');
    setDecrypted('');

    const apiPromise = apiService.pqc.encrypt(message);
    for (let i = 0; i < ENC_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      setActiveStep(i);
    }
    try {
      const result = await apiPromise;
      setCiphertext(result.ciphertext);
      setNoisedVector(result.noisedVector);
      setPhase('encrypted');
    } catch {
      setPhase('idle');
    }
  }, [message]);

  const handleDecrypt = useCallback(async () => {
    if (!ciphertext) return;
    setPhase('decrypting');
    try {
      const result = await apiService.pqc.decrypt(ciphertext, message);
      await new Promise(r => setTimeout(r, 2200));
      setDecrypted(result.recoveredMessage);
      setPhase('decrypted');
    } catch {
      setPhase('encrypted');
    }
  }, [ciphertext, message]);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 80, textAlign: 'center' }}
      >
        <div className="badge-quantum" style={{ 
          marginBottom: 24, 
          padding: '8px 20px',
          background: 'rgba(94, 0, 255, 0.1)',
          borderColor: 'rgba(94, 0, 255, 0.3)',
          letterSpacing: '0.2em',
          borderRadius: '16px'
        }}>
          🔮 CRYSTALS-KYBER PROTOCOL
        </div>
        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900,
          fontSize: 'clamp(40px, 6vw, 72px)',
          letterSpacing: '-0.04em',
          lineHeight: 1,
          background: 'linear-gradient(135deg, #fff 0%, #c4b5fd 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          POST-QUANTUM <br/> DEFENSE SHIELD
        </h1>
        <p style={{ color: 'rgba(226, 232, 240, 0.6)', marginTop: 24, fontSize: 20, lineHeight: 1.6, maxWidth: 800, margin: '24px auto 0' }}>
          Leveraging Learning With Errors (LWE) over module lattices. <br/>
          Kyber-512 ensures security parity in the presence of cryptographically relevant quantum computers.
        </p>
      </motion.div>


      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 32, marginBottom: 32 }}>
        {/* Input */}
        <ThreeDCard intensity={15}>
          <div className="qs-card h-full glass-premium" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="step-label" style={{ color: 'var(--neon-purple)' }}><span className="step-dot" style={{ background: 'var(--neon-purple)', boxShadow: '0 0 10px var(--neon-purple)' }} />S-01: SOURCE DATA</div>
            <h3 style={{ fontWeight: 800, marginBottom: 24, fontSize: 18, color: '#fff', letterSpacing: '0.05em' }}>
              PLAINTEXT BUFFER
            </h3>
            <textarea
              className="qs-input"
              rows={6}
              value={message}
              onChange={e => { setMessage(e.target.value); setPhase('idle'); setActiveStep(-1); setCiphertext(''); setDecrypted(''); }}
              disabled={phase === 'encrypting' || phase === 'decrypting'}
              placeholder="Inject plaintext message…"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', fontSize: '15px' }}
            />
            <button
              className="btn-secondary"
              onClick={handleEncrypt}
              disabled={phase === 'encrypting' || phase === 'decrypting' || !message.trim()}
              style={{ 
                marginTop: 'auto', width: '100%', height: 56, borderRadius: '16px',
                border: '1px solid rgba(124, 58, 237, 0.3)',
                background: 'rgba(124, 58, 237, 0.1)',
                color: '#fff',
                fontWeight: 800,
                letterSpacing: '0.1em'
              }}
            >
              {phase === 'encrypting'
                ? <><span className="spinner" style={{ marginRight: 12 }} />LATTICE_SAMPLING…</>
                : '🔮 ENCAPSULATE WITH KYBER-512'}
            </button>
          </div>
        </ThreeDCard>

        {/* Steps */}
        <ThreeDCard intensity={15}>
          <div className="qs-card h-full glass-premium">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div className="step-label"><span className="step-dot" style={{ background: 'var(--neon-blue)', boxShadow: '0 0 10px var(--neon-blue)' }} />Kyber Protocol</div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(167,139,250,0.5)', fontFamily: "'JetBrains Mono', monospace" }}>{Math.max(0, activeStep + 1)}/{ENC_STEPS.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {ENC_STEPS.map((step, i) => {
                const isActive = i <= activeStep;
                return (
                  <motion.div 
                    key={step.label}
                    initial={{ opacity: 0.1 }}
                    animate={{ opacity: isActive ? 1 : 0.2 }}
                    transition={{ duration: 0.4 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px',
                      borderRadius: 12,
                      background: isActive ? 'rgba(255,255,255,0.02)' : 'transparent',
                    }}
                  >
                    <span style={{ fontSize: 17, flexShrink: 0, filter: isActive ? `drop-shadow(0 0 5px ${step.color}44)` : 'grayscale(1) opacity(0.3)' }}>{step.icon}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: isActive ? 600 : 400, color: isActive ? step.color : 'rgba(255,255,255,0.12)', flex: 1 }}>
                      {step.label}
                    </span>
                    {isActive && <span style={{ fontSize: 14, color: '#86efac' }}>✓</span>}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </ThreeDCard>

      </div>

      {/* Noise animation during encryption */}
      <AnimatePresence>
        {phase === 'encrypting' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="qs-card glass-premium" style={{ marginBottom: 32, borderColor: 'rgba(124, 58, 237, 0.4)', background: 'rgba(124, 58, 237, 0.02)' }}
          >
            <div className="step-label" style={{ color: 'var(--neon-purple)' }}><span className="step-dot" style={{ background: 'var(--neon-purple)', boxShadow: '0 0 10px var(--neon-purple)' }} />HEDGED_NOISE_GEN_SAMPLING…</div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 16, color: '#e9d5ff',
              background: 'rgba(0,0,0,0.6)', borderRadius: '16px', padding: '24px',
              border: '1px solid rgba(124, 58, 237, 0.2)',
              letterSpacing: '0.3em',
              textAlign: 'center',
              boxShadow: 'inset 0 2px 20px rgba(0,0,0,0.5)'
            }}>
              {noiseChars}
            </div>
            <p style={{ fontSize: 14, color: 'rgba(226, 232, 240, 0.5)', marginTop: 16, textAlign: 'center', fontWeight: 500 }}>
              Injecting secret gaussian noise vectors into public lattice coordinates…
            </p>
          </motion.div>
        )}
      </AnimatePresence>


      {/* LWE Noise Vectors */}
      {noisedVector && (
        <ThreeDCard intensity={5}>
          <div className="qs-card glass-premium" style={{ marginBottom: 40, borderColor: 'rgba(124, 58, 237, 0.2)', animation: 'fadeInUp 0.6s ease forwards' }}>
            <div className="step-label" style={{ color: 'var(--neon-purple)' }}><span className="step-dot" style={{ background: 'var(--neon-purple)', boxShadow: '0 0 10px var(--neon-purple)' }} />LWE_COORDINATE_SYSTEM</div>
            <h3 style={{ fontWeight: 800, marginBottom: 16, color: '#fff', fontSize: 18, letterSpacing: '0.05em' }}>🔀 HIGH-DIMENSIONAL LATTICE SPACE (ℤ₃₃₂₉)</h3>
            <p style={{ fontSize: 15, color: 'rgba(226, 232, 240, 0.6)', marginBottom: 24, lineHeight: 1.6 }}>
              Encoded ciphertext fragments distributed across 512 dimensions with structured noise. 
              Each point represents a modular arithmetic operation within the lattice.
            </p>
            <pre style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
              color: '#d8b4fe', background: 'rgba(0,0,0,0.7)',
              border: '1px solid rgba(124, 58, 237, 0.1)', borderRadius: '16px',
              padding: '24px', whiteSpace: 'pre-wrap', maxHeight: 300, overflow: 'auto',
              boxShadow: 'inset 0 4px 30px rgba(0,0,0,0.5)'
            }}>
              {noisedVector}
            </pre>
            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: '12px', background: 'rgba(94, 0, 255, 0.05)', border: '1px solid rgba(94, 0, 255, 0.1)' }}>
              <span style={{ fontSize: 20 }}>💡</span>
              <p style={{ fontSize: 14, color: 'rgba(226, 232, 240, 0.7)', margin: 0, fontWeight: 500 }}>
                Complexity: Solving this without the secret trapdoor requires super-exponential quantum runtime.
              </p>
            </div>
          </div>
        </ThreeDCard>
      )}


      {/* Ciphertext */}
      <AnimatePresence>
        {ciphertext && phase !== 'decrypted' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="qs-card glass-premium" style={{ marginBottom: 40, borderColor: 'rgba(0, 212, 255, 0.3)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
              <div className="step-label" style={{ color: 'var(--neon-blue)' }}><span className="step-dot" style={{ background: 'var(--neon-blue)', boxShadow: '0 0 10px var(--neon-blue)' }} />KYBER_KEM_BLOB</div>
              <div className="badge-quantum" style={{ background: 'rgba(94, 0, 255, 0.1)', borderColor: 'rgba(94, 0, 255, 0.4)', borderRadius: '10px', fontSize: 11, fontWeight: 800 }}>QUANTUM_HARD_LWE</div>
              <div className="step-label translate-z-20" style={{ color: 'var(--neon-blue)' }}><span className="step-dot" style={{ background: 'var(--neon-blue)', boxShadow: '0 0 10px var(--neon-blue)' }} />KYBER_KEM_BLOB</div>
              <div className="badge-quantum translate-z-20" style={{ background: 'rgba(94, 0, 255, 0.1)', borderColor: 'rgba(94, 0, 255, 0.4)', borderRadius: '10px', fontSize: 11, fontWeight: 800 }}>QUANTUM_HARD_LWE</div>
            </div>
            <div className="encrypted-text translate-z-10" style={{
              background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(0,212,255,0.1)',
              borderRadius: '20px', padding: '32px', marginBottom: 32, fontSize: 14,
              boxShadow: 'inset 0 4px 30px rgba(0,0,0,0.5)',
              color: 'var(--neon-blue)',
              letterSpacing: '0.05em',
              lineHeight: 1.6
            }}>
              {phase === 'decrypting'
                ? ciphertext.split('').map((c, i) => (
                    i / ciphertext.length * 100 < revealProgress ? '·' : c
                  )).join('')
                : ciphertext}
            </div>
            {phase !== 'decrypting' && (
              <button
                className="btn-neon translate-z-30"
                onClick={handleDecrypt}
                disabled={phase as string === 'decrypting'}
                style={{ width: '100%', height: 60, fontSize: 17, letterSpacing: '0.1em' }}
              >
                🔓 RECOVER PLAINTEXT (TRAPDOOR)
              </button>
            )}
            {phase === 'decrypting' && (
              <div className="translate-z-30" style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ fontSize: 15, color: 'var(--neon-blue)', marginBottom: 16, fontWeight: 700, letterSpacing: '0.05em' }}>
                  <span className="spinner" style={{ marginRight: 12 }} />RESOLVING_LWE_ERROR_TERM…
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: 8, height: 10, overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)', width: '100%' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${revealProgress}%` }}
                    transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                    style={{
                      height: '100%',
                      background: 'var(--gradient-premium)',
                      boxShadow: '0 0 20px var(--neon-blue)',
                      borderRadius: 8,
                      position: 'relative'
                    }} 
                  >
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '30%', background: 'rgba(255,255,255,0.2)', borderRadius: '8px 8px 0 0' }} />
                  </motion.div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>


      {/* Decrypted result */}
      <AnimatePresence>
        {phase === 'decrypted' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="qs-card glass-premium" style={{ borderColor: 'rgba(34, 197, 94, 0.3)', background: 'rgba(34, 197, 94, 0.05)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
              <motion.div 
                animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }} 
                transition={{ repeat: Infinity, duration: 3 }}
                style={{ width: 72, height: 72, borderRadius: '24px', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(86, 239, 172, 0.2)' }}
              >
                <span style={{ fontSize: 40, filter: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.5))' }}>🛡️</span>
              </motion.div>
              <div>
                <div style={{ fontWeight: 900, color: '#86efac', fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, letterSpacing: '-0.02em' }}>
                  INTEGRITY_VERIFIED
                </div>
                <div style={{ fontSize: 15, color: 'rgba(226, 232, 240, 0.5)', fontWeight: 500, marginTop: 4 }}>Lattice trapdoor key solved with perfect precision</div>
              </div>
            </div>
            <div style={{
              background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(34, 197, 94, 0.2)',
              borderRadius: '20px', padding: '32px', fontFamily: "'JetBrains Mono', monospace", color: '#86efac', fontSize: 24,
              textAlign: 'center', letterSpacing: '0.15em',
              boxShadow: '0 0 50px rgba(34, 197, 94, 0.1), inset 0 2px 20px rgba(0,0,0,0.5)'
            }}>
              <span style={{ color: 'rgba(134,239,172,0.4)', fontSize: 16 }}>&gt; RECOVERED_DATA:</span> <br/>
              &quot;<span className="shimmer-text" style={{ fontWeight: 900 }}>{decrypted}</span>&quot;
            </div>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.5 }}
              style={{ marginTop: 32, padding: '32px', borderRadius: '24px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'flex-start', gap: 24 }}
            >
              <div style={{ fontSize: 40, flexShrink: 0 }}>🛡️</div>
              <div>
                <div style={{ fontWeight: 800, color: '#fff', marginBottom: 12, fontSize: 18, letterSpacing: '0.05em' }}>QUANTUM_PERSISTENCE: MAXIMUM</div>
                <p style={{ fontSize: 16, color: 'rgba(226, 232, 240, 0.6)', lineHeight: 1.6, margin: 0 }}>
                  Lattice-based cryptography remains functionally impenetrable by Shor&apos;s Algorithm. <br/>
                  <strong>CRYSTALS-Kyber (ML-KEM)</strong> is the global gold standard for post-quantum forward secrecy.
                </p>
                <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
                  <div className="badge-quantum" style={{ padding: '6px 16px', borderRadius: '10px' }}>PQC VERIFIED</div>
                  <div className="badge-safe" style={{ padding: '6px 16px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.3)' }}>LWE IMMUNE</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
