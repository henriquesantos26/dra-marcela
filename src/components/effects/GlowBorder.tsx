/**
 * @system DO NOT EDIT - Core effect component
 * @description Animated gradient glow border on hover
 * @module system
 */
import React from 'react';

interface GlowBorderProps {
  children: React.ReactNode;
  glowColor?: string;
  className?: string;
}

const GlowBorder = ({
  children,
  glowColor = 'from-indigo-500 via-violet-500 to-pink-500',
  className = '',
}: GlowBorderProps) => {
  return (
    <div className={`relative group overflow-hidden rounded-2xl ${className}`}>
      {/* Animated gradient glow - visible on hover */}
      <div
        className={`absolute -inset-10 bg-gradient-to-r ${glowColor} opacity-0 group-hover:opacity-100 blur-2xl animate-spin-slow transition-opacity duration-500 -z-10`}
      />

      {/* Content with background to mask center of glow */}
      <div className="relative z-10 bg-card rounded-[14px] h-full w-full">
        {children}
      </div>
    </div>
  );
};

export default GlowBorder;
