import { motion } from 'framer-motion';

export default function SplitText({ text, className = "", delay = 0, duration = 0.5 }) {
  const words = text.split(" ");

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: delay,
      },
    },
  };

  const childVariants = {
    hidden: {
      opacity: 0,
      y: "20%",
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: duration,
        ease: [0.16, 1, 0.3, 1], // easeOutExpo
      },
    },
  };

  return (
    <motion.span
      className={`split-text-container ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ display: "inline-flex", flexWrap: "wrap", rowGap: "0.2em" }}
    >
      {words.map((word, wordIndex) => (
        <span
          key={wordIndex}
          style={{ display: "inline-flex", marginRight: "0.25em", overflow: "hidden" }}
        >
          <motion.span variants={childVariants}>
            {word}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
