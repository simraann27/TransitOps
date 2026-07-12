import { motion } from 'framer-motion';

export default function AnimatedContent({ children, className = "", delay = 0, yOffset = 30, duration = 0.6 }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        delay: delay,
        duration: duration,
        ease: [0.16, 1, 0.3, 1], // easeOutExpo
      }}
    >
      {children}
    </motion.div>
  );
}
