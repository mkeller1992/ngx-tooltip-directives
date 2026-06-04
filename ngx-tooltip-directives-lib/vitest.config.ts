
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
	setupFiles: ['projects/ngx-tooltip-directives/src/setup-vitest.ts']
  }
});
