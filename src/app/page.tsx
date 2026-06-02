"use client";

import { useState } from "react";
import { Expense } from "@/types/expense";
import { useExpenses } from "@/hooks/useExpenses";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseList from "@/components/ExpenseList";
import Dashboard from "@/components/Dashboard";

type Tab = "dashboard" | "expenses";

export default function Home() {
  const { expenses, isLoaded, add, update, remove, importBulk } = useExpenses();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">ExpenseTracker</h1>
            </div>

            <nav className="flex gap-1">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "dashboard"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab("expenses")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "expenses"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Expenses
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && <Dashboard expenses={expenses} />}

        {activeTab === "expenses" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ExpenseForm
                onSubmit={add}
                onUpdate={update}
                editingExpense={editingExpense}
                onCancelEdit={() => setEditingExpense(null)}
              />
            </div>
            <div className="lg:col-span-2">
              <ExpenseList
                expenses={expenses}
                onEdit={(expense) => setEditingExpense(expense)}
                onDelete={remove}
                onImport={importBulk}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
