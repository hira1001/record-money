"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { Transaction } from "@/types";

interface DailyDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  transactions: Transaction[];
  totalAmount: number;
}

export function DailyDetailModal({
  open,
  onOpenChange,
  date,
  transactions,
  totalAmount,
}: DailyDetailModalProps) {
  if (!date) return null;

  // Group transactions by category for pie chart
  const categoryData = transactions.reduce((acc, transaction) => {
    const categoryName = transaction.category?.name || "その他";
    const categoryColor = transaction.category?.color || "#6b7280";

    const existing = acc.find((item) => item.name === categoryName);
    if (existing) {
      existing.value += transaction.amount;
    } else {
      acc.push({
        name: categoryName,
        value: transaction.amount,
        color: categoryColor,
      });
    }
    return acc;
  }, [] as { name: string; value: number; color: string }[]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "HH:mm");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[calc(100vw-2rem)] mx-auto p-0 gap-0 bg-card border-border overflow-hidden max-h-[85vh] flex flex-col">
        <DialogHeader className="p-5 pb-3 flex-shrink-0">
          <DialogTitle className="text-lg font-semibold">
            {format(date, "yyyy年M月d日(E)", { locale: ja })}
          </DialogTitle>
          <p className="text-2xl font-bold text-money text-expense mt-2">
            {formatCurrency(totalAmount)}
          </p>
        </DialogHeader>

        <div className="p-5 pt-0 overflow-y-auto flex-1 space-y-5">
          {/* Pie Chart */}
          {categoryData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-elevated p-4"
            >
              <h3 className="text-sm font-medium mb-3">カテゴリ別内訳</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {categoryData.map((category) => (
                  <div key={category.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground truncate">
                        {category.name}
                      </p>
                      <p className="text-sm font-medium text-money">
                        {formatCurrency(category.value)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Transaction List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-sm font-medium mb-3">取引明細</h3>
            <div className="space-y-2">
              {transactions.length === 0 ? (
                <div className="card-elevated p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    この日の支出はありません
                  </p>
                </div>
              ) : (
                transactions.map((transaction) => (
                  <motion.div
                    key={transaction.id}
                    className="card-elevated p-3 flex items-center justify-between"
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: transaction.category?.color || "#6b7280",
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {transaction.description || "取引"}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">
                            {transaction.category?.name || "その他"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(transaction.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-money text-expense ml-2">
                      {formatCurrency(transaction.amount)}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
