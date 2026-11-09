import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fetchProcurement} from '../server/procurement.js';
import handler from '../api/procurement.js';
test('procurement adapter constrains upstream host, clamps pagination and strips source contact HTML',async()=>{
 const original=globalThis.fetch;let target;globalThis.fetch=async url=>{target=new URL(url);return {ok:true,json:async()=>({total:'1',procnotices:[{id:'OP987654321',bid_description:'Identity review',notice_type:'Request for Expression of Interest',submission_deadline_date:'2026-12-01T00:00:00Z',contact_email:'private-source@example.invalid',notice_text:'<script>bad</script>'}]})};};
 try{const data=await fetchProcurement({query:'https://evil.example/?x=1&secret=no',offset:-100});assert.equal(target.hostname,'search.worldbank.org');assert.equal(target.searchParams.get('os'),'0');assert.equal(target.searchParams.get('rows'),'50');assert.equal(target.searchParams.get('qterm'),'https://evil.example/?x=1&secret=no');assert.equal(data.entries[0].deadline,'2026-12-01');assert.ok(!JSON.stringify(data).includes('private-source'));assert.ok(!JSON.stringify(data).includes('<script>'));}finally{globalThis.fetch=original;}
});
test('public procurement function rejects mutation requests',async()=>{let code,result;const headers={};const res={setHeader:(k,v)=>headers[k]=v,status:value=>{code=value;return res;},json:value=>{result=value;return res;}};await handler({method:'POST',query:{}},res);assert.equal(code,405);assert.equal(headers.Allow,'GET');assert.match(result.error,/GET/);});
