import { useEffect, useState } from 'react';
import { isWithinInterval, startOfDay, addDays } from 'date-fns';
import type { Document, Task } from '../types/erp';

export interface ReminderBuckets {
  within7: Array<{ label: string; date: string }>;
  within14: Array<{ label: string; date: string }>;
  within30: Array<{ label: string; date: string }>;
}

export function useReminders(tasks: Task[], documents: Document[]) {
  const [buckets, setBuckets] = useState<ReminderBuckets>({ within7: [], within14: [], within30: [] });

  useEffect(() => {
    const today = startOfDay(new Date());
    const ranges = {
      within7: { start: today, end: addDays(today, 7) },
      within14: { start: today, end: addDays(today, 14) },
      within30: { start: today, end: addDays(today, 30) },
    };

    const items: Array<{ label: string; date: string }> = [];

    tasks.forEach((t) => {
      items.push({ label: `Task: ${t.title}`, date: t.dueDate });
    });
    documents.forEach((d) => {
      if (d.expiryDate) items.push({ label: `Doc: ${d.name} expires`, date: d.expiryDate });
    });

    const bucketed: ReminderBuckets = { within7: [], within14: [], within30: [] };

    items.forEach((i) => {
      const d = new Date(i.date);
      if (isWithinInterval(d, ranges.within7)) bucketed.within7.push(i);
      else if (isWithinInterval(d, ranges.within14)) bucketed.within14.push(i);
      else if (isWithinInterval(d, ranges.within30)) bucketed.within30.push(i);
    });

    setBuckets(bucketed);
  }, [tasks, documents]);

  return buckets;
}
