import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { FinanceRecord, FinanceSummary, ChartDataPoint } from '../types/finance';

const COLLECTION_NAME = 'finance_records';

// Sample finance data for initial seeding
const sampleFinanceData: FinanceRecord[] = [
  {
    id: '1',
    month: 'Jan 2026',
    category: 'Revenue',
    expected: 50000,
    actual: 48500,
    notes: 'Slightly below target'
  },
  {
    id: '2',
    month: 'Feb 2026',
    category: 'Revenue',
    expected: 52000,
    actual: 54200,
    notes: 'Exceeded expectations'
  },
  {
    id: '3',
    month: 'Mar 2026',
    category: 'Revenue',
    expected: 55000,
    actual: 53800,
    notes: 'Close to target'
  },
  {
    id: '4',
    month: 'Jan 2026',
    category: 'Expenses',
    expected: 30000,
    actual: 28500,
    notes: 'Cost savings'
  },
  {
    id: '5',
    month: 'Feb 2026',
    category: 'Expenses',
    expected: 31000,
    actual: 32100,
    notes: 'Slightly over budget'
  },
  {
    id: '6',
    month: 'Mar 2026',
    category: 'Expenses',
    expected: 29000,
    actual: 29800,
    notes: 'Within range'
  },
  {
    id: '7',
    month: 'Jan 2026',
    category: 'Marketing',
    expected: 8000,
    actual: 7500,
    notes: 'Under budget'
  },
  {
    id: '8',
    month: 'Feb 2026',
    category: 'Marketing',
    expected: 8500,
    actual: 9200,
    notes: 'Campaign overspend'
  },
  {
    id: '9',
    month: 'Mar 2026',
    category: 'Marketing',
    expected: 9000,
    actual: 8800,
    notes: 'On track'
  },
];

/**
 * Initialize database with sample data (call once)
 */
export async function seedFinanceData(): Promise<void> {
  try {
    const existingRecords = await getFinanceRecords();
    if (existingRecords.length > 0) {
      console.log('Database already has data, skipping seed.');
      return;
    }

    console.log('Seeding finance data...');
    const collectionRef = collection(db, COLLECTION_NAME);
    
    for (const record of sampleFinanceData) {
      const { id, ...recordData } = record;
      await addDoc(collectionRef, {
        ...recordData,
        createdAt: Timestamp.now()
      });
    }
    
    console.log('Finance data seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
}

/**
 * Get all finance records from Firestore
 */
export async function getFinanceRecords(): Promise<FinanceRecord[]> {
  try {
    const collectionRef = collection(db, COLLECTION_NAME);
    const q = query(collectionRef, orderBy('month', 'asc'));
    const snapshot = await getDocs(q);
    
    const records: FinanceRecord[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        month: data.month,
        category: data.category,
        expected: data.expected,
        actual: data.actual,
        notes: data.notes || '',
        variance: data.actual - data.expected
      };
    });
    
    return records;
  } catch (error) {
    console.error('Error fetching finance records:', error);
    throw error;
  }
}

/**
 * Get finance summary statistics
 */
export async function getFinanceSummary(): Promise<FinanceSummary> {
  const records = await getFinanceRecords();
  
  const summary: FinanceSummary = {
    totalExpected: 0,
    totalActual: 0,
    totalVariance: 0,
    categories: {}
  };
  
  records.forEach(record => {
    // Overall totals
    summary.totalExpected += record.expected;
    summary.totalActual += record.actual;
    summary.totalVariance += record.variance || 0;
    
    // Category breakdown
    if (!summary.categories[record.category]) {
      summary.categories[record.category] = { expected: 0, actual: 0 };
    }
    summary.categories[record.category].expected += record.expected;
    summary.categories[record.category].actual += record.actual;
  });
  
  return summary;
}

/**
 * Get chart data grouped by month
 */
export async function getMonthlyChartData(): Promise<ChartDataPoint[]> {
  const records = await getFinanceRecords();
  const monthlyData = new Map<string, ChartDataPoint>();
  
  records.forEach(record => {
    if (!monthlyData.has(record.month)) {
      monthlyData.set(record.month, {
        name: record.month,
        expected: 0,
        actual: 0,
        variance: 0
      });
    }
    
    const data = monthlyData.get(record.month)!;
    data.expected += record.expected;
    data.actual += record.actual;
    data.variance = data.actual - data.expected;
  });
  
  return Array.from(monthlyData.values());
}

/**
 * Get chart data grouped by category
 */
export async function getCategoryChartData(): Promise<ChartDataPoint[]> {
  const records = await getFinanceRecords();
  const categoryData = new Map<string, ChartDataPoint>();
  
  records.forEach(record => {
    if (!categoryData.has(record.category)) {
      categoryData.set(record.category, {
        name: record.category,
        expected: 0,
        actual: 0,
        variance: 0
      });
    }
    
    const data = categoryData.get(record.category)!;
    data.expected += record.expected;
    data.actual += record.actual;
    data.variance = data.actual - data.expected;
  });
  
  return Array.from(categoryData.values());
}

/**
 * Add a new finance record to Firestore
 */
export async function addFinanceRecord(record: Omit<FinanceRecord, 'id' | 'variance'>): Promise<FinanceRecord> {
  try {
    const collectionRef = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(collectionRef, {
      ...record,
      createdAt: Timestamp.now()
    });
    
    const newRecord: FinanceRecord = {
      ...record,
      id: docRef.id,
      variance: record.actual - record.expected
    };
    
    return newRecord;
  } catch (error) {
    console.error('Error adding finance record:', error);
    throw error;
  }
}

/**
 * Update an existing finance record
 */
export async function updateFinanceRecord(id: string, updates: Partial<Omit<FinanceRecord, 'id' | 'variance'>>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating finance record:', error);
    throw error;
  }
}

/**
 * Delete a finance record
 */
export async function deleteFinanceRecord(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting finance record:', error);
    throw error;
  }
}
