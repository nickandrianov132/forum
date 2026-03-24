import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  resolve: {
    alias: {
      // Мы подменяем пакет на пустой модуль. 
      // Это убирает ошибку "Failed to resolve entry" раз и навсегда.
      '@graphql-typed-document-node/core': 'data:text/javascript,export {}'
    }
  }
})
