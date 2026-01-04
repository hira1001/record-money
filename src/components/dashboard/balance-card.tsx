"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";

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
  const isHealthy = percentUsed < 80;
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="relative overflow-hidden glass-card p-6">
      {/* Background gradient */}
      <div
        className={`absolute inset-0 opacity-20 ${
          isHealthy
            ? "bg-gradient-to-br from-emerald-500 to-transparent"
            : "bg-gradient-to-br from-rose-500 to-transparent"
        }`}
      />

      <div className="relative z-10">
        <p className="text-sm text-muted-foreground mb-2">今月あと使える</p>

        <motion.div
          className="flex items-baseline gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span
            className={`text-4xl md:text-5xl font-bold text-money ${
              isHealthy ? "text-income" : "text-expense"
            }`}
          >
            {formatCurrency(remainingBudget)}
          </span>
        </motion.div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>使用済み: {percentUsed.toFixed(0)}%</span>
            <span>予算: {formatCurrency(totalBudget)}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                isHealthy ? "bg-income" : "bg-expense"
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentUsed, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            />
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2 mt-4">
          {isHealthy ? (
            <>
              <TrendingUp className="w-4 h-4 text-income" />
              <span className="text-sm text-income">順調です</span>
            </>
          ) : (
            <>
              <TrendingDown className="w-4 h-4 text-expense" />
              <span className="text-sm text-expense">予算超過注意</span>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
