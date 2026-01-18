import type { ForecastResult, RecurringItem, Transaction } from '../types/erp';

function download(filename: string, content: string, mime = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportTransactionsCSV(transactions: Transaction[], filename = 'transactions.csv') {
  const header = 'date,amount,type,notes\n';
  const rows = transactions
    .map((t) => `${t.date},${t.amount},${t.type},${(t.notes || '').replace(/,/g, ';')}`)
    .join('\n');
  download(filename, header + rows);
}

export function exportRecurringCSV(items: RecurringItem[], filename = 'recurring_items.csv') {
  const header = 'name,amount,cadence,startDate,endDate,type\n';
  const rows = items
    .map((i) => `${i.name},${i.amount},${i.cadence},${i.startDate},${i.endDate || ''},${i.type}`)
    .join('\n');
  download(filename, header + rows);
}

export function exportForecastCSV(result: ForecastResult, filename = 'forecast.csv') {
  const header = 'monthLabel,totalIncome,totalExpenses,endBalance\n';
  const rows = result.projections
    .map((p) => `${p.monthLabel},${p.totalIncome},${p.totalExpenses},${p.endBalance}`)
    .join('\n');
  download(filename, header + rows);
}
