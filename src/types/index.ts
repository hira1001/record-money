// Database types
export type TransactionType = "income" | "expense";
export type TransactionSource = "manual" | "ocr" | "gmail_auto";
export type TransactionStatus = "confirmed" | "review_needed";
export type BudgetPeriod = "weekly" | "monthly" | "yearly";

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  color: string | null;
  icon: string | null;
  is_default: boolean;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: TransactionType;
  category_id: string | null;
  category?: Category;
  description: string | null;
  date: string;
  status: TransactionStatus;
  source: TransactionSource;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string | null;
  amount_limit: number;
  period: BudgetPeriod;
}

// UI types
export interface MonthSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  remainingBudget: number;
}

export interface CategorySummary {
  category: Category;
  total: number;
  percentage: number;
  count: number;
}

// Form types
export interface TransactionFormData {
  amount: number;
  type: TransactionType;
  category_id: string | null;
  description: string;
  date: string;
}

// API Response types
export interface OCRResult {
  amount: number;
  description: string;
  date: string;
  suggested_category: string | null;
  confidence: number;
}
