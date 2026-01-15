import { useEffect, useMemo, useState } from 'react';
import './Budget.css';
import { useAuth } from '../../core';
import {
  calculateBudgetProgress,
  createAllowance,
  createBudget,
  createExpense,
  getExpenseInsights,
  listenToAllowances,
  listenToBudgets,
  listenToExpenses,
} from '../../services';
import type {
  Allowance,
  Budget as BudgetType,
  CreateAllowanceInput,
  CreateBudgetInput,
  CreateExpenseInput,
  Expense,
  ExpenseCategory,
} from '../../types/budget';

const categoryLabels: Record<ExpenseCategory, string> = {
  food: 'Food & Dining',
  transport: 'Transportation',
  entertainment: 'Entertainment',
  utilities: 'Utilities',
  health: 'Healthcare',
  education: 'Education',
  other: 'Other',
};

export default function Budget() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<BudgetType[]>([]);
  const [allowances, setAllowances] = useState<Allowance[]>([]);

  // Expense form
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('food');
  const [expDate, setExpDate] = useState('');
  const [creatingExp, setCreatingExp] = useState(false);

  // Budget form
  const [budgetName, setBudgetName] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [budgetCategory, setBudgetCategory] = useState<ExpenseCategory>('food');
  const [budgetPeriod, setBudgetPeriod] = useState<'weekly' | 'monthly'>('monthly');
  const [creatingBudget, setCreatingBudget] = useState(false);

  // Allowance form
  const [allowUserId, setAllowUserId] = useState('');
  const [allowUserName, setAllowUserName] = useState('');
  const [allowAmount, setAllowAmount] = useState('');
  const [allowFreq, setAllowFreq] = useState<'weekly' | 'monthly'>('monthly');
  const [creatingAllow, setCreatingAllow] = useState(false);

  const [view, setView] = useState<'expenses' | 'budgets' | 'allowances'>('expenses');

  useEffect(() => {
    const unsub = listenToExpenses(setExpenses);
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = listenToBudgets(setBudgets);
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = listenToAllowances(setAllowances);
    return () => unsub();
  }, []);

  const budgetsWithProgress = useMemo(() => {
    return calculateBudgetProgress(budgets, expenses);
  }, [budgets, expenses]);

  const insights = useMemo(() => {
    return getExpenseInsights(expenses);
  }, [expenses]);

  async function handleCreateExpense(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !expDesc.trim() || !expAmount || !expDate) return;
    setCreatingExp(true);
    try {
      const input: CreateExpenseInput = {
        description: expDesc.trim(),
        amount: parseFloat(expAmount),
        category: expCategory,
        paidBy: user.uid,
        paidByName: user.email ?? 'User',
        date: new Date(expDate),
      };
      await createExpense(input);
      setExpDesc('');
      setExpAmount('');
      setExpCategory('food');
      setExpDate('');
    } finally {
      setCreatingExp(false);
    }
  }

  async function handleCreateBudget(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !budgetName.trim() || !budgetLimit) return;
    setCreatingBudget(true);
    try {
      const input: CreateBudgetInput = {
        name: budgetName.trim(),
        category: budgetCategory,
        limit: parseFloat(budgetLimit),
        period: budgetPeriod,
        createdBy: user.uid,
      };
      await createBudget(input);
      setBudgetName('');
      setBudgetLimit('');
      setBudgetCategory('food');
      setBudgetPeriod('monthly');
    } finally {
      setCreatingBudget(false);
    }
  }

  async function handleCreateAllowance(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !allowUserId.trim() || !allowUserName.trim() || !allowAmount) return;
    setCreatingAllow(true);
    try {
      const input: CreateAllowanceInput = {
        userId: allowUserId.trim(),
        userName: allowUserName.trim(),
        amount: parseFloat(allowAmount),
        frequency: allowFreq,
      };
      await createAllowance(input);
      setAllowUserId('');
      setAllowUserName('');
      setAllowAmount('');
      setAllowFreq('monthly');
    } finally {
      setCreatingAllow(false);
    }
  }

  if (!user) {
    return (
      <div className="budget-page">
        <header className="budget-hero">
          <div className="budget-hero__content">
            <p className="eyebrow">Feature 4 · Sign in required</p>
            <h1>Family Budget & Expenses</h1>
            <p className="lede">Sign in to track spending and manage budgets.</p>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="budget-page">
      <header className="budget-hero">
        <div className="budget-hero__content">
          <p className="eyebrow">Feature 4 · In Progress</p>
          <h1>Family Budget & Expenses</h1>
          <p className="lede">Track spending, set budgets, and manage allowances with insights.</p>

          <div className="insights-row">
            <div className="insight-card">
              <div className="insight-value">${insights.total.toFixed(2)}</div>
              <div className="insight-label">Total Spent</div>
            </div>
            <div className="insight-card">
              <div className="insight-value">{insights.count}</div>
              <div className="insight-label">Expenses</div>
            </div>
            {insights.topCategory && (
              <div className="insight-card">
                <div className="insight-value">{categoryLabels[insights.topCategory.category as ExpenseCategory]}</div>
                <div className="insight-label">Top Category</div>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="budget-layout">
        <aside className="budget-sidebar">
          <div className="sidebar-section">
            <h2>Add Expense</h2>
            <form onSubmit={handleCreateExpense} className="budget-form">
              <label>
                Description
                <input value={expDesc} onChange={(e) => setExpDesc(e.target.value)} placeholder="Groceries" />
              </label>
              <label>
                Amount
                <input
                  type="number"
                  step="0.01"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  placeholder="50.00"
                />
              </label>
              <label>
                Category
                <select value={expCategory} onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)}>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Date
                <input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} />
              </label>
              <button type="submit" disabled={!expDesc.trim() || !expAmount || !expDate || creatingExp}>
                {creatingExp ? 'Adding…' : 'Add Expense'}
              </button>
            </form>
          </div>

          <div className="sidebar-section">
            <h2>Create Budget</h2>
            <form onSubmit={handleCreateBudget} className="budget-form">
              <label>
                Name
                <input value={budgetName} onChange={(e) => setBudgetName(e.target.value)} placeholder="Food Budget" />
              </label>
              <label>
                Limit
                <input
                  type="number"
                  step="0.01"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  placeholder="500.00"
                />
              </label>
              <label>
                Category
                <select value={budgetCategory} onChange={(e) => setBudgetCategory(e.target.value as ExpenseCategory)}>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Period
                <select value={budgetPeriod} onChange={(e) => setBudgetPeriod(e.target.value as 'weekly' | 'monthly')}>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </label>
              <button type="submit" disabled={!budgetName.trim() || !budgetLimit || creatingBudget}>
                {creatingBudget ? 'Creating…' : 'Create Budget'}
              </button>
            </form>
          </div>

          <div className="sidebar-section">
            <h2>Add Allowance</h2>
            <form onSubmit={handleCreateAllowance} className="budget-form">
              <label>
                User ID
                <input value={allowUserId} onChange={(e) => setAllowUserId(e.target.value)} placeholder={user.uid} />
              </label>
              <label>
                User Name
                <input
                  value={allowUserName}
                  onChange={(e) => setAllowUserName(e.target.value)}
                  placeholder="John Doe"
                />
              </label>
              <label>
                Amount
                <input
                  type="number"
                  step="0.01"
                  value={allowAmount}
                  onChange={(e) => setAllowAmount(e.target.value)}
                  placeholder="100.00"
                />
              </label>
              <label>
                Frequency
                <select value={allowFreq} onChange={(e) => setAllowFreq(e.target.value as 'weekly' | 'monthly')}>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </label>
              <button
                type="submit"
                disabled={!allowUserId.trim() || !allowUserName.trim() || !allowAmount || creatingAllow}
              >
                {creatingAllow ? 'Adding…' : 'Add Allowance'}
              </button>
            </form>
          </div>
        </aside>

        <main className="budget-main">
          <div className="view-tabs">
            <button
              className={view === 'expenses' ? 'tab-btn active' : 'tab-btn'}
              onClick={() => setView('expenses')}
            >
              Expenses
            </button>
            <button className={view === 'budgets' ? 'tab-btn active' : 'tab-btn'} onClick={() => setView('budgets')}>
              Budgets
            </button>
            <button
              className={view === 'allowances' ? 'tab-btn active' : 'tab-btn'}
              onClick={() => setView('allowances')}
            >
              Allowances
            </button>
          </div>

          {view === 'expenses' && (
            <div className="expense-list">
              {expenses.length === 0 && <p className="muted">No expenses yet. Add one to get started.</p>}
              {expenses.map((exp) => (
                <div key={exp.id} className="expense-card">
                  <div className="expense-header">
                    <div className="expense-desc">{exp.description}</div>
                    <div className="expense-amount">${exp.amount.toFixed(2)}</div>
                  </div>
                  <div className="expense-meta">
                    <span className="expense-category">{categoryLabels[exp.category]}</span>
                    <span className="expense-by">{exp.paidByName}</span>
                    <span className="expense-date">{exp.date.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {view === 'budgets' && (
            <div className="budget-list">
              {budgetsWithProgress.length === 0 && <p className="muted">No budgets yet. Create one to track spending.</p>}
              {budgetsWithProgress.map((budget) => {
                const percent = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
                const isOver = percent > 100;
                return (
                  <div key={budget.id} className={`budget-card ${isOver ? 'budget-card--over' : ''}`}>
                    <div className="budget-header">
                      <div className="budget-name">{budget.name}</div>
                      <div className="budget-spent">
                        ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                      </div>
                    </div>
                    <div className="budget-progress-bar">
                      <div
                        className={`budget-progress-fill ${isOver ? 'budget-progress-fill--over' : ''}`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                    <div className="budget-meta">
                      <span className="budget-category">{categoryLabels[budget.category]}</span>
                      <span className="budget-period">{budget.period}</span>
                      <span className={`budget-percent ${isOver ? 'budget-percent--over' : ''}`}>
                        {percent.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {view === 'allowances' && (
            <div className="allowance-list">
              {allowances.length === 0 && <p className="muted">No allowances yet. Add one to manage payments.</p>}
              {allowances.map((allow) => (
                <div key={allow.id} className="allowance-card">
                  <div className="allowance-header">
                    <div className="allowance-user">{allow.userName}</div>
                    <div className="allowance-amount">${allow.amount.toFixed(2)}</div>
                  </div>
                  <div className="allowance-meta">
                    <span className="allowance-freq">{allow.frequency}</span>
                    <span className="allowance-next">Next: {allow.nextPayment.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </section>
    </div>
  );
}
