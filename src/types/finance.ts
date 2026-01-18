export interface FinanceRecord {
  id: string;
  month: string;
  category: string;
  expected: number;
  actual: number;
  variance?: number;
  notes?: string;
}

export interface FinanceSummary {
  totalExpected: number;
  totalActual: number;
  totalVariance: number;
  categories: {
    [key: string]: {
      expected: number;
      actual: number;
    };
  };
}

export interface ChartDataPoint {
  name: string;
  expected: number;
  actual: number;
  variance?: number;
  [key: string]: string | number | undefined;
}
