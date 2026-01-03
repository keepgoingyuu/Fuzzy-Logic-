import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env from project root (parent directory)
  const projectRoot = path.resolve(__dirname, '..')
  const env = loadEnv(mode, projectRoot, 'VITE_')

  return {
    plugins: [react()],
    envDir: projectRoot, // Load .env from project root
    server: {
      port: parseInt(env.VITE_APP_PORT),
      open: false,
      host: '0.0.0.0',
      allowedHosts: [
        'fuzzylogic.yuudemo.com',
        'localhost',
        '127.0.0.1',
      ],
    },
  }
})
