import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: false, // غیرفعال کردن Source Map
  },
  plugins: [react()],
  base: "/TodoList",
})
