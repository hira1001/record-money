"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface SummaryStatsProps {
  totalIncome: number;
  totalExpense: number;
}

export function SummaryStats({ totalIncome, totalExpense }: SummaryStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="card-elevated p-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl icon-income">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">収入</p>
            <p className="font-semibold text-money text-foreground">
              {formatCurrency(totalIncome)}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="card-elevated p-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl icon-expense">
            <TrendingDown className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">支出</p>
            <p className="font-semibold text-money text-foreground">
              {formatCurrency(totalExpense)}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
