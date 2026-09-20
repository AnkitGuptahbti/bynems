import { copyFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const root = dirname(fileURLToPath(import.meta.url))

function spaFallback() {
  return {
    name: 'spa-fallback',
    closeBundle() {
      const index = resolve(root, 'dist/index.html')
      if (existsSync(index)) copyFileSync(index, resolve(root, 'dist/404.html'))
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), spaFallback()],
})
