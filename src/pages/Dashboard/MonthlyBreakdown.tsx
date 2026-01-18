import { useState } from 'react';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import type { FinanceRecord } from '../../types/finance';
import { analyzeByMonth, calculateTrend } from '../../services/financeAnalytics';
import './MonthlyBreakdown.css';

interface MonthlyBreakdownProps {
  records: FinanceRecord[];
  onEdit: (record: FinanceRecord) => void;
}

export default function MonthlyBreakdown({ records, onEdit }: MonthlyBreakdownProps) {
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  
  const monthlyAnalysis = analyzeByMonth(records);
  const trend = calculateTrend(monthlyAnalysis);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  const toggleMonth = (month: string) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(month)) {
      newExpanded.delete(month);
    } else {
      newExpanded.add(month);
    }
    setExpandedMonths(newExpanded);
  };

  // Prepare data for outcome chart
  const outcomeData = monthlyAnalysis.map(m => ({
    month: m.month,
    revenue: m.revenue,
    expenses: m.expenses,
    netIncome: m.netIncome,
    expectedNet: m.expectedNet,
    actualNet: m.actualNet
  }));

  return (
    <>
      {/* Analytics Overview */}
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>📈 Revenue Growth</h3>
          <div className="analytics-value" style={{ color: trend.revenueGrowth >= 0 ? '#48bb78' : '#f56565' }}>
            {trend.revenueGrowth >= 0 ? '+' : ''}{trend.revenueGrowth.toFixed(1)}%
          </div>
          <div className="analytics-change">
            {trend.revenueGrowth >= 0 ? 'Increasing' : 'Decreasing'} trend
          </div>
        </div>

        <div className="analytics-card">
          <h3>💰 Avg Profit Margin</h3>
          <div className="analytics-value">{trend.avgProfitMargin.toFixed(1)}%</div>
          <div className="analytics-change">
            <span className={`trend-indicator ${trend.trend}`}>
              {trend.trend === 'improving' && '📈 Improving'}
              {trend.trend === 'declining' && '📉 Declining'}
              {trend.trend === 'stable' && '➡️ Stable'}
            </span>
          </div>
        </div>

        <div className="analytics-card">
          <h3>💸 Expense Growth</h3>
          <div className="analytics-value" style={{ color: trend.expenseGrowth <= 0 ? '#48bb78' : '#f56565' }}>
            {trend.expenseGrowth >= 0 ? '+' : ''}{trend.expenseGrowth.toFixed(1)}%
          </div>
          <div className="analytics-change">
            {trend.expenseGrowth <= 0 ? 'Cost control effective' : 'Costs rising'}
          </div>
        </div>
      </div>

      {/* Monthly Outcome Chart */}
      <div className="outcome-table">
        <h2>📊 Monthly Profit & Loss Analysis</h2>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={outcomeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Legend />
            <Bar dataKey="revenue" fill="#48bb78" name="Revenue" />
            <Bar dataKey="expenses" fill="#f56565" name="Expenses" />
            <Line 
              type="monotone" 
              dataKey="netIncome" 
              stroke="#667eea" 
              strokeWidth={3}
              name="Net Income"
            />
            <Line 
              type="monotone" 
              dataKey="expectedNet" 
              stroke="#cbd5e0" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Expected Net"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Net Income Trend */}
      <div className="outcome-table">
        <h2>💹 Net Income Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={outcomeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="netIncome" 
              stroke="#667eea" 
              fill="#667eea" 
              fillOpacity={0.3}
              name="Actual Net Income"
            />
            <Area 
              type="monotone" 
              dataKey="expectedNet" 
              stroke="#cbd5e0" 
              fill="#cbd5e0" 
              fillOpacity={0.2}
              name="Expected Net Income"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Breakdown Sections */}
      <div className="monthly-sections">
        <h2 style={{ marginBottom: '1.5rem', color: '#2d3748' }}>📅 Monthly Breakdown</h2>
        {monthlyAnalysis.map((monthData) => (
          <div key={monthData.month} className="month-card">
            <div className="month-header" onClick={() => toggleMonth(monthData.month)}>
              <div>
                <h3 className="month-title">{monthData.month}</h3>
                <div className="month-summary">
                  <div className="month-stat">
                    <span className="month-stat-label">Net Income</span>
                    <span className="month-stat-value">
                      {formatCurrency(monthData.netIncome)}
                    </span>
                  </div>
                  <div className="month-stat">
                    <span className="month-stat-label">Profit Margin</span>
                    <span className="month-stat-value">
                      {monthData.profitMargin.toFixed(1)}%
                    </span>
                  </div>
                  <div className="month-stat">
                    <span className="month-stat-label">Records</span>
                    <span className="month-stat-value">{monthData.records.length}</span>
                  </div>
                </div>
              </div>
              <span className={`expand-icon ${expandedMonths.has(monthData.month) ? 'expanded' : ''}`}>
                ▼
              </span>
            </div>

            {expandedMonths.has(monthData.month) && (
              <div className="month-content">
                <div className="month-metrics">
                  <div className="metric-box revenue">
                    <div className="metric-label">Revenue</div>
                    <div className="metric-value">{formatCurrency(monthData.revenue)}</div>
                    <div className="metric-subtext">
                      Expected: {formatCurrency(
                        monthData.records
                          .filter(r => r.category === 'Revenue')
                          .reduce((sum, r) => sum + r.expected, 0)
                      )}
                    </div>
                  </div>

                  <div className="metric-box expense">
                    <div className="metric-label">Expenses</div>
                    <div className="metric-value">{formatCurrency(monthData.expenses)}</div>
                    <div className="metric-subtext">
                      Expected: {formatCurrency(
                        monthData.records
                          .filter(r => r.category !== 'Revenue')
                          .reduce((sum, r) => sum + r.expected, 0)
                      )}
                    </div>
                  </div>

                  <div className="metric-box profit">
                    <div className="metric-label">Net Income</div>
                    <div className="metric-value metric-positive">
                      {formatCurrency(monthData.netIncome)}
                    </div>
                    <div className="metric-subtext">
                      Performance: 
                      <span className={monthData.performance >= 0 ? 'metric-positive' : 'metric-negative'}>
                        {' '}{monthData.performance >= 0 ? '+' : ''}
                        {monthData.performance.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <table className="month-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Expected</th>
                      <th>Actual</th>
                      <th>Variance</th>
                      <th>Notes</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthData.records.map((record) => (
                      <tr key={record.id}>
                        <td>
                          <span className={`category-badge category-${record.category.toLowerCase()}`}>
                            {record.category}
                          </span>
                        </td>
                        <td>{formatCurrency(record.expected)}</td>
                        <td>{formatCurrency(record.actual)}</td>
                        <td>
                          <span className={record.variance && record.variance >= 0 ? 'metric-positive' : 'metric-negative'}>
                            {record.variance && formatCurrency(Math.abs(record.variance))}
                            {record.variance && (record.variance >= 0 ? ' ▲' : ' ▼')}
                          </span>
                        </td>
                        <td>{record.notes}</td>
                        <td>
                          <button 
                            onClick={() => onEdit(record)} 
                            className="btn-icon"
                            title="Edit"
                          >
                            ✏️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
