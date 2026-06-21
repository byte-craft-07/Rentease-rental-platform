const path = require('path');
const { defineConfig } = require('vite');

module.exports = defineConfig({
  root: __dirname,
  envDir: path.resolve(__dirname, '..'),
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: false
  },
  preview: {
    host: '127.0.0.1',
    port: 4173
  },
  build: {
    outDir: path.resolve(__dirname, '../dist/client'),
    emptyOutDir: true
  }
});
