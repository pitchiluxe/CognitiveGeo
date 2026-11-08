const {test}=require('node:test');
const assert=require('node:assert/strict');
const {mkdtemp,writeFile,mkdir,rm}=require('node:fs/promises');
const {tmpdir}=require('node:os');
const path=require('node:path');
const http=require('node:http');
const {startLocalServer}=require('../desktop/server.cjs');
test('desktop server serves the bundled app and blocks foreign origins, hostnames and traversal',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'cognitivegeo-test-'));await writeFile(path.join(root,'app.html'),'<h1>Atlas</h1>');await mkdir(path.join(root,'assets'));await writeFile(path.join(root,'assets','test.js'),'export default 1;');
 const instance=await startLocalServer(root);try{
  const app=await fetch(instance.origin+'/app.html');assert.equal(app.status,200);assert.match(await app.text(),/Atlas/);assert.ok(app.headers.get('content-security-policy').includes("script-src 'self'"));
  assert.equal((await fetch(instance.origin+'/api/ollama/tags',{headers:{Origin:'https://evil.example'}})).status,403);
  const forgedHostStatus=await new Promise((resolve,reject)=>{const request=http.get(instance.origin+'/app.html',{headers:{Host:'evil.example'}},response=>{response.resume();resolve(response.statusCode);});request.on('error',reject);});
  assert.equal(forgedHostStatus,403);
  assert.notEqual((await fetch(instance.origin+'/%2e%2e%2fsecret.txt')).status,200);
  assert.equal((await fetch(instance.origin+'/app.html',{method:'DELETE'})).status,405);
  assert.equal((await fetch(instance.origin+'/missing.json')).status,404);
 }finally{await instance.close();await rm(root,{recursive:true,force:true});}
});
