import { useMemo } from 'react';
import debounce from 'lodash/debounce';
import { format, isSameMonth } from 'date-fns';
import type { Transaction } from '../../types/erp';

interface Props {
  transactions: Transaction[];
  monthDate?: Date; // filter month
  onUpdate: (id: string, data: Partial<Omit<Transaction, 'id'>>) => void;
  onDelete: (id: string) => void;
}

export default function BillsTable({ transactions, monthDate = new Date(), onUpdate, onDelete }: Props) {
  const debouncedUpdate = useMemo(() => debounce(onUpdate, 400), [onUpdate]);
  const filtered = transactions.filter((t) => isSameMonth(new Date(t.date), monthDate));

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th align="left">Date</th>
          <th align="left">Notes</th>
          <th align="right">Amount</th>
          <th align="left">Type</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filtered.map((t) => (
          <tr key={t.id || t.date + t.amount}>
            <td>{format(new Date(t.date), 'yyyy-MM-dd')}</td>
            <td>
              <input defaultValue={t.notes || ''} onChange={(e) => debouncedUpdate(t.id!, { notes: e.target.value })} />
            </td>
            <td align="right">
              <input type="number" defaultValue={t.amount} onChange={(e) => debouncedUpdate(t.id!, { amount: Number(e.target.value) })} />
            </td>
            <td>
              <select defaultValue={t.type} onChange={(e) => debouncedUpdate(t.id!, { type: e.target.value as any })}>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </td>
            <td>
              <button onClick={() => onDelete(t.id!)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
