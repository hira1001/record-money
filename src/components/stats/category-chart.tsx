"use client";

import { motion } from "framer-motion";

interface CategoryData {
  name: string;
  amount: number;
  color: string;
  percentage: number;
}

interface CategoryChartProps {
  categories: CategoryData[];
}

export function CategoryChart({ categories }: CategoryChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const total = categories.reduce((sum, cat) => sum + cat.amount, 0);

  return (
    <div className="card-elevated p-4 space-y-4">
      {/* Progress bar visualization */}
      <div className="h-3 rounded-full overflow-hidden flex bg-secondary">
        {categories.map((cat, index) => (
          <motion.div
            key={cat.name}
            className="h-full"
            style={{ backgroundColor: cat.color }}
            initial={{ width: 0 }}
            animate={{ width: `${cat.percentage}%` }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          />
        ))}
      </div>

      {/* Category list */}
      <div className="space-y-3">
        {categories.map((cat, index) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-sm">{cat.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-money">
                {formatCurrency(cat.amount)}
              </span>
              <span className="text-xs text-muted-foreground w-10 text-right">
                {cat.percentage}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Total */}
      <div className="pt-3 border-t border-border flex justify-between items-center">
        <span className="text-sm font-medium">合計</span>
        <span className="font-semibold text-money">
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
}
