import { motion } from "framer-motion"
import { FiMoon, FiSun } from "react-icons/fi"

const ANIMATION_TRANSITION = {
  duration: 0.96,
  ease: [0.2, 0.95, 0.35, 1],
}

const ThemeToggle = ({ isDark, onToggle, className = "" }) => {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-purple-500/35 bg-white/80 text-slate-800 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-black/40 dark:text-purple-100 dark:ring-offset-black ${className}`}
      whileTap={{ scale: 0.9 }}
    >
      <motion.span
        key={isDark ? "dark" : "light"}
        initial={{ rotate: -28, scale: 0.8, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={{ rotate: 24, scale: 0.8, opacity: 0 }}
        transition={ANIMATION_TRANSITION}
        className="absolute"
      >
        {isDark ? <FiMoon className="h-5 w-5" /> : <FiSun className="h-5 w-5" />}
      </motion.span>
      <motion.span
        initial={false}
        animate={{
          scale: [1, 1.45, 1],
          opacity: [0.15, 0.35, 0.15],
        }}
        transition={ANIMATION_TRANSITION}
        className="pointer-events-none absolute inset-0 rounded-full bg-purple-500/30"
      />
    </motion.button>
  )
}

export default ThemeToggle

