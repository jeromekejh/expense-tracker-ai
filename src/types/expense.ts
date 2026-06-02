export type Category =
  | "Food"
  | "Transportation"
  | "Entertainment"
  | "Shopping"
  | "Bills"
  | "Other";

export const CATEGORIES: Category[] = [
  "Food",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Bills",
  "Other",
];

export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: Category;
  description: string;
  createdAt: string;
}

export interface ExpenseFormData {
  date: string;
  amount: string;
  category: Category;
  description: string;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface ExpenseFilters {
  search: string;
  category: Category | "All";
  dateRange: DateRange;
}
