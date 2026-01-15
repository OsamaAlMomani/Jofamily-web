# 📁 Project Structure Documentation

**Last Updated**: January 15, 2026  
**Status**: Reorganized & Optimized  

## 🎯 Overview

The project has been reorganized with a **feature-based, scalable architecture** that separates concerns and makes it easy to find, maintain, and extend code.

---

## 📊 Folder Structure

```
jofamily-web/
│
├── 📄 Configuration Files (Root Level)
│   ├── package.json              # Dependencies & scripts
│   ├── tsconfig.json             # TypeScript configuration
│   ├── vite.config.ts            # Vite build configuration
│   ├── vitest.config.ts          # Testing configuration
│   ├── eslint.config.js          # Code linting rules
│   ├── firebase.json             # Firebase deployment config
│   └── index.html                # Main HTML entry point
│
├── 📚 Documentation (Root Level)
│   ├── README.md
│   ├── DEVELOPMENT_GUIDE.md
│   ├── TESTING_GUIDE.md
│   ├── ENVIRONMENT_SETUP.md
│   ├── TROUBLESHOOTING.md
│   ├── QUICK_REFERENCE.md
│   ├── FEATURE_IDEAS_MARKET_RESEARCH.md
│   └── PROJECT_STRUCTURE.md      # This file
│
├── 🔧 functions/                 # Firebase Cloud Functions
│   ├── src/
│   │   ├── index.ts              # Function exports
│   │   └── genkit-sample.ts      # Sample implementation
│   └── package.json
│
├── 🌐 public/                    # Static assets
│   ├── rtc-practice.html
│   └── rtc-practice.css
│
├── 🧪 test/                      # Test files (non-unit)
│   └── page.login.test.jsx       # Integration tests
│
└── 📦 src/                       # MAIN APPLICATION CODE
    │
    ├── 🎨 assets/                # Static media
    │   ├── css/
    │   │   ├── App.css
    │   │   └── index.css
    │   └── static/
    │       └── homepagelego/     # Homepage images/media
    │
    ├── 🔐 core/                  # CORE FEATURES & LOGIC
    │   ├── auth/                 # Authentication system
    │   │   ├── AuthContext.tsx   # Auth context definition
    │   │   ├── AuthProvider.tsx  # Auth provider component
    │   │   ├── authErrorMessage.ts # Error message handler
    │   │   └── index.ts          # Barrel export
    │   └── index.ts              # Re-exports all core
    │
    ├── ⚙️ config/                # CONFIGURATION & SERVICES
    │   ├── firebase/             # Firebase configuration
    │   │   ├── firebase.ts       # Firebase initialization
    │   │   └── index.ts          # Barrel export
    │   └── index.ts              # Re-exports all config
    │
    ├── 🎯 pages/                 # PAGE COMPONENTS (Full Pages)
    │   ├── Home/
    │   │   ├── Home.tsx          # Home page
    │   │   └── Home.css
    │   ├── Login/
    │   │   ├── Login.tsx         # Login page
    │   │   └── Login.css
    │   ├── CreateAcc/            # Create Account page
    │   │   ├── CreateAcc.tsx
    │   │   └── CreateAcc.css
    │   ├── Logout/
    │   │   └── Logout.tsx
    │   ├── Rooms/                # Rooms page
    │   │   ├── Rooms.tsx
    │   │   └── Rooms.css
    │   └── RTCPractice/          # RTC Practice page
    │       ├── RTCPractice.tsx
    │       ├── RTCPractice.css
    │       ├── Mic_and_Cam.tsx
    │       └── components/       # Sub-components for this page
    │           ├── RTCHeader.tsx
    │           ├── RTCVideoPanel.tsx
    │           ├── RTCSignalingWorkbench.tsx
    │           ├── RTCChatPanel.tsx
    │           ├── RTCLogsPanel.tsx
    │           └── RTCFooter.tsx
    │
    ├── 🧩 components/            # REUSABLE COMPONENTS
    │   ├── Home.tsx              # (Legacy - should be in pages)
    │   └── Home.css
    │
    ├── 🎣 hooks/                 # CUSTOM REACT HOOKS
    │   └── (To be created)       # e.g., useLocalStorage, useFetch
    │
    ├── 🔧 utils/                 # UTILITY FUNCTIONS
    │   └── (To be created)       # e.g., helpers, formatters
    │
    ├── 💾 services/              # EXTERNAL SERVICE CLIENTS
    │   └── (To be created)       # e.g., API clients, storage
    │
    ├── 📝 types/                 # TYPESCRIPT TYPES & INTERFACES
    │   └── (To be created)       # Shared type definitions
    │
    ├── ⚡ constants/             # CONSTANTS & CONFIGURATION
    │   └── (To be created)       # Routes, API endpoints, etc.
    │
    ├── 🎨 styles/               # GLOBAL STYLES
    │   ├── App.css              # App styles
    │   └── index.css            # Global styles
    │
    ├── 🔌 rtc/                  # REAL-TIME COMMUNICATION
    │   ├── id.ts
    │   ├── routing.ts
    │   ├── media/
    │   │   └── combinedStream.ts
    │   ├── webrtc/
    │   │   ├── ice.ts
    │   │   └── peerConnection.ts
    │   └── signaling/
    │       └── firestoreRooms.ts
    │
    ├── 🧪 tests/                # UNIT TESTS & UTILITIES
    │   ├── test-utils.tsx       # Custom render function
    │   ├── setup.ts             # Global test setup
    │   └── mocks/
    │       ├── auth.ts          # Auth mock scenarios
    │       ├── firebase.ts      # Firebase mock services
    │       └── router.ts        # React Router mocks
    │
    ├── App.tsx                  # Root app component
    ├── main.tsx                 # React entry point
    └── index.ts                 # (To be created) - Main export


```

---

## 📍 Folder Purposes

### `src/core/` - Core Business Logic
**What goes here**: Authentication, authorization, core features  
**Examples**: User management, auth context, user roles  
**Characteristics**: 
- Fundamental to app functionality
- Used by many other parts
- Should be stable and well-tested

### `src/config/` - Configuration & Initialization
**What goes here**: Firebase setup, environment config, third-party service setup  
**Examples**: Firebase init, API keys, database connections  
**Characteristics**:
- Runs at app startup
- Rarely changes during runtime
- Centralized for easy maintenance

### `src/pages/` - Full Page Components
**What goes here**: Components that map directly to routes  
**Examples**: Login, Home, Dashboard, Settings  
**Characteristics**:
- One per route typically
- Contains page-specific logic
- Can contain sub-components
- Usually have their own CSS file

### `src/components/` - Reusable Components
**What goes here**: Components used across multiple pages  
**Examples**: Header, Footer, Button, Modal, UserCard  
**Characteristics**:
- Generic and reusable
- No page-specific logic
- Usually take props
- Shared CSS or styled-components

### `src/hooks/` - Custom React Hooks
**What goes here**: Reusable logic hooks  
**Examples**: `useLocalStorage`, `useFetch`, `useAuth`, `useForm`  
**Characteristics**:
- Extract complex logic
- Reusable across components
- Start with `use` prefix
- Pure functions with React hooks

### `src/utils/` - Utility Functions
**What goes here**: Pure functions, helpers  
**Examples**: String formatters, date utilities, validators, calculators  
**Characteristics**:
- No side effects
- No React dependencies
- Testable
- General purpose

### `src/services/` - External Service Clients
**What goes here**: API clients, database queries, external services  
**Examples**: UserService, ChatService, NotificationService  
**Characteristics**:
- Handle external communication
- Encapsulate API details
- Can have side effects
- Database interactions

### `src/types/` - TypeScript Type Definitions
**What goes here**: Shared interfaces, types, enums  
**Examples**: User, Message, Room, AuthContext  
**Characteristics**:
- No implementation
- Shared across project
- Organized by domain

### `src/constants/` - Configuration Constants
**What goes here**: Static values, routes, API endpoints  
**Examples**: Route paths, API URLs, error codes, default values  
**Characteristics**:
- Never change at runtime
- Exported as `const`
- Easy to update in one place

### `src/styles/` - Global Styles
**What goes here**: Global CSS, CSS variables, themes  
**Examples**: Color schemes, typography, reset styles  
**Characteristics**:
- Imported in main.tsx
- Available globally
- Component-specific CSS stays with components

### `src/tests/` - Test Configuration & Utilities
**What goes here**: Test setup, mock factories, custom render functions  
**Characteristics**:
- Loaded by vitest.config.ts
- Shared mocks across all tests
- Custom render implementations

---

## 🔄 Import Patterns (NEW SIMPLIFIED IMPORTS)

### Before Reorganization ❌
```typescript
import { useAuth } from '../../auth/AuthContext';
import { authErrorMessage } from '../../auth/authErrorMessage';
import { db } from '../../firebase/firebase';
```

### After Reorganization ✅
```typescript
// Single imports from barrel exports
import { useAuth, authErrorMessage } from '../../core';
import { db } from '../../config/firebase';
```

### Barrel Export Files (index.ts)
Located in each folder to re-export contents:

- `src/core/auth/index.ts` - Exports all auth utilities
- `src/core/index.ts` - Exports all core features
- `src/config/firebase/index.ts` - Exports Firebase instances
- `src/config/index.ts` - Exports all config

---

## 📋 File Naming Conventions

### Components
- **Pascal Case**: `UserProfile.tsx`, `LoginForm.tsx`
- **With styles**: `UserProfile.tsx` + `UserProfile.css` (same folder)

### Hooks
- **Prefix with `use`**: `useAuth.ts`, `useLocalStorage.ts`
- **camelCase**: `useFormValidation.ts`

### Utilities
- **camelCase**: `formatDate.ts`, `calculateTotal.ts`
- **Descriptive names**: `stringUtils.ts`, `dateHelpers.ts`

### Types
- **PascalCase**: `User.ts`, `AuthContext.ts`
- **Suffix with Type**: `types.ts`, `interfaces.ts`

### Tests
- **Match source file**: `LoginForm.test.tsx` (same folder)
- **Or in __tests__ folder**: `__tests__/LoginForm.test.tsx`

### CSS Files
- **Same name as component**: `Button.css` for `Button.tsx`
- **Corresponding styles**: `styles/globals.css`, `styles/theme.css`

---

## 🚀 How to Add New Features

### Adding a New Page
```
1. Create folder: src/pages/NewPage/
2. Create components:
   - NewPage.tsx (main component)
   - NewPage.css (styles)
   - components/ (sub-components if needed)
3. Add route in App.tsx:
   import NewPage from './pages/NewPage/NewPage'
   <Route path="/newpage" element={<NewPage />} />
```

### Adding a Reusable Component
```
1. Create file: src/components/MyComponent.tsx
2. Create styles: src/components/MyComponent.css
3. Export from component barrel or import directly
4. Add unit tests in src/tests/ folder
```

### Adding a Custom Hook
```
1. Create file: src/hooks/useMyHook.ts
2. Export the hook
3. Can be used: import { useMyHook } from '../../hooks'
```

### Adding a Service
```
1. Create file: src/services/MyService.ts
2. Define class or functions
3. Export from services barrel
4. Use in components/pages
```

---

## 🧪 Testing Structure

```
src/tests/
├── test-utils.tsx              # Custom render() with providers
├── setup.ts                    # Global setup (jest-dom, mocks)
└── mocks/
    ├── auth.ts                 # Auth context mocks
    ├── firebase.ts             # Firebase service mocks
    └── router.ts               # React Router mocks
```

**Usage**:
```typescript
// In any .test.tsx file
import { render, screen } from '../tests/test-utils'

test('renders component', () => {
  render(<MyComponent />)
  expect(screen.getByText('Hello')).toBeInTheDocument()
})
```

---

## 📊 Module Dependency Diagram

```
pages/          → components/  (re-usable UI)
                → hooks/       (re-usable logic)
                → services/    (data/external)
                → core/        (auth, state)
                → config/      (Firebase)
                ↓
hooks/          → core/        (can use auth)
                → services/
                → utils/

services/       → config/      (Firebase client)
                → types/       (models)
                → utils/       (helpers)

components/     → hooks/
                → utils/
                → types/
                → assets/      (images)

utils/          (no dependencies except node modules)
types/          (no dependencies)
constants/      (no dependencies)
```

**Rule**: Don't import from `pages/` in other folders (unidirectional)

---

## 🎯 Best Practices

### ✅ DO
- Use barrel exports (`index.ts`) for cleaner imports
- Keep components small and focused (< 200 lines)
- Put CSS next to components
- Use TypeScript types for everything
- Test pages and critical logic
- Use custom hooks to share logic

### ❌ DON'T
- Import directly from `src/pages` in other folders
- Mix business logic with UI (use hooks/services)
- Create deeply nested folders (max 3 levels)
- Import from `node_modules` with long paths
- Leave TODO comments without context
- Commit console.logs (use debug in tests)

---

## 🔍 Quick Lookups

| Need... | Location | Import |
|---------|----------|--------|
| Use authentication | Any component | `import { useAuth } from '@/core'` |
| Access Firebase | Service/hook | `import { db, auth } from '@/config/firebase'` |
| Create new page | `src/pages/PageName/` | Set route in `App.tsx` |
| Global styles | `src/styles/` | Import in `main.tsx` |
| Type definition | `src/types/` | `import type { MyType }` |
| Format dates | `src/utils/` | `import { formatDate }` |
| Fetch data | `src/services/` | `import { UserService }` |
| Custom logic | `src/hooks/` | `import { useMyHook }` |

---

## 📈 Migration Checklist

✅ Auth moved to `src/core/auth/`  
✅ Firebase moved to `src/config/firebase/`  
✅ Barrel exports created  
✅ Import paths updated in:
  - ✅ `src/main.tsx`
  - ✅ `src/pages/Login/Login.tsx`
  - ✅ `src/pages/CreateAcc/CreateAcc.tsx`
  - ✅ `src/pages/RTCPractice/RTCPractice.tsx`
  - ✅ `src/tests/test-utils.tsx`
  - ✅ `src/tests/mocks/auth.ts`

---

## 🚀 Next Steps

1. **Ready to build**: All structure is in place
2. **Add features**: Use the template structure for new pages/components
3. **Organize existing**: Move loose components to appropriate folders
4. **Create missing**: Add services/, hooks/, utils/, types/, constants/ folders as needed
5. **Document types**: Move shared types to src/types/ with barrel export

---

## 📚 Related Documentation

- [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) - Development best practices
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - How to write tests
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Commands and snippets
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues and fixes

---

**Status**: ✅ Reorganization Complete  
**Ready for**: Build & Testing  
**Next action**: Run `npm run build`
