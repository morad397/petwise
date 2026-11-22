import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vercel serves the site at the root ("/"), GitHub Pages under "/petwise/".
// Vercel sets the VERCEL env var during its build, so we pick the right base automatically.
export default defineConfig({
  base: process.env.VERCEL ? '/' : '/petwise/',
  plugins: [react()],
})
