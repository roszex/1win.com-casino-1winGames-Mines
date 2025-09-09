import { defineConfig } from 'vite'

export default defineConfig({
  root: './public',
  server: {
    port: 3000
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    copyPublicDir: true
  },
  publicDir: './public'
})
