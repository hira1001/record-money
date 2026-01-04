"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FABProps {
  onClick: () => void;
}

export function FAB({ onClick }: FABProps) {
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50 safe-bottom"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.5,
      }}
    >
      <Button
        onClick={() => {
          // Haptic feedback
          if (navigator.vibrate) {
            navigator.vibrate(10);
          }
          onClick();
        }}
        className="w-14 h-14 rounded-full bg-action hover:bg-action/90 shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 press-effect"
        size="icon"
      >
        <Plus className="w-6 h-6 text-white" />
      </Button>
    </motion.div>
  );
}
