'use client';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ParallaxBackground() {
  const { scrollY } = useScroll();
  
  // Parallax multipliers
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -300]);
  const y3 = useTransform(scrollY, [0, 1000], [0, 100]);
  
  // Opacity fade on scroll
  const opacity1 = useTransform(scrollY, [0, 800], [0.15, 0.05]);
  const opacity2 = useTransform(scrollY, [0, 800], [0.1, 0.03]);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -1, overflow: 'hidden' }}>
      {/* Primary Parallax Blob */}
      <motion.div 
        className="floating-blob parallax-bg" 
        style={{ 
          top: '10%', 
          left: '10%', 
          y: y1, 
          opacity: opacity1,
          background: 'var(--gradient-premium)',
          filter: 'blur(100px)'
        }} 
      />
      
      {/* Secondary Parallax Blob */}
      <motion.div 
        className="floating-blob parallax-bg" 
        style={{ 
          top: '60%', 
          right: '5%', 
          y: y2, 
          opacity: opacity2,
          background: 'var(--gradient-soft)',
          filter: 'blur(120px)',
          animationDelay: '-5s'
        }} 
      />

      {/* Tertiary Small Accent */}
      <motion.div 
        className="floating-blob parallax-bg" 
        style={{ 
          top: '30%', 
          left: '70%', 
          width: '200px',
          height: '200px',
          y: y3, 
          opacity: 0.05,
          background: 'var(--neon-purple)',
          filter: 'blur(60px)',
          animationDelay: '-2s'
        }} 
      />
    </div>
  );
}
