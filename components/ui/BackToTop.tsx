"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white/80 text-neutral-500 shadow-sm backdrop-blur transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-400 dark:hover:bg-neutral-800"
          aria-label="Quay lai dau trang"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 10L8 6L12 10" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
