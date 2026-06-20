import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: ['src/v4/**/*.js'],
      exclude: ['src/v4/shell-render.js']
    }
  }
});
