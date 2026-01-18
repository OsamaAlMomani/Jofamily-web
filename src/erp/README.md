# ERP System Architecture

A centralized Personal Enterprise Resource Planning (ERP) system for managing life finances, studies, work, and administrative tasks.

## Directory Structure

```
src/erp/
├── types/              # Shared TypeScript interfaces
│   └── index.ts       # Transaction, Task, Shift, Document, Category types
├── services/          # Firestore CRUD operations
│   └── erpService.ts  # Generic DB helpers + typed exports
├── forms/             # Zod validation schemas
│   └── schemas.ts     # TransactionSchema, TaskSchema, ShiftSchema, DocumentSchema
├── modules/           # Feature modules (organized by domain)
│   ├── Money/         # Financial tracking module
│   ├── Studies/       # Study task management
│   ├── Work/          # Shift tracking & income
│   └── Admin/         # Document expiry tracking
├── hooks/             # Shared React hooks (future)
├── index.ts           # Central export barrel
└── README.md          # This file
```

## Modules

### Money Module
- **Path**: `/dashboard/money`
- **Purpose**: Financial tracking, forecasting, CSV export
- **Features**:
  - Transaction CRUD
  - Recurring items (bills, salary)
  - Balance forecasting with inflation
  - Analytics & charts
  - Export to CSV

### Studies Module
- **Path**: `/dashboard/studies`
- **Purpose**: Course/assignment task management
- **Features**:
  - Task CRUD (add/edit/delete)
  - Status tracking (open/done)
  - Due date management
  - Hours estimation
  - Type classification

### Work Module
- **Path**: `/dashboard/work`
- **Purpose**: Shift tracking & income calculation
- **Features**:
  - Shift CRUD (start/end time, hourly rate)
  - Weekly hour limits
  - Income calculations
  - Weekly analytics
  - CSV export

### Admin Module
- **Path**: `/dashboard/admin`
- **Purpose**: Document expiry tracking (visa, insurance, enrollment)
- **Features**:
  - Document CRUD
  - Expiry date tracking
  - Status management
  - Days-until-expiry alerts
  - File attachment links

## Data Models

### Transaction
```typescript
{
  id: string;
  date: string;        // ISO date
  amount: number;
  type: 'income' | 'expense';
  categoryId?: string;
  notes?: string;
}
```

### Task
```typescript
{
  id: string;
  title: string;
  dueDate: string;     // ISO date
  type: 'study' | 'admin';
  estimatedHours?: number;
  done?: boolean;
}
```

### Shift
```typescript
{
  id: string;
  start: string;       // ISO datetime
  end: string;         // ISO datetime
  hourlyRate: number;
  notes?: string;
}
```

### Document
```typescript
{
  id: string;
  name: string;
  expiryDate?: string; // ISO date
  relatedTo?: 'visa' | 'insurance' | 'enrollment' | 'bank';
  status?: 'active' | 'expired' | 'pending';
  fileUrl?: string;
}
```

## Service Functions

All CRUD operations follow this pattern:

```typescript
// Get all
const items = await getTasks();

// Add
const newItem = await addTask({ title: 'Study Math', dueDate: '2026-02-01', type: 'study' });

// Update
await updateTask(id, { done: true });

// Delete
await deleteTask(id);
```

Available services:
- `getTransactions`, `addTransaction`, `updateTransaction`, `deleteTransaction`
- `getRecurringItems`, `addRecurringItem`, `updateRecurringItem`, `deleteRecurringItem`
- `getCategories`, `addCategory`, `updateCategory`, `deleteCategory`
- `getTasks`, `addTask`, `updateTask`, `deleteTask`
- `getShifts`, `addShift`, `updateShift`, `deleteShift`
- `getDocuments`, `addDocument`, `updateDocument`, `deleteDocument`

## Validation

All data is validated using Zod schemas:

```typescript
import { TaskSchema } from '../../erp/forms/schemas';

const result = TaskSchema.safeParse({
  title: 'Study Math',
  dueDate: '2026-02-01',
  type: 'study'
});

if (result.success) {
  const task = result.data;
}
```

## Styling

Each module has its own stylesheet following glassmorphism design:
- Backdrop blur effects
- RGBA backgrounds
- Subtle shadows
- Purple/blue gradients
- Interactive hover states

## Hidden Features (Optional)

Future expandable features:
- Budget limits per category
- Recurring task templates
- Mobile app sync
- Reminders & notifications
- Data export/import
- Multi-user access
- API integrations (bank sync, calendar, etc.)

## Usage Example

```typescript
import { getTasks, addTask, updateTask } from '../../erp/services';
import type { Task } from '../../erp/types';

function MyComponent() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    (async () => {
      const data = await getTasks();
      setTasks(data);
    })();
  }, []);

  const handleAdd = async () => {
    await addTask({
      title: 'New task',
      dueDate: '2026-02-15',
      type: 'study'
    });
    const updated = await getTasks();
    setTasks(updated);
  };

  return (/* JSX */);
}
```

## Deployment

Test/Dev:
```bash
firebase deploy --only firestore
```

Production:
```bash
npm run build
firebase deploy --only "hosting,firestore"
```

## Security Rules

Currently in **test mode** (allow all):
```plaintext
match /{document=**} {
  allow read, write: if true;
}
```

Switch to production rules when ready (in `firestore.rules`).
