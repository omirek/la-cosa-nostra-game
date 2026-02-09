import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/la-cosa-nostra-game/', // WAŻNE: Tu musi być dokładna nazwa Twojego repozytorium!
})