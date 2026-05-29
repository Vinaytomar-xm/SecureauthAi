import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy only works in LOCAL development (npm run dev)
    // On Vercel (production), VITE_API_URL env variable is used instead
    // Set VITE_API_URL=https://secureauth-backend-85f6.onrender.com/api on Vercel
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // disable sourcemaps in production for smaller bundle
  },
});
