import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({
  base: process.env.COGNITIVEGEO_BASE || '/',
  server: {
    proxy: {
      '^/api/ollama/(tags|generate)$': {target:'http://127.0.0.1:11434',changeOrigin:true,rewrite:path=>path.replace('/api/ollama','/api'),timeout:180000,proxyTimeout:180000},
      '/api/model-registry': {target:'https://huggingface.co',changeOrigin:true,rewrite:path=>path.replace('/api/model-registry','/api/models'),timeout:30000,proxyTimeout:30000},
    },
  },
  build: {
    rollupOptions: {
      input: { landing: resolve(import.meta.dirname,'index.html'), app: resolve(import.meta.dirname,'app.html') },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three/')) return 'three';
          if (id.includes('node_modules/world-atlas/') || id.includes('node_modules/topojson-client/')) return 'geography';
        },
      },
    },
  },
});
