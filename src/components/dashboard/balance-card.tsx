"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings } from "lucide-react";

interface BalanceCardProps {
  remainingBudget: number;
  totalBudget: number;
  percentUsed: number;
  onBudgetChange?: (newBudget: number) => void;
}

export function BalanceCard({
  remainingBudget,
  totalBudget,
  percentUsed,
  onBudgetChange,
}: BalanceCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(totalBudget));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleBudgetSave = () => {
    const newBudget = Number(editValue);
    if (!isNaN(newBudget) && newBudget > 0) {
      onBudgetChange?.(newBudget);
      setIsEditing(false);
    }
  };

  const handleBudgetCancel = () => {
    setEditValue(String(totalBudget));
    setIsEditing(false);
  };

  return (
    <div className="card-hero p-6 relative">
      <div className="flex items-start justify-between mb-1">
        <p className="text-sm text-white/70">今月あと使える</p>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors press-effect"
        >
          <Settings className="w-4 h-4 text-white/60" />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <span className="text-4xl md:text-5xl font-bold text-money text-white">
          {formatCurrency(remainingBudget)}
        </span>
      </motion.div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="flex justify-between text-xs text-white/60 mb-2">
          <span>使用済み {percentUsed.toFixed(0)}%</span>
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2"
              >
                <span className="text-white/60">予算</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-24 px-2 py-1 bg-white/20 border border-white/30 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-white/50"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleBudgetSave();
                    if (e.key === "Escape") handleBudgetCancel();
                  }}
                />
                <button
                  onClick={handleBudgetSave}
                  className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-[10px] text-white transition-colors"
                >
                  保存
                </button>
                <button
                  onClick={handleBudgetCancel}
                  className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-[10px] text-white transition-colors"
                >
                  ✕
                </button>
              </motion.div>
            ) : (
              <motion.span
                key="display"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                予算 {formatCurrency(totalBudget)}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentUsed, 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          />
        </div>
      </div>
    </div>
  );
}
