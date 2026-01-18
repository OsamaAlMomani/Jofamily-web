import { useEffect, useMemo, useState } from 'react';
import { generateBalanceForecast } from '../../services/forecastService';
import { exportForecastCSV, exportRecurringCSV, exportTransactionsCSV } from '../../services/exportService';
import { 
  getRecurringItems, addRecurringItem, updateRecurringItem, deleteRecurringItem,
  getTransactions, addTransaction, updateTransaction, deleteTransaction,
  getCategories
} from '../../services/erpService';
import type { ForecastResult, RecurringItem, Transaction, Category } from '../../types/erp';
import RecurringItemForm from '../../components/forms/RecurringItemForm';
import MoneyTransactionForm from '../../components/forms/MoneyTransactionForm';
import MonthlyBudgetTable from '../../components/erp/MonthlyBudgetTable';
import BillsTable from '../../components/erp/BillsTable';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar
} from 'recharts';

function Money() {
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [recurring, setRecurring] = useState<RecurringItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  async function load() {
    setLoading(true);
    const [ri, tx, cats] = await Promise.all([
      getRecurringItems(),
      getTransactions(),
      getCategories(),
    ]);
    setRecurring(ri);
    setTransactions(tx);
    setCategories(cats);

    const result = generateBalanceForecast({
      startingBalance: 5000,
      months: 6,
      expectedMonthlyIncome: 1500,
      inflationRate: 0.03,
      recurringItems: ri,
    });
    setForecast(result);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // Derived finance metrics
  const metrics = useMemo(() => {
    const monthlyAmount = (item: RecurringItem) => {
      switch (item.cadence) {
        case 'monthly': return item.amount;
        case 'weekly': return item.amount * 4.345;
        case 'yearly': return item.amount / 12;
        default: return item.amount;
      }
    };

    const recurringIncome = recurring.filter(r => r.type === 'income').reduce((s, r) => s + monthlyAmount(r), 0);
    const recurringExpense = recurring.filter(r => r.type === 'expense').reduce((s, r) => s + monthlyAmount(r), 0);

    const txIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const txExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const net = (recurringIncome - recurringExpense) + (txIncome - txExpense);
    const burnRate = recurringExpense + txExpense; // monthly outflow approx
    const savingsRate = recurringIncome > 0 ? ((recurringIncome - recurringExpense) / recurringIncome) * 100 : 0;

    const cushionMonths = burnRate > recurringIncome
      ? 5000 / Math.max(1, burnRate - recurringIncome)
      : 12; // if positive cashflow, treat as safe

    return {
      recurringIncome: Number(recurringIncome.toFixed(2)),
      recurringExpense: Number(recurringExpense.toFixed(2)),
      txIncome: Number(txIncome.toFixed(2)),
      txExpense: Number(txExpense.toFixed(2)),
      net: Number(net.toFixed(2)),
      burnRate: Number(burnRate.toFixed(2)),
      savingsRate: Number(savingsRate.toFixed(1)),
      cushionMonths: Number(cushionMonths.toFixed(1)),
    };
  }, [recurring, transactions]);

  const currency = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

  return (
    <div style={{ padding: 16, display: 'grid', gap: 24 }}>
      <h2>Money</h2>
      <p>Monthly Budget, Bills, Forecast, Reports</p>

      {loading && <div>Loading finance data…</div>}

      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginTop: 8 }}>
        <div className="stat-card">
          <h3>Net Cash Flow</h3>
          <div className="value">{currency(metrics.net)}</div>
          <div className={`variance ${metrics.net >= 0 ? 'positive' : 'negative'}`}>
            {metrics.net >= 0 ? 'Positive' : 'Negative'} this cycle
          </div>
        </div>
        <div className="stat-card">
          <h3>Burn Rate</h3>
          <div className="value">{currency(metrics.burnRate)}</div>
          <div className="variance">Monthly outflow est.</div>
        </div>
        <div className="stat-card">
          <h3>Savings Rate</h3>
          <div className="value">{metrics.savingsRate}%</div>
          <div className="variance">Income retained</div>
        </div>
        <div className="stat-card">
          <h3>Runway</h3>
          <div className="value">{metrics.cushionMonths} mo</div>
          <div className={`variance ${metrics.cushionMonths < 2 ? 'negative' : 'positive'}`}>
            Cushion before cashout
          </div>
        </div>
      </div>

      {/* Forecast */}
      {forecast && (
        <div style={{ display: 'grid', gap: 12 }}>
          <h3>Balance Forecast (next {forecast.projections.length} months)</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={forecast.projections} margin={{ left: 0, right: 0 }}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monthLabel" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="endBalance" stroke="#10b981" fillOpacity={1} fill="url(#colorBalance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={forecast.projections}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monthLabel" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalIncome" stackId="a" fill="#60a5fa" name="Income" />
                <Bar dataKey="totalExpenses" stackId="a" fill="#f87171" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => exportForecastCSV(forecast!)}>Export Forecast CSV</button>
            <button onClick={() => exportRecurringCSV(recurring)}>Export Recurring CSV</button>
            <button onClick={() => exportTransactionsCSV(transactions)}>Export Transactions CSV</button>
          </div>
        </div>
      )}

      {/* Monthly Budget - Recurring Items */}
      <div>
        <h3>Monthly Budget</h3>
        <RecurringItemForm categories={categories} onSubmit={async (data) => { await addRecurringItem(data); await load(); }} />
        <MonthlyBudgetTable
          items={recurring}
          onUpdate={async (id, data) => { await updateRecurringItem(id, data); }}
          onDelete={async (id) => { await deleteRecurringItem(id); await load(); }}
        />
      </div>

      {/* Bills (Transactions) */}
      <div>
        <h3>Bills</h3>
        <MoneyTransactionForm categories={categories} onSubmit={async (data) => { await addTransaction(data); await load(); }} />
        <BillsTable
          transactions={transactions}
          onUpdate={async (id, data) => { await updateTransaction(id, data); }}
          onDelete={async (id) => { await deleteTransaction(id); await load(); }}
        />
      </div>
    </div>
  );
}

export default Money;
