import { useState } from 'react';
import { RecurringItemSchema } from '../../forms/schemas';
import type { RecurringItem, Category } from '../../types/erp';

interface Props {
  initial?: Partial<RecurringItem>;
  categories?: Category[];
  onSubmit: (data: Omit<RecurringItem, 'id'>) => void;
}

export default function RecurringItemForm({ initial, categories = [], onSubmit }: Props) {
  const [form, setForm] = useState<Omit<RecurringItem, 'id'>>({
    name: initial?.name || '',
    amount: initial?.amount || 0,
    cadence: initial?.cadence || 'monthly',
    startDate: initial?.startDate || new Date().toISOString().slice(0, 10),
    endDate: initial?.endDate,
    type: initial?.type || 'expense',
    categoryId: initial?.categoryId,
  });
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = RecurringItemSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Invalid input');
      return;
    }
    onSubmit(parsed.data);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8 }}>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <label>
        Name
        <input value={form.name} onChange={(e) => update('name', e.target.value)} />
      </label>
      <label>
        Amount
        <input type="number" value={form.amount} onChange={(e) => update('amount', Number(e.target.value))} />
      </label>
      <label>
        Cadence
        <select value={form.cadence} onChange={(e) => update('cadence', e.target.value as RecurringItem['cadence'])}>
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
          <option value="yearly">Yearly</option>
        </select>
      </label>
      <label>
        Start Date
        <input type="date" value={form.startDate} onChange={(e) => update('startDate', e.target.value)} />
      </label>
      <label>
        End Date
        <input type="date" value={form.endDate || ''} onChange={(e) => update('endDate', e.target.value)} />
      </label>
      <label>
        Type
        <select value={form.type} onChange={(e) => update('type', e.target.value as 'income' | 'expense')}>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </label>
      <label>
        Category
        <select value={form.categoryId || ''} onChange={(e) => update('categoryId', e.target.value)}>
          <option value="">-- none --</option>
          {categories.map((c) => (
            <option key={c.id || c.name} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>
      <button type="submit">Save Recurring Item</button>
    </form>
  );
}
