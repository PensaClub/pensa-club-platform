import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import eslint from 'vite-plugin-eslint'

import { resolve } from 'path'
export default defineConfig({
    plugins: [react(),
    // eslint({
    //     cache: false,
    //     include: ['./src/**/*.js', './src/**/*.jsx'],
    //     exclude: [],
    // })
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
            '@components': resolve(__dirname, 'src/components'),
            '@utils': resolve(__dirname, 'src/utils'),
            // '@contexts': resolve(__dirname, 'src/components/contexts'),
            '@assets': resolve(__dirname, 'src/assets'),
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