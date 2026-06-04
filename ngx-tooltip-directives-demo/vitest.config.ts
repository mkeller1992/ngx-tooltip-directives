import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@ngx-tooltip-directives': fileURLToPath(
        new URL('../ngx-tooltip-directives-lib/projects/ngx-tooltip-directives/src/public-api.ts', import.meta.url)
      )
    }
  },
  test: {
    environment: 'jsdom'
  }
});