import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Определяем базовый URL для страниц в зависимости от среды
function pagesBase(): string {
  const repo = process.env.GITHUB_REPOSITORY;

  if (!process.env.GITHUB_ACTIONS || !repo) return '/';

  const [owner, name] = repo.split('/');

  if (!owner || !name || name === `${owner}.github.io`) return '/';

  return `/${name}/`;
}

export default defineConfig({
  plugins: [react()],
  base: pagesBase(),
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
});
