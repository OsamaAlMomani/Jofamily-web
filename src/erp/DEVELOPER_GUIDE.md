# ERP System - Developer Guide

## Quick Navigation

### Module Paths
- **Money**: `/src/erp/modules/Money` - Financial tracking
- **Studies**: `/src/erp/modules/Studies` - Study task management  
- **Work**: `/src/erp/modules/Work` - Shift tracking
- **Admin**: `/src/erp/modules/Admin` - Document/visa management

### Service Layer
- **ERP Service**: `/src/erp/services/erpService.ts` - All CRUD operations
- **Types**: `/src/erp/types/index.ts` - Shared data models
- **Forms**: `/src/erp/forms/schemas.ts` - Zod validation schemas

### UI Components (by module)
- Money: `/src/components/forms/MoneyTransactionForm.tsx`, `RecurringItemForm.tsx`
- Studies: `/src/components/forms/TaskForm.tsx`
- Work: `/src/components/forms/ShiftForm.tsx`
- Admin: `/src/components/forms/DocumentForm.tsx`

## Adding a New Feature

### Example: Add "Budget Limit" to Money Module

1. **Update Type** (`src/erp/types/index.ts`):
```typescript
export interface Category {
  id?: ID;
  name: string;
  budgetLimit?: number;  // NEW
  group?: 'Money' | 'Study' | 'Work' | 'Admin';
}
```

2. **Update Schema** (`src/erp/forms/schemas.ts`):
```typescript
export const CategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  budgetLimit: z.number().positive().optional(),  // NEW
  group: z.enum([...]).optional(),
});
```

3. **Update Component** (`src/pages/Money/Money.tsx`):
```typescript
const handleSaveCategory = async (data: Partial<Category>) => {
  await updateCategory(categoryId, {
    name: data.name,
    budgetLimit: data.budgetLimit  // NEW
  });
};
```

4. **Add UI** (in form component):
```tsx
<input
  type="number"
  placeholder="Budget limit"
  value={formData.budgetLimit}
  onChange={(e) => setFormData({ ...formData, budgetLimit: parseFloat(e.target.value) })}
/>
```

## Common Tasks

### Create a new Task
```typescript
import { addTask } from '../../erp/services';

const newTask = await addTask({
  title: 'Study Math Chapter 5',
  dueDate: '2026-02-15',
  type: 'study',
  estimatedHours: 3,
  done: false
});
```

### Update multiple records
```typescript
import { updateTransaction } from '../../erp/services';

await Promise.all(
  selectedTransactions.map(t => 
    updateTransaction(t.id!, { categoryId: newCategoryId })
  )
);
```

### Query and filter locally
```typescript
const completedTasks = tasks.filter(t => t.done);
const overdueTasks = tasks.filter(t => 
  new Date(t.dueDate) < new Date()
);
```

### Add error handling
```typescript
try {
  const result = TaskSchema.safeParse(formData);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    setFormErrors(errors);
    return;
  }
  await addTask(result.data);
} catch (err) {
  setFormErrors({ submit: err.message });
}
```

## Styling Guide

All ERP modules use glassmorphism:

```css
.module-container {
  background: radial-gradient(circle at 20% 20%, rgba(255,255,255,0.6), rgba(233,244,255,0.4));
  backdrop-filter: blur(12px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(102, 126, 234, 0.4);
}
```

See `/src/pages/Studies/Studies.css` for complete examples.

## Testing Data Entry

All modules can be tested immediately because Firestore rules are in test mode.

### Test Workflow
1. Go to `/dashboard`
2. Navigate to any module
3. Click "Add" button
4. Fill form and submit
5. Data appears in table immediately
6. Edit/delete buttons work

## Deployment Checklist

- [ ] Code changes tested locally
- [ ] All imports updated (new module paths)
- [ ] TypeScript compiles: `npm run build`
- [ ] No console errors
- [ ] Firebase rules updated if needed
- [ ] Deploy: `firebase deploy --only "hosting,firestore"`

## File Organization Reference

```
src/
├── erp/                          ← ERP System Core
│   ├── types/index.ts            ← Data models
│   ├── services/erpService.ts    ← CRUD operations
│   ├── forms/schemas.ts          ← Zod validation
│   ├── modules/
│   │   ├── Money/                ← Financial features
│   │   ├── Studies/              ← Study tasks
│   │   ├── Work/                 ← Shift tracking
│   │   └── Admin/                ← Document tracking
│   ├── index.ts                  ← Barrel exports
│   └── README.md                 ← Architecture docs
│
├── components/
│   ├── forms/                    ← Form components
│   │   ├── MoneyTransactionForm.tsx
│   │   ├── RecurringItemForm.tsx
│   │   ├── TaskForm.tsx
│   │   ├── ShiftForm.tsx
│   │   └── DocumentForm.tsx
│   └── erp/                      ← Table components
│       ├── MonthlyBudgetTable.tsx
│       └── BillsTable.tsx
│
├── pages/
│   ├── Money/Money.tsx           ← Money module page
│   ├── Studies/Studies.tsx       ← Studies module page
│   ├── Work/Work.tsx             ← Work module page
│   └── Admin/Admin.tsx           ← Admin module page
│
└── services/
    ├── erpService.ts            ← (Legacy - can keep for compatibility)
    ├── forecastService.ts       ← Forecasting logic
    └── exportService.ts         ← CSV export
```

## Migration Notes

Old paths still work:
- `/src/types/erp.ts` → Points to `/src/erp/types/`
- `/src/services/erpService.ts` → Can be deprecated or aliased

Gradually migrate imports:
- Before: `import { Task } from '../../types/erp'`
- After: `import type { Task } from '../../erp/types'`

## Future Enhancements

- [ ] Move form components to `/src/erp/components/forms/`
- [ ] Move table components to `/src/erp/components/tables/`
- [ ] Add `/src/erp/hooks/` for shared React hooks
- [ ] Add `/src/erp/utils/` for date/currency helpers
- [ ] Create `/src/erp/hooks/useReminders.ts` moved from current location
