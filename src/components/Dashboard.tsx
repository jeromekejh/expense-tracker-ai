"use client";

import { Expense } from "@/types/expense";
import {
  formatCurrency,
  getTotalSpending,
  getMonthlySpending,
  getSpendingByCategory,
  getMonthlyTrend,
  getCategoryColor,
} from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DashboardProps {
  expenses: Expense[];
}

export default function Dashboard({ expenses }: DashboardProps) {
  const totalSpending = getTotalSpending(expenses);
  const monthlySpending = getMonthlySpending(expenses);
  const categoryData = getSpendingByCategory(expenses);
  const trendData = getMonthlyTrend(expenses);
  const averageExpense = expenses.length > 0 ? totalSpending / expenses.length : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Spending"
          value={formatCurrency(totalSpending)}
          subtitle={`${expenses.length} expenses`}
          color="indigo"
        />
        <SummaryCard
          title="This Month"
          value={formatCurrency(monthlySpending)}
          subtitle="Current month"
          color="emerald"
        />
        <SummaryCard
          title="Average Expense"
          value={formatCurrency(averageExpense)}
          subtitle="Per transaction"
          color="amber"
        />
        <SummaryCard
          title="Top Category"
          value={categoryData[0]?.category || "N/A"}
          subtitle={categoryData[0] ? formatCurrency(categoryData[0].amount) : "No data"}
          color="rose"
        />
      </div>

      {expenses.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Monthly Trend</h3>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                  />
                  <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-sm text-center py-12">
                Add expenses across multiple months to see trends
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">By Category</h3>
            {categoryData.length > 0 ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      strokeWidth={2}
                    >
                      {categoryData.map((entry) => (
                        <Cell
                          key={entry.category}
                          fill={getCategoryColor(entry.category)}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {categoryData.map((item) => (
                    <div key={item.category} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getCategoryColor(item.category) }}
                        />
                        <span className="text-gray-700">{item.category}</span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-12">
                No category data available
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  color: string;
}) {
  const bgColors: Record<string, string> = {
    indigo: "bg-indigo-50",
    emerald: "bg-emerald-50",
    amber: "bg-amber-50",
    rose: "bg-rose-50",
  };

  const textColors: Record<string, string> = {
    indigo: "text-indigo-600",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    rose: "text-rose-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
      <p className={`text-2xl font-bold mt-1 ${textColors[color]}`}>{value}</p>
      <div className="mt-2 flex items-center gap-1.5">
        <span className={`inline-block w-2 h-2 rounded-full ${bgColors[color]}`} />
        <span className="text-xs text-gray-500">{subtitle}</span>
      </div>
    </div>
  );
}
