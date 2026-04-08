/**
 * @system DO NOT EDIT - Core effect component
 * @description Stagger reveal animation for grid/list children
 * @module system
 */
import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

interface StaggerGridProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
  },
};

const StaggerGrid = forwardRef<HTMLDivElement, StaggerGridProps>(
  ({ children, className = '', staggerDelay }, ref) => {
    const variants = staggerDelay
      ? {
          ...containerVariants,
          show: {
            ...containerVariants.show,
            transition: { staggerChildren: staggerDelay },
          },
        }
      : containerVariants;

    return (
      <motion.div
        ref={ref}
        variants={variants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-50px' }}
        className={className}
      >
        {React.Children.map(children, (child) => (
          <motion.div variants={itemVariants}>{child}</motion.div>
        ))}
      </motion.div>
    );
  }
);

StaggerGrid.displayName = 'StaggerGrid';

export default StaggerGrid;
