"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";

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

  const stats = [
    {
      label: "収入",
      value: totalIncome,
      icon: ArrowUpCircle,
      color: "text-income",
      bgColor: "bg-income/10",
    },
    {
      label: "支出",
      value: totalExpense,
      icon: ArrowDownCircle,
      color: "text-expense",
      bgColor: "bg-expense/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
        >
          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className={`font-bold text-money ${stat.color}`}>
                  {formatCurrency(stat.value)}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
