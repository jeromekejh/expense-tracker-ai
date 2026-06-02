"use client";

import { useState, useEffect } from "react";
import { Category, CATEGORIES, ExpenseFormData, Expense } from "@/types/expense";
import { format } from "date-fns";

interface ExpenseFormProps {
  onSubmit: (data: ExpenseFormData) => void;
  onUpdate?: (expense: Expense) => void;
  editingExpense?: Expense | null;
  onCancelEdit?: () => void;
}

export default function ExpenseForm({
  onSubmit,
  onUpdate,
  editingExpense,
  onCancelEdit,
}: ExpenseFormProps) {
  const [formData, setFormData] = useState<ExpenseFormData>({
    date: editingExpense?.date || format(new Date(), "yyyy-MM-dd"),
    amount: editingExpense?.amount.toString() || "",
    category: editingExpense?.category || "Food",
    description: editingExpense?.description || "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ExpenseFormData, string>>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (editingExpense) {
      setFormData({
        date: editingExpense.date,
        amount: editingExpense.amount.toString(),
        category: editingExpense.category,
        description: editingExpense.description,
      });
    } else {
      setFormData({
        date: format(new Date(), "yyyy-MM-dd"),
        amount: "",
        category: "Food",
        description: "",
      });
    }
  }, [editingExpense]);

  function validate(): boolean {
    const newErrors: Partial<Record<keyof ExpenseFormData, string>> = {};

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (!formData.amount || isNaN(parseFloat(formData.amount))) {
      newErrors.amount = "Valid amount is required";
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    if (editingExpense && onUpdate) {
      onUpdate({
        ...editingExpense,
        date: formData.date,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
      });
    } else {
      onSubmit(formData);
    }

    setFormData({
      date: format(new Date(), "yyyy-MM-dd"),
      amount: "",
      category: "Food",
      description: "",
    });
    setErrors({});
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {editingExpense ? "Edit Expense" : "Add Expense"}
      </h2>

      {showSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          Expense {editingExpense ? "updated" : "added"} successfully!
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
          />
          {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount ($)
          </label>
          <input
            type="number"
            id="amount"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
          />
          {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            id="description"
            placeholder="What did you spend on?"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {editingExpense ? "Update Expense" : "Add Expense"}
          </button>
          {editingExpense && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
