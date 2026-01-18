import type { FinanceRecord } from '../types/finance';
import { groupBy, sumBy, meanBy } from 'lodash';

export interface MonthlyAnalysis {
  month: string;
  revenue: number;
  expenses: number;
  netIncome: number;
  profitMargin: number;
  records: FinanceRecord[];
  expectedNet: number;
  actualNet: number;
  performance: number; // percentage
}

export interface CategoryBreakdown {
  category: string;
  expected: number;
  actual: number;
  variance: number;
  percentOfTotal: number;
}

/**
 * Group records by month and calculate monthly analytics
 */
export function analyzeByMonth(records: FinanceRecord[]): MonthlyAnalysis[] {
  const groupedByMonth: Record<string, FinanceRecord[]> = groupBy(records, 'month');
  
  return Object.entries(groupedByMonth).map(([month, monthRecords]) => {
    const revenue = sumBy(monthRecords.filter(r => r.category === 'Revenue'), 'actual');
    const expenses = sumBy(
      monthRecords.filter(r => r.category !== 'Revenue'),
      'actual'
    );
    const netIncome = revenue - expenses;
    const profitMargin = revenue > 0 ? (netIncome / revenue) * 100 : 0;
    
    const expectedRevenue = sumBy(monthRecords.filter(r => r.category === 'Revenue'), 'expected');
    const expectedExpenses = sumBy(
      monthRecords.filter(r => r.category !== 'Revenue'),
      'expected'
    );
    const expectedNet = expectedRevenue - expectedExpenses;
    const actualNet = netIncome;
    const performance = expectedNet !== 0 ? ((actualNet - expectedNet) / Math.abs(expectedNet)) * 100 : 0;
    
    return {
      month,
      revenue,
      expenses,
      netIncome,
      profitMargin,
      records: monthRecords,
      expectedNet,
      actualNet,
      performance
    };
  }).sort((a, b) => {
    // Sort by month chronologically
    const parseMonth = (m: string) => {
      const [monthName, year] = m.split(' ');
      const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(monthName);
      return new Date(parseInt(year), monthIndex).getTime();
    };
    return parseMonth(a.month) - parseMonth(b.month);
  });
}

/**
 * Get category breakdown with percentages
 */
export function analyzeCategoryBreakdown(records: FinanceRecord[]): CategoryBreakdown[] {
  const groupedByCategory: Record<string, FinanceRecord[]> = groupBy(records, 'category');
  const totalActual = sumBy(records, 'actual');
  
  return Object.entries(groupedByCategory).map(([category, categoryRecords]) => {
    const expected = sumBy(categoryRecords, 'expected');
    const actual = sumBy(categoryRecords, 'actual');
    const variance = actual - expected;
    const percentOfTotal = totalActual > 0 ? (actual / totalActual) * 100 : 0;
    
    return {
      category,
      expected,
      actual,
      variance,
      percentOfTotal
    };
  }).sort((a, b) => b.actual - a.actual); // Sort by actual amount descending
}

/**
 * Calculate trend analysis
 */
export function calculateTrend(monthlyData: MonthlyAnalysis[]): {
  revenueGrowth: number;
  expenseGrowth: number;
  avgProfitMargin: number;
  trend: 'improving' | 'declining' | 'stable';
} {
  if (monthlyData.length < 2) {
    return {
      revenueGrowth: 0,
      expenseGrowth: 0,
      avgProfitMargin: meanBy(monthlyData, 'profitMargin'),
      trend: 'stable'
    };
  }
  
  const sortedData = [...monthlyData].sort((a, b) => {
    const parseMonth = (m: string) => {
      const [monthName, year] = m.split(' ');
      const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(monthName);
      return new Date(parseInt(year), monthIndex).getTime();
    };
    return parseMonth(a.month) - parseMonth(b.month);
  });
  
  const firstMonth = sortedData[0];
  const lastMonth = sortedData[sortedData.length - 1];
  
  const revenueGrowth = firstMonth.revenue > 0 
    ? ((lastMonth.revenue - firstMonth.revenue) / firstMonth.revenue) * 100 
    : 0;
    
  const expenseGrowth = firstMonth.expenses > 0 
    ? ((lastMonth.expenses - firstMonth.expenses) / firstMonth.expenses) * 100 
    : 0;
    
  const avgProfitMargin = meanBy(sortedData, 'profitMargin');
  
  // Determine trend based on net income progression
  const netIncomes = sortedData.map(d => d.netIncome);
  const increasing = netIncomes.slice(1).every((val, i) => val >= netIncomes[i]);
  const decreasing = netIncomes.slice(1).every((val, i) => val <= netIncomes[i]);
  
  const trend = increasing ? 'improving' : decreasing ? 'declining' : 'stable';
  
  return {
    revenueGrowth,
    expenseGrowth,
    avgProfitMargin,
    trend
  };
}
