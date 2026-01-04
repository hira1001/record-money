"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BalanceCard } from "@/components/dashboard/balance-card";
import { SummaryStats } from "@/components/dashboard/summary-stats";
import { TransactionList } from "@/components/dashboard/transaction-list";
import { FAB } from "@/components/dashboard/fab";
import { InputModal } from "@/components/transaction/input-modal";
import { BottomTabBar } from "@/components/navigation/bottom-tab-bar";
import { User, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AssetsFlow } from "@/components/dashboard/assets-flow";
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
  const [monthlyBudget, setMonthlyBudget] = useState(200000);

  // Calculate summary data
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const remainingBudget = monthlyBudget - totalExpense;
  const percentUsed = (totalExpense / monthlyBudget) * 100;

  const handleBudgetChange = (newBudget: number) => {
    setMonthlyBudget(newBudget);
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([10, 30, 10]);
    }
  };

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
    <main className="min-h-screen pb-32 safe-top bg-background">
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

      <div className="px-4 py-4 max-w-lg mx-auto">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-2 gap-3 auto-rows-fr">
          {/* Large Balance Card - spans 2 columns */}
          <motion.div
            className="col-span-2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <BalanceCard
              remainingBudget={remainingBudget}
              totalBudget={monthlyBudget}
              percentUsed={percentUsed}
              onBudgetChange={handleBudgetChange}
            />
          </motion.div>

          {/* Income Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="card-elevated p-4"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg icon-income">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <p className="text-xs text-muted-foreground">収入</p>
              </div>
              <p className="text-xl font-bold text-money text-income">
                {new Intl.NumberFormat("ja-JP", {
                  style: "currency",
                  currency: "JPY",
                  minimumFractionDigits: 0,
                }).format(totalIncome)}
              </p>
            </div>
          </motion.div>

          {/* Expense Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="card-elevated p-4"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg icon-expense">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <p className="text-xs text-muted-foreground">支出</p>
              </div>
              <p className="text-xl font-bold text-money text-expense">
                {new Intl.NumberFormat("ja-JP", {
                  style: "currency",
                  currency: "JPY",
                  minimumFractionDigits: 0,
                }).format(totalExpense)}
              </p>
            </div>
          </motion.div>

          {/* Assets Flow Animation Card - spans 2 columns */}
          <motion.div
            className="col-span-2 card-elevated p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">収支バランス</h3>
              <Link href="/stats">
                <Button variant="ghost" size="sm" className="h-7 text-xs">
                  詳細
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
            <AssetsFlow totalIncome={totalIncome} totalExpense={totalExpense} />
          </motion.div>

          {/* Quick Stats - spans 2 columns */}
          <motion.div
            className="col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-sm font-medium text-foreground">最近の取引</h2>
              <Link href="/transactions">
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors press-effect">
                  すべて見る
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
            <TransactionList transactions={transactions.slice(0, 3)} />
          </motion.div>
        </div>
      </div>

      {/* Floating Action Button */}
      <FAB onClick={() => setIsModalOpen(true)} />

      {/* Input Modal */}
      <InputModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleAddTransaction}
        existingTransactions={transactions.map((t) => ({
          amount: t.amount,
          description: t.description || "",
          date: t.date,
        }))}
      />

      {/* Bottom Tab Bar */}
      <BottomTabBar />
    </main>
  );
}
