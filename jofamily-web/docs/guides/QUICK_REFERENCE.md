# Quick Reference - JoFamily Web

## Essential Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:5173)
npm run build            # Create production build
npm run preview          # Preview production locally

# Testing
npm test                 # Run tests (watch mode)
npm test -- --run        # Run tests once
npm test -- --ui         # Visual test dashboard
npm test -- --coverage   # Coverage report

# Code Quality
npm run lint             # Run ESLint
```

## File Locations

| Component | Location |
|-----------|----------|
| Login Page | `src/pages/Login/Login.tsx` |
| Auth Context | `src/auth/AuthContext.tsx` |
| Test Utilities | `src/tests/test-utils.tsx` |
| Auth Mocks | `src/tests/mocks/auth.ts` |
| Firebase Config | `src/firebase/firebase.ts` |
| Test Example | `test/page.login.test.new.jsx` |

## Test Template

```typescript
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../src/tests/test-utils';
import { authMockScenarios } from '../src/tests/mocks/auth';

describe('Component Name', () => {
  it('should do something', async () => {
    render(<Component />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle user input', async () => {
    const user = userEvent.setup();
    render(<Component />);
    
    await user.click(screen.getByRole('button'));
    expect(screen.getByText(/success/i)).toBeInTheDocument();
  });
});
```

## Common Queries

```typescript
// Find by accessibility role (PREFERRED)
screen.getByRole('button', { name: /submit/i })
screen.getByRole('textbox')
screen.getByRole('heading', { level: 1 })

// Find by label text (for forms)
screen.getByLabelText(/email/i)
screen.getByLabelText(/password/i)

// Find by text content
screen.getByText(/welcome/i)
screen.getByText(/logged in/i)

// Find by placeholder
screen.getByPlaceholderText(/enter email/i)

// Wait for element
await screen.findByText(/loading complete/i)
```

## User Interactions

```typescript
const user = userEvent.setup();

// Type text
await user.type(emailInput, 'test@example.com');

// Click button
await user.click(submitButton);

// Clear input
await user.clear(input);

// Keyboard shortcuts
await user.keyboard('{Enter}');
await user.keyboard('{Escape}');

// Tab navigation
await user.tab();
await user.tab({ shift: true }); // Shift+Tab
```

## Auth Mock Scenarios

```typescript
// Authenticated user (default)
render(<Component />);

// Unauthenticated
render(<Component />, {
  authContextValue: authMockScenarios.unauthenticated()
});

// Loading state
render(<Component />, {
  authContextValue: authMockScenarios.loading()
});

// Login error
render(<Component />, {
  authContextValue: authMockScenarios.loginError()
});
```

## Assertions

```typescript
// Element presence
expect(element).toBeInTheDocument();
expect(element).not.toBeInTheDocument();

// Element state
expect(button).toBeDisabled();
expect(button).toBeEnabled();
expect(button).toHaveClass('active');

// Input values
expect(input).toHaveValue('text');
expect(input).toHaveAttribute('type', 'email');

// Text content
expect(element).toHaveTextContent(/some text/i);
expect(element).toHaveTextContent(/regex/);

// Visibility
expect(element).toBeVisible();
expect(element).not.toBeVisible();

// Mock calls
expect(mockFunction).toHaveBeenCalled();
expect(mockFunction).toHaveBeenCalledWith('arg');
expect(mockFunction).toHaveBeenCalledTimes(1);
```

## Async Operations

```typescript
// Wait for element to appear
const element = await screen.findByText(/appears later/i);

// Wait for condition
await waitFor(() => {
  expect(screen.getByText(/success/i)).toBeInTheDocument();
});

// With custom timeout
await waitFor(
  () => {
    expect(data).toBeDefined();
  },
  { timeout: 5000 }
);
```

## Project Structure Tips

### Add New Page

```typescript
// src/pages/MyPage/MyPage.tsx
export default function MyPage() {
  return <div>My Page</div>;
}

// src/pages/MyPage/MyPage.css
/* Styles here */

// test/page.mypage.test.tsx
import { render } from '../src/tests/test-utils';
import MyPage from '../src/pages/MyPage/MyPage';

describe('MyPage', () => {
  it('renders', () => {
    render(<MyPage />);
    expect(screen.getByText(/my page/i)).toBeInTheDocument();
  });
});
```

### Add New Component

```typescript
// src/components/MyComponent.tsx
interface MyComponentProps {
  title: string;
  onClick: () => void;
}

export default function MyComponent({ title, onClick }: MyComponentProps) {
  return <button onClick={onClick}>{title}</button>;
}
```

### Add New Utility

```typescript
// src/utils/myUtility.ts
export function myFunction(input: string): string {
  return input.toUpperCase();
}

// test/utils.myutility.test.ts
import { myFunction } from '../src/utils/myUtility';

describe('myFunction', () => {
  it('converts to uppercase', () => {
    expect(myFunction('hello')).toBe('HELLO');
  });
});
```

## Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Add Firebase credentials to .env
VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_PROJECT_ID=your_project_id
# ... etc
```

## Debugging Tips

```typescript
// Print rendered HTML
const { debug } = render(<Component />);
debug();

// Print specific element
debug(screen.getByRole('button'));

// Open testing playground
screen.logTestingPlaygroundURL();

// Check all queries available
screen.debug();
```

## Common Issues

| Issue | Solution |
|-------|----------|
| "Cannot find element" | Use `screen.debug()` to see rendered output |
| "useNavigate not in Router" | Use `render()` from test-utils (has Router) |
| "useAuth not in AuthProvider" | Pass `authContextValue` to `render()` |
| Test timeout | Add `await` to user interactions |
| Port 5173 in use | Change port: `npm run dev -- --port 3000` |

## Documentation

- 📘 **DEVELOPMENT_GUIDE.md** - Project structure & best practices
- 📗 **TESTING_GUIDE.md** - Complete testing documentation
- 📙 **ENVIRONMENT_SETUP.md** - Setup & configuration guide
- 📓 **HOW_TO_TEST_LOGIN.md** - Testing patterns & examples

## Useful Links

- Vitest: https://vitest.dev/
- React Testing Library: https://testing-library.com/react
- Firebase: https://firebase.google.com/docs
- React Router: https://reactrouter.com/
- TypeScript: https://www.typescriptlang.org/docs/

## Need Help?

1. Check the relevant documentation file
2. Look at example tests: `test/page.login.test.new.jsx`
3. Run `screen.debug()` to inspect component
4. Use `npm test -- --ui` for visual debugging
5. Check error messages carefully - they usually tell you what's wrong
