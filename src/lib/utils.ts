import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Duplicate detection for batch transactions
 * Compares a new transaction against existing transactions to detect potential duplicates
 */
export interface DuplicateCheckTransaction {
  amount: number;
  description: string;
  date: string;
}

export function detectDuplicates<
  T extends {
    amount: number;
    description: string;
    date: string;
    suggested_category?: string | null;
  }
>(
  newTransactions: T[],
  existingTransactions: { amount: number; description: string; date: string }[]
): (T & { isDuplicate?: boolean })[] {
  return newTransactions.map((newTx) => {
    const isDuplicate = existingTransactions.some((existingTx) => {
      // Exact amount match required
      if (newTx.amount !== existingTx.amount) {
        return false;
      }

      // Date similarity (within 1 day tolerance)
      const newDate = new Date(newTx.date).getTime();
      const existingDate = new Date(existingTx.date).getTime();
      const dayInMs = 24 * 60 * 60 * 1000;
      const dateDiff = Math.abs(newDate - existingDate);

      if (dateDiff > dayInMs) {
        return false;
      }

      // Description similarity (case-insensitive, normalized)
      const normalizeDescription = (desc: string) =>
        desc.toLowerCase().trim().replace(/\s+/g, " ");

      const newDesc = normalizeDescription(newTx.description);
      const existingDesc = normalizeDescription(existingTx.description);

      // Exact match or one contains the other
      return (
        newDesc === existingDesc ||
        newDesc.includes(existingDesc) ||
        existingDesc.includes(newDesc)
      );
    });

    return {
      ...newTx,
      isDuplicate,
    };
  });
}
