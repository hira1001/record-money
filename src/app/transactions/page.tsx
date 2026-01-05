"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TransactionCard } from "@/components/transaction/transaction-card";
import { EditModal } from "@/components/transaction/edit-modal";
import type { Transaction } from "@/types";

// Mock data
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
  {
    id: "5",
    user_id: "user-1",
    amount: 15000,
    type: "expense",
    category_id: "entertainment",
    category: { id: "entertainment", user_id: null, name: "娯楽", color: "#ec4899", icon: "entertainment", is_default: true },
    description: "映画・ディナー",
    date: new Date(Date.now() - 345600000).toISOString(),
    status: "confirmed",
    source: "manual",
    created_at: new Date(Date.now() - 345600000).toISOString(),
  },
];

type FilterType = "all" | "income" | "expense";

export default function TransactionsPage() {
  const searchParams = useSearchParams();
  const initialFilter = (searchParams.get("filter") as FilterType) || "all";

  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [filter, setFilter] = useState<FilterType>(initialFilter);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    const filterParam = searchParams.get("filter") as FilterType;
    if (filterParam && ["all", "income", "expense"].includes(filterParam)) {
      setFilter(filterParam);
    }
  }, [searchParams]);

  const filteredTransactions = transactions.filter((t) => {
    const matchesFilter = filter === "all" || t.type === filter;
    const matchesSearch =
      searchQuery === "" ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleSave = (id: string, data: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data } : t))
    );
  };

  const handleDelete = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <main className="min-h-screen bg-background safe-top safe-bottom pb-8">
      {/* Header */}
      <header className="header-clean px-5 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href="/" className="p-2 -ml-2 press-effect">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-base font-semibold">取引一覧</h1>
          <div className="w-9" />
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            すべて
          </Button>
          <Button
            variant={filter === "income" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("income")}
            className={filter === "income" ? "bg-green-500 hover:bg-green-600" : ""}
          >
            収入
          </Button>
          <Button
            variant={filter === "expense" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("expense")}
            className={filter === "expense" ? "bg-red-500 hover:bg-red-600" : ""}
          >
            支出
          </Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card-elevated p-3 text-center">
            <p className="text-xs text-muted-foreground">収入合計</p>
            <p className="font-semibold text-income">
              ¥{totalIncome.toLocaleString()}
            </p>
          </div>
          <div className="card-elevated p-3 text-center">
            <p className="text-xs text-muted-foreground">支出合計</p>
            <p className="font-semibold text-expense">
              ¥{totalExpense.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Transaction List */}
        <div className="space-y-2">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              取引が見つかりません
            </div>
          ) : (
            filteredTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleEdit(transaction)}
                className="cursor-pointer"
              >
                <TransactionCard transaction={transaction} />
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <EditModal
        transaction={editingTransaction}
        open={!!editingTransaction}
        onOpenChange={(open) => !open && setEditingTransaction(null)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </main>
  );
}
