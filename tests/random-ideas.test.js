import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {generateRandomIdeas,materializeRandomIdea} from '../src/random-ideas.js';
import {buildIdeaPack} from '../src/idea-agent-data.js';
const ideas=JSON.parse(await readFile(new URL('../public/opportunities.json',import.meta.url),'utf8'));
test('random button produces exactly 20 unique variations with complete map and launch-agent data',()=>{
 const original=JSON.stringify(ideas);const batch=generateRandomIdeas(ideas,{random:()=>.42,batchId:'test-one'});
 assert.equal(batch.length,20);assert.equal(new Set(batch.map(x=>x.idea.id)).size,20);assert.equal(new Set(batch.map(x=>`${x.descriptor.baseId}:${x.descriptor.variant}`)).size,20);
 for(const {idea,descriptor} of batch){assert.ok(idea.noveltyNote.includes('not an AI-generated'));assert.equal(idea.markets.length,3);assert.ok(idea.markets.every(m=>m.id.startsWith(idea.id)&&m.coordinates.length===2));assert.equal(idea.validation.length,3);const pack=buildIdeaPack(idea,idea.markets[0]);assert.ok(pack.build.includes(idea.mvp));assert.ok(pack.strategy.includes(idea.buyer));assert.deepEqual(materializeRandomIdea(ideas.find(x=>x.id===descriptor.baseId),JSON.parse(JSON.stringify(descriptor))),idea);}
 assert.equal(JSON.stringify(ideas),original);
});
test('regeneration avoids the previous batch combinations and rejects corrupt stored descriptors',()=>{
 const first=generateRandomIdeas(ideas,{random:()=>.6,batchId:'one'});const second=generateRandomIdeas(ideas,{random:()=>.6,batchId:'two',previous:first.map(x=>x.descriptor)});const prior=new Set(first.map(x=>`${x.descriptor.baseId}:${x.descriptor.variant}`));assert.ok(second.every(x=>!prior.has(`${x.descriptor.baseId}:${x.descriptor.variant}`)));assert.throws(()=>materializeRandomIdea(ideas[0],{id:'<script>',variant:0,marketIndex:0}));assert.throws(()=>materializeRandomIdea(ideas[0],{id:'random-idea-invalid',variant:100,marketIndex:0}));assert.throws(()=>materializeRandomIdea(ideas[0],{id:'random-idea-invalid',variant:0,marketIndex:99}));
});
