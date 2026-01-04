"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
  isSameMonth,
} from "date-fns";
import { ja } from "date-fns/locale";

interface MoneyHeatmapProps {
  month: Date;
  onDateClick?: (date: Date) => void;
}

// Mock daily spending data
const mockDailyData: Record<string, number> = {
  "2026-01-01": 2500,
  "2026-01-02": 800,
  "2026-01-03": 15000,
  "2026-01-04": 1200,
  "2026-01-05": 3500,
  "2026-01-06": 500,
  "2026-01-07": 8000,
  "2026-01-08": 2200,
  "2026-01-10": 4500,
  "2026-01-12": 1800,
  "2026-01-15": 12000,
  "2026-01-18": 3200,
  "2026-01-20": 6500,
  "2026-01-22": 900,
  "2026-01-25": 4800,
};

const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

export function MoneyHeatmap({ month, onDateClick }: MoneyHeatmapProps) {
  const days = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    return eachDayOfInterval({ start, end });
  }, [month]);

  const startDayOfWeek = getDay(startOfMonth(month));

  const getIntensity = (amount: number): string => {
    if (amount === 0) return "bg-secondary";
    if (amount < 1000) return "bg-emerald-100";
    if (amount < 3000) return "bg-emerald-200";
    if (amount < 5000) return "bg-amber-200";
    if (amount < 10000) return "bg-orange-300";
    return "bg-red-400";
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000) {
      return `¥${(amount / 10000).toFixed(1)}万`;
    }
    return `¥${amount.toLocaleString()}`;
  };

  return (
    <div className="card-elevated p-4">
      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before start of month */}
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Day cells */}
        {days.map((day, index) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const amount = mockDailyData[dateKey] || 0;
          const intensity = getIntensity(amount);

          return (
            <motion.div
              key={dateKey}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01 }}
              className={`aspect-square rounded-lg ${intensity} flex flex-col items-center justify-center cursor-pointer hover:ring-2 hover:ring-foreground/20 transition-all press-effect`}
              title={amount > 0 ? formatCurrency(amount) : "支出なし"}
              onClick={() => onDateClick?.(day)}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-xs font-medium text-foreground/70">
                {format(day, "d")}
              </span>
              {amount > 0 && (
                <span className="text-[9px] text-foreground/50 mt-0.5">
                  {formatCurrency(amount)}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-border">
        <span className="text-xs text-muted-foreground">少</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded bg-emerald-100" />
          <div className="w-4 h-4 rounded bg-emerald-200" />
          <div className="w-4 h-4 rounded bg-amber-200" />
          <div className="w-4 h-4 rounded bg-orange-300" />
          <div className="w-4 h-4 rounded bg-red-400" />
        </div>
        <span className="text-xs text-muted-foreground">多</span>
      </div>
    </div>
  );
}
