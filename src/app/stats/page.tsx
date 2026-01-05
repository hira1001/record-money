"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoneyHeatmap } from "@/components/stats/money-heatmap";
import { CategoryChart } from "@/components/stats/category-chart";
import { format, addMonths, subMonths } from "date-fns";
import { ja } from "date-fns/locale";

export default function StatsPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const router = useRouter();

  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  // Mock data
  const monthlyData = {
    totalExpense: 156800,
    totalIncome: 350000,
    balance: 193200,
    categoryBreakdown: [
      { name: "食費", amount: 45000, color: "#f59e0b", percentage: 29 },
      { name: "住居", amount: 80000, color: "#06b6d4", percentage: 51 },
      { name: "交通費", amount: 15800, color: "#3b82f6", percentage: 10 },
      { name: "娯楽", amount: 12000, color: "#ec4899", percentage: 8 },
      { name: "その他", amount: 4000, color: "#6b7280", percentage: 2 },
    ],
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <main className="min-h-screen bg-background safe-top safe-bottom pb-8">
      {/* Header */}
      <header className="header-clean px-5 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href="/" className="p-2 -ml-2 press-effect">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-base font-semibold min-w-[100px] text-center">
              {format(currentMonth, "yyyy年M月", { locale: ja })}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              onClick={goToNextMonth}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="w-9" />
        </div>
      </header>

      <div className="px-4 py-4 space-y-6 max-w-lg mx-auto">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-elevated p-4 text-center cursor-pointer hover:bg-secondary/50 transition-colors"
            onClick={() => router.push("/transactions?filter=income")}
          >
            <p className="text-xs text-muted-foreground mb-1">収入</p>
            <p className="font-semibold text-income text-money">
              {formatCurrency(monthlyData.totalIncome)}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card-elevated p-4 text-center cursor-pointer hover:bg-secondary/50 transition-colors"
            onClick={() => router.push("/transactions?filter=expense")}
          >
            <p className="text-xs text-muted-foreground mb-1">支出</p>
            <p className="font-semibold text-expense text-money">
              {formatCurrency(monthlyData.totalExpense)}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-elevated p-4 text-center cursor-pointer hover:bg-secondary/50 transition-colors"
            onClick={() => router.push("/transactions")}
          >
            <p className="text-xs text-muted-foreground mb-1">収支</p>
            <p className={`font-semibold text-money ${monthlyData.balance >= 0 ? "text-income" : "text-expense"}`}>
              {formatCurrency(monthlyData.balance)}
            </p>
          </motion.div>
        </div>

        {/* Money Heatmap */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h2 className="text-sm font-medium mb-3 px-1">支出ヒートマップ</h2>
          <MoneyHeatmap month={currentMonth} />
        </motion.section>

        {/* Category Breakdown */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-sm font-medium mb-3 px-1">カテゴリ別支出</h2>
          <CategoryChart categories={monthlyData.categoryBreakdown} />
        </motion.section>
      </div>
    </main>
  );
}
