import { differenceInMinutes, format } from 'date-fns';
import type { ForecastInputs, ForecastResult, MonthProjection, RecurringItem, Shift } from '../types/erp';

function hoursFromShift(shift: Shift): number {
  const start = new Date(shift.start);
  const end = new Date(shift.end);
  const minutes = Math.max(0, differenceInMinutes(end, start));
  return minutes / 60;
}

function monthlyIncomeFromShifts(shifts: Shift[]): number {
  return shifts.reduce((sum, s) => sum + hoursFromShift(s) * s.hourlyRate, 0);
}

function inflateAmount(amount: number, annualRate: number, monthIndex: number): number {
  const monthlyRate = annualRate / 12;
  return amount * Math.pow(1 + monthlyRate, monthIndex);
}

function monthlyExpenseFromRecurring(items: RecurringItem[], monthIndex: number, inflationRate = 0): number {
  return items.reduce((sum, item) => {
    const base = inflateAmount(item.amount, inflationRate || 0, monthIndex);
    switch (item.cadence) {
      case 'monthly':
        return sum + base;
      case 'weekly':
        return sum + base * 4.345; // average weeks per month
      case 'yearly':
        return sum + base / 12; // spread yearly over months
      default:
        return sum;
    }
  }, 0);
}

export function generateBalanceForecast(inputs: ForecastInputs): ForecastResult {
  const {
    startingBalance,
    months,
    inflationRate = 0,
    expectedMonthlyIncome = 0,
    shifts = [],
    recurringItems = [],
  } = inputs;

  const projections: MonthProjection[] = [];
  const warnings: ForecastResult['warnings'] = [];

  let balance = startingBalance;
  const now = new Date();

  for (let i = 0; i < months; i++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthLabel = format(monthDate, 'MMM yyyy');

    const incomeFromShifts = shifts.length ? monthlyIncomeFromShifts(shifts) : 0;
    const totalIncome = expectedMonthlyIncome + incomeFromShifts;

    const totalExpenses = monthlyExpenseFromRecurring(recurringItems, i, inflationRate);

    balance = balance + totalIncome - totalExpenses;

    projections.push({
      monthLabel,
      totalIncome: Number(totalIncome.toFixed(2)),
      totalExpenses: Number(totalExpenses.toFixed(2)),
      endBalance: Number(balance.toFixed(2)),
    });

    if (balance < 0) {
      warnings.push({ monthLabel, message: 'Projected balance below zero.' });
    }
  }

  return { projections, warnings };
}
