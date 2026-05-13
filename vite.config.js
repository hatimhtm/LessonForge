import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: '/LessonForge/',
  build: {
    outDir: 'dist',
  },
  server: {
    open: true,
  },
});
