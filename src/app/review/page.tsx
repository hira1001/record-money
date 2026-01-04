"use client";

import { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Check, X, Edit2, ChevronLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomTabBar } from "@/components/navigation/bottom-tab-bar";
import { EditTransactionModal } from "@/components/transaction/edit-transaction-modal";
import Link from "next/link";
import type { Transaction } from "@/types";

// Mock pending transactions
const mockPendingTransactions: Transaction[] = [
  {
    id: "p1",
    user_id: "user-1",
    amount: 1580,
    type: "expense",
    category_id: "food",
    category: { id: "food", user_id: null, name: "食費", color: "#f59e0b", icon: "food", is_default: true },
    description: "マクドナルド 渋谷店",
    date: new Date().toISOString(),
    status: "review_needed",
    source: "gmail_auto",
    created_at: new Date().toISOString(),
  },
  {
    id: "p2",
    user_id: "user-1",
    amount: 3200,
    type: "expense",
    category_id: "transport",
    category: { id: "transport", user_id: null, name: "交通費", color: "#3b82f6", icon: "transport", is_default: true },
    description: "JR東日本 Suicaチャージ",
    date: new Date(Date.now() - 3600000).toISOString(),
    status: "review_needed",
    source: "gmail_auto",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "p3",
    user_id: "user-1",
    amount: 980,
    type: "expense",
    category_id: "food",
    category: { id: "food", user_id: null, name: "食費", color: "#f59e0b", icon: "food", is_default: true },
    description: "ファミリーマート",
    date: new Date(Date.now() - 7200000).toISOString(),
    status: "review_needed",
    source: "ocr",
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
];

export default function ReviewPage() {
  const [transactions, setTransactions] = useState(mockPendingTransactions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const currentTransaction = transactions[currentIndex];
  const remaining = transactions.length - currentIndex;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat("ja-JP", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  };

  const handleSwipe = (info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      handleApprove();
    } else if (info.offset.x < -threshold) {
      handleReject();
    }
  };

  const handleApprove = () => {
    if (navigator.vibrate) navigator.vibrate(10);
    setDirection("right");
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setDirection(null);
    }, 200);
  };

  const handleReject = () => {
    if (navigator.vibrate) navigator.vibrate([10, 20, 10]);
    setDirection("left");
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setDirection(null);
      setDragOffset(0);
    }, 200);
  };

  const handleEdit = () => {
    if (!currentTransaction) return;
    setEditingTransaction(currentTransaction);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (updatedTransaction: Transaction) => {
    // Update the transaction in the list
    setTransactions((prev) =>
      prev.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t))
    );
    setEditingTransaction(null);
  };

  if (currentIndex >= transactions.length) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-income/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-income" />
          </div>
          <h1 className="text-xl font-semibold mb-2">すべて完了!</h1>
          <p className="text-muted-foreground text-sm mb-6">
            確認が必要な取引はありません
          </p>
          <Link href="/">
            <Button className="bg-foreground text-background">
              ダッシュボードへ戻る
            </Button>
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background safe-top pb-24">
      {/* Header */}
      <header className="header-clean px-5 py-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href="/" className="p-2 -ml-2 press-effect">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="text-center">
            <h1 className="text-base font-semibold">確認待ち</h1>
            <p className="text-xs text-muted-foreground">
              残り {remaining} 件
            </p>
          </div>
          <div className="w-9" />
        </div>
      </header>

      {/* Card Stack */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="relative w-full max-w-sm h-[400px]">
          {/* Background indicators */}
          <div className="absolute inset-0 flex items-center justify-between px-8 pointer-events-none">
            {/* Reject indicator (left swipe) */}
            <motion.div
              className="flex flex-col items-center gap-2"
              animate={{
                opacity: dragOffset < -50 ? 1 : 0,
                scale: dragOffset < -50 ? 1 : 0.8,
              }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-16 h-16 rounded-full bg-expense/20 flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-expense" />
              </div>
              <span className="text-sm font-medium text-expense">削除</span>
            </motion.div>

            {/* Approve indicator (right swipe) */}
            <motion.div
              className="flex flex-col items-center gap-2"
              animate={{
                opacity: dragOffset > 50 ? 1 : 0,
                scale: dragOffset > 50 ? 1 : 0.8,
              }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-16 h-16 rounded-full bg-income/20 flex items-center justify-center">
                <Check className="w-8 h-8 text-income" />
              </div>
              <span className="text-sm font-medium text-income">承認</span>
            </motion.div>
          </div>

          <AnimatePresence>
            {currentTransaction && (
              <motion.div
                key={currentTransaction.id}
                className="absolute inset-0 card-elevated p-6 cursor-grab active:cursor-grabbing"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  x: direction === "right" ? 300 : direction === "left" ? -300 : 0,
                  rotate: direction === "right" ? 15 : direction === "left" ? -15 : 0,
                }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDrag={(_, info) => setDragOffset(info.offset.x)}
                onDragEnd={(_, info) => {
                  setDragOffset(0);
                  handleSwipe(info);
                }}
              >
                {/* Source badge */}
                <div className="flex justify-between items-start mb-6">
                  <span className="px-2.5 py-1 rounded-full badge-neutral text-xs">
                    {currentTransaction.source === "gmail_auto" ? "メール自動取得" : "OCR読み取り"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(currentTransaction.date)}
                  </span>
                </div>

                {/* Amount */}
                <div className="text-center py-8">
                  <p className="text-4xl font-bold text-money text-expense mb-2">
                    -{formatCurrency(currentTransaction.amount)}
                  </p>
                  <p className="text-lg text-foreground">
                    {currentTransaction.description}
                  </p>
                </div>

                {/* Category */}
                <div className="flex items-center justify-center gap-2 py-4 border-t border-border">
                  <span className="text-sm text-muted-foreground">カテゴリ:</span>
                  <span className="px-3 py-1 rounded-full bg-secondary text-sm font-medium">
                    {currentTransaction.category?.name || "未分類"}
                  </span>
                </div>

                {/* Swipe hints */}
                <div className="flex justify-between text-xs text-muted-foreground mt-4 px-4">
                  <span className="flex items-center gap-1">
                    <X className="w-3.5 h-3.5 text-expense" /> 削除
                  </span>
                  <span className="flex items-center gap-1">
                    承認 <Check className="w-3.5 h-3.5 text-income" />
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 pb-8">
        <div className="flex justify-center gap-4 max-w-sm mx-auto">
          <Button
            variant="outline"
            size="lg"
            className="w-16 h-16 rounded-full border-2 border-expense/20 hover:bg-expense/10 hover:border-expense/40"
            onClick={handleReject}
          >
            <X className="w-6 h-6 text-expense" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-14 h-14 rounded-full hover:bg-action/10 hover:border-action/40"
            onClick={handleEdit}
          >
            <Edit2 className="w-5 h-5 text-action" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-16 h-16 rounded-full border-2 border-income/20 hover:bg-income/10 hover:border-income/40"
            onClick={handleApprove}
          >
            <Check className="w-6 h-6 text-income" />
          </Button>
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <BottomTabBar />

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        transaction={editingTransaction}
        onSave={handleSaveEdit}
      />
    </main>
  );
}
