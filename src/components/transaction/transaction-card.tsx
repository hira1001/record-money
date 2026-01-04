"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import type { Transaction } from "@/types";
import {
  ShoppingBag,
  Utensils,
  Car,
  Home,
  Gamepad2,
  Heart,
  Banknote,
  CircleDollarSign,
} from "lucide-react";

interface TransactionCardProps {
  transaction: Transaction;
  index?: number;
}

const categoryIcons: Record<string, React.ElementType> = {
  shopping: ShoppingBag,
  food: Utensils,
  transport: Car,
  housing: Home,
  entertainment: Gamepad2,
  health: Heart,
  income: Banknote,
  default: CircleDollarSign,
};

export function TransactionCard({ transaction, index = 0 }: TransactionCardProps) {
  const Icon =
    categoryIcons[transaction.category?.icon || "default"] ||
    categoryIcons.default;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("ja-JP", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="glass-card p-4 hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div
            className={`p-3 rounded-xl ${
              transaction.type === "income"
                ? "bg-income/10 text-income"
                : "bg-expense/10 text-expense"
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">
              {transaction.description || transaction.category?.name || "取引"}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(transaction.date)}
              {transaction.source !== "manual" && (
                <span className="ml-2 px-1.5 py-0.5 bg-action/10 text-action rounded text-[10px]">
                  {transaction.source === "ocr" ? "OCR" : "自動"}
                </span>
              )}
            </p>
          </div>

          {/* Amount */}
          <div className="text-right">
            <p
              className={`font-bold text-money ${
                transaction.type === "income" ? "text-income" : "text-expense"
              }`}
            >
              {transaction.type === "income" ? "+" : "-"}
              {formatCurrency(transaction.amount)}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
