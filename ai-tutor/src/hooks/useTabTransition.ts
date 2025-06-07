import { useReducedMotion } from "framer-motion";

interface TabTransitionOptions {
  direction?: "left" | "right";
}

export function useTabTransition({ direction = "right" }: TabTransitionOptions = {}) {
  const prefersReducedMotion = useReducedMotion();

  const variants = {
    initial: {
      opacity: 0,
      x: prefersReducedMotion ? 0 : direction === "right" ? 20 : -20,
    },
    animate: {
      opacity: 1,
      x: 0,
    },
    exit: {
      opacity: 0,
      x: prefersReducedMotion ? 0 : direction === "right" ? -20 : 20,
    },
  };

  return {
    variants,
    transition: {
      duration: prefersReducedMotion ? 0 : 0.2,
      ease: "easeInOut",
    },
  };
} 