"use client";

import { motion } from "framer-motion";

interface BalanceCardProps {
  remainingBudget: number;
  totalBudget: number;
  percentUsed: number;
}

export function BalanceCard({
  remainingBudget,
  totalBudget,
  percentUsed,
}: BalanceCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="card-hero p-6">
      <p className="text-sm text-white/70 mb-1">今月あと使える</p>

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
          <span>予算 {formatCurrency(totalBudget)}</span>
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
