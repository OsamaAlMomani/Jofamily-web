export type ExpenseCategory = 'food' | 'transport' | 'entertainment' | 'utilities' | 'health' | 'education' | 'other';

export type Expense = {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  paidBy: string;
  paidByName?: string;
  date: Date;
  createdAt?: Date | null;
};

export type Budget = {
  id: string;
  name: string;
  category: ExpenseCategory;
  limit: number;
  spent: number;
  period: 'weekly' | 'monthly';
  createdBy: string;
  createdAt?: Date | null;
};

export type Allowance = {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  frequency: 'weekly' | 'monthly';
  nextPayment: Date;
  createdAt?: Date | null;
};

export type CreateExpenseInput = {
  description: string;
  amount: number;
  category: ExpenseCategory;
  paidBy: string;
  paidByName?: string;
  date: Date;
};

export type CreateBudgetInput = {
  name: string;
  category: ExpenseCategory;
  limit: number;
  period: 'weekly' | 'monthly';
  createdBy: string;
};

export type CreateAllowanceInput = {
  userId: string;
  userName: string;
  amount: number;
  frequency: 'weekly' | 'monthly';
};

export type UpdateExpenseInput = {
  description?: string;
  amount?: number;
  category?: ExpenseCategory;
  date?: Date;
};

export type UpdateBudgetInput = {
  category?: ExpenseCategory;
  limit?: number;
  period?: 'weekly' | 'monthly';
};
