'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/rsa', label: 'RSA Attack' },
  { href: '/pqc', label: 'PQC Encrypt' },
  { href: '/chat', label: 'Secure Chat' },
  { href: '/lattice', label: 'Lattice' },
  { href: '/compare', label: 'Compare' },
  { href: '/encrypt-decrypt', label: 'Encrypt / Decrypt' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav 
      className="glass-premium"
      style={{
        position: 'fixed', 
        top: '24px', 
        left: '50%', 
        transform: 'translateX(-50%)',
        width: 'calc(100% - 48px)',
        maxWidth: '1200px',
        zIndex: 100,
        borderRadius: '24px',
        padding: '0 24px',
        height: '72px',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* Glow Effect behind navbar */}
      <div style={{ position: 'absolute', top: -20, left: '10%', right: '10%', height: 40, background: 'radial-gradient(ellipse at center, rgba(94, 0, 255, 0.15) 0%, transparent 70%)', pointerEvents: 'none', zIndex: -1 }} />

      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <div style={{ position: 'relative', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'var(--gradient-premium)', borderRadius: '12px', opacity: 0.2, filter: 'blur(8px)' }} />
          <img 
            src="/logo_new.png" 
            alt="QuantumShield Logo" 
            style={{ width: 32, height: 32, objectFit: 'contain', zIndex: 1, filter: 'drop-shadow(0 0 8px rgba(0, 245, 255, 0.5))' }} 
          />
        </div>
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 900, fontSize: 18,
          letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, #fff 0%, #00f5ff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>QuantumShield</span>
      </Link>

      {/* Desktop nav */}
      <div className="qs-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link ${pathname === item.href ? 'active' : ''}`}
            style={{ 
              fontSize: '10px', 
              fontWeight: 800, 
              textTransform: 'uppercase', 
              letterSpacing: '0.1em',
              whiteSpace: 'nowrap',
              color: pathname === item.href ? 'var(--neon-blue)' : 'rgba(255, 255, 255, 0.6)',
              transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
              position: 'relative'
            }}
          >
            {item.label}
            {pathname === item.href && (
              <motion.div 
                layoutId="nav-active"
                style={{ position: 'absolute', bottom: -8, left: 0, right: 0, height: 2, background: 'var(--neon-blue)', borderRadius: 2, boxShadow: '0 0 10px var(--neon-blue)' }}
              />
            )}
          </Link>
        ))}
      </div>

      {/* Badge / Action */}
      <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="badge-quantum" style={{ 
          padding: '8px 18px', 
          borderRadius: '14px', 
          background: 'rgba(0, 245, 255, 0.05)', 
          border: '1px solid rgba(0, 245, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div className="pulse-dot" style={{ width: 8, height: 8, background: '#00f5ff', boxShadow: '0 0 12px #00f5ff', borderRadius: '50%' }} />
          <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--neon-blue)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>System_Active</span>
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        className="hide-desktop"
        style={{
          background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#00f5ff', cursor: 'pointer', fontSize: 20, width: 44, height: 44, borderRadius: '12px',
          alignItems: 'center', justifyContent: 'center'
        }}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="glass-premium" 
            style={{
              position: 'absolute', top: '88px', left: 0, right: 0,
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              padding: '24px',
              display: 'flex', flexDirection: 'column', gap: '16px',
              boxShadow: '0 30px 60px rgba(0, 0, 0, 0.5)',
              zIndex: 99
            }}
          >
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${pathname === item.href ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
                style={{ 
                  padding: '12px 16px', 
                  borderRadius: '12px',
                  background: pathname === item.href ? 'rgba(0, 245, 255, 0.1)' : 'transparent',
                  color: pathname === item.href ? 'var(--neon-blue)' : '#fff',
                  fontWeight: 700
                }}
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>


  );
}
