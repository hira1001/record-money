"use client";

import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import type { Transaction } from "@/types";

interface EditTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  onSave: (transaction: Transaction) => void;
}

const categories = [
  { id: "food", name: "食費", icon: "🍽️" },
  { id: "transport", name: "交通費", icon: "🚃" },
  { id: "shopping", name: "日用品", icon: "🛒" },
  { id: "entertainment", name: "娯楽", icon: "🎮" },
  { id: "health", name: "医療", icon: "💊" },
  { id: "housing", name: "住居", icon: "🏠" },
  { id: "income", name: "収入", icon: "💰" },
  { id: "other", name: "その他", icon: "📦" },
];

export function EditTransactionModal({
  open,
  onOpenChange,
  transaction,
  onSave,
}: EditTransactionModalProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState<Date>(new Date());

  // Initialize form with transaction data when it changes
  useEffect(() => {
    if (transaction) {
      setAmount(String(transaction.amount));
      setDescription(transaction.description || "");
      setCategory(transaction.category_id || "");
      setDate(new Date(transaction.date));
    }
  }, [transaction]);

  const handleSave = () => {
    if (!transaction || !amount || isNaN(Number(amount))) return;

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([10, 50, 10]);
    }

    const updatedTransaction: Transaction = {
      ...transaction,
      amount: Number(amount),
      description,
      category_id: category,
      date: date.toISOString(),
    };

    onSave(updatedTransaction);
    onOpenChange(false);
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[calc(100vw-2rem)] mx-auto p-0 gap-0 bg-card border-border overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="p-5 pb-0 flex-shrink-0">
          <DialogTitle className="text-lg font-semibold">取引を編集</DialogTitle>
        </DialogHeader>

        <div className="p-5 pt-4 overflow-y-auto flex-1 space-y-4">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">金額</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">
                ¥
              </span>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-9 text-2xl font-semibold text-money h-14 bg-secondary border-0"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">カテゴリ</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-11 bg-secondary border-0">
                <SelectValue placeholder="カテゴリを選択" />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter((c) =>
                    transaction.type === "income" ? c.id === "income" : c.id !== "income"
                  )
                  .map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </span>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">メモ</Label>
            <Input
              placeholder="例: セブンイレブン"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-11 bg-secondary border-0"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">日付</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-11 justify-start bg-secondary border-0 font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  {format(date, "yyyy年M月d日", { locale: ja })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11"
            >
              キャンセル
            </Button>
            <Button
              onClick={handleSave}
              disabled={!amount}
              className="flex-1 h-11 bg-foreground text-background hover:bg-foreground/90 press-effect"
            >
              保存
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
