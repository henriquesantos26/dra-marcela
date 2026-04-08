/**
 * @system DO NOT EDIT - Core effect component
 * @description Word-by-word text reveal with blur animation
 * @module system
 */
import React from 'react';
import { motion } from 'framer-motion';

interface TextRevealProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  className?: string;
  style?: React.CSSProperties;
}

const wordVariants = {
  hidden: { opacity: 0, filter: 'blur(8px)', y: 10 },
  visible: { opacity: 1, filter: 'blur(0px)', y: 0 },
};

const TextReveal = ({ text, as: Tag = 'h2', className = '', style }: TextRevealProps) => {
  const words = text.split(' ');
  const MotionTag = motion(Tag);

  return (
    <MotionTag
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ staggerChildren: 0.05 }}
      className={`flex flex-wrap gap-x-[0.3em] ${className}`}
      style={style}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={wordVariants}
          transition={{ duration: 0.4 }}
          className="inline-block"
        >
          {word}
        </motion.span>
      ))}
    </MotionTag>
  );
};

export default TextReveal;
