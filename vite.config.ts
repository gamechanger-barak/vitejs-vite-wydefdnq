import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // 1. הוספנו את הייבוא הזה

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  resolve: { // 2. הוספנו את כל הבלוק הזה שמלמד את המערכת מה זה @
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
