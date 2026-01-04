"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Keyboard,
  Camera,
  Mic,
  CalendarIcon,
  Loader2,
  Check,
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

export function InputModal({ open, onOpenChange, onSubmit }: InputModalProps) {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("manual");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    amount: number;
    description: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setCategory("");
    setDate(new Date());
    setScanResult(null);
  };

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanResult(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/ai/ocr", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setScanResult({
          amount: result.amount,
          description: result.description,
        });
        setAmount(String(result.amount));
        setDescription(result.description);
        // Haptic feedback for success
        if (navigator.vibrate) {
          navigator.vibrate([10, 30, 10]);
        }
      }
    } catch (error) {
      console.error("OCR Error:", error);
    } finally {
      setIsScanning(false);
    }
  };

  const quickAmounts = [500, 1000, 3000, 5000];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-4 p-0 gap-0 bg-card border-border overflow-hidden">
        <DialogHeader className="p-5 pb-0">
          <DialogTitle className="text-lg font-semibold">取引を追加</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3 mx-5 bg-secondary">
            <TabsTrigger value="manual" className="gap-1.5 text-xs">
              <Keyboard className="w-3.5 h-3.5" />
              手入力
            </TabsTrigger>
            <TabsTrigger value="camera" className="gap-1.5 text-xs">
              <Camera className="w-3.5 h-3.5" />
              カメラ
            </TabsTrigger>
            <TabsTrigger value="voice" className="gap-1.5 text-xs">
              <Mic className="w-3.5 h-3.5" />
              音声
            </TabsTrigger>
          </TabsList>

          <div className="p-5 pt-4">
            <TabsContent value="manual" className="mt-0 space-y-4">
              {/* Type Toggle */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={type === "expense" ? "default" : "outline"}
                  className={`h-11 ${
                    type === "expense"
                      ? "bg-foreground text-background hover:bg-foreground/90"
                      : "hover:bg-secondary"
                  }`}
                  onClick={() => setType("expense")}
                >
                  支出
                </Button>
                <Button
                  type="button"
                  variant={type === "income" ? "default" : "outline"}
                  className={`h-11 ${
                    type === "income"
                      ? "bg-foreground text-background hover:bg-foreground/90"
                      : "hover:bg-secondary"
                  }`}
                  onClick={() => setType("income")}
                >
                  収入
                </Button>
              </div>

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

              {/* Quick Amount Buttons */}
              <div className="flex gap-2">
                {quickAmounts.map((amt) => (
                  <Button
                    key={amt}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs bg-secondary border-0 hover:bg-muted"
                    onClick={() => setAmount(String(amt))}
                  >
                    ¥{amt.toLocaleString()}
                  </Button>
                ))}
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
                        type === "income" ? c.id === "income" : c.id !== "income"
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

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={!amount}
                className="w-full h-12 text-base font-medium bg-foreground text-background hover:bg-foreground/90 press-effect"
              >
                記録する
              </Button>
            </TabsContent>

            <TabsContent value="camera" className="mt-0">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageCapture}
                className="hidden"
              />

              <AnimatePresence mode="wait">
                {isScanning ? (
                  <motion.div
                    key="scanning"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="aspect-[4/3] bg-secondary rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="w-10 h-10 mx-auto text-muted-foreground animate-spin mb-3" />
                        <p className="text-sm text-muted-foreground">
                          AIが解析中...
                        </p>
                      </div>
                    </div>
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-11 w-full" />
                  </motion.div>
                ) : scanResult ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="p-4 bg-secondary rounded-xl">
                      <div className="flex items-center gap-2 text-income mb-3">
                        <Check className="w-5 h-5" />
                        <span className="font-medium">読み取り完了</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">金額</span>
                          <span className="font-semibold">
                            ¥{scanResult.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">店名</span>
                          <span className="font-medium">{scanResult.description}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={handleSubmit}
                      className="w-full h-12 bg-foreground text-background hover:bg-foreground/90"
                    >
                      この内容で記録
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setScanResult(null);
                        fileInputRef.current?.click();
                      }}
                      className="w-full"
                    >
                      再スキャン
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="capture"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div
                      className="aspect-[4/3] bg-secondary rounded-xl flex items-center justify-center cursor-pointer hover:bg-muted transition-colors press-effect"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="text-center">
                        <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground font-medium">
                          レシートを撮影
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          AIが自動で金額を読み取ります
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="voice" className="mt-0">
              <div className="py-8 flex flex-col items-center">
                <motion.button
                  className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  <Mic className="w-8 h-8 text-muted-foreground" />
                </motion.button>
                <p className="mt-4 text-muted-foreground text-sm">
                  タップして話しかける
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  例: 「ランチで800円」
                </p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
