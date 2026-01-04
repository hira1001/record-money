"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransactionCard } from "@/components/transaction/transaction-card";
import { BottomTabBar } from "@/components/navigation/bottom-tab-bar";
import Link from "next/link";
import { format, parseISO, isToday, isYesterday, isThisWeek, isThisMonth } from "date-fns";
import { ja } from "date-fns/locale";
import type { Transaction } from "@/types";

// Mock all transactions (in real app, this would come from API)
const generateMockTransactions = (count: number): Transaction[] => {
  const categories = [
    { id: "food", name: "食費", color: "#f59e0b" },
    { id: "transport", name: "交通費", color: "#3b82f6" },
    { id: "shopping", name: "日用品", color: "#8b5cf6" },
    { id: "entertainment", name: "娯楽", color: "#ec4899" },
  ];

  const descriptions = [
    "セブンイレブン",
    "ファミリーマート",
    "スターバックス",
    "マクドナルド",
    "JR東日本",
    "Amazon",
    "ユニクロ",
    "映画館",
  ];

  return Array.from({ length: count }, (_, i) => {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const hoursAgo = i * 6 + Math.floor(Math.random() * 6);
    return {
      id: `tx-${i}`,
      user_id: "user-1",
      amount: Math.floor(Math.random() * 5000) + 100,
      type: "expense" as const,
      category_id: category.id,
      category: {
        id: category.id,
        user_id: null,
        name: category.name,
        color: category.color,
        icon: category.id,
        is_default: true,
      },
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      date: new Date(Date.now() - hoursAgo * 3600000).toISOString(),
      status: "confirmed",
      source: i % 3 === 0 ? "ocr" : i % 3 === 1 ? "gmail_auto" : "manual",
      created_at: new Date(Date.now() - hoursAgo * 3600000).toISOString(),
    };
  });
};

const allTransactions = generateMockTransactions(100);

const PAGE_SIZE = 10;

export default function TransactionsPage() {
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(false);

  const displayedTransactions = allTransactions.slice(0, displayCount);
  const hasMore = displayCount < allTransactions.length;

  const loadMore = () => {
    setIsLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      setDisplayCount((prev) => Math.min(prev + PAGE_SIZE, allTransactions.length));
      setIsLoading(false);
    }, 500);
  };

  // Group transactions by date category
  const groupTransactionsByDate = (transactions: Transaction[]) => {
    const groups: { [key: string]: Transaction[] } = {
      today: [],
      yesterday: [],
      thisWeek: [],
      thisMonth: [],
      older: [],
    };

    transactions.forEach((tx) => {
      const date = parseISO(tx.date);
      if (isToday(date)) {
        groups.today.push(tx);
      } else if (isYesterday(date)) {
        groups.yesterday.push(tx);
      } else if (isThisWeek(date)) {
        groups.thisWeek.push(tx);
      } else if (isThisMonth(date)) {
        groups.thisMonth.push(tx);
      } else {
        groups.older.push(tx);
      }
    });

    return groups;
  };

  const groupedTransactions = groupTransactionsByDate(displayedTransactions);

  const getGroupLabel = (key: string) => {
    switch (key) {
      case "today":
        return "今日";
      case "yesterday":
        return "昨日";
      case "thisWeek":
        return "今週";
      case "thisMonth":
        return "今月";
      case "older":
        return "それ以前";
      default:
        return key;
    }
  };

  const totalAmount = displayedTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <main className="min-h-screen bg-background safe-top pb-32">
      {/* Header */}
      <header className="header-clean px-5 py-4 sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href="/" className="p-2 -ml-2 press-effect">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="text-center">
            <h1 className="text-base font-semibold">全ての取引</h1>
            <p className="text-xs text-muted-foreground">
              {displayedTransactions.length} 件 / {allTransactions.length} 件
            </p>
          </div>
          <div className="w-9" />
        </div>
      </header>

      {/* Summary */}
      <div className="px-5 py-4 max-w-lg mx-auto">
        <div className="card-elevated p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">表示中の合計</span>
            <span className="text-xl font-bold text-money text-expense">
              -{new Intl.NumberFormat("ja-JP", {
                style: "currency",
                currency: "JPY",
                minimumFractionDigits: 0,
              }).format(totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Transaction Groups */}
      <div className="px-5 space-y-6 max-w-lg mx-auto">
        {Object.entries(groupedTransactions).map(([key, transactions]) => {
          if (transactions.length === 0) return null;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xs font-medium text-muted-foreground mb-3 px-1">
                {getGroupLabel(key)}
              </h2>
              <div className="space-y-3">
                {transactions.map((transaction, index) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    index={index}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="px-5 py-6 max-w-lg mx-auto">
          <Button
            onClick={loadMore}
            disabled={isLoading}
            variant="outline"
            className="w-full h-12 hover:bg-secondary"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                読み込み中...
              </>
            ) : (
              <>
                さらに{Math.min(PAGE_SIZE, allTransactions.length - displayCount)}件を表示
              </>
            )}
          </Button>
        </div>
      )}

      {/* End Message */}
      {!hasMore && displayedTransactions.length > 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">すべての取引を表示しました</p>
        </div>
      )}

      {/* Bottom Tab Bar */}
      <BottomTabBar />
    </main>
  );
}
