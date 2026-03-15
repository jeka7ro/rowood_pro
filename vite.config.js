import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import base44 from '@base44/vite-plugin';
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    base44(),
  ],
  server: {
    allowedHosts: true,
    port: 3075,
    host: true, // Listen on all local IPs
    https: false,
    // Fix HTTP 431 (Request Header Fields Too Large) - increase header size limit
    hmr: true,
    proxy: {
      '/api/anaf': {
        target: 'https://webservicesp.anaf.ro',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/anaf/, '/api/PlatitorTvaRest/v9/tva')
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
});