import {test} from 'node:test';
import assert from 'node:assert/strict';
import { validateGenerated, buildGrounding, normalizeRegistry } from '../src/generation-data.js';
const context=[{id:'grok',kind:'directory',name:'Grok',city:'San Francisco',country:'United States',coordinates:[37.77,-122.42],sourceUrl:'https://x.ai/'}];
test('factual generations can select only known sourced records, never invent coordinates',()=>{
 const result=validateGenerated({summary:'Relevant models',recordIds:['grok','imaginary'],inventions:[]},context,'research');
 assert.deepEqual(result.records.map(x=>x.id),['grok']);assert.equal(result.rejectedIds.length,1);
 assert.throws(()=>validateGenerated({summary:'Fake',recordIds:['imaginary'],inventions:[]},context,'research'));
});
test('inventions are marked speculative and use only selected city anchors',()=>{
 const item={name:'Flood response mesh',problem:'Response delays',solution:'Coordinate reviewed requests',impact:'Measure response time',firstExperiment:'Pilot with a local coordinator',risk:'False routing',locationId:'grok'};
 const result=validateGenerated({summary:'Proposal',recordIds:[],inventions:[item]},context,'inventions');
 assert.equal(result.inventions[0].verification,'Unverified invention proposal');assert.deepEqual(result.inventions[0].coordinates,[37.77,-122.42]);
 assert.throws(()=>validateGenerated({summary:'Proposal',recordIds:[],inventions:[{...item,locationId:'fake'}]},context,'inventions'));
});
test('grounding excludes imported records and registry does not infer unknown creator locations',()=>{
 assert.equal(buildGrounding([{id:'a',name:'A',coordinates:[0,0],provenance:'User-provided import.'}]).length,0);
 const [entry]=normalizeRegistry([{id:'unknown-publisher/m1',downloads:12}],{});assert.equal(entry.coordinates,null);assert.equal(entry.locationStatus,'Publisher location not documented');
});
