import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
    plugins: [
        vue()
    ],
    root: resolve(__dirname, './example'),
    build: {
        outDir: resolve(__dirname, './example-dist')
    }
});
