import { z } from 'zod';

export const MoneyTypeSchema = z.enum(['income', 'expense']);
export const CadenceSchema = z.enum(['monthly', 'weekly', 'yearly']);
export const TaskTypeSchema = z.enum(['study', 'admin']);

export const CategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  group: z.enum(['Money', 'Study', 'Work', 'Admin']).optional(),
});

export const TransactionSchema = z.object({
  id: z.string().optional(),
  date: z.string().min(1),
  amount: z.number().finite(),
  type: MoneyTypeSchema,
  categoryId: z.string().optional(),
  recurringId: z.string().optional(),
  notes: z.string().optional(),
});

export const RecurringItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  amount: z.number().finite(),
  cadence: CadenceSchema,
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  type: MoneyTypeSchema,
  categoryId: z.string().optional(),
});

export const TaskSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  dueDate: z.string().min(1),
  type: TaskTypeSchema,
  estimatedHours: z.number().finite().optional(),
  done: z.boolean().optional(),
});

export const ShiftSchema = z.object({
  id: z.string().optional(),
  start: z.string().min(1),
  end: z.string().min(1),
  hourlyRate: z.number().finite(),
  notes: z.string().optional(),
});

export const DocumentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  fileUrl: z.string().optional(),
  expiryDate: z.string().optional(),
  relatedTo: z.enum(['visa', 'insurance', 'enrollment', 'bank']).optional(),
  status: z.enum(['active', 'expired', 'pending']).optional(),
});
