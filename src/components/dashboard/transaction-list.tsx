"use client";

import { motion } from "framer-motion";
import { TransactionCard } from "@/components/transaction/transaction-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Transaction } from "@/types";

interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onEdit?: (transaction: Transaction) => void;
}

export function TransactionList({
  transactions,
  isLoading,
  onEdit,
}: TransactionListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <motion.div
        className="text-center py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-muted-foreground">取引がありません</p>
        <p className="text-sm text-muted-foreground mt-1">
          右下の + ボタンで追加しましょう
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction, index) => (
        <div
          key={transaction.id}
          onClick={() => onEdit?.(transaction)}
          className={onEdit ? "cursor-pointer" : ""}
        >
          <TransactionCard
            transaction={transaction}
            index={index}
          />
        </div>
      ))}
    </div>
  );
}
