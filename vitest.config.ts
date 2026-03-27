import path from 'node:path'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['services/**/*.test.ts', 'services/**/*.test.tsx', 'lib/**/*.test.ts'],
    exclude: ['node_modules', 'tests', '.next', 'website', 'app_backup'],
  },
})
