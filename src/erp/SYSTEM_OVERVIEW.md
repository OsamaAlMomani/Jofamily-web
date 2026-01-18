# 🏗️ ERP System - Complete Organization

## Folder Structure

```
src/erp/                              ← All ERP code centralized here
│
├── 📄 index.ts                       ← Central barrel exports
├── 📄 README.md                      ← Architecture overview
├── 📄 DEVELOPER_GUIDE.md             ← How to build features
├── 📄 ARCHITECTURE_MAP.md            ← Quick reference
│
├── types/                            ← Shared TypeScript models
│   └── 📄 index.ts
│       - Transaction, RecurringItem
│       - Task, Shift, Document
│       - Category, ForecastResult
│
├── services/                         ← Firestore CRUD layer
│   └── 📄 erpService.ts
│       - getTransactions, addTransaction, updateTransaction, deleteTransaction
│       - getRecurringItems, addRecurringItem, ...
│       - getTasks, addTask, ...
│       - getShifts, addShift, ...
│       - getDocuments, addDocument, ...
│
├── forms/                            ← Zod validation schemas
│   └── 📄 schemas.ts
│       - TransactionSchema
│       - RecurringItemSchema
│       - TaskSchema
│       - ShiftSchema
│       - DocumentSchema
│       - CategorySchema
│
└── modules/                          ← Feature modules by domain
    │
    ├── Money/                        ← 💰 Financial Tracking
    │   ├── 📄 index.ts (exports)
    │   └── 📖 See: src/pages/Money/Money.tsx
    │       Features:
    │       ✓ Transactions (income/expense)
    │       ✓ Recurring items (bills, salary)
    │       ✓ Balance forecasting
    │       ✓ Analytics & charts
    │       ✓ CSV export
    │
    ├── Studies/                      ← 📚 Study Task Management
    │   ├── 📄 index.ts (exports)
    │   └── 📖 See: src/pages/Studies/Studies.tsx
    │       Features:
    │       ✓ Task CRUD
    │       ✓ Status tracking (open/done)
    │       ✓ Due dates
    │       ✓ Hours estimation
    │       ✓ Analytics by type
    │
    ├── Work/                         ← 💼 Shift Tracking
    │   ├── 📄 index.ts (exports)
    │   └── 📖 See: src/pages/Work/Work.tsx
    │       Features:
    │       ✓ Shift CRUD
    │       ✓ Start/end datetime
    │       ✓ Hourly rate & income
    │       ✓ Weekly limits (compliance)
    │       ✓ Analytics & charts
    │
    └── Admin/                        ← 📋 Document Management
        ├── 📄 index.ts (exports)
        └── 📖 See: src/pages/Admin/Admin.tsx
            Features:
            ✓ Document CRUD
            ✓ Expiry tracking
            ✓ Status management
            ✓ File links
            ✓ Alert system

```

## Module Status

| Module | Route | CRUD | Forms | Analytics | Export | Status |
|--------|-------|------|-------|-----------|--------|--------|
| **Money** | `/dashboard/money` | ✅ | ✅ | ✅ | ✅ | 🟢 Complete |
| **Studies** | `/dashboard/studies` | ✅ | ✅ | ✅ | ❌ | 🟢 Complete |
| **Work** | `/dashboard/work` | ✅ | ✅ | ✅ | ❌ | 🟢 Complete |
| **Admin** | `/dashboard/admin` | ✅ | ✅ | ✅ | ❌ | 🟢 Complete |

## Quick Import Reference

### Get Data
```typescript
import { getTasks, getTransactions, getShifts, getDocuments } from '../../erp/services'
```

### Add/Edit/Delete
```typescript
import { addTask, updateTask, deleteTask } from '../../erp/services'
```

### Types
```typescript
import type { Task, Transaction, Shift, Document } from '../../erp/types'
```

### Validation
```typescript
import { TaskSchema, TransactionSchema } from '../../erp/forms'
```

### Module Components
```typescript
import { TaskForm } from '../../erp/modules/Studies'
import { ShiftForm } from '../../erp/modules/Work'
import { DocumentForm } from '../../erp/modules/Admin'
```

## Routes & Permissions

| Path | Component | Auth Required | Admin Only |
|------|-----------|---|---|
| `/dashboard` | Dashboard | ✅ | ❌ |
| `/dashboard/money` | Money.tsx | ✅ | ❌ |
| `/dashboard/studies` | Studies.tsx | ✅ | ❌ |
| `/dashboard/work` | Work.tsx | ✅ | ❌ |
| `/dashboard/admin` | Admin.tsx | ✅ | ❌ |

**Note**: "Admin Only" disabled - all authenticated users can access

## Firestore Collections

```
Database (jofamily-acc6c)
├── transactions/          ← Money transactions
├── recurring_items/       ← Bills, salary, recurring expenses
├── categories/            ← Money categories
├── tasks/                 ← Study tasks
├── shifts/                ← Work shifts
└── documents/             ← Admin documents (visa, insurance, etc.)
```

**Security**: Currently in TEST mode (allow all)

## Design System

### Colors
- **Primary**: Purple gradient (#667eea → #764ba2)
- **Secondary**: White glass (rgba(255,255,255,0.7))
- **Danger**: Red gradient
- **Background**: Radial gradient + blur

### Components
- Glass cards with backdrop-filter blur
- Smooth hover animations
- Purple/blue gradients
- Subtle shadows
- 16px border radius

## Hidden Features (Expandable)

These don't have UI yet but can be added:
- Budget limits per category
- Recurring task templates
- Mobile app sync
- Reminders & notifications
- Data import/export
- Multi-user access
- Bank account sync
- Calendar integration

## Deployment

```bash
# Development
npm run build
firebase deploy --only "hosting"

# Production with rules
firebase deploy --only "hosting,firestore"
```

## File Locations Reference

| Purpose | Path |
|---------|------|
| Types | `src/erp/types/index.ts` |
| Services | `src/erp/services/erpService.ts` |
| Schemas | `src/erp/forms/schemas.ts` |
| Money page | `src/pages/Money/Money.tsx` |
| Studies page | `src/pages/Studies/Studies.tsx` |
| Work page | `src/pages/Work/Work.tsx` |
| Admin page | `src/pages/Admin/Admin.tsx` |
| Money forms | `src/components/forms/MoneyTransactionForm.tsx`, `RecurringItemForm.tsx` |
| Studies form | `src/components/forms/TaskForm.tsx` |
| Work form | `src/components/forms/ShiftForm.tsx` |
| Admin form | `src/components/forms/DocumentForm.tsx` |
| Styling | `src/pages/Studies/Studies.css` (template) |

---

**Status**: ✅ ERP System fully organized and ready for development

**Last Updated**: January 18, 2026
