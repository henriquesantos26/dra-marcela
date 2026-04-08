/**
 * @system DO NOT EDIT - Core effect component
 * @description Parallax grid with columns moving at different speeds on scroll
 * @module system
 */
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxGridProps {
  children: React.ReactNode;
  columns?: number;
  speed?: number;
  className?: string;
}

const ParallaxGrid = ({ children, columns = 3, speed = 30, className = '' }: ParallaxGridProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const childArray = React.Children.toArray(children);

  // Distribute children into columns
  const columnArrays: React.ReactNode[][] = Array.from({ length: columns }, () => []);
  childArray.forEach((child, i) => {
    columnArrays[i % columns].push(child);
  });

  return (
    <div
      ref={containerRef}
      className={`grid gap-4 ${className}`}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {columnArrays.map((colChildren, colIndex) => (
        <ParallaxColumn
          key={colIndex}
          index={colIndex}
          speed={speed}
          scrollYProgress={scrollYProgress}
        >
          {colChildren.map((child, i) => (
            <div key={i} className="mb-4">{child}</div>
          ))}
        </ParallaxColumn>
      ))}
    </div>
  );
};

interface ParallaxColumnProps {
  children: React.ReactNode;
  index: number;
  speed: number;
  scrollYProgress: any;
}

const ParallaxColumn = ({ children, index, speed, scrollYProgress }: ParallaxColumnProps) => {
  const direction = index % 2 === 0 ? 1 : -1;
  const y = useTransform(scrollYProgress, [0, 1], [0, speed * direction]);

  return (
    <motion.div style={{ y }} className="flex flex-col">
      {children}
    </motion.div>
  );
};

export default ParallaxGrid;
