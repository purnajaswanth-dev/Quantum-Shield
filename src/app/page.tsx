'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ThreeDCard from '@/components/animations/ThreeDCard';



export default function HomePage() {
  const [rsaBroken, setRsaBroken] = useState(false);

  useEffect(() => {
    const loop = setInterval(() => {
      setRsaBroken(true);
      setTimeout(() => setRsaBroken(false), 2000);
    }, 4000);
    return () => clearInterval(loop);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <section style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', padding: '120px 24px 80px', textAlign: 'center', position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Animated Background Elements */}
        <div className="mesh-gradient-premium" />
        <div className="mesh-gradient-premium" />
        <div className="floating-blob" style={{ top: '20%', left: '5%', width: '600px', height: '600px', opacity: 0.1 }} />
        <div className="floating-blob" style={{ bottom: '10%', right: '5%', background: 'var(--gradient-soft)', animationDelay: '-10s', width: '500px', height: '500px', opacity: 0.08 }} />
        
        {/* Floating 3D Shapes */}
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 45, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: 'absolute', top: '15%', right: '15%', width: 60, height: 60, border: '1px solid rgba(0, 245, 255, 0.2)', borderRadius: '12px', zIndex: 0 }} 
        />
        <motion.div 
          animate={{ y: [0, 30, 0], rotate: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{ position: 'absolute', bottom: '25%', left: '10%', width: 40, height: 40, border: '1px solid rgba(124, 58, 237, 0.2)', borderRadius: '8px', zIndex: 0 }} 
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="badge-quantum" 
          style={{ 
            marginBottom: 24, 
            padding: '12px 28px', 
            fontSize: 14, 
            letterSpacing: '0.2em',
            background: 'rgba(94, 0, 255, 0.1)',
            borderColor: 'rgba(94, 0, 255, 0.3)',
            borderRadius: '16px'
          }}
        >
          <span style={{ marginRight: 8 }}>🛡️</span> NEXT-GEN QUANTUM SECURITY
        </motion.div>

        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 'clamp(48px, 12vw, 120px)',
          fontWeight: 900,
          lineHeight: 0.85,
          marginBottom: 36,
          letterSpacing: '-0.05em',
          color: '#fff',
          zIndex: 1,
        }}>
          Your Data is <span className="shimmer-text" style={{ background: 'linear-gradient(90deg, #00f5ff, #a78bfa, #00f5ff)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Safe Today</span>…<br/>
          But <span className="shimmer-text" style={{ background: 'linear-gradient(90deg, #ef4444, #f97316, #ef4444)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Not Tomorrow</span>.
        </h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          style={{
            maxWidth: 850, color: 'rgba(226, 232, 240, 0.7)', fontSize: 24, lineHeight: 1.5,
            marginBottom: 64, zIndex: 1, fontWeight: 400,
            textShadow: '0 2px 10px rgba(0,0,0,0.5)'
          }}
        >
          Master the future of encryption. <br/>
          Deploy <strong className="shimmer-text" style={{ fontWeight: 700 }}>Crystals-Kyber</strong> protection against the quantum threat.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 120, zIndex: 1 }}
        >
          <Link href="/pqc" className="btn-neon">
            INITIALIZE DEFENSE
          </Link>
          <Link href="/rsa" className="btn-secondary">
            SIMULATE ATTACK
          </Link>
        </motion.div>


        {/* Visual Showcase */}
        <div style={{
          display: 'flex', gap: 64, flexWrap: 'wrap', justifyContent: 'center', perspective: 2000,
          zIndex: 1
        }}>
          <ThreeDCard intensity={30}>
            <div className={`qs-card ${rsaBroken ? 'glow-red' : ''}`} style={{ 
              width: 340, height: 420, textAlign: 'center', 
              borderColor: rsaBroken ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255,255,255,0.1)',
              background: rsaBroken ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255,255,255,0.03)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              boxShadow: rsaBroken ? '0 0 80px rgba(239, 68, 68, 0.2)' : '0 30px 60px -12px rgba(0,0,0,0.6)'
            }}>
              <div 
                style={{ 
                  fontSize: 100, marginBottom: 32, 
                  filter: rsaBroken ? 'drop-shadow(0 0 30px rgba(239, 68, 68, 0.6))' : 'drop-shadow(0 0 30px rgba(0, 245, 255, 0.4))',
                  transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {rsaBroken ? '🔓' : '🔒'}
              </div>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 900, marginBottom: 16, letterSpacing: '-0.02em', color: '#fff' }}>Legacy RSA</h3>
              {rsaBroken ? (
                <div className="badge-danger" style={{ padding: '8px 24px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>CRITICAL BREACH</div>
              ) : (
                <div className="badge-safe" style={{ padding: '8px 24px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>VULNERABLE</div>
              )}
              <div style={{ marginTop: 40, width: '100%', height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: rsaBroken ? '0%' : '100%' }}
                  style={{ height: '100%', background: rsaBroken ? '#ef4444' : '#64748b' }}
                />
              </div>
            </div>
          </ThreeDCard>

          <div style={{ display: 'flex', alignItems: 'center', fontSize: 60, color: 'var(--color-primary)', opacity: 0.2 }} className="animate-pulse-glow">
            <svg width="120" height="48" viewBox="0 0 120 48" fill="none">
              <path d="M0 24H118M118 24L100 6M118 24L100 42" stroke="currentColor" strokeWidth="3" strokeDasharray="12 12"/>
            </svg>
          </div>

          <ThreeDCard intensity={30}>
            <div className="qs-card neon-border-premium" style={{ 
              width: 340, height: 420, textAlign: 'center', 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(94, 0, 255, 0.05)',
              boxShadow: '0 30px 60px -12px rgba(0,0,0,0.6), 0 0 50px rgba(94, 0, 255, 0.15)'
            }}>
              <div style={{ fontSize: 100, marginBottom: 32 }} className="animate-float">🛡️</div>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 900, marginBottom: 16, letterSpacing: '-0.02em', color: '#fff' }}>Quantum Kyber</h3>
              <div className="badge-quantum" style={{ padding: '8px 24px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                CRYPTO-AGILE
              </div>
              <div style={{ marginTop: 40, width: '100%', display: 'flex', gap: 8 }}>
                {[1,2,3,4,5,6,7,8].map(i => (
                  <motion.div 
                    key={i}
                    animate={{ scaleY: [0.4, 1.2, 0.4] }}
                    transition={{ duration: 1.5, delay: i * 0.15, repeat: Infinity }}
                    style={{ flex: 1, height: 20, background: 'var(--color-secondary)', borderRadius: 3, boxShadow: '0 0 10px var(--color-secondary)' }} 
                  />
                ))}
              </div>
            </div>
          </ThreeDCard>
        </div>

      </section>

      {/* Stats with Parallax */}
      <section style={{ padding: '100px 24px', maxWidth: 1200, margin: '0 auto', width: '100%', position: 'relative' }}>
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 50 }}
          viewport={{ once: true }}
        >
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 48,
            textAlign: 'center', marginBottom: 64, letterSpacing: '-0.02em'
          }} className="gradient-text">
            Intelligence Report 2035
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 32 }}>
            {[
              { icon: '⏱️', stat: '8 YEARS', label: 'Q-DAY ESTIMATE', color: 'var(--neon-pink)', desc: 'Estimated time until public RSA encryption becomes obsolete.' },
              { icon: '🌐', stat: '94.2%', label: 'SYSTEM EXPOSURE', color: '#ffb86c', desc: 'Current global infrastructure still reliant on vulnerable prime algorithms.' },
              { icon: '📦', stat: '7.2B', label: 'DATA OBJECTS', color: 'var(--neon-blue)', desc: 'Encrypted records currenty archived by adversaries for future decryption.' },
              { icon: '🏛️', stat: 'ML-KEM', label: 'NIST STANDARD', color: '#50fa7b', desc: 'Kyber is now the global benchmark for lattice-based security.' },
            ].map((item, idx) => (
              <ThreeDCard key={item.label} intensity={15}>
                <div className="qs-card" style={{ textAlign: 'center', borderBottom: `4px solid ${item.color}` }}>
                  <div style={{ fontSize: 44, marginBottom: 16 }}>{item.icon}</div>
                  <div style={{ fontSize: 36, fontWeight: 900, color: item.color, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 12 }}>
                    {item.stat}
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'white', letterSpacing: '0.1em', marginBottom: 12 }}>{item.label}</p>
                  <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.7)', lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              </ThreeDCard>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Grid Menu */}
      <section style={{ padding: '100px 24px 160px', maxWidth: 1300, margin: '0 auto', width: '100%' }}>
        <h2 style={{
          fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16,
          textAlign: 'center', marginBottom: 64, color: 'rgba(148, 163, 184, 0.6)',
          letterSpacing: '0.4em', textTransform: 'uppercase'
        }}>
          OPERATIONAL MODULES
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 32 }}>
          {[
            { href: '/rsa', emoji: '󱐋', title: 'RSA COLLAPSE', desc: 'Real-time Shor’s algorithm execution against 2048-bit keys.', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.05)' },
            { href: '/pqc', emoji: '󱒀', title: 'LATTICE SHIELD', desc: 'Deploy Kyber-512 with ML-KEM standardization.', color: 'var(--color-primary)', glow: 'rgba(94, 0, 255, 0.05)' },
            { href: '/chat', emoji: '󰭹', title: 'SECURE COMMS', desc: 'End-to-end PQC messaging with AES-256 forward secrecy.', color: 'var(--color-secondary)', glow: 'rgba(0, 245, 255, 0.05)' },
            { href: '/lattice', emoji: '󰈈', title: 'LATTICE DYNAMICS', desc: 'Visualizing structured noise and shortest-vector problems.', color: 'var(--color-primary)', glow: 'rgba(94, 0, 255, 0.05)' },
            { href: '/compare', emoji: '󰙏', title: 'PROTOCOL AUDIT', desc: 'Performance benchmarks: RSA vs PQC vs Classical.', color: 'var(--color-secondary)', glow: 'rgba(0, 245, 255, 0.05)' },
          ].map((item, idx) => (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <ThreeDCard intensity={15} className="h-full">
                <div 
                  className="qs-card h-full" 
                  style={{ 
                    cursor: 'pointer', 
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex', flexDirection: 'column'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = item.color;
                    e.currentTarget.style.background = `linear-gradient(135deg, rgba(255,255,255,0.03) 0%, ${item.glow} 100%)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  }}
                >
                  <div style={{ fontSize: 44, marginBottom: 28, color: item.color }}>{item.emoji}</div>
                  <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 22, color: '#fff', marginBottom: 16, letterSpacing: '0.05em' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: 15, color: 'rgba(148,163,184,0.7)', lineHeight: 1.6, marginBottom: 32 }}>{item.desc}</p>
                  <div style={{ marginTop: 'auto', fontSize: 14, color: item.color, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10, letterSpacing: '0.1em' }}>
                    INITIALIZE <span style={{ fontSize: 20 }}>→</span>
                  </div>
                </div>
              </ThreeDCard>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
