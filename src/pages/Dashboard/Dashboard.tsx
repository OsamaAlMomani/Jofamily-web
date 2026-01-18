import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth';
import {
  getFinanceRecords,
  getFinanceSummary,
  seedFinanceData,
  addFinanceRecord,
  updateFinanceRecord,
  deleteFinanceRecord
} from '../../services/financeService';
import type { FinanceRecord, FinanceSummary } from '../../types/finance';
import FinanceModal from './FinanceModal';
import MonthlyBreakdown from './MonthlyBreakdown';
import { generateBalanceForecast } from '../../services/forecastService';
import { getTasks, getDocuments, getShifts, getRecurringItems } from '../../services/erpService';
import { useReminders } from '../../hooks/useReminders';
import type { Task, Document, Shift } from '../../types/erp';
import './Dashboard.css';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinanceRecord | undefined>(undefined);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [safeThisMonth, setSafeThisMonth] = useState<{ endBalance: number; warning?: string } | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Reminders buckets (hooks must stay top-level)
  const reminders = useReminders(tasks, documents);

  // Weekly work hours
  const weeklyLimit = 20;
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay()); // Sunday start
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  const weeklyHours = shifts.reduce((sum, s) => {
    const start = new Date(s.start);
    const end = new Date(s.end);
    if (start >= weekStart && end <= weekEnd) {
      const hours = Math.max(0, (end.getTime() - start.getTime()) / 3600000);
      return sum + hours;
    }
    return sum;
  }, 0);

  useEffect(() => {
    // Check user is logged in
    if (!user) {
      navigate('/login');
      return;
    }

    // Load data
    loadDashboardData();
  }, [user, navigate]);

  async function loadDashboardData() {
    try {
      setLoading(true);
      
      // Seed data if database is empty
      await seedFinanceData();
      
      const [recordsData, summaryData, tasksData, docsData, shiftsData, recurringData] = await Promise.all([
        getFinanceRecords(),
        getFinanceSummary(),
        getTasks(),
        getDocuments(),
        getShifts(),
        getRecurringItems(),
      ]);

      setRecords(recordsData);
      setSummary(summaryData);
      setTasks(tasksData);
      setDocuments(docsData);
      setShifts(shiftsData);

      // Safety widget: forecast end balance for current month
      const forecast = generateBalanceForecast({
        startingBalance: 5000,
        months: 1,
        expectedMonthlyIncome: 1500,
        recurringItems: recurringData,
      });
      const endBalance = forecast.projections[0]?.endBalance || 0;
      setSafeThisMonth({ endBalance, warning: endBalance < 0 ? 'Projected negative balance.' : undefined });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      alert('Failed to load dashboard data. Make sure Firestore is enabled in Firebase Console.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  function handleAddNew() {
    setEditingRecord(undefined);
    setShowModal(true);
  }

  function handleEdit(record: FinanceRecord) {
    setEditingRecord(record);
    setShowModal(true);
  }

  async function handleSave(recordData: Omit<FinanceRecord, 'id' | 'variance'>) {
    if (editingRecord) {
      // Update existing record
      await updateFinanceRecord(editingRecord.id, recordData);
    } else {
      // Add new record
      await addFinanceRecord(recordData);
    }
    // Reload all data
    await loadDashboardData();
    setShowModal(false);
  }

  async function handleDelete(id: string) {
    await deleteFinanceRecord(id);
    await loadDashboardData();
    setShowModal(false);
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="admin-badge">👑 ADMIN DASHBOARD</div>
        <h1>Finance & Analytics Overview</h1>
        <div className="user-info">
          Logged in as: <strong>{user?.email}</strong>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      <div className="stats-grid" style={{ marginTop: 12 }}>
        <div className="stat-card">
          <h3>Money</h3>
          <p style={{ marginBottom: 8 }}>Budget, bills, forecast, CSV export.</p>
          <button onClick={() => navigate('/dashboard/money')} className="btn-add">Open Money</button>
        </div>
        <div className="stat-card">
          <h3>Studies</h3>
          <p style={{ marginBottom: 8 }}>Courses, assignments, exams.</p>
          <button onClick={() => navigate('/dashboard/studies')} className="btn-add">Open Studies</button>
        </div>
        <div className="stat-card">
          <h3>Work</h3>
          <p style={{ marginBottom: 8 }}>Shifts, hourly rate, limits.</p>
          <button onClick={() => navigate('/dashboard/work')} className="btn-add">Open Work</button>
        </div>
        <div className="stat-card">
          <h3>Admin / Visa</h3>
          <p style={{ marginBottom: 8 }}>Docs, expiries, checklists.</p>
          <button onClick={() => navigate('/dashboard/admin')} className="btn-add">Open Admin</button>
        </div>
      </div>

      {summary && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Expected</h3>
            <div className="value">{formatCurrency(summary.totalExpected)}</div>
          </div>

          <div className="stat-card">
            <h3>Total Actual</h3>
            <div className="value">{formatCurrency(summary.totalActual)}</div>
          </div>

          <div className="stat-card">
            <h3>Variance</h3>
            <div className="value">{formatCurrency(Math.abs(summary.totalVariance))}</div>
            <div className={`variance ${summary.totalVariance >= 0 ? 'positive' : 'negative'}`}>
              {summary.totalVariance >= 0 ? '▲' : '▼'} 
              {' '}
              {summary.totalVariance >= 0 ? 'Above' : 'Below'} Target
            </div>
          </div>

          <div className="stat-card">
            <h3>Performance</h3>
            <div className="value">
              {((summary.totalActual / summary.totalExpected) * 100).toFixed(1)}%
            </div>
            <div className={`variance ${summary.totalActual >= summary.totalExpected ? 'positive' : 'negative'}`}>
              {summary.totalActual >= summary.totalExpected ? 'Meeting' : 'Below'} Expectations
            </div>
          </div>
        </div>
      )}

      {/* ERP Overview */}
      <div className="stats-grid" style={{ marginTop: 16 }}>
        <div className="stat-card">
          <h3>Tasks Open</h3>
          <div className="value">{tasks.filter(t => !t.done).length}</div>
          <div className="variance">{tasks.length} total</div>
        </div>
        <div className="stat-card">
          <h3>Docs Expiring (30d)</h3>
          <div className="value">{reminders.within30.length}</div>
          <div className="variance">{reminders.within7.length} due in 7d</div>
        </div>
        <div className="stat-card">
          <h3>Shifts This Week</h3>
          <div className="value">{weeklyHours.toFixed(1)} hrs</div>
          <div className={`variance ${weeklyHours > weeklyLimit ? 'negative' : 'positive'}`}>
            Limit {weeklyLimit}h
          </div>
        </div>
        <div className="stat-card">
          <h3>Transactions</h3>
          <div className="value">{records.length}</div>
          <div className="variance">Finance records loaded</div>
        </div>
      </div>

      {/* Safety + Upcoming + Work limits */}
      <div className="stats-grid" style={{ marginTop: 16 }}>
        <div className="stat-card">
          <h3>Am I Safe This Month?</h3>
          <div className="value">{formatCurrency(safeThisMonth?.endBalance || 0)}</div>
          {safeThisMonth?.warning ? (
            <div className="variance negative">{safeThisMonth.warning}</div>
          ) : (
            <div className="variance positive">Looks OK</div>
          )}
        </div>
        <div className="stat-card">
          <h3>Upcoming (7 days)</h3>
          <ul>
            {reminders.within7.length === 0 && <li>None</li>}
            {reminders.within7.map((r) => (
              <li key={r.label + r.date}>{r.label}</li>
            ))}
          </ul>
        </div>
        <div className="stat-card">
          <h3>Work Hours (This Week)</h3>
          <div className="value">{weeklyHours.toFixed(1)} / {weeklyLimit}</div>
          <div className={`variance ${weeklyHours > weeklyLimit ? 'negative' : 'positive'}`}>
            {weeklyHours > weeklyLimit ? 'Over limit' : 'Within limit'}
          </div>
        </div>
      </div>

        {/* Add New Record Button */}
        <div className="add-record-section">
          <button onClick={handleAddNew} className="btn-add">
            ➕ Add New Record
          </button>
        </div>

        {/* Monthly Breakdown with Analytics */}
        <MonthlyBreakdown records={records} onEdit={handleEdit} />

      {showModal && (
        <FinanceModal
          record={editingRecord}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          onDelete={editingRecord ? handleDelete : undefined}
        />
      )}
    </div>
  );
}
