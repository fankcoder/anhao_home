import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: fileURLToPath(new URL('./index.html', import.meta.url)),
        friends: fileURLToPath(new URL('./friends/index.html', import.meta.url)),
      },
    },
  },
})
