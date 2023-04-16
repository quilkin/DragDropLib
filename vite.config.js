import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue() ],
  // build: {
  //   sourcemap: true,
  // },
 // root: "DragDropTest",
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js',
      // '@': fileURLToPath(new URL('./src', import.meta.url)),
    }
  }

})


