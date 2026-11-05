import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    // 🌟 Naikkan batas peringatan chunk — gambar ada di /public/ bukan bundle
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // 🌟 Manual chunk splitting: pisahkan vendor besar dari app code
        manualChunks(id) {
          // Firebase dan Firestore dalam chunk terpisah (hanya dimuat oleh admin)
          if (id.includes('firebase')) {
            return 'firebase';
          }
          // React ecosystem
          if (id.includes('react-dom') || id.includes('react-router')) {
            return 'react-vendor';
          }
          // AOS animation library
          if (id.includes('/aos/')) {
            return 'aos';
          }
        },
      },
    },
  },
})
