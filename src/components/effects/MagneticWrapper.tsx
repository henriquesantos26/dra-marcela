/**
 * @system DO NOT EDIT - Core effect component
 * @description Magnetic attraction effect wrapper using framer-motion
 * @module system
 */
import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface MagneticWrapperProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

const MagneticWrapper = ({ children, strength = 80, className = '' }: MagneticWrapperProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { stiffness: strength, damping: 15, mass: 0.5 };
  const dx = useSpring(x, springConfig);
  const dy = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    x.set((e.clientX - centerX) * 0.3);
    y.set((e.clientY - centerY) * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: dx, y: dy, display: 'inline-block' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default MagneticWrapper;
