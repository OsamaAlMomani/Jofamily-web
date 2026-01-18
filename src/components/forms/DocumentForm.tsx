import { useState } from 'react';
import { DocumentSchema } from '../../forms/schemas';
import type { Document } from '../../types/erp';

interface Props {
  initial?: Partial<Document>;
  onSubmit: (data: Omit<Document, 'id'>) => void;
}

export default function DocumentForm({ initial, onSubmit }: Props) {
  const [form, setForm] = useState<Omit<Document, 'id'>>({
    name: initial?.name || '',
    fileUrl: initial?.fileUrl,
    expiryDate: initial?.expiryDate,
    relatedTo: initial?.relatedTo || 'visa',
    status: initial?.status || 'active',
  });
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = DocumentSchema.safeParse(form);
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
        File URL
        <input value={form.fileUrl || ''} onChange={(e) => update('fileUrl', e.target.value)} />
      </label>
      <label>
        Expiry Date
        <input type="date" value={form.expiryDate || ''} onChange={(e) => update('expiryDate', e.target.value)} />
      </label>
      <label>
        Related To
        <select value={form.relatedTo || 'visa'} onChange={(e) => update('relatedTo', e.target.value as any)}>
          <option value="visa">Visa</option>
          <option value="insurance">Insurance</option>
          <option value="enrollment">Enrollment</option>
          <option value="bank">Bank</option>
        </select>
      </label>
      <label>
        Status
        <select value={form.status || 'active'} onChange={(e) => update('status', e.target.value as any)}>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="pending">Pending</option>
        </select>
      </label>
      <button type="submit">Save Document</button>
    </form>
  );
}
