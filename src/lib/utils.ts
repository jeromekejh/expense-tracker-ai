import { Expense, Category, CATEGORIES, ExpenseFilters } from "@/types/expense";
import { format, isWithinInterval, parseISO, startOfMonth, endOfMonth, isValid } from "date-fns";
import { v4 as uuidv4 } from "uuid";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return format(parseISO(dateString), "MMM d, yyyy");
}

export function filterExpenses(
  expenses: Expense[],
  filters: ExpenseFilters
): Expense[] {
  return expenses.filter((expense) => {
    if (
      filters.search &&
      !expense.description.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    if (filters.category !== "All" && expense.category !== filters.category) {
      return false;
    }

    if (filters.dateRange.start && filters.dateRange.end) {
      const expenseDate = parseISO(expense.date);
      const start = parseISO(filters.dateRange.start);
      const end = parseISO(filters.dateRange.end);
      if (!isWithinInterval(expenseDate, { start, end })) {
        return false;
      }
    }

    return true;
  });
}

export function getTotalSpending(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function getMonthlySpending(expenses: Expense[]): number {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  return expenses
    .filter((e) => {
      const date = parseISO(e.date);
      return isWithinInterval(date, { start: monthStart, end: monthEnd });
    })
    .reduce((sum, e) => sum + e.amount, 0);
}

export function getSpendingByCategory(
  expenses: Expense[]
): { category: Category; amount: number }[] {
  const map: Record<string, number> = {};
  expenses.forEach((e) => {
    map[e.category] = (map[e.category] || 0) + e.amount;
  });
  return Object.entries(map)
    .map(([category, amount]) => ({ category: category as Category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function getMonthlyTrend(
  expenses: Expense[]
): { month: string; amount: number }[] {
  const map: Record<string, number> = {};
  expenses.forEach((e) => {
    const month = format(parseISO(e.date), "yyyy-MM");
    map[month] = (map[month] || 0) + e.amount;
  });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, amount]) => ({
      month: format(parseISO(month + "-01"), "MMM yyyy"),
      amount,
    }));
}

export function exportToCSV(expenses: Expense[]): void {
  const headers = ["Date", "Amount", "Category", "Description"];
  const rows = expenses.map((e) => [
    e.date,
    e.amount.toFixed(2),
    e.category,
    `"${e.description.replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `expenses-${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function parseCSVRow(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        fields.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

export interface CSVParseResult {
  valid: Expense[];
  errors: string[];
  duplicates: number;
}

export function parseCSV(
  csvString: string,
  existingExpenses: Expense[]
): CSVParseResult {
  const lines = csvString.split(/\r?\n/).filter((line) => line.trim());
  const valid: Expense[] = [];
  const errors: string[] = [];
  let duplicates = 0;

  if (lines.length === 0) {
    errors.push("File is empty");
    return { valid, errors, duplicates };
  }

  const headerLine = lines[0].toLowerCase();
  if (!headerLine.includes("date") || !headerLine.includes("amount")) {
    errors.push("Invalid header row. Expected: Date,Amount,Category,Description");
    return { valid, errors, duplicates };
  }

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVRow(lines[i]);

    if (fields.length < 4) {
      errors.push(`Row ${i + 1}: Expected 4 columns, got ${fields.length}`);
      continue;
    }

    const [dateStr, amountStr, categoryStr, description] = fields;

    const parsedDate = parseISO(dateStr);
    if (!isValid(parsedDate)) {
      errors.push(`Row ${i + 1}: Invalid date "${dateStr}"`);
      continue;
    }

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount < 0) {
      errors.push(`Row ${i + 1}: Invalid amount "${amountStr}"`);
      continue;
    }

    if (!CATEGORIES.includes(categoryStr as Category)) {
      errors.push(
        `Row ${i + 1}: Invalid category "${categoryStr}". Must be one of: ${CATEGORIES.join(", ")}`
      );
      continue;
    }

    const isDuplicate = existingExpenses.some(
      (e) =>
        e.date === dateStr &&
        e.amount === amount &&
        e.category === categoryStr &&
        e.description === description
    );

    if (isDuplicate) {
      duplicates++;
      continue;
    }

    valid.push({
      id: uuidv4(),
      date: dateStr,
      amount,
      category: categoryStr as Category,
      description,
      createdAt: new Date().toISOString(),
    });
  }

  return { valid, errors, duplicates };
}

export function getCategoryColor(category: Category): string {
  const colors: Record<Category, string> = {
    Food: "#f59e0b",
    Transportation: "#3b82f6",
    Entertainment: "#8b5cf6",
    Shopping: "#ec4899",
    Bills: "#ef4444",
    Other: "#6b7280",
  };
  return colors[category];
}
