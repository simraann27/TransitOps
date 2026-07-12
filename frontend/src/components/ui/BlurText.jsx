import { motion } from 'framer-motion';

export default function BlurText({ text, className = "", delay = 0, duration = 0.8 }) {
  return (
    <motion.span
      className={`blur-text ${className}`}
      initial={{ opacity: 0, filter: "blur(12px)", y: 15 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      transition={{
        delay: delay,
        duration: duration,
        ease: [0.16, 1, 0.3, 1], // easeOutExpo
      }}
      style={{ display: "inline-block" }}
    >
      {text}
    </motion.span>
  );
}
