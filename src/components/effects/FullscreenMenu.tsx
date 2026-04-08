/**
 * @system DO NOT EDIT - Core effect component
 * @description Fullscreen menu with morphing hamburger icon and staggered link reveal
 * @module system
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FullscreenMenuProps {
  children: React.ReactNode;
  menuColor?: string;
  className?: string;
}

const menuVariants = {
  closed: {
    opacity: 0,
    scaleY: 0,
    transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] as const, when: 'afterChildren' as const },
  },
  open: {
    opacity: 1,
    scaleY: 1,
    transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] as const, staggerChildren: 0.1 },
  },
};

const linkVariants = {
  closed: { y: 30, opacity: 0, transition: { duration: 0.3 } },
  open: { y: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const FullscreenMenu = ({ children, menuColor = 'bg-primary', className = '' }: FullscreenMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={className}>
      {/* Hamburger / X morphing icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-[100] flex flex-col gap-1.5 w-8 h-8 justify-center items-center"
        aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
      >
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 8 : 0 }}
          transition={{ duration: 0.3 }}
          className="block w-full h-[3px] bg-current rounded-full"
        />
        <motion.span
          animate={{ opacity: isOpen ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          className="block w-full h-[3px] bg-current rounded-full"
        />
        <motion.span
          animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -8 : 0 }}
          transition={{ duration: 0.3 }}
          className="block w-full h-[3px] bg-current rounded-full"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className={`fixed inset-0 ${menuColor} p-10 flex items-center justify-center z-[90] origin-top text-primary-foreground`}
          >
            <motion.nav className="flex flex-col gap-6 text-4xl font-bold tracking-tight">
              {React.Children.map(children, (child) => (
                <motion.div
                  variants={linkVariants}
                  whileHover={{ scale: 1.1, x: 10 }}
                  className="cursor-pointer"
                >
                  {child}
                </motion.div>
              ))}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FullscreenMenu;
