# 📋 JoFamily Web - Development Guidelines & Best Practices

## Project Structure Overview

```
jofamily-web/
├── src/
│   ├── assets/              # Static assets (images, fonts, etc.)
│   ├── auth/                # Authentication logic
│   │   ├── AuthContext.tsx
│   │   ├── AuthProvider.tsx
│   │   └── authErrorMessage.ts
│   ├── components/          # Reusable React components
│   ├── firebase/            # Firebase configuration
│   ├── pages/               # Page components (routing)
│   ├── styles/              # Global styles
│   ├── tests/               # Test utilities & setup
│   │   ├── mocks/           # Mock implementations
│   │   │   ├── auth.ts
│   │   │   ├── firebase.ts
│   │   │   └── router.ts
│   │   ├── setup.ts         # Global test setup
│   │   └── test-utils.tsx   # Custom render functions
│   ├── App.tsx
│   └── main.tsx
├── test/                    # Integration & feature tests
├── functions/               # Firebase Cloud Functions
├── public/                  # Public static files
├── vitest.config.ts         # Vitest configuration
├── vite.config.ts           # Vite configuration
└── tsconfig.json            # TypeScript configuration
```

## Quick Start

### 1. Environment Setup

```bash
# Clone the repository
git clone <repo-url>
cd jofamily-web

# Install dependencies
npm install

# Create .env file from template
cp .env.example .env

# Add your Firebase credentials to .env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
# ... etc
```

### 2. Development Server

```bash
# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### 3. Testing

```bash
# Run tests in watch mode
npm test

# Run tests once
npm test -- --run

# Visual test dashboard
npm test -- --ui

# Coverage report
npm test -- --coverage
```

## Testing Architecture

### Overview

The testing infrastructure is organized for maximum efficiency and reusability:

```
src/tests/
├── setup.ts                 # Global test setup (runs before all tests)
├── test-utils.tsx          # Custom render() with providers
└── mocks/
    ├── auth.ts             # Auth context mocks
    ├── firebase.ts         # Firebase service mocks
    └── router.ts           # React Router mocks
```

### Custom Render Function

The `render()` function automatically wraps components with required providers:

```typescript
// Instead of:
render(
  <BrowserRouter>
    <AuthContext.Provider value={authContext}>
      <MyComponent />
    </AuthContext.Provider>
  </BrowserRouter>
);

// Use:
import { render } from '../src/tests/test-utils';
render(<MyComponent />);
```

### Auth Mock Scenarios

Pre-built auth context scenarios for common testing situations:

```typescript
import { authMockScenarios } from '../src/tests/mocks/auth';

// Authenticated user
render(<Login />, {
  authContextValue: authMockScenarios.authenticated()
});

// Unauthenticated user
render(<Login />, {
  authContextValue: authMockScenarios.unauthenticated()
});

// Loading state
render(<Login />, {
  authContextValue: authMockScenarios.loading()
});

// Login error
render(<Login />, {
  authContextValue: authMockScenarios.loginError()
});
```

## Code Organization Principles

### 1. Feature-Based Directory Structure

Group related code by feature, not by type:

```
❌ AVOID (By type):
src/
├── components/
│   ├── LoginForm.tsx
│   └── RegisterForm.tsx
├── pages/
│   ├── LoginPage.tsx
│   └── RegisterPage.tsx

✅ PREFER (By feature):
src/pages/
├── Login/
│   ├── Login.tsx
│   ├── Login.css
│   └── useLoginForm.ts
├── Register/
│   ├── Register.tsx
│   ├── Register.css
│   └── useRegisterForm.ts
```

### 2. Component File Naming

- **Pages**: `ComponentName/ComponentName.tsx`
- **Components**: `components/ComponentName.tsx`
- **Styles**: Co-locate with component (`.tsx` and `.css` together)
- **Tests**: `test/ComponentName.test.tsx`

### 3. Export Patterns

```typescript
// ✅ GOOD: Default export for pages
// pages/Login/Login.tsx
export default function Login() { ... }

// Use: import Login from 'pages/Login/Login'

// ✅ GOOD: Named exports for utilities
// utils/helpers.ts
export function validateEmail(email: string) { ... }
export function formatDate(date: Date) { ... }

// Use: import { validateEmail, formatDate } from 'utils/helpers'
```

## Testing Best Practices

### 1. Test Structure (AAA Pattern)

```typescript
test('should do something specific', async () => {
  // ARRANGE - Setup test data and render component
  const user = userEvent.setup();
  render(<Component />);
  const button = screen.getByRole('button');

  // ACT - Perform user interactions
  await user.click(button);

  // ASSERT - Verify expected outcome
  expect(button).toHaveBeenClicked();
});
```

### 2. Query Priority

Always use this order when finding elements:

1. **getByRole** (matches accessibility tree)
   ```typescript
   screen.getByRole('button', { name: /submit/i })
   screen.getByRole('textbox', { name: /email/i })
   ```

2. **getByLabelText** (for form inputs)
   ```typescript
   screen.getByLabelText(/email/i)
   ```

3. **getByPlaceholderText** (fallback)
   ```typescript
   screen.getByPlaceholderText(/enter email/i)
   ```

4. **getByText** (for text content)
   ```typescript
   screen.getByText(/welcome/i)
   ```

5. **getByTestId** (last resort)
   ```typescript
   screen.getByTestId('login-form')
   ```

### 3. User Interactions

**Use `userEvent` instead of `fireEvent`** (more realistic simulation):

```typescript
// ✅ GOOD
const user = userEvent.setup();
await user.type(emailInput, 'test@example.com');
await user.click(submitButton);

// ❌ AVOID
fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
fireEvent.click(submitButton);
```

### 4. Async Testing

Always use `waitFor` for async operations:

```typescript
// For async state changes
await waitFor(() => {
  expect(screen.getByText(/success/i)).toBeInTheDocument();
});

// Or use findBy (shorthand for getBy + waitFor)
const successMessage = await screen.findByText(/success/i);
expect(successMessage).toBeInTheDocument();
```

### 5. Mocking Best Practices

```typescript
// ✅ GOOD: Mock at module level
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
}));

// ✅ GOOD: Clear mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});

// ❌ AVOID: Mocking implementation details
// ❌ AVOID: Over-mocking (mock only external dependencies)
```

## Firebase Integration

### Environment Variables

Create `.env` file with Firebase config:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Firebase Usage

```typescript
// Authentication
import { useAuth } from 'src/auth/AuthContext';

function MyComponent() {
  const { user, loginWithEmail, logout } = useAuth();

  return (
    <>
      {user ? (
        <>
          <p>Welcome, {user.email}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={() => loginWithEmail(email, password)}>
          Login
        </button>
      )}
    </>
  );
}
```

## Type Safety

### TypeScript Best Practices

```typescript
// ✅ GOOD: Explicit types
interface LoginFormData {
  email: string;
  password: string;
}

function handleLogin(data: LoginFormData): void {
  // ...
}

// ✅ GOOD: Type your component props
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export default function Button({ label, onClick, disabled }: ButtonProps) {
  // ...
}

// ❌ AVOID: Using any
function handleData(data: any) { // Don't do this!
}
```

## Performance Optimization

### 1. Code Splitting

Use lazy loading for routes:

```typescript
import { lazy, Suspense } from 'react';

const Login = lazy(() => import('pages/Login/Login'));
const Register = lazy(() => import('pages/Register/Register'));

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Suspense>
  );
}
```

### 2. React.memo for Components

```typescript
interface CardProps {
  title: string;
  content: string;
}

export default React.memo(function Card({ title, content }: CardProps) {
  return (
    <div>
      <h2>{title}</h2>
      <p>{content}</p>
    </div>
  );
});
```

## Common Pitfalls & Solutions

### Problem: "useNavigate() may be used only in the context of a <Router> component"

**Solution**: Use the custom `render()` function that wraps components with `BrowserRouter`:

```typescript
import { render } from '../src/tests/test-utils';

test('my test', () => {
  render(<Login />); // ✓ Already wrapped with BrowserRouter
});
```

### Problem: "useAuth must be used within <AuthProvider>"

**Solution**: Pass `authContextValue` to `render()`:

```typescript
render(<MyComponent />, {
  authContextValue: authMockScenarios.authenticated()
});
```

### Problem: Test timeout or async issues

**Solution**: Always await user interactions:

```typescript
const user = userEvent.setup();
await user.click(button);  // ✓ Don't forget await
await user.type(input, 'text');
```

### Problem: "Element not found" in tests

**Solution**: Use `screen.debug()` to see what's actually rendered:

```typescript
render(<Component />);
screen.debug(); // Prints all rendered HTML
```

## Debugging

### 1. Visual Test Dashboard

```bash
npm test -- --ui
# Opens http://localhost:51204
```

### 2. Debug Component Rendering

```typescript
const { debug } = render(<Component />);
debug();  // Print full HTML
debug(screen.getByRole('button')); // Print specific element
```

### 3. Testing Playground

```typescript
screen.logTestingPlaygroundURL(); // Generates a testing playground URL
```

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview build locally
npm run lint             # Run ESLint

# Testing
npm test                 # Run tests (watch mode)
npm test -- --run        # Run once
npm test -- --ui         # Visual dashboard
npm test -- --coverage   # Coverage report
npm test [filename]      # Run specific test file

# Build & Deploy
npm run build            # Creates dist/ folder
```

## Resources

- **Vitest**: https://vitest.dev/guide/
- **React Testing Library**: https://testing-library.com/react
- **Firebase Docs**: https://firebase.google.com/docs
- **React Router**: https://reactrouter.com/
- **TypeScript**: https://www.typescriptlang.org/docs/

## Contributing

When adding new features:

1. Create feature branch: `git checkout -b feature/my-feature`
2. Write tests first (TDD approach)
3. Implement feature
4. Ensure all tests pass: `npm test -- --run`
5. Check types: `npx tsc --noEmit`
6. Commit with clear message
7. Create pull request

## Support

For issues or questions:
- Check existing issues on GitHub
- Create detailed bug reports with reproduction steps
- Include error messages and console logs
