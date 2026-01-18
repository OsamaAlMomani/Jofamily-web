import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { Category, Document, RecurringItem, Shift, Task, Transaction } from '../types';

// Collection names
const COL = {
  transactions: 'transactions',
  recurringItems: 'recurring_items',
  categories: 'categories',
  tasks: 'tasks',
  shifts: 'shifts',
  documents: 'documents',
};

// Generic helpers
async function getAll<T>(path: string, orderField?: string): Promise<T[]> {
  const colRef = collection(db, path);
  const q = orderField ? query(colRef, orderBy(orderField, 'asc')) : colRef;
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
}

async function create<T>(path: string, data: Omit<T, 'id'>): Promise<T & { id: string }> {
  const colRef = collection(db, path);
  const docRef = await addDoc(colRef, data as any);
  return { id: docRef.id, ...(data as any) };
}

async function update<T>(path: string, id: string, data: Partial<Omit<T, 'id'>>): Promise<void> {
  const docRef = doc(db, path, id);
  await updateDoc(docRef, data as any);
}

async function remove(path: string, id: string): Promise<void> {
  const docRef = doc(db, path, id);
  await deleteDoc(docRef);
}

// Transactions
export const getTransactions = () => getAll<Transaction>(COL.transactions, 'date');
export const addTransaction = (t: Omit<Transaction, 'id'>) => create<Transaction>(COL.transactions, t);
export const updateTransaction = (id: string, data: Partial<Omit<Transaction, 'id'>>) => update<Transaction>(COL.transactions, id, data);
export const deleteTransaction = (id: string) => remove(COL.transactions, id);

// Recurring Items
export const getRecurringItems = () => getAll<RecurringItem>(COL.recurringItems, 'startDate');
export const addRecurringItem = (r: Omit<RecurringItem, 'id'>) => create<RecurringItem>(COL.recurringItems, r);
export const updateRecurringItem = (id: string, data: Partial<Omit<RecurringItem, 'id'>>) => update<RecurringItem>(COL.recurringItems, id, data);
export const deleteRecurringItem = (id: string) => remove(COL.recurringItems, id);

// Categories
export const getCategories = () => getAll<Category>(COL.categories, 'name');
export const addCategory = (c: Omit<Category, 'id'>) => create<Category>(COL.categories, c);
export const updateCategory = (id: string, data: Partial<Omit<Category, 'id'>>) => update<Category>(COL.categories, id, data);
export const deleteCategory = (id: string) => remove(COL.categories, id);

// Tasks
export const getTasks = () => getAll<Task>(COL.tasks, 'dueDate');
export const addTask = (t: Omit<Task, 'id'>) => create<Task>(COL.tasks, t);
export const updateTask = (id: string, data: Partial<Omit<Task, 'id'>>) => update<Task>(COL.tasks, id, data);
export const deleteTask = (id: string) => remove(COL.tasks, id);

// Shifts
export const getShifts = () => getAll<Shift>(COL.shifts, 'start');
export const addShift = (s: Omit<Shift, 'id'>) => create<Shift>(COL.shifts, s);
export const updateShift = (id: string, data: Partial<Omit<Shift, 'id'>>) => update<Shift>(COL.shifts, id, data);
export const deleteShift = (id: string) => remove(COL.shifts, id);

// Documents
export const getDocuments = () => getAll<Document>(COL.documents, 'name');
export const addDocument = (d: Omit<Document, 'id'>) => create<Document>(COL.documents, d);
export const updateDocument = (id: string, data: Partial<Omit<Document, 'id'>>) => update<Document>(COL.documents, id, data);
export const deleteDocument = (id: string) => remove(COL.documents, id);
