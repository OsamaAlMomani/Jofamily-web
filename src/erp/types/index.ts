// Core ERP types for Money, Studies, Work, Admin/Visa

export type ID = string;

export type MoneyType = 'income' | 'expense';
export type Cadence = 'monthly' | 'weekly' | 'yearly';
export type TaskType = 'study' | 'admin';

export interface Category {
  id?: ID;
  name: string; // e.g., Rent, Groceries, Insurance
  group?: 'Money' | 'Study' | 'Work' | 'Admin';
}

export interface Transaction {
  id?: ID;
  date: string; // ISO date string
  amount: number;
  type: MoneyType;
  categoryId?: ID;
  recurringId?: ID;
  notes?: string;
}

export interface RecurringItem {
  id?: ID;
  name: string;
  amount: number;
  cadence: Cadence;
  startDate: string; // ISO date string
  endDate?: string; // optional end
  type: MoneyType;
  categoryId?: ID;
}

export interface Task {
  id?: ID;
  title: string;
  dueDate: string; // ISO date string
  type: TaskType;
  estimatedHours?: number;
  done?: boolean;
}

export interface Shift {
  id?: ID;
  start: string; // ISO datetime string
  end: string;   // ISO datetime string
  hourlyRate: number;
  notes?: string;
}

export interface Document {
  id?: ID;
  name: string;
  fileUrl?: string; // Firebase Storage path or URL
  expiryDate?: string; // ISO date string
  relatedTo?: 'visa' | 'insurance' | 'enrollment' | 'bank';
  status?: 'active' | 'expired' | 'pending';
}

// Forecast inputs/outputs
export interface ForecastInputs {
  startingBalance: number;
  months: number; // horizon
  inflationRate?: number; // annual percentage, e.g., 0.03
  expectedMonthlyIncome?: number; // default income when shifts not provided
  shifts?: Shift[]; // optional to compute income dynamically
  recurringItems?: RecurringItem[];
}

export interface MonthProjection {
  monthLabel: string; // e.g., Jan 2026
  totalIncome: number;
  totalExpenses: number;
  endBalance: number;
}

export interface ForecastResult {
  projections: MonthProjection[];
  warnings: Array<{ monthLabel: string; message: string }>;
}
