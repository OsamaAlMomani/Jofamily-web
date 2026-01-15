import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  
  test: {
    // Test environment
    environment: 'jsdom',
    
    // Global test utilities (describe, it, expect)
    globals: true,
    
    // Setup files (run before tests)
    setupFiles: ['./src/tests/setup.ts'],
    
    // Include test files
    include: ['src/**/*.{test,spec}.{ts,tsx,js,jsx}', 'test/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    
    // Exclude from test discovery
    exclude: ['node_modules', 'dist', 'cypress', 'temp'],
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'src': path.resolve(__dirname, './src'),
    },
  },
});
