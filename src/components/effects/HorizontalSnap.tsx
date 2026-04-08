/**
 * @system DO NOT EDIT - Core effect component
 * @description Horizontal snap scroll driven by vertical page scroll (sticky + translateX)
 * @module system
 */
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface HorizontalSnapProps {
  children: React.ReactNode;
  className?: string;
  itemWidth?: string;
}

const HorizontalSnap = ({ children, className = '', itemWidth }: HorizontalSnapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const totalItems = React.Children.count(children);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Map vertical scroll 0→1 to horizontal translate 0% → -(totalItems-1)*100%
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    ['0%', `-${(totalItems - 1) * 100}%`]
  );

  if (totalItems === 0) return null;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ height: `${totalItems * 100}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        <motion.div
          style={{ x }}
          className="flex"
        >
          {React.Children.map(children, (child) => (
            <div
              className="shrink-0"
              style={{ width: itemWidth || '100vw' }}
            >
              {child}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default HorizontalSnap;
