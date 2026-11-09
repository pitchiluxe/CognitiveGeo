import {fetchSecurity} from './server/security.js';
import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import {fetchProcurement} from './server/procurement.js';
export default defineConfig({
  base: process.env.COGNITIVEGEO_BASE || '/',
  plugins:[{name:'public-procurement',configureServer(server){server.middlewares.use('/api/security',async(req,res)=>{res.setHeader('Content-Type','application/json');if(req.method!=='GET'){res.statusCode=405;res.end(JSON.stringify({error:'Use GET.'}));return;}try{res.end(JSON.stringify(await fetchSecurity()));}catch{res.statusCode=502;res.end(JSON.stringify({error:'Security sources unavailable.'}));}});server.middlewares.use('/api/procurement',async(req,res)=>{res.setHeader('Content-Type','application/json');if(req.method!=='GET'){res.statusCode=405;res.end(JSON.stringify({error:'Use GET.'}));return;}try{const url=new URL(req.url,'http://localhost');const data=await fetchProcurement({query:url.searchParams.get('q')||'',offset:url.searchParams.get('offset')});res.end(JSON.stringify(data));}catch{res.statusCode=502;res.end(JSON.stringify({error:'Official procurement source unavailable. Open the source website or try again later.'}));}});}}],
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
