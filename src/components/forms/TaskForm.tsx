import { useState } from 'react';
import { TaskSchema } from '../../forms/schemas';
import type { Task } from '../../types/erp';

interface Props {
  initial?: Partial<Task>;
  onSubmit: (data: Omit<Task, 'id'>) => void;
}

export default function TaskForm({ initial, onSubmit }: Props) {
  const [form, setForm] = useState<Omit<Task, 'id'>>({
    title: initial?.title || '',
    dueDate: initial?.dueDate || new Date().toISOString().slice(0, 10),
    type: initial?.type || 'study',
    estimatedHours: initial?.estimatedHours,
    done: initial?.done || false,
  });
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = TaskSchema.safeParse(form);
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
        Title
        <input value={form.title} onChange={(e) => update('title', e.target.value)} />
      </label>
      <label>
        Due Date
        <input type="date" value={form.dueDate} onChange={(e) => update('dueDate', e.target.value)} />
      </label>
      <label>
        Type
        <select value={form.type} onChange={(e) => update('type', e.target.value as 'study' | 'admin')}>
          <option value="study">Study</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      <label>
        Estimated Hours
        <input type="number" value={form.estimatedHours || 0} onChange={(e) => update('estimatedHours', Number(e.target.value))} />
      </label>
      <label>
        Done
        <input type="checkbox" checked={form.done || false} onChange={(e) => update('done', e.target.checked)} />
      </label>
      <button type="submit">Save Task</button>
    </form>
  );
}
