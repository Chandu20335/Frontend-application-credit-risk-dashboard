import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base:"/",
  server: {
    host: 'localhost', // ⚠️ allows access from network (like mobile, other PC)
    port: 3000
  }
})
