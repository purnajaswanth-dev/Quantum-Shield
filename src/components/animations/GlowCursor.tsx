'use client';
import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export default function GlowCursor() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const springX = useSpring(mousePos.x, { damping: 30, stiffness: 150 });
  const springY = useSpring(mousePos.y, { damping: 30, stiffness: 150 });

  useEffect(() => {
    springX.set(mousePos.x);
    springY.set(mousePos.y);
  }, [mousePos, springX, springY]);

  if (isMobile) return null;

  return (
    <>
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: springX,
          y: springY,
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 212, 255, 0.07) 0%, transparent 65%)',
          pointerEvents: 'none',
          zIndex: 1,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: springX,
          y: springY,
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.05) 0%, transparent 60%)',
          pointerEvents: 'none',
          zIndex: 1,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: springX,
          y: springY,
          width: '0px',
          height: '0px',
          borderRadius: '50%',
          background: 'var(--neon-blue)',
          boxShadow: '0 0 10px var(--neon-blue)',
          pointerEvents: 'none',
          zIndex: 1000,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />
    </>
  );
}
