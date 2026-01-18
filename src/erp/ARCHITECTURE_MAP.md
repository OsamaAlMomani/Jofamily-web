/**
 * ERP SYSTEM ARCHITECTURE MAP
 * 
 * All ERP code is now organized in /src/erp/ with clear folder structure
 * Each folder represents a logical domain/module
 */

// ============================================================================
// CORE TYPES
// ============================================================================
// Path: src/erp/types/index.ts
// Contents: Transaction, RecurringItem, Task, Shift, Document, Category
// Usage: import type { Task, Transaction } from '../../erp/types'

// ============================================================================
// SERVICES (Firestore CRUD)
// ============================================================================
// Path: src/erp/services/erpService.ts
// Functions:
//   - getTransactions(), addTransaction(), updateTransaction(), deleteTransaction()
//   - getRecurringItems(), addRecurringItem(), ...
//   - getTasks(), addTask(), ...
//   - getShifts(), addShift(), ...
//   - getDocuments(), addDocument(), ...
// Usage: import { getTasks, addTask } from '../../erp/services'

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================
// Path: src/erp/forms/schemas.ts
// Schemas: TransactionSchema, RecurringItemSchema, TaskSchema, ShiftSchema, DocumentSchema
// Usage: import { TaskSchema } from '../../erp/forms'

// ============================================================================
// MODULE: MONEY (Financial Tracking)
// ============================================================================
// Path: src/erp/modules/Money/
// Location: src/pages/Money/Money.tsx
// Route: /dashboard/money
// Components:
//   - MoneyTransactionForm
//   - RecurringItemForm
//   - MonthlyBudgetTable
//   - BillsTable
// Services: generateBalanceForecast(), exportForecastCSV()
// Features:
//   ✓ Add/edit/delete transactions
//   ✓ Recurring bills & income
//   ✓ Balance forecasting
//   ✓ Analytics (net cash flow, burn rate, savings rate)
//   ✓ Charts (AreaChart, BarChart)
//   ✓ CSV export

// ============================================================================
// MODULE: STUDIES (Task Management)
// ============================================================================
// Path: src/erp/modules/Studies/
// Location: src/pages/Studies/Studies.tsx
// Route: /dashboard/studies
// Components:
//   - TaskForm
// Features:
//   ✓ Add/edit/delete tasks
//   ✓ Mark done/undo
//   ✓ Due date tracking
//   ✓ Hours estimation
//   ✓ Analytics (open tasks, planned hours)
//   ✓ Chart by task type (BarChart)

// ============================================================================
// MODULE: WORK (Shift Tracking)
// ============================================================================
// Path: src/erp/modules/Work/
// Location: src/pages/Work/Work.tsx
// Route: /dashboard/work
// Components:
//   - ShiftForm
// Features:
//   ✓ Add/edit/delete shifts
//   ✓ Start/end datetime
//   ✓ Hourly rate & income calculation
//   ✓ Weekly hour limit tracking (compliance)
//   ✓ Analytics (total hours, total income, this week)
//   ✓ Chart by week (BarChart)

// ============================================================================
// MODULE: ADMIN (Document Management)
// ============================================================================
// Path: src/erp/modules/Admin/
// Location: src/pages/Admin/Admin.tsx
// Route: /dashboard/admin
// Components:
//   - DocumentForm
// Features:
//   ✓ Add/edit/delete documents
//   ✓ Expiry tracking
//   ✓ Status management (active/expired/pending)
//   ✓ File attachment links
//   ✓ Days-until-expiry alerts
//   ✓ Analytics (total docs, expiring ≤30d, expired)

// ============================================================================
// STYLING (Glassmorphism)
// ============================================================================
// Reference: src/pages/Studies/Studies.css
// Classes:
//   - .studies-container    - Glass background, radial gradient
//   - .studies-table        - Glassmorphic table with hover
//   - .btn-primary          - Purple gradient, smooth hover
//   - .btn-secondary        - White glass button
//   - .btn-danger           - Red gradient delete button
//   - .modal-overlay        - Blurred dark overlay
//   - .modal-content        - Glass modal panel
//   - .form-group           - Form field styling
//   - .badge-done/.badge-open - Status indicators

// ============================================================================
// ROUTING
// ============================================================================
// Location: src/App.tsx
// Protected routes (requires login):
//   /dashboard                ← Overview dashboard
//   /dashboard/money          ← Financial tracking
//   /dashboard/studies        ← Study tasks
//   /dashboard/work          ← Work shifts
//   /dashboard/admin         ← Document management

// ============================================================================
// SECURITY (Firestore Rules)
// ============================================================================
// Location: firestore.rules
// Mode: TEST (allow all for development)
// Switch to production: Uncomment admin-only rules, comment test rules

// ============================================================================
// IMPORTING GUIDELINES
// ============================================================================

// ✓ DO: Use new ERP paths
// import type { Task } from '../../erp/types'
// import { getTasks, addTask } from '../../erp/services'
// import { TaskSchema } from '../../erp/forms'

// ✓ DO: Import from module index
// import { TaskForm } from '../../erp/modules/Studies'

// ✗ DON'T: Mix old and new paths
// import type { Task } from '../../types/erp'           (old - deprecated)
// import { getTasks } from '../../services/erpService'  (old - deprecated)

// ============================================================================
// KEY FILES
// ============================================================================
// ERP architecture docs:
//   - src/erp/README.md            ← Architecture overview
//   - src/erp/DEVELOPER_GUIDE.md   ← How to add features
//   - src/erp/index.ts             ← Central exports

// Entry points:
//   - src/pages/Money/Money.tsx
//   - src/pages/Studies/Studies.tsx
//   - src/pages/Work/Work.tsx
//   - src/pages/Admin/Admin.tsx

// ============================================================================
// COMMON OPERATIONS
// ============================================================================

// Add new task
// import { addTask } from '../../erp/services'
// const task = await addTask({
//   title: 'Study Math',
//   dueDate: '2026-02-15',
//   type: 'study',
//   estimatedHours: 3
// })

// Update task
// import { updateTask } from '../../erp/services'
// await updateTask(taskId, { done: true })

// Delete task
// import { deleteTask } from '../../erp/services'
// await deleteTask(taskId)

// Validate before submit
// import { TaskSchema } from '../../erp/forms'
// const result = TaskSchema.safeParse(formData)
// if (result.success) { await addTask(result.data) }

// ============================================================================
