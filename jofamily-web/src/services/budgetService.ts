import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type {
  Allowance,
  Budget,
  CreateAllowanceInput,
  CreateBudgetInput,
  CreateExpenseInput,
  Expense,
  UpdateExpenseInput,
  UpdateBudgetInput,
} from '../types/budget';

const expensesCollection = collection(db, 'familyExpenses');
const budgetsCollection = collection(db, 'familyBudgets');
const allowancesCollection = collection(db, 'familyAllowances');

export function listenToExpenses(callback: (expenses: Expense[]) => void) {
  const q = query(expensesCollection, orderBy('date', 'desc'));
  return onSnapshot(q, (snap) => {
    const expenses: Expense[] = snap.docs.map((d) => {
      const data = d.data();
      const date = data.date instanceof Timestamp ? data.date.toDate() : new Date();
      const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null;
      return {
        id: d.id,
        description: data.description ?? 'No description',
        amount: data.amount ?? 0,
        category: data.category ?? 'other',
        paidBy: data.paidBy ?? '',
        paidByName: data.paidByName ?? 'Unknown',
        date,
        createdAt,
      };
    });
    callback(expenses);
  });
}

export function listenToUserExpenses(userId: string, callback: (expenses: Expense[]) => void) {
  const q = query(expensesCollection, where('paidBy', '==', userId), orderBy('date', 'desc'));
  return onSnapshot(q, (snap) => {
    const expenses: Expense[] = snap.docs.map((d) => {
      const data = d.data();
      const date = data.date instanceof Timestamp ? data.date.toDate() : new Date();
      const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null;
      return {
        id: d.id,
        description: data.description ?? 'No description',
        amount: data.amount ?? 0,
        category: data.category ?? 'other',
        paidBy: data.paidBy ?? '',
        paidByName: data.paidByName ?? 'Unknown',
        date,
        createdAt,
      };
    });
    callback(expenses);
  });
}

export async function createExpense(input: CreateExpenseInput) {
  const ref = await addDoc(expensesCollection, {
    description: input.description,
    amount: input.amount,
    category: input.category,
    paidBy: input.paidBy,
    paidByName: input.paidByName ?? 'Unknown',
    date: Timestamp.fromDate(input.date),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export function listenToBudgets(callback: (budgets: Budget[]) => void) {
  const q = query(budgetsCollection, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const budgets: Budget[] = snap.docs.map((d) => {
      const data = d.data();
      const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null;
      return {
        id: d.id,
        name: data.name ?? 'Unnamed Budget',
        category: data.category ?? 'other',
        limit: data.limit ?? 0,
        spent: data.spent ?? 0,
        period: data.period ?? 'monthly',
        createdBy: data.createdBy ?? '',
        createdAt,
      };
    });
    callback(budgets);
  });
}

export async function createBudget(input: CreateBudgetInput) {
  const ref = await addDoc(budgetsCollection, {
    name: input.name,
    category: input.category,
    limit: input.limit,
    spent: 0,
    period: input.period,
    createdBy: input.createdBy,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export function listenToAllowances(callback: (allowances: Allowance[]) => void) {
  const q = query(allowancesCollection, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const allowances: Allowance[] = snap.docs.map((d) => {
      const data = d.data();
      const nextPayment = data.nextPayment instanceof Timestamp ? data.nextPayment.toDate() : new Date();
      const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null;
      return {
        id: d.id,
        userId: data.userId ?? '',
        userName: data.userName ?? 'Unknown',
        amount: data.amount ?? 0,
        frequency: data.frequency ?? 'monthly',
        nextPayment,
        createdAt,
      };
    });
    callback(allowances);
  });
}

export async function createAllowance(input: CreateAllowanceInput) {
  const now = new Date();
  const nextPayment = new Date(now);
  if (input.frequency === 'weekly') {
    nextPayment.setDate(now.getDate() + 7);
  } else {
    nextPayment.setMonth(now.getMonth() + 1);
  }

  const ref = await addDoc(allowancesCollection, {
    userId: input.userId,
    userName: input.userName,
    amount: input.amount,
    frequency: input.frequency,
    nextPayment: Timestamp.fromDate(nextPayment),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export function calculateBudgetProgress(budgets: Budget[], expenses: Expense[]): Budget[] {
  return budgets.map((budget) => {
    const categoryExpenses = expenses.filter((exp) => exp.category === budget.category);
    const spent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    return { ...budget, spent };
  });
}

export function getExpenseInsights(expenses: Expense[]) {
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const byCategory: Record<string, number> = {};
  
  expenses.forEach((exp) => {
    byCategory[exp.category] = (byCategory[exp.category] || 0) + exp.amount;
  });

  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

  return {
    total,
    byCategory,
    topCategory: topCategory ? { category: topCategory[0], amount: topCategory[1] } : null,
  };
}

export async function updateExpense(expenseId: string, input: UpdateExpenseInput) {
  const expenseRef = doc(expensesCollection, expenseId);
  const updateData: Record<string, unknown> = {};

  if (input.description !== undefined) updateData.description = input.description;
  if (input.amount !== undefined) updateData.amount = input.amount;
  if (input.category !== undefined) updateData.category = input.category;
  if (input.date !== undefined) updateData.date = Timestamp.fromDate(input.date);

  await updateDoc(expenseRef, updateData);
}

export async function deleteExpense(expenseId: string) {
  await deleteDoc(doc(expensesCollection, expenseId));
}

export async function updateBudget(budgetId: string, input: UpdateBudgetInput) {
  const budgetRef = doc(budgetsCollection, budgetId);
  const updateData: Record<string, unknown> = {};

  if (input.category !== undefined) updateData.category = input.category;
  if (input.limit !== undefined) updateData.limit = input.limit;
  if (input.period !== undefined) updateData.period = input.period;

  await updateDoc(budgetRef, updateData);
}

export async function deleteBudget(budgetId: string) {
  await deleteDoc(doc(budgetsCollection, budgetId));
}
