'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function BubbleSpotlight() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 25, stiffness: 150 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX - 75);
      cursorY.set(e.clientY - 75);
    };

    window.addEventListener('mousemove', moveCursor);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
    };
  }, [cursorX, cursorY]);

  return (
    <>
      <motion.div
        className="pointer-events-none fixed inset-0 z-30 opacity-50 dark:opacity-30"
        style={{
          background: 'radial-gradient(600px at 0px 0px, rgba(29, 78, 216, 0.15), transparent 80%)',
          transform: `translate(${cursorXSpring}px, ${cursorYSpring}px)`,
        }}
      />
      <div className="pointer-events-none fixed inset-0 z-20 bg-gradient-to-br from-blue-50/10 via-transparent to-purple-50/10 dark:from-blue-500/5 dark:to-purple-500/5" />
    </>
  );
} 