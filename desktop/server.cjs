const http=require('node:http');
const https=require('node:https');
const fs=require('node:fs');
const path=require('node:path');
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.ico':'image/x-icon','.woff2':'font/woff2'};
const CSP="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://api.github.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'";
function error(res,status,message){if(!res.headersSent)res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify({error:message}));}
async function startLocalServer(root,{port=0}={}){
 const assets=path.resolve(root);let origin;
 const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Content-Security-Policy',CSP);res.setHeader('Referrer-Policy','no-referrer');
  if(req.headers.host!==new URL(origin).host)return error(res,403,'Invalid local host.');
  let url;try{url=new URL(req.url,origin);}catch{return error(res,400,'Invalid URL.');}
  if(url.pathname.startsWith('/api/')){
   if(req.headers.origin&&req.headers.origin!==origin)return error(res,403,'Only this local app can use this endpoint.');
   let target;
   if(url.pathname==='/api/ollama/tags'&&req.method==='GET')target=new URL('http://127.0.0.1:11434/api/tags');
   else if(url.pathname==='/api/ollama/generate'&&req.method==='POST')target=new URL('http://127.0.0.1:11434/api/generate');
   else if(url.pathname==='/api/model-registry'&&req.method==='GET'){
    target=new URL('https://huggingface.co/api/models');for(const key of ['search','author','cursor','sort','direction','full','limit'])if(url.searchParams.has(key))target.searchParams.set(key,url.searchParams.get(key).slice(0,key==='cursor'?4000:200));target.searchParams.set('limit',String(Math.min(50,Math.max(1,Number(target.searchParams.get('limit'))||50))));
   }else return error(res,404,'Endpoint not available.');
   let body=null;
   if(req.method==='POST'){
    const chunks=[];let size=0;try{for await(const chunk of req){size+=chunk.length;if(size>131072){error(res,413,'Request is too large.');return;}chunks.push(chunk);}body=Buffer.concat(chunks);const payload=JSON.parse(body.toString('utf8'));if(typeof payload.model!=='string'||payload.model.length>150||/cloud/i.test(payload.model))return error(res,400,'Choose an installed local generation model.');}catch{return error(res,400,'Invalid generation request.');}
   }
   const transport=target.protocol==='https:'?https:http;
   const proxy=transport.request(target,{method:req.method,headers:{Accept:'application/json',...(body?{'Content-Type':'application/json','Content-Length':body.length}:{})},timeout:180000},upstream=>{
    const headers={'Content-Type':upstream.headers['content-type']||'application/json','Cache-Control':'no-store'};if(upstream.headers.link)headers.Link=upstream.headers.link;res.writeHead(upstream.statusCode||502,headers);upstream.pipe(res);
   });proxy.on('timeout',()=>proxy.destroy(new Error('Upstream service timed out.')));proxy.on('error',()=>error(res,502,target.hostname==='127.0.0.1'?'Local Ollama is unavailable. Start Ollama and reconnect.':'Model registry is unavailable. Try again later.'));res.on('close',()=>{if(!res.writableEnded)proxy.destroy();});if(body)proxy.write(body);proxy.end();return;
  }
  if(!['GET','HEAD'].includes(req.method))return error(res,405,'Method not supported.');
  let decoded;try{decoded=decodeURIComponent(url.pathname);}catch{return error(res,400,'Invalid path.');}
  if(decoded.includes('\0')||decoded.includes('\\'))return error(res,403,'Invalid asset path.');
  const file=path.resolve(assets,'.'+(decoded==='/'?'/index.html':decoded));if(!file.startsWith(assets+path.sep))return error(res,403,'Asset outside application.');
  try{const info=await fs.promises.stat(file);if(!info.isFile())return error(res,404,'Asset not found.');res.writeHead(200,{'Content-Type':TYPES[path.extname(file)]||'application/octet-stream','Cache-Control':url.pathname.startsWith('/assets/')?'public, max-age=31536000, immutable':'no-cache','Content-Length':info.size});if(req.method==='HEAD')res.end();else{const stream=fs.createReadStream(file);stream.on('error',()=>res.destroy());stream.pipe(res);}}catch{return error(res,404,'Asset not found.');}
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});origin=`http://127.0.0.1:${server.address().port}`;
 return {origin,close:()=>new Promise(resolve=>{server.close(resolve);server.closeAllConnections?.();})};
}
module.exports={startLocalServer};
