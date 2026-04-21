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
   
        watch: {
            usePolling: true,
            interval: 1000,
            binaryInterval: 1000
        },
        hmr: {
            overlay: true // 🔧 Показва грешки като overlay
        },
        fs: {
            strict: false,  // По-толерантен към файлове
            allow: ['..']
        }
    },
    build: {
        outDir: 'dist',
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    if (!id.includes('node_modules')) return;
                    if (/node_modules[\\/](react|react-dom|react-router|react-router-dom|react-helmet-async|scheduler)[\\/]/.test(id)) return 'react-vendor';
                    if (/node_modules[\\/](i18next|react-i18next)/.test(id)) return 'i18n';
                    if (/node_modules[\\/]@tiptap/.test(id)) return 'editor';
                    if (/node_modules[\\/]prosemirror/.test(id)) return 'editor';
                    if (/node_modules[\\/]@fortawesome/.test(id)) return 'icons';
                    if (/node_modules[\\/]lucide-react/.test(id)) return 'icons';
                    if (/node_modules[\\/]recharts/.test(id)) return 'charts';
                    if (/node_modules[\\/](d3|victory-vendor)/.test(id)) return 'charts';
                    if (/node_modules[\\/](@firebase|firebase)/.test(id)) return 'firebase';
                    if (/node_modules[\\/](leaflet|react-leaflet)/.test(id)) return 'maps';
                    if (/node_modules[\\/]jspdf/.test(id)) return 'pdf';
                    if (/node_modules[\\/]lottie/.test(id)) return 'lottie';
                    return 'vendor';
                },
            },
        },
    },
    resolve: {
        // alias: {
        //     '@': resolve(__dirname, 'src'),
        //     '@components': resolve(__dirname, 'src/components'),
        //     '@utils': resolve(__dirname, 'src/utils'),
        //     // '@contexts': resolve(__dirname, 'src/components/contexts'),
        //     '@assets': resolve(__dirname, 'src/assets'),
        // },
    },
    define: {
        global: 'globalThis',
    },
    css: {
        modules: {
            localsConvention: 'camelCase'
        }
    },
    base: '/',
})