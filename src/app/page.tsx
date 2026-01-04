"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BalanceCard } from "@/components/dashboard/balance-card";
import { SummaryStats } from "@/components/dashboard/summary-stats";
import { TransactionList } from "@/components/dashboard/transaction-list";
import { FAB } from "@/components/dashboard/fab";
import { InputModal } from "@/components/transaction/input-modal";
import { User, ChevronRight } from "lucide-react";
import type { Transaction, TransactionType } from "@/types";

// Mock data for initial development
const mockTransactions: Transaction[] = [
  {
    id: "1",
    user_id: "user-1",
    amount: 1200,
    type: "expense",
    category_id: "food",
    category: { id: "food", user_id: null, name: "食費", color: "#f59e0b", icon: "food", is_default: true },
    description: "セブンイレブン",
    date: new Date().toISOString(),
    status: "confirmed",
    source: "manual",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    user_id: "user-1",
    amount: 350000,
    type: "income",
    category_id: "income",
    category: { id: "income", user_id: null, name: "給与", color: "#10b981", icon: "income", is_default: true },
    description: "給与振込",
    date: new Date(Date.now() - 86400000).toISOString(),
    status: "confirmed",
    source: "gmail_auto",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "3",
    user_id: "user-1",
    amount: 5800,
    type: "expense",
    category_id: "transport",
    category: { id: "transport", user_id: null, name: "交通費", color: "#3b82f6", icon: "transport", is_default: true },
    description: "定期券",
    date: new Date(Date.now() - 172800000).toISOString(),
    status: "confirmed",
    source: "ocr",
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "4",
    user_id: "user-1",
    amount: 2500,
    type: "expense",
    category_id: "food",
    category: { id: "food", user_id: null, name: "食費", color: "#f59e0b", icon: "food", is_default: true },
    description: "スターバックス",
    date: new Date(Date.now() - 259200000).toISOString(),
    status: "confirmed",
    source: "manual",
    created_at: new Date(Date.now() - 259200000).toISOString(),
  },
];

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);

  // Calculate summary data
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyBudget = 200000;
  const remainingBudget = monthlyBudget - totalExpense;
  const percentUsed = (totalExpense / monthlyBudget) * 100;

  const handleAddTransaction = (data: {
    amount: number;
    type: TransactionType;
    description: string;
  }) => {
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      user_id: "user-1",
      amount: data.amount,
      type: data.type,
      category_id: null,
      description: data.description,
      date: new Date().toISOString(),
      status: "confirmed",
      source: "manual",
      created_at: new Date().toISOString(),
    };

    // Optimistic update with haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([10, 30, 10]);
    }
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  return (
    <main className="min-h-screen pb-24 safe-top safe-bottom bg-background">
      {/* Header */}
      <motion.header
        className="sticky top-0 z-40 header-clean px-5 py-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <h1 className="text-lg font-semibold text-foreground">RecordMoney</h1>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
              })}
            </p>
          </div>
          <button className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center press-effect">
            <User className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </motion.header>

      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Balance Card */}
        <BalanceCard
          remainingBudget={remainingBudget}
          totalBudget={monthlyBudget}
          percentUsed={percentUsed}
        />

        {/* Summary Stats */}
        <SummaryStats totalIncome={totalIncome} totalExpense={totalExpense} />

        {/* Transaction List */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-medium text-foreground">最近の取引</h2>
            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors press-effect">
              すべて見る
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <TransactionList transactions={transactions} />
        </section>
      </div>

      {/* Floating Action Button */}
      <FAB onClick={() => setIsModalOpen(true)} />

      {/* Input Modal */}
      <InputModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleAddTransaction}
      />
    </main>
  );
}
