# 🔧 Troubleshooting Guide - JoFamily Web

## Common Issues & Solutions

### Test Issues

#### ❌ "Cannot find element"
**Problem**: Test queries not finding elements

**Solution**:
```typescript
// Use screen.debug() to see what's rendered
const { debug } = render(<Component />);
debug(); // Prints all HTML

// Or debug specific element
debug(screen.getByRole('button'));

// Check element name/role
// (from error output, see "accessible roles" section)
```

#### ❌ "useNavigate not in Router context"
**Problem**: Using standard `render()` instead of custom

**Solution**:
```typescript
// ❌ WRONG
import { render } from '@testing-library/react';
render(<Component />);

// ✅ CORRECT
import { render } from '../src/tests/test-utils';
render(<Component />); // Already has BrowserRouter
```

#### ❌ "useAuth must be used within AuthProvider"
**Problem**: Auth context not provided

**Solution**:
```typescript
// Add auth context
render(<Component />, {
  authContextValue: authMockScenarios.authenticated()
});

// Or use different scenario
render(<Component />, {
  authContextValue: authMockScenarios.unauthenticated()
});
```

#### ❌ "toBeInTheDocument is not a function"
**Problem**: Jest-DOM matchers not loaded

**Solution**: This should be fixed by updated `vitest.config.ts` with `setupFiles: ['./src/tests/setup.ts']`

If still happening:
```bash
npm test -- --clearCache
npm test -- --run
```

#### ❌ Test timeout
**Problem**: Async operations not awaited

**Solution**:
```typescript
// ❌ WRONG
user.click(button);
expect(element).toBeInTheDocument();

// ✅ CORRECT
await user.click(button);
const element = await screen.findByText(/text/i);
expect(element).toBeInTheDocument();
```

#### ❌ "No test files found"
**Problem**: Vitest include pattern doesn't match files

**Check**:
1. File extension is `.test.jsx` or `.test.tsx` (not `.js`)
2. File is in `src/` or `test/` directory
3. `vitest.config.ts` include pattern includes your extension
4. Run `npm test -- --clearCache`

### Development Issues

#### ❌ "Port 5173 already in use"
**Problem**: Another process using dev server port

**Solution - Option 1**: Kill the process
```bash
# macOS/Linux
lsof -i :5173
kill -9 <PID>

# Windows PowerShell
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**Solution - Option 2**: Use different port
```bash
npm run dev -- --port 3000
```

#### ❌ "Cannot find module 'react'"
**Problem**: Dependencies not installed

**Solution**:
```bash
# Clear everything
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Verify
npm test -- --run
```

#### ❌ "Firebase credentials not loading"
**Problem**: `.env` file not found or missing variables

**Solution**:
1. Check `.env` file exists in root
2. Verify all `VITE_` variables are present
3. Variables must start with `VITE_` prefix
4. **Restart dev server** after updating `.env`

```bash
# Restart dev server
Ctrl+C
npm run dev
```

#### ❌ TypeScript errors in IDE
**Problem**: VSCode not recognizing types

**Solution**:
```bash
# Restart TypeScript server in VSCode
Cmd+Shift+P (macOS) or Ctrl+Shift+P (Windows)
Search: "TypeScript: Restart TS Server"

# Or regenerate
npx tsc --noEmit
```

#### ❌ ESLint errors
**Problem**: Code style issues

**Solution - Option 1**: Fix automatically
```bash
npm run lint -- --fix
```

**Solution - Option 2**: Check specific issues
```bash
npm run lint -- --debug
```

**Solution - Option 3**: Configure VSCode to auto-fix
```json
// .vscode/settings.json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

### Build Issues

#### ❌ Build fails with "Cannot find module"
**Problem**: Missing dependency or import typo

**Solution**:
```bash
# Check import path exists
ls src/utils/myFile.ts  # Does it exist?

# Check spelling matches exactly
```

#### ❌ Build succeeds but has warnings
**Problem**: Usually chunk size warnings

**Solution** (usually safe to ignore):
- Warnings in yellow are non-critical
- Errors in red must be fixed
- For production: Use `npm run build` and check `dist/` folder

#### ❌ "VITE_FIREBASE_* is undefined"
**Problem**: Environment variables not loading

**Solution**:
1. Ensure `.env` file exists and has values
2. Variables must start with `VITE_` prefix
3. Check `.env.example` for correct variable names
4. Restart dev server after changes

### Firebase Issues

#### ❌ "Cannot read property 'uid' of null"
**Problem**: User not authenticated

**Solution**:
1. Check auth mocks are set up
2. Verify `setup.ts` is loaded
3. Use appropriate mock scenario:

```typescript
render(<Component />, {
  authContextValue: authMockScenarios.authenticated()
});
```

#### ❌ Firebase rules error
**Problem**: During real Firebase testing (not mocked)

**Solution**:
1. Check Firebase security rules
2. Ensure user is authenticated
3. Or use mocks for testing:

```typescript
// In test file
vi.mock('firebase/auth', () => ({
  // mock implementation
}));
```

### Windows-Specific Issues

#### ❌ "PowerShell: cannot find npm"
**Problem**: npm not in system PATH

**Solution**:
```bash
# Check if Node is installed
node --version

# If not, install from https://nodejs.org/

# Or use WSL2
wsl
npm install
npm test
```

#### ❌ "Unexpected token" in terminal
**Problem**: Path with spaces in terminal command

**Solution**:
```bash
# Use quotes around paths
npm run dev "src/my file.tsx"

# Or use WSL2
wsl npm test
```

### Git/GitHub Issues

#### ❌ Cannot commit: Git hooks failing
**Problem**: Husky pre-commit hooks failing

**Solution**:
```bash
# Reinstall husky
npm install husky --save-dev
npx husky install

# Or bypass for one commit (not recommended)
git commit --no-verify
```

#### ❌ CI/CD failing on GitHub
**Problem**: GitHub Actions workflow not working

**Solution**:
1. Check secrets are configured:
   - Settings → Secrets and variables → Actions
   - Add `FIREBASE_SERVICE_ACCOUNT`
   - Add `FIREBASE_PROJECT_ID`
   - Add other required `VITE_*` variables

2. Check workflow file:
   - `.github/workflows/ci-cd.yml`
   - Verify paths are correct
   - Check Node version compatibility

### Performance Issues

#### ❌ Tests running slowly
**Problem**: Large test suite taking too long

**Solution**:
```bash
# Run only specific test
npm test -- page.login

# Run with coverage (slower)
npm test -- --run

# Use watch mode for faster feedback
npm test
```

#### ❌ Dev server slow to start
**Problem**: Too many dependencies

**Solution**:
```bash
# Clear cache
rm -rf node_modules/.vite
rm -rf node_modules/.vitest

# Restart
npm run dev
```

## Debugging Techniques

### 1. Console Logging
```typescript
const result = someFunction();
console.log('Result:', result); // Use labels
console.log(JSON.stringify(result, null, 2)); // Pretty print
```

### 2. Visual Test Debugging
```bash
npm test -- --ui
# Opens interactive dashboard at http://localhost:51204
```

### 3. Screen Debug in Tests
```typescript
test('debug test', () => {
  const { debug } = render(<Component />);
  debug();  // Print entire DOM
  
  // Or specific element
  const button = screen.getByRole('button');
  debug(button);
});
```

### 4. Testing Playground
```typescript
screen.logTestingPlaygroundURL(); // Click URL for interactive testing
```

### 5. Browser DevTools
```typescript
// In dev mode, use browser DevTools
// F12 or Cmd+Option+I (macOS)
// - Check Network tab
// - Check Console for errors
// - Inspect Elements
```

## Getting Help

### Checklist Before Asking for Help
- [ ] Read relevant documentation file
- [ ] Checked error message carefully
- [ ] Searched for similar issues
- [ ] Ran `npm test -- --clearCache`
- [ ] Restarted dev server
- [ ] Ran `screen.debug()` to inspect output
- [ ] Checked `.env` file has all required variables

### Resources
- **Official Docs**: https://vitest.dev/, https://testing-library.com/
- **GitHub Issues**: Search project issues
- **Stack Overflow**: Tag with `vitest` + `react-testing-library`
- **Discord Communities**: React, Testing Library Discord servers

## Common Success Patterns

### ✅ Working Test
```typescript
import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../src/tests/test-utils';
import MyComponent from '../components/MyComponent';

describe('MyComponent', () => {
  it('should work', async () => {
    render(<MyComponent />);
    
    expect(screen.getByText(/hello/i)).toBeInTheDocument();
    
    const user = userEvent.setup();
    await user.click(screen.getByRole('button'));
    
    expect(screen.getByText(/clicked/i)).toBeInTheDocument();
  });
});
```

### ✅ Working Dev Server
```bash
npm run dev
# Output shows:
#   VITE v... dev server running at:
#   ➜  Local:   http://localhost:5173/
```

### ✅ Working Tests
```bash
npm test -- --run
# Shows green checkmarks ✓
# No red errors ❌
```

## Prevention

### Before Committing
```bash
# Run all checks
npm run lint -- --fix
npx tsc --noEmit
npm test -- --run

# All should pass ✓
```

### Before Pushing
```bash
# Check git status
git status

# Make sure .env is in .gitignore
grep "\.env" .gitignore

# Final check
npm run build
```

---

**Still stuck?** Check the relevant documentation file or open an issue with:
- Clear error message
- Steps to reproduce
- What you've already tried
