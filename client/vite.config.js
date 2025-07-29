import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(),
   eslint({
      cache: false,
      include: ['./src/**/*.js', './src/**/*.jsx'],
      exclude: [],
    })
  ],
  server: {
    port: 3000,
    open: true,
    // 🔧 Добави тези настройки
    hmr: {
      overlay: false  // Спре overlay-a временно
    },
    fs: {
      strict: false,  // По-толерантен към файлове
      allow: ['..']
    }
  },
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  define: {
    global: 'globalThis',
  },
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  },
  base: './',
})