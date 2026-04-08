/**
 * @system DO NOT EDIT - Core effect component
 * @description Glassmorphic effect that activates on scroll
 * @module system
 */
import React, { useState, useEffect } from 'react';

interface GlassWrapperProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
}

const GlassWrapper = ({ children, className = '', threshold = 50 }: GlassWrapperProps) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return (
    <div
      className={`transition-all duration-500 ${
        isScrolled
          ? 'bg-background/70 backdrop-blur-xl shadow-lg'
          : 'bg-transparent'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassWrapper;
