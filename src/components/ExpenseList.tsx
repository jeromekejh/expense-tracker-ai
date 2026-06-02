"use client";

import { Expense, CATEGORIES, ExpenseFilters } from "@/types/expense";
import { useState, useRef } from "react";
import { formatCurrency, formatDate, filterExpenses, exportToCSV, parseCSV, getCategoryColor } from "@/lib/utils";

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onImport: (expenses: Expense[]) => void;
}

interface ImportFeedback {
  type: "success" | "error";
  message: string;
}

export default function ExpenseList({ expenses, onEdit, onDelete, onImport }: ExpenseListProps) {
  const [filters, setFilters] = useState<ExpenseFilters>({
    search: "",
    category: "All",
    dateRange: { start: "", end: "" },
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [importFeedback, setImportFeedback] = useState<ImportFeedback | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvString = event.target?.result as string;
      const { valid, errors, duplicates } = parseCSV(csvString, expenses);

      if (valid.length > 0) {
        onImport(valid);
      }

      const parts: string[] = [];
      if (valid.length > 0) parts.push(`${valid.length} imported`);
      if (duplicates > 0) parts.push(`${duplicates} duplicates skipped`);
      if (errors.length > 0) parts.push(`${errors.length} rows failed`);

      if (valid.length === 0 && errors.length > 0) {
        setImportFeedback({
          type: "error",
          message: `Import failed: ${errors[0]}`,
        });
      } else {
        setImportFeedback({
          type: "success",
          message: parts.join(", "),
        });
      }

      setTimeout(() => setImportFeedback(null), 5000);
    };
    reader.readAsText(file);

    e.target.value = "";
  }

  const filtered = filterExpenses(expenses, filters);

  function handleDelete(id: string) {
    if (deleteConfirm === id) {
      onDelete(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Expenses</h2>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={handleImportClick}
              className="text-sm px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
            >
              Import CSV
            </button>
            {expenses.length > 0 && (
              <button
                onClick={() => exportToCSV(filtered)}
                className="text-sm px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Export CSV
              </button>
            )}
          </div>
        </div>

        {importFeedback && (
          <div
            className={`mb-4 px-4 py-2.5 rounded-lg text-sm font-medium ${
              importFeedback.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {importFeedback.message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Search expenses..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
          />
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value as ExpenseFilters["category"] })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="date"
            value={filters.dateRange.start}
            onChange={(e) => setFilters({ ...filters, dateRange: { ...filters.dateRange, start: e.target.value } })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
          />
          <input
            type="date"
            value={filters.dateRange.end}
            onChange={(e) => setFilters({ ...filters, dateRange: { ...filters.dateRange, end: e.target.value } })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
          />
        </div>
      </div>

      <div className="divide-y divide-gray-50">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {expenses.length === 0
              ? "No expenses yet. Add your first expense above!"
              : "No expenses match your filters."}
          </div>
        ) : (
          filtered.map((expense) => (
            <div
              key={expense.id}
              className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4"
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: getCategoryColor(expense.category) }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {expense.description}
                </p>
                <p className="text-xs text-gray-500">
                  {expense.category} &middot; {formatDate(expense.date)}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(expense.amount)}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => onEdit(expense)}
                  className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                  title="Edit"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(expense.id)}
                  className={`p-1.5 rounded transition-colors ${
                    deleteConfirm === expense.id
                      ? "text-red-600 bg-red-50"
                      : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                  }`}
                  title={deleteConfirm === expense.id ? "Click again to confirm" : "Delete"}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {filtered.length > 0 && (
        <div className="p-4 border-t border-gray-100 text-sm text-gray-500">
          Showing {filtered.length} of {expenses.length} expenses
        </div>
      )}
    </div>
  );
}
