import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readdirSync, copyFileSync, mkdirSync, existsSync } from 'fs'

const copyResourcesPlugin = {
  name: 'copy-resources',
  closeBundle() {
    if (!existsSync('resources')) return
    mkdirSync('dist/resources', { recursive: true })
    for (const file of readdirSync('resources')) {
      copyFileSync(`resources/${file}`, `dist/resources/${file}`)
      console.log(`  copied: ${file}`)
    }
  },
}

export default defineConfig({
  plugins: [react(), copyResourcesPlugin],
  base: './',
})
