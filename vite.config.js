import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  server: {
    port: 3000,  // Make sure this matches your running port
    open: true,  // Automatically open browser
    host: true,  // Listen on all local IPs
    proxy: {
      '/api': {
        target: 'https://sefainventorybackend-production.up.railway.app/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})