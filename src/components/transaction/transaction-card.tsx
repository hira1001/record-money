"use client";

import { motion } from "framer-motion";
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
    >
      <div className="card-elevated p-4 cursor-pointer press-effect">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div
            className={`p-2.5 rounded-xl ${
              transaction.type === "income" ? "icon-income" : "icon-expense"
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">
              {transaction.description || transaction.category?.name || "取引"}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-muted-foreground">
                {formatDate(transaction.date)}
              </p>
              {transaction.source !== "manual" && (
                <span className="px-1.5 py-0.5 badge-neutral rounded text-[10px]">
                  {transaction.source === "ocr" ? "OCR" : "自動"}
                </span>
              )}
            </div>
          </div>

          {/* Amount */}
          <div className="text-right">
            <p
              className={`font-semibold text-money ${
                transaction.type === "income" ? "text-income" : "text-expense"
              }`}
            >
              {transaction.type === "income" ? "+" : "-"}
              {formatCurrency(transaction.amount)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
