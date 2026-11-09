const {Readable,Writable}=require('node:stream');
const {createAppHandler}=require('./server.cjs');
const APP_ORIGIN='http://127.0.0.1:35471';
// Dispatch the existing restricted app handler in-process; no TCP listener or proxy.
function createLocalTransport(root,{origin=APP_ORIGIN}={}){
 const handler=createAppHandler(root,()=>origin);
 async function respond(request){
  const url=new URL(request.url);if(url.origin!==origin)return new Response('Not an app request.',{status:403});
  const parts=[];let size=0;if(request.method==='POST'&&request.body){const reader=request.body.getReader();while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>131072){await reader.cancel();return new Response(JSON.stringify({error:'Request is too large.'}),{status:413,headers:{'Content-Type':'application/json'}});}parts.push(Buffer.from(value));}}const body=Buffer.concat(parts);
  const req=Readable.from(body.length?[body]:[]);req.method=request.method;req.url=url.pathname+url.search;req.headers=Object.fromEntries(request.headers);req.headers.host=new URL(origin).host;
  return new Promise(resolve=>{const chunks=[],headers={};let status=200,bytes=0,settled=false;const finish=(code=status)=>{if(settled)return;settled=true;resolve(new Response(request.method==='HEAD'||[204,205,304].includes(code)?null:Buffer.concat(chunks),{status:code,headers}));};
   const res=new Writable({write(chunk,_encoding,callback){bytes+=chunk.length;if(bytes>33554432){callback(Error('Response limit exceeded.'));return;}chunks.push(Buffer.from(chunk));callback();}});
   res.setHeader=(name,value)=>{headers[name]=String(value);};res.writeHead=(code,values={})=>{status=code;for(const [name,value]of Object.entries(values))res.setHeader(name,value);res.headersSent=true;return res;};
   res.on('close',()=>{if(!settled)res.emit('error',Error('Response closed prematurely.'));});res.on('finish',()=>finish());res.on('error',()=>{if(!settled){chunks.length=0;chunks.push(Buffer.from('{"error":"Local app response unavailable."}'));delete headers['Content-Length'];headers['Content-Type']='application/json';finish(502);}});
   request.signal?.addEventListener('abort',()=>{req.destroy();res.destroy(Error('Request cancelled.'));},{once:true});
   Promise.resolve(handler(req,res)).catch(()=>res.destroy(Error('Local app handler failed.')));
  });
 }
 return {origin,respond,close:async()=>{}};
}
async function installLocalTransport(session,root){const local=createLocalTransport(root);await session.protocol.handle('http',request=>new URL(request.url).origin===local.origin?local.respond(request):session.fetch(request,{bypassCustomProtocolHandlers:true}));return local;}
module.exports={APP_ORIGIN,createLocalTransport,installLocalTransport};
