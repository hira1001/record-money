"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Check, Edit2, AlertCircle } from "lucide-react";

interface BatchTransaction {
  amount: number;
  description: string;
  date: string;
  suggested_category: string | null;
  isDuplicate?: boolean;
}

interface BatchConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactions: BatchTransaction[];
  onConfirm: (transactions: BatchTransaction[]) => void;
}

export function BatchConfirmModal({
  open,
  onOpenChange,
  transactions: initialTransactions,
  onConfirm,
}: BatchConfirmModalProps) {
  const [transactions, setTransactions] =
    useState<BatchTransaction[]>(initialTransactions);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleRemove = (index: number) => {
    setTransactions((prev) => prev.filter((_, i) => i !== index));
    if (navigator.vibrate) {
      navigator.vibrate([10, 20, 10]);
    }
  };

  const handleEdit = (index: number, field: keyof BatchTransaction, value: string | number) => {
    setTransactions((prev) =>
      prev.map((t, i) =>
        i === index ? { ...t, [field]: value } : t
      )
    );
  };

  const handleConfirmAll = () => {
    onConfirm(transactions.filter((t) => !t.isDuplicate));
    onOpenChange(false);
    if (navigator.vibrate) {
      navigator.vibrate([10, 30, 10]);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const nonDuplicateCount = transactions.filter((t) => !t.isDuplicate).length;
  const totalAmount = transactions
    .filter((t) => !t.isDuplicate)
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[calc(100vw-2rem)] mx-auto p-0 gap-0 bg-card border-border overflow-hidden max-h-[85vh] flex flex-col">
        <DialogHeader className="p-5 pb-3 flex-shrink-0">
          <DialogTitle className="text-lg font-semibold">
            {nonDuplicateCount}件の取引を確認
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            合計: {formatCurrency(totalAmount)}
          </p>
        </DialogHeader>

        <div className="p-5 pt-2 overflow-y-auto flex-1 space-y-2">
          <AnimatePresence mode="popLayout">
            {transactions.map((transaction, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className={`card-elevated p-3 ${
                  transaction.isDuplicate ? "opacity-50 border-2 border-expense/30" : ""
                }`}
              >
                {transaction.isDuplicate && (
                  <div className="flex items-center gap-1 text-expense text-xs mb-2">
                    <AlertCircle className="w-3 h-3" />
                    <span>重複の可能性あり</span>
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {editingIndex === index ? (
                      <div className="space-y-2">
                        <Input
                          value={transaction.description}
                          onChange={(e) =>
                            handleEdit(index, "description", e.target.value)
                          }
                          className="h-8 text-sm"
                          placeholder="店名"
                        />
                        <Input
                          type="number"
                          value={transaction.amount}
                          onChange={(e) =>
                            handleEdit(index, "amount", Number(e.target.value))
                          }
                          className="h-8 text-sm"
                          placeholder="金額"
                        />
                      </div>
                    ) : (
                      <>
                        <p className="font-medium text-sm truncate">
                          {transaction.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(transaction.date), "M/d", { locale: ja })}
                          </span>
                          {transaction.suggested_category && (
                            <span className="text-xs badge-neutral px-2 py-0.5 rounded">
                              {transaction.suggested_category}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <p className="text-sm font-semibold text-money">
                      {formatCurrency(transaction.amount)}
                    </p>
                    <div className="flex gap-1">
                      <button
                        onClick={() =>
                          setEditingIndex(editingIndex === index ? null : index)
                        }
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleRemove(index)}
                        className="p-1.5 rounded-lg hover:bg-expense/10 transition-colors"
                      >
                        <X className="w-3.5 h-3.5 text-expense" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {transactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              全ての取引が削除されました
            </div>
          )}
        </div>

        <div className="p-5 pt-3 flex-shrink-0 border-t border-border">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              キャンセル
            </Button>
            <Button
              onClick={handleConfirmAll}
              disabled={nonDuplicateCount === 0}
              className="flex-1 bg-foreground text-background hover:bg-foreground/90"
            >
              <Check className="w-4 h-4 mr-2" />
              {nonDuplicateCount}件を記録
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
