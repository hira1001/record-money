"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Transaction, TransactionType } from "@/types";

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("transactions")
        .select(
          `
          *,
          category:categories(*)
        `
        )
        .order("date", { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;
      setTransactions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const addTransaction = useCallback(
    async (data: {
      amount: number;
      type: TransactionType;
      category_id?: string | null;
      description?: string;
      date?: string;
      source?: string;
    }) => {
      // Optimistic update
      const tempId = crypto.randomUUID();
      const optimisticTransaction: Transaction = {
        id: tempId,
        user_id: "",
        amount: data.amount,
        type: data.type,
        category_id: data.category_id || null,
        description: data.description || null,
        date: data.date || new Date().toISOString(),
        status: "confirmed",
        source: (data.source as Transaction["source"]) || "manual",
        created_at: new Date().toISOString(),
      };

      setTransactions((prev) => [optimisticTransaction, ...prev]);

      try {
        const { data: newTransaction, error: insertError } = await supabase
          .from("transactions")
          .insert({
            amount: data.amount,
            type: data.type,
            category_id: data.category_id,
            description: data.description,
            date: data.date || new Date().toISOString(),
            source: data.source || "manual",
          })
          .select(
            `
            *,
            category:categories(*)
          `
          )
          .single();

        if (insertError) throw insertError;

        // Replace optimistic with real data
        setTransactions((prev) =>
          prev.map((t) => (t.id === tempId ? newTransaction : t))
        );

        return newTransaction;
      } catch (err) {
        // Rollback on error
        setTransactions((prev) => prev.filter((t) => t.id !== tempId));
        throw err;
      }
    },
    [supabase]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      // Optimistic delete - use functional update to get current state
      let deletedTransaction: Transaction | undefined;
      setTransactions((prev) => {
        deletedTransaction = prev.find((t) => t.id === id);
        return prev.filter((t) => t.id !== id);
      });

      try {
        const { error: deleteError } = await supabase
          .from("transactions")
          .delete()
          .eq("id", id);

        if (deleteError) throw deleteError;
      } catch (err) {
        // Rollback on error
        if (deletedTransaction) {
          setTransactions((prev) => [deletedTransaction!, ...prev]);
        }
        throw err;
      }
    },
    [supabase]
  );

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Calculate summaries
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    transactions,
    isLoading,
    error,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    addTransaction,
    deleteTransaction,
    refetch: fetchTransactions,
  };
}
