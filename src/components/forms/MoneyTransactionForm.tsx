import { useState } from 'react';
import { TransactionSchema } from '../../forms/schemas';
import type { Transaction, Category } from '../../types/erp';

interface Props {
  initial?: Partial<Transaction>;
  categories?: Category[];
  onSubmit: (data: Omit<Transaction, 'id'>) => void;
}

export default function MoneyTransactionForm({ initial, categories = [], onSubmit }: Props) {
  const [form, setForm] = useState<Omit<Transaction, 'id'>>({
    date: initial?.date || new Date().toISOString().slice(0, 10),
    amount: initial?.amount || 0,
    type: initial?.type || 'expense',
    categoryId: initial?.categoryId,
    notes: initial?.notes,
  });
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = TransactionSchema.safeParse(form);
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
        Date
        <input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} />
      </label>
      <label>
        Amount
        <input type="number" value={form.amount} onChange={(e) => update('amount', Number(e.target.value))} />
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
      <label>
        Notes
        <input value={form.notes || ''} onChange={(e) => update('notes', e.target.value)} />
      </label>
      <button type="submit">Save Transaction</button>
    </form>
  );
}
