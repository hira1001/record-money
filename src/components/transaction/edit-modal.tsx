"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { Transaction, TransactionType } from "@/types";

const categories = [
  { id: "food", name: "食費", emoji: "🍽️" },
  { id: "transport", name: "交通費", emoji: "🚃" },
  { id: "shopping", name: "日用品", emoji: "🛒" },
  { id: "entertainment", name: "娯楽", emoji: "🎮" },
  { id: "health", name: "医療", emoji: "💊" },
  { id: "housing", name: "住居", emoji: "🏠" },
  { id: "income", name: "給与", emoji: "💰" },
  { id: "other", name: "その他", emoji: "📦" },
];

interface EditModalProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, data: Partial<Transaction>) => void;
  onDelete: (id: string) => void;
}

export function EditModal({
  transaction,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: EditModalProps) {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount.toString());
      setType(transaction.type);
      setDescription(transaction.description || "");
      setCategoryId(transaction.category_id || "");
      setDate(new Date(transaction.date));
    }
  }, [transaction]);

  const handleSave = () => {
    if (!transaction || !amount) return;

    onSave(transaction.id, {
      amount: parseInt(amount, 10),
      type,
      description,
      category_id: categoryId || null,
      date: date.toISOString(),
    });
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!transaction) return;

    if (isDeleting) {
      onDelete(transaction.id);
      onOpenChange(false);
      setIsDeleting(false);
    } else {
      setIsDeleting(true);
      setTimeout(() => setIsDeleting(false), 3000);
    }
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>取引を編集</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Type Toggle */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={type === "expense" ? "default" : "outline"}
              className={`flex-1 ${type === "expense" ? "bg-red-500 hover:bg-red-600" : ""}`}
              onClick={() => setType("expense")}
            >
              支出
            </Button>
            <Button
              type="button"
              variant={type === "income" ? "default" : "outline"}
              className={`flex-1 ${type === "income" ? "bg-green-500 hover:bg-green-600" : ""}`}
              onClick={() => setType("income")}
            >
              収入
            </Button>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">金額</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ¥
              </span>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8"
                placeholder="0"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>カテゴリ</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="カテゴリを選択" />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter((c) =>
                    type === "income"
                      ? c.id === "income" || c.id === "other"
                      : c.id !== "income"
                  )
                  .map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.emoji} {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">メモ</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="取引の詳細"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>日付</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, "yyyy年M月d日", { locale: ja })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  locale={ja}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            className="flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? "もう一度押して削除" : "削除"}
          </Button>
          <div className="flex-1" />
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSave}>保存</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
