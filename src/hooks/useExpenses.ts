"use client";

import { useState, useEffect, useCallback } from "react";
import { Expense, ExpenseFormData } from "@/types/expense";
import {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  importExpenses,
} from "@/lib/storage";
import { v4 as uuidv4 } from "uuid";

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setExpenses(getExpenses());
    setIsLoaded(true);
  }, []);

  const add = useCallback((formData: ExpenseFormData) => {
    const expense: Expense = {
      id: uuidv4(),
      date: formData.date,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      createdAt: new Date().toISOString(),
    };
    const updated = addExpense(expense);
    setExpenses(updated);
  }, []);

  const update = useCallback((expense: Expense) => {
    const updated = updateExpense(expense);
    setExpenses(updated);
  }, []);

  const remove = useCallback((id: string) => {
    const updated = deleteExpense(id);
    setExpenses(updated);
  }, []);

  const importBulk = useCallback((newExpenses: Expense[]) => {
    const updated = importExpenses(newExpenses);
    setExpenses(updated);
  }, []);

  return { expenses, isLoaded, add, update, remove, importBulk };
}
