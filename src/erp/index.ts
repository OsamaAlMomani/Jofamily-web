/**
 * ERP System - Centralized Personal Enterprise Resource Planning
 * 
 * Structure:
 * /src/erp/
 *   ├── types/          - Shared data models (Transaction, Task, Shift, Document, etc.)
 *   ├── services/       - Firestore CRUD operations and business logic
 *   ├── forms/          - Zod schemas and form validation
 *   ├── modules/        - Feature modules (Money, Studies, Work, Admin)
 *   │   ├── Money/      - Financial tracking, transactions, forecasting
 *   │   ├── Studies/    - Task management for studies/courses
 *   │   ├── Work/       - Shift tracking and income calculation
 *   │   └── Admin/      - Document expiry tracking, visa management
 *   └── hooks/          - Custom React hooks (useReminders, etc.)
 * 
 * Usage:
 * - Import types: import type { Task, Transaction, Shift } from '../../erp/types'
 * - Import services: import { getTasks, addTask } from '../../erp/services'
 * - Import forms: import { TaskSchema } from '../../erp/forms'
 * - Import hooks: import { useReminders } from '../../erp/hooks'
 */

export * from './types';
export * from './services/erpService';
export * from './forms/schemas';
