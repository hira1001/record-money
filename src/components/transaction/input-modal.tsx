"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { detectDuplicates } from "@/lib/utils";
import { BatchConfirmModal } from "./batch-confirm-modal";

// Type definitions for Web Speech API
interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}
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

interface BatchTransaction {
  amount: number;
  description: string;
  date: string;
  suggested_category?: string | null;
  isDuplicate?: boolean;
}

interface InputModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    amount: number;
    type: TransactionType;
    description: string;
  }) => void;
  existingTransactions?: Array<{
    amount: number;
    description: string;
    date: string;
  }>;
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

export function InputModal({ open, onOpenChange, onSubmit, existingTransactions = [] }: InputModalProps) {
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
  const [isListening, setIsListening] = useState(false);
  const [voiceResult, setVoiceResult] = useState<{
    amount: number;
    description: string;
  } | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Batch OCR state
  const [batchTransactions, setBatchTransactions] = useState<BatchTransaction[]>([]);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

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
    setVoiceResult(null);
  };

  // Voice recognition setup
  const setupVoiceRecognition = () => {
    if (typeof window === "undefined") return null;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech Recognition API not supported");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ja-JP";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      parseVoiceInput(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      if (navigator.vibrate) {
        navigator.vibrate([10, 50, 10]);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return recognition;
  };

  const parseVoiceInput = (transcript: string) => {
    // Extract amount (numbers followed by 円)
    const amountMatch = transcript.match(/(\d+)[万円千]/);
    let extractedAmount = 0;
    let extractedDescription = transcript;

    if (amountMatch) {
      const number = parseInt(amountMatch[1]);
      if (transcript.includes("万")) {
        extractedAmount = number * 10000;
      } else if (transcript.includes("千")) {
        extractedAmount = number * 1000;
      } else {
        extractedAmount = number;
      }

      // Extract description (remove amount part)
      extractedDescription = transcript
        .replace(/\d+[万円千]/g, "")
        .replace(/円/g, "")
        .trim();
    } else {
      // Try to find just numbers
      const numberMatch = transcript.match(/\d+/);
      if (numberMatch) {
        extractedAmount = parseInt(numberMatch[0]);
        extractedDescription = transcript.replace(/\d+/g, "").trim();
      }
    }

    // Determine type from keywords
    const incomeKeywords = ["給与", "給料", "収入", "入金"];
    const expenseKeywords = ["ランチ", "食事", "買い物", "支出", "出金"];
    const isIncome = incomeKeywords.some((keyword) => transcript.includes(keyword));
    const isExpense = expenseKeywords.some((keyword) => transcript.includes(keyword));

    if (isIncome) {
      setType("income");
    } else if (isExpense || !isIncome) {
      setType("expense");
    }

    if (extractedAmount > 0) {
      setVoiceResult({
        amount: extractedAmount,
        description: extractedDescription || "音声入力",
      });
      setAmount(String(extractedAmount));
      setDescription(extractedDescription || "音声入力");
      if (navigator.vibrate) {
        navigator.vibrate([10, 30, 10]);
      }
    } else {
      // If no amount found, show error
      setVoiceResult(null);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = setupVoiceRecognition();
    if (!recognition) {
      alert("お使いのブラウザは音声認識に対応していません");
      return;
    }

    recognitionRef.current = recognition;
    recognition.start();
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

      if (!response.ok) {
        throw new Error(`OCR API error: ${response.status}`);
      }

      const result = await response.json();

      // Check if this is a batch result (credit card statement)
      if (result.is_batch && result.transactions && result.transactions.length > 0) {
        // Detect duplicates
        const transactionsWithDuplicates = detectDuplicates(
          result.transactions,
          existingTransactions
        );

        setBatchTransactions(transactionsWithDuplicates);
        setIsBatchModalOpen(true);
        onOpenChange(false); // Close input modal

        // Haptic feedback for batch detection
        if (navigator.vibrate) {
          navigator.vibrate([10, 20, 10]);
        }
      } else if (result.amount && result.description) {
        // Single transaction (regular receipt)
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
      } else {
        // No valid data found
        throw new Error("画像から取引情報を読み取れませんでした");
      }
    } catch (error) {
      console.error("OCR Error:", error);
      // User-friendly error feedback
      alert(error instanceof Error ? error.message : "画像の読み取りに失敗しました。もう一度お試しください。");
      if (navigator.vibrate) {
        navigator.vibrate([50, 100, 50]); // Error vibration pattern
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleBatchConfirm = (confirmedTransactions: BatchTransaction[]) => {
    // Process each confirmed transaction
    confirmedTransactions.forEach((tx) => {
      onSubmit({
        amount: tx.amount,
        type: "expense", // Credit card transactions are always expenses
        description: tx.description,
      });
    });

    // Clear batch state
    setBatchTransactions([]);
    setIsBatchModalOpen(false);

    // Haptic feedback for batch confirmation
    if (navigator.vibrate) {
      navigator.vibrate([10, 30, 10]);
    }
  };

  const quickAmounts = [500, 1000, 3000, 5000];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[calc(100vw-2rem)] mx-auto p-0 gap-0 bg-card border-border overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="p-5 pb-0 flex-shrink-0">
          <DialogTitle className="text-lg font-semibold">取引を追加</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4 flex flex-col flex-1 min-h-0">
          <div className="px-5 flex-shrink-0">
            <TabsList className="grid grid-cols-3 w-full bg-secondary">
              <TabsTrigger value="manual" className="flex items-center justify-center gap-1.5 text-xs">
                <Keyboard className="w-3.5 h-3.5" />
                手入力
              </TabsTrigger>
              <TabsTrigger value="camera" className="flex items-center justify-center gap-1.5 text-xs">
                <Camera className="w-3.5 h-3.5" />
                カメラ
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center justify-center gap-1.5 text-xs">
                <Mic className="w-3.5 h-3.5" />
                音声
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-5 pt-4 overflow-y-auto flex-1">
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
                          レシートを撮影 / 選択
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
              <AnimatePresence mode="wait">
                {voiceResult ? (
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
                        <span className="font-medium">音声認識完了</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">金額</span>
                          <span className="font-semibold">
                            ¥{voiceResult.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">内容</span>
                          <span className="font-medium">{voiceResult.description}</span>
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
                        setVoiceResult(null);
                        setAmount("");
                        setDescription("");
                        handleVoiceInput();
                      }}
                      className="w-full"
                    >
                      再入力
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-8 flex flex-col items-center"
                  >
                    <motion.button
                      className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors ${
                        isListening
                          ? "bg-expense/20 animate-pulse"
                          : "bg-secondary hover:bg-muted"
                      }`}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleVoiceInput}
                    >
                      <Mic
                        className={`w-8 h-8 ${
                          isListening ? "text-expense" : "text-muted-foreground"
                        }`}
                      />
                    </motion.button>
                    <p className="mt-4 text-muted-foreground text-sm">
                      {isListening ? "聞き取り中..." : "タップして話しかける"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      例: 「ランチで800円」「給与35万円」
                    </p>
                    {isListening && (
                      <motion.div
                        className="mt-4 flex gap-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full bg-expense"
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.2,
                            }}
                          />
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>

      {/* Batch Confirmation Modal for Credit Card Statements */}
      <BatchConfirmModal
        open={isBatchModalOpen}
        onOpenChange={setIsBatchModalOpen}
        transactions={batchTransactions}
        onConfirm={handleBatchConfirm}
      />
    </Dialog>
  );
}
