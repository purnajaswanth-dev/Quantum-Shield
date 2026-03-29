'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '@/services/api';
import ThreeDCard from '@/components/animations/ThreeDCard';

const GLITCH_CHARS = '!@#$%^&*<>?ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function useGlitchText(target: string, active: boolean) {
  const [text, setText] = useState(target);
  useEffect(() => {
    if (!active) { setText(target); return; }
    let iter = 0;
    const iv = setInterval(() => {
      setText(target.split('').map((c, i) => {
        if (i < iter) return target[i];
        if (c === ' ') return ' ';
        return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
      }).join(''));
      iter += 0.4;
      if (iter >= target.length) clearInterval(iv);
    }, 25);
    return () => clearInterval(iv);
  }, [active, target]);
  return text;
}

const SHOR_STEPS = [
  { label: 'Initializing quantum register…', icon: '⚛', color: '#67e8f9' },
  { label: 'Factoring public key modulus N…', icon: '🔢', color: '#a5b4fc' },
  { label: 'Applying Quantum Fourier Transform…', icon: '🌊', color: '#c4b5fd' },
  { label: 'Finding period r via quantum interference…', icon: '🔭', color: '#f0abfc' },
  { label: 'Computing GCD(a^(r/2) ± 1, N)…', icon: '🧮', color: '#fca5a5' },
  { label: 'Reconstructing private key from primes!', icon: '🗝️', color: '#fca5a5' },
  { label: 'Decrypting ciphertext…', icon: '💥', color: '#ef4444' },
];

type Phase = 'idle' | 'encrypting' | 'encrypted' | 'attacking' | 'broken';
type StepState = { label: string; icon: string; color: string; done: boolean };

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: 8, height: 10, overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)' }}>
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        style={{
          height: '100%',
          background: `linear-gradient(90deg, ${color}, ${color}dd)`,
          boxShadow: `0 0 20px ${color}88`,
          borderRadius: 8,
          position: 'relative'
        }} 
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '30%', background: 'rgba(255,255,255,0.2)', borderRadius: '8px 8px 0 0' }} />
      </motion.div>
    </div>
  );
}

export default function RSAPage() {
  const [message, setMessage] = useState('TOP_SECRET_RECORDS_2035');
  const [ciphertext, setCiphertext] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [steps, setSteps] = useState<StepState[]>([]);
  const [recovered, setRecovered] = useState('');
  const [activeStep, setActiveStep] = useState(-1);
  const [flicker, setFlicker] = useState(false);
  const recoveredGlitch = useGlitchText(recovered, recovered.length > 0 && phase === 'broken');

  // Flicker effect during attack
  useEffect(() => {
    if (phase !== 'attacking') { setFlicker(false); return; }
    const iv = setInterval(() => setFlicker(f => !f), 180);
    return () => clearInterval(iv);
  }, [phase]);

  const handleEncrypt = useCallback(async () => {
    if (!message.trim()) return;
    setPhase('encrypting');
    setCiphertext('');
    setSteps([]);
    setRecovered('');
    setActiveStep(-1);
    try {
      const data = await apiService.rsa.encrypt(message);
      setCiphertext(data.ciphertext);
      setPhase('encrypted');
    } catch {
      setPhase('idle');
    }
  }, [message]);

  const handleAttack = useCallback(async () => {
    if (!ciphertext) return;
    setPhase('attacking');
    const initSteps = SHOR_STEPS.map(s => ({ ...s, done: false }));
    setSteps(initSteps);
    setActiveStep(0);
    setRecovered('');

    const apiPromise = apiService.rsa.decrypt(ciphertext, message);

    for (let i = 0; i < SHOR_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 800));
      setActiveStep(i);
      setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, done: true } : s));
    }

    try {
      const data = await apiPromise;
      setRecovered(data.recoveredMessage);
      setPhase('broken');
    } catch {
      setPhase('encrypted');
    }
  }, [ciphertext, message]);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px' }}>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 80, textAlign: 'center' }}
      >
        <div className="badge-danger" style={{ 
          marginBottom: 24, 
          padding: '8px 20px',
          background: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'rgba(239, 68, 68, 0.3)',
          letterSpacing: '0.2em'
        }}>
          ⚡ RSA VULNERABILITY SIMULATION
        </div>
        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900,
          fontSize: 'clamp(40px, 6vw, 72px)',
          letterSpacing: '-0.04em',
          lineHeight: 1,
          opacity: flicker ? 0.4 : 1,
          transition: 'opacity 0.1s',
          background: 'linear-gradient(135deg, #fff 0%, #fca5a5 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          SHOR&apos;S ATTACK <br/> DEPLOYMENT
        </h1>
        <p style={{ color: 'rgba(226, 232, 240, 0.6)', marginTop: 24, fontSize: 20, lineHeight: 1.6, maxWidth: 800, margin: '24px auto 0' }}>
          Witness the collapse of prime-factorization security. <br/>
          Quantum hardware bypasses the mathematical difficulty of RSA-2048 in polynomial time.
        </p>
      </motion.div>


      {/* Main panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 32 }}>
        {/* Step 1 – Input */}
        <ThreeDCard intensity={15}>
          <div className="qs-card h-full glass-premium" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="step-label" style={{ color: 'var(--neon-blue)' }}><span className="step-dot" />S-01: SYSTEM INPUT</div>
            <h3 style={{ fontWeight: 800, marginBottom: 24, fontSize: 18, color: '#fff', letterSpacing: '0.05em' }}>
              PRIVATE DATA BUFFER
            </h3>
            <textarea
              className="qs-input"
              rows={6}
              value={message}
              onChange={e => { setMessage(e.target.value); setPhase('idle'); setCiphertext(''); setSteps([]); setRecovered(''); }}
              placeholder="Inject secret data segment…"
              disabled={phase === 'encrypting' || phase === 'attacking'}
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', fontSize: '15px' }}
            />
            <button
              className="btn-neon"
              onClick={handleEncrypt}
              disabled={!message.trim() || phase === 'encrypting' || phase === 'attacking'}
              style={{ marginTop: 'auto', width: '100%', height: 56, letterSpacing: '0.1em' }}
            >
              {phase === 'encrypting' ? (
                <><span className="spinner" style={{ marginRight: 12 }} />KEYGEN_ACTIVE…</>
              ) : '🔒 RSA-2048 ENCAPSULATE'}
            </button>
          </div>
        </ThreeDCard>

        {/* Step 2 – Ciphertext */}
        <ThreeDCard intensity={15}>
          <div className="qs-card h-full glass-premium" style={{ 
            borderColor: ciphertext ? 'rgba(94, 0, 255, 0.3)' : 'rgba(255,255,255,0.08)',
            display: 'flex', flexDirection: 'column'
          }}>
            <div className="step-label">
              <span className="step-dot" style={{ background: ciphertext ? 'var(--neon-purple)' : '#334155', boxShadow: ciphertext ? '0 0 10px var(--neon-purple)' : 'none' }} />
              S-02: CIPHERTEXT ENVELOPE
            </div>
            <h3 style={{ fontWeight: 800, marginBottom: 24, fontSize: 18, color: '#fff', letterSpacing: '0.05em' }}>
              ENCRYPTED STRING
            </h3>
            <AnimatePresence mode='wait'>
              {ciphertext ? (
                <motion.div 
                  key="cipher"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
                >
                  <div className="encrypted-text" style={{
                    background: 'rgba(0,0,0,0.4)', 
                    border: '1px solid rgba(124, 58, 237, 0.2)',
                    borderRadius: '16px', padding: '20px', flexGrow: 1, marginBottom: 24,
                    fontSize: 13, overflow: 'auto',
                    opacity: flicker ? 0.3 : 1, transition: 'opacity 0.05s',
                    color: '#c4b5fd'
                  }}>
                    {ciphertext}
                  </div>
                  <button
                    className="btn-danger"
                    onClick={handleAttack}
                    disabled={phase === 'attacking' || phase === 'broken'}
                    style={{ 
                      width: '100%', height: 56, borderRadius: '16px', fontWeight: 800, 
                      letterSpacing: '0.1em',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      color: '#fca5a5'
                    }}
                  >
                    {phase === 'attacking' ? (
                      <><span className="spinner" style={{ marginRight: 12 }} />CRACKING…</>
                    ) : '⚡ INITIATE SHOR\'S ATTACK'}
                  </button>
                </motion.div>
              ) : (
                <div style={{ color: 'rgba(148,163,184,0.3)', fontSize: 15, marginTop: 'auto', marginBottom: 'auto', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.08)', padding: '60px 40px', borderRadius: '20px' }}>
                  AWAITING ENCRYPTION KEY…
                </div>
              )}
            </AnimatePresence>
          </div>
        </ThreeDCard>

      </div>

      {/* Attack progress bar */}
      <AnimatePresence>
        {phase === 'attacking' && activeStep >= 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="qs-card" style={{ marginTop: 32, borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.02)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="step-label"><span className="step-dot" style={{ background: 'var(--neon-pink)' }} />QUANTUM REGISTER STATUS</div>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--neon-pink)' }}>BURST_INDEX: {activeStep + 1}/{SHOR_STEPS.length}</span>
            </div>
            <ProgressBar value={activeStep + 1} max={SHOR_STEPS.length} color="var(--neon-pink)" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shor's log */}
      {steps.length > 0 && (
        <ThreeDCard intensity={5}>
          <div className="qs-card glass-premium" style={{ marginTop: 48, borderColor: 'rgba(239, 68, 68, 0.2)', animation: 'fadeInUp 0.6s ease forwards' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div className="step-label" style={{ color: '#fca5a5' }}><span className="step-dot" style={{ background: '#ef4444', boxShadow: '0 0 10px #ef4444' }} />Shor's Algorithm Trace</div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(252,165,165,0.6)', fontFamily: "'JetBrains Mono', monospace" }}>{steps.filter(s => s.done).length}/{steps.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {steps.map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: step.done ? 1 : 0.2 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px',
                    borderRadius: 12,
                    background: step.done ? 'rgba(255,255,255,0.02)' : 'transparent',
                  }}
                >
                  <span style={{ fontSize: 18, flexShrink: 0, filter: step.done ? `drop-shadow(0 0 6px ${step.color}44)` : 'grayscale(1) opacity(0.3)' }}>{step.icon}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: step.done ? 600 : 400, color: step.done ? step.color : 'rgba(255,255,255,0.12)', flex: 1 }}>{step.label}</span>
                  {step.done && <span style={{ fontSize: 14, color: '#86efac' }}>✓</span>}
                </motion.div>
              ))}
            </div>
          </div>
        </ThreeDCard>
      )}


      {/* Recovered message */}
      <AnimatePresence>
        {phase === 'broken' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            style={{ marginTop: 60 }}
          >
            <div className="qs-card glass-premium" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
                <motion.div 
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} 
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{ fontSize: 64, filter: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.4))' }}
                >
                  ⚡
                </motion.div>
                <div>
                  <div style={{ fontWeight: 900, color: '#fca5a5', fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                    RSA_PROTOCOL_BREACHED
                  </div>
                  <div style={{ fontSize: 15, color: 'rgba(226, 232, 240, 0.5)', fontWeight: 500, marginTop: 4 }}>Quantum Fourier Transform recovered private key components</div>
                </div>
              </div>
              <div style={{
                background: 'rgba(0,0,0,0.8)', borderRadius: '20px', padding: '32px',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 24, color: '#86efac',
                border: '1px solid rgba(134,239,172,0.2)',
                boxShadow: '0 0 50px rgba(134,239,172,0.1), inset 0 2px 20px rgba(0,0,0,0.5)',
                letterSpacing: '0.15em',
                textAlign: 'center'
              }}>
                <span style={{ color: 'rgba(134,239,172,0.4)', fontSize: 16 }}>&gt; RECOVERED_PLAINTEXT:</span> <br/>
                &quot;<span className="shimmer-text" style={{ fontWeight: 900 }}>{recoveredGlitch}</span>&quot;
              </div>
            </div>

            {/* Warning Banner */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                marginTop: 32, borderRadius: '24px', padding: '40px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex', alignItems: 'center', gap: 32,
                backdropFilter: 'blur(20px)'
              }}
            >
              <div style={{ 
                width: 72, height: 72, borderRadius: '20px', background: 'rgba(239, 68, 68, 0.1)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}>
                <span style={{ fontSize: 36 }}>⚠️</span>
              </div>
              <div>
                <div style={{
                  fontWeight: 800, color: '#fff', marginBottom: 12,
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: 22,
                  letterSpacing: '0.02em'
                }}>
                  CRITICAL RISK: OBSOLETE ENCRYPTION
                </div>
                <p style={{ fontSize: 16, color: 'rgba(226, 232, 240, 0.6)', lineHeight: 1.6, margin: 0 }}>
                  A quantum advantage machine has demonstrated perfect decryption of your RSA buffer.
                  Future data integrity requires immediate transition to lattice-based protocols.
                </p>
                <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
                  <div className="badge-danger" style={{ padding: '6px 16px', borderRadius: '10px' }}>PROVEN VULNERABILITY</div>
                  <div className="badge-quantum" style={{ padding: '6px 16px', borderRadius: '10px', background: 'rgba(94, 0, 255, 0.1)', borderColor: 'rgba(94, 0, 255, 0.3)' }}>MIGRATION REQUIRED</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
