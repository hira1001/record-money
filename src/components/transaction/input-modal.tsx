"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Keyboard,
  Camera,
  Mic,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import type { TransactionType } from "@/types";

interface InputModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    amount: number;
    type: TransactionType;
    description: string;
  }) => void;
}

export function InputModal({ open, onOpenChange, onSubmit }: InputModalProps) {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [description, setDescription] = useState("");
  const [activeTab, setActiveTab] = useState("manual");

  const handleSubmit = () => {
    if (!amount || isNaN(Number(amount))) return;

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([10, 50, 10]);
    }

    onSubmit({
      amount: Number(amount),
      type,
      description,
    });

    // Reset form
    setAmount("");
    setDescription("");
    onOpenChange(false);
  };

  const quickAmounts = [100, 500, 1000, 3000, 5000, 10000];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-glass-border max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="text-xl">取引を追加</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3 bg-muted/50">
            <TabsTrigger value="manual" className="gap-2">
              <Keyboard className="w-4 h-4" />
              <span className="hidden sm:inline">手入力</span>
            </TabsTrigger>
            <TabsTrigger value="camera" className="gap-2">
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">カメラ</span>
            </TabsTrigger>
            <TabsTrigger value="voice" className="gap-2">
              <Mic className="w-4 h-4" />
              <span className="hidden sm:inline">音声</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="mt-4 space-y-4">
            {/* Type Toggle */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={type === "expense" ? "default" : "outline"}
                className={`flex-1 ${
                  type === "expense"
                    ? "bg-expense hover:bg-expense/90"
                    : "hover:bg-expense/10 hover:text-expense"
                }`}
                onClick={() => setType("expense")}
              >
                <ArrowDownCircle className="w-4 h-4 mr-2" />
                支出
              </Button>
              <Button
                type="button"
                variant={type === "income" ? "default" : "outline"}
                className={`flex-1 ${
                  type === "income"
                    ? "bg-income hover:bg-income/90"
                    : "hover:bg-income/10 hover:text-income"
                }`}
                onClick={() => setType("income")}
              >
                <ArrowUpCircle className="w-4 h-4 mr-2" />
                収入
              </Button>
            </div>

            {/* Amount Input */}
            <div>
              <label className="text-sm text-muted-foreground">金額</label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  ¥
                </span>
                <Input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8 text-2xl font-bold text-money bg-muted/50 border-glass-border h-14"
                />
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((amt) => (
                <Button
                  key={amt}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-muted/50 border-glass-border hover:bg-muted"
                  onClick={() => setAmount(String(amt))}
                >
                  ¥{amt.toLocaleString()}
                </Button>
              ))}
            </div>

            {/* Description */}
            <div>
              <label className="text-sm text-muted-foreground">メモ</label>
              <Input
                placeholder="例: セブンイレブン"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 bg-muted/50 border-glass-border"
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!amount}
              className={`w-full h-12 text-lg font-bold ${
                type === "expense"
                  ? "bg-expense hover:bg-expense/90"
                  : "bg-income hover:bg-income/90"
              }`}
            >
              記録する
            </Button>
          </TabsContent>

          <TabsContent value="camera" className="mt-4">
            <div className="aspect-[4/3] bg-muted/30 rounded-xl flex items-center justify-center border-2 border-dashed border-glass-border">
              <div className="text-center">
                <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  レシートを撮影してAIが自動解析
                </p>
                <Button className="mt-4 bg-action hover:bg-action/90">
                  カメラを起動
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="voice" className="mt-4">
            <div className="py-8 flex flex-col items-center">
              <motion.div
                className="w-24 h-24 rounded-full bg-action/20 flex items-center justify-center"
                whileTap={{ scale: 0.95 }}
              >
                <Mic className="w-10 h-10 text-action" />
              </motion.div>
              <p className="mt-4 text-muted-foreground">
                ボタンを押して話しかけてください
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                例: 「ランチで800円」
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
