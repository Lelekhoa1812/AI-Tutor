import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";
import { useTabTransition } from "@/hooks/useTabTransition";

interface TabTransitionProps {
  children: ReactNode;
  activeTab: string;
  direction?: "left" | "right";
}

export function TabTransition({
  children,
  activeTab,
  direction = "right",
}: TabTransitionProps) {
  const { variants, transition } = useTabTransition({ direction });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
} 