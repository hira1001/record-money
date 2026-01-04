"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface AssetsFlowProps {
  totalIncome: number;
  totalExpense: number;
}

export function AssetsFlow({ totalIncome, totalExpense }: AssetsFlowProps) {
  const balance = totalIncome - totalExpense;
  const incomePercentage = totalIncome > 0 ? (totalIncome / (totalIncome + totalExpense)) * 100 : 0;
  const expensePercentage = totalExpense > 0 ? (totalExpense / (totalIncome + totalExpense)) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Visual Flow Bars */}
      <div className="relative h-24 rounded-xl overflow-hidden bg-secondary">
        {/* Income Flow */}
        <motion.div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-income/20 to-income/40 flex items-center justify-end pr-3"
          initial={{ width: 0 }}
          animate={{ width: `${incomePercentage}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        >
          {incomePercentage > 15 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-1.5 text-income"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-xs font-semibold">収入</span>
            </motion.div>
          )}
        </motion.div>

        {/* Expense Flow */}
        <motion.div
          className="absolute right-0 top-0 h-full bg-gradient-to-l from-expense/20 to-expense/40 flex items-center justify-start pl-3"
          initial={{ width: 0 }}
          animate={{ width: `${expensePercentage}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
        >
          {expensePercentage > 15 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="flex items-center gap-1.5 text-expense"
            >
              <span className="text-xs font-semibold">支出</span>
              <ArrowDownRight className="w-4 h-4" />
            </motion.div>
          )}
        </motion.div>

        {/* Balance Indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center"
          >
            <p className="text-xs text-muted-foreground mb-0.5">収支</p>
            <p
              className={`text-lg font-bold text-money ${
                balance >= 0 ? "text-income" : "text-expense"
              }`}
            >
              {formatCurrency(balance)}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Flow Details */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
          className="flex items-center gap-2"
        >
          <div className="w-3 h-3 rounded-full bg-income" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">収入</p>
            <p className="text-sm font-semibold text-income">
              {formatCurrency(totalIncome)}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.1 }}
          className="flex items-center gap-2"
        >
          <div className="w-3 h-3 rounded-full bg-expense" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">支出</p>
            <p className="text-sm font-semibold text-expense">
              {formatCurrency(totalExpense)}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

