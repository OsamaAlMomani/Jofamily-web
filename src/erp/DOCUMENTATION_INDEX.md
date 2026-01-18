# 📚 ERP System - Complete Documentation Index

## 🎯 Start Here

**New to the ERP system?** Start with these files in order:

1. **[SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md)** ← You are here
   - Visual folder structure
   - Module status
   - Quick reference

2. **[README.md](./README.md)**
   - Architecture details
   - Data models
   - Service functions

3. **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)**
   - How to add features
   - Common tasks
   - Code examples

4. **[ARCHITECTURE_MAP.md](./ARCHITECTURE_MAP.md)**
   - Detailed mapping
   - Import guidelines
   - Common operations

---

## 📁 Directory Organization

```
src/erp/
├── 📘 Documentation (YOU ARE HERE)
│   ├── 📄 README.md              ← Architecture overview
│   ├── 📄 SYSTEM_OVERVIEW.md     ← Visual guide
│   ├── 📄 DEVELOPER_GUIDE.md     ← Feature development
│   ├── 📄 ARCHITECTURE_MAP.md    ← Reference map
│   └── 📄 DOCUMENTATION_INDEX.md ← This file
│
├── 🔧 Core System
│   ├── 📄 index.ts               ← Central exports
│   ├── types/                    ← Data models
│   ├── services/                 ← CRUD operations
│   └── forms/                    ← Validation schemas
│
├── 🎨 Feature Modules
│   ├── Money/                    ← 💰 Financial
│   ├── Studies/                  ← 📚 Studies
│   ├── Work/                     ← 💼 Shifts
│   └── Admin/                    ← 📋 Documents
```

---

## 🚀 Quick Start

### I want to...

#### **Add a new task to Studies**
```typescript
import { addTask } from '../../erp/services'

const task = await addTask({
  title: 'Study Chapter 5',
  dueDate: '2026-02-20',
  type: 'study',
  estimatedHours: 3
})
```
👉 See: [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md#creating-a-new-task)

#### **Understand the data models**
👉 See: [README.md](./README.md#data-models)

#### **Create a new feature module**
👉 See: [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md#adding-a-new-feature)

#### **See all available services**
👉 See: [README.md](./README.md#service-functions)

#### **Validate form data**
👉 See: [README.md](./README.md#validation)

#### **Find import paths**
👉 See: [ARCHITECTURE_MAP.md](./ARCHITECTURE_MAP.md#importing-guidelines)

---

## 📊 Module Reference

### Money Module 💰
- **Route**: `/dashboard/money`
- **File**: `src/pages/Money/Money.tsx`
- **Features**: Transactions, recurring items, forecasting, CSV export
- **Docs**: [DEVELOPER_GUIDE.md#money-module](./DEVELOPER_GUIDE.md)

### Studies Module 📚
- **Route**: `/dashboard/studies`
- **File**: `src/pages/Studies/Studies.tsx`
- **Features**: Task CRUD, status tracking, due dates, analytics
- **Docs**: [DEVELOPER_GUIDE.md#studies-module](./DEVELOPER_GUIDE.md)

### Work Module 💼
- **Route**: `/dashboard/work`
- **File**: `src/pages/Work/Work.tsx`
- **Features**: Shift CRUD, income calculation, weekly limits
- **Docs**: [DEVELOPER_GUIDE.md#work-module](./DEVELOPER_GUIDE.md)

### Admin Module 📋
- **Route**: `/dashboard/admin`
- **File**: `src/pages/Admin/Admin.tsx`
- **Features**: Document CRUD, expiry tracking, file links
- **Docs**: [DEVELOPER_GUIDE.md#admin-module](./DEVELOPER_GUIDE.md)

---

## 🔑 Key Concepts

### Types
Located in: `src/erp/types/index.ts`

```typescript
Transaction   // Income/expense records
RecurringItem // Bills, salary, recurring expenses
Task          // Study tasks
Shift         // Work shifts
Document      // Visa, insurance, enrollment docs
Category      // For grouping transactions
```

### Services
Located in: `src/erp/services/erpService.ts`

Pattern: `get*()`, `add*()`, `update*()`, `delete*()`

Example:
```typescript
getTasks()        // Get all tasks
addTask(data)     // Create new task
updateTask(id, data)  // Update task
deleteTask(id)    // Delete task
```

### Validation
Located in: `src/erp/forms/schemas.ts`

All Zod schemas for type safety:
```typescript
TaskSchema.safeParse(data)  // Validate before submit
```

---

## 🎨 Styling Guide

All modules use **glassmorphism** design:

```css
/* Glass container */
.module-container {
  background: radial-gradient(...);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  box-shadow: subtle shadow;
}

/* Buttons */
.btn-primary   { purple gradient + hover animation }
.btn-secondary { white glass + hover }
.btn-danger    { red gradient }

/* Tables */
.module-table { glass header + hover effects }
```

Reference file: `src/pages/Studies/Studies.css`

---

## 🔐 Security

**Current Mode**: TEST (allow all)
- Location: `firestore.rules`
- For development and testing

**Production Mode**: Admin-only
- Uncomment production rules in `firestore.rules`
- Deploy: `firebase deploy --only firestore`

See: [firestore.rules](../../firestore.rules)

---

## 📦 Firestore Collections

```
transactions/      ← Money transactions
recurring_items/   ← Bills, salary
categories/        ← Money categories
tasks/             ← Study tasks
shifts/            ← Work shifts
documents/         ← Admin docs
```

---

## 🚀 Deployment

### Development
```bash
npm run build
firebase deploy --only hosting
```

### Production
```bash
npm run build
firebase deploy --only "hosting,firestore"
```

### Check Status
- Firebase Console: https://console.firebase.google.com/project/jofamily-acc6c
- Live Site: https://jofamily-acc6c.web.app

---

## 📞 Common Issues

### "Can't find module `erp/types`"
**Solution**: Update import path to `../../erp/types` or use barrel export: `import { /* ... */ } from '../../erp'`

### Form validation fails
**Solution**: Check Zod schema in `src/erp/forms/schemas.ts` - ensure all required fields have values

### Data not saving
**Solution**: Check Firestore rules in `firestore.rules` - ensure in TEST mode for development

### Can't find form component
**Solution**: Components in `src/components/forms/` - import and use in pages

---

## 🔄 Migration From Old Structure

**Old paths** (deprecated but still work):
```typescript
import type { Task } from '../../types/erp'
import { getTasks } from '../../services/erpService'
```

**New paths** (recommended):
```typescript
import type { Task } from '../../erp/types'
import { getTasks } from '../../erp/services'
```

Gradually migrate as you update files.

---

## 📋 Checklist for Adding Features

- [ ] Update type in `src/erp/types/index.ts`
- [ ] Update schema in `src/erp/forms/schemas.ts`
- [ ] Create form component if needed
- [ ] Update module page component
- [ ] Add styling (glassmorphism)
- [ ] Test CRUD operations
- [ ] Run: `npm run build`
- [ ] Deploy: `firebase deploy --only hosting`

---

## 🎓 Learning Resources

- **TypeScript**: Understand the type system
- **React Hooks**: useState, useEffect, useMemo
- **Zod**: Schema validation library
- **Firebase**: Firestore for database
- **CSS**: Glassmorphism design patterns

---

## 📞 Support

For questions about:
- **Architecture**: See [README.md](./README.md)
- **Development**: See [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- **Imports**: See [ARCHITECTURE_MAP.md](./ARCHITECTURE_MAP.md)
- **Features**: See module documentation
- **Styling**: See `src/pages/Studies/Studies.css`

---

## 🎉 Summary

✅ **ERP System is fully organized!**

- Clean folder structure
- Clear separation of concerns
- Comprehensive documentation
- Ready for development
- Scalable architecture

**Next steps**:
1. Read [README.md](./README.md)
2. Pick a module to enhance
3. Follow [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
4. Build awesome features! 🚀

---

**Last Updated**: January 18, 2026
**Status**: ✅ Production Ready
