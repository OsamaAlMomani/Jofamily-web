import { useMemo } from 'react';
import debounce from 'lodash/debounce';
import type { RecurringItem } from '../../types/erp';

interface Props {
  items: RecurringItem[];
  onUpdate: (id: string, data: Partial<Omit<RecurringItem, 'id'>>) => void;
  onDelete: (id: string) => void;
}

function monthlyAmount(item: RecurringItem): number {
  switch (item.cadence) {
    case 'monthly':
      return item.amount;
    case 'weekly':
      return item.amount * 4.345;
    case 'yearly':
      return item.amount / 12;
    default:
      return item.amount;
  }
}

export default function MonthlyBudgetTable({ items, onUpdate, onDelete }: Props) {
  const debouncedUpdate = useMemo(() => debounce(onUpdate, 400), [onUpdate]);

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th align="left">Name</th>
          <th align="right">Amount</th>
          <th align="left">Cadence</th>
          <th align="right">Monthly</th>
          <th align="left">Type</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id || item.name}>
            <td>
              <input defaultValue={item.name} onChange={(e) => debouncedUpdate(item.id!, { name: e.target.value })} />
            </td>
            <td align="right">
              <input type="number" defaultValue={item.amount} onChange={(e) => debouncedUpdate(item.id!, { amount: Number(e.target.value) })} />
            </td>
            <td>
              <select defaultValue={item.cadence} onChange={(e) => debouncedUpdate(item.id!, { cadence: e.target.value as any })}>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="yearly">Yearly</option>
              </select>
            </td>
            <td align="right">{monthlyAmount(item).toFixed(2)}</td>
            <td>
              <select defaultValue={item.type} onChange={(e) => debouncedUpdate(item.id!, { type: e.target.value as any })}>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </td>
            <td>
              <button onClick={() => onDelete(item.id!)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
