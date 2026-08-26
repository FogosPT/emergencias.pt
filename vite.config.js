import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The project historically used .js files with JSX (CRA-style). Rather
// than rename every component, we tell esbuild to treat .js files inside
// src/ as JSX.
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        open: true,
    },
    build: {
        outDir: 'build',
        sourcemap: true,
    },
    esbuild: {
        loader: 'jsx',
        include: /src\/.*\.jsx?$/,
        exclude: [],
    },
    optimizeDeps: {
        esbuildOptions: {
            loader: { '.js': 'jsx' },
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.js',
        css: false,
    },
});
