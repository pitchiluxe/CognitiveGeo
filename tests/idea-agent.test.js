import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildIdeaPack,validateIdeaRefinement} from '../src/idea-agent-data.js';
const ideas=JSON.parse(await readFile(new URL('../public/opportunities.json',import.meta.url),'utf8'));
test('every idea and market gets a complete contextual build and customer handoff pack',()=>{
 for(const idea of ideas)for(const market of idea.markets){const pack=buildIdeaPack(idea,market,{weeks:8,constraints:'French interface; budget USD 500'});assert.equal(pack.ideaId,idea.id);assert.equal(pack.marketId,market.id);assert.ok(pack.build.includes(idea.mvp));assert.ok(pack.build.includes(idea.risk));assert.ok(pack.build.includes('French interface; budget USD 500'));assert.ok(pack.build.includes('8 weeks'));assert.ok(pack.strategy.includes(market.city));assert.ok(pack.strategy.includes(idea.buyer));assert.ok(pack.strategy.includes('day 4'));assert.ok(pack.strategy.includes('day 10'));assert.ok(pack.strategy.includes('rollback'));assert.equal(pack.roles.length,6);assert.ok(pack.roles.every(r=>r.prompt.includes(idea.name)&&r.prompt.includes(idea.mvp)));assert.ok(pack.brief.includes('Acceptance evidence'));}
});
test('market selection rejects another idea’s location and limits user inputs',()=>{
 assert.throws(()=>buildIdeaPack(ideas[0],ideas[1].markets[0]));const pack=buildIdeaPack(ideas[0],ideas[0].markets[0],{weeks:100,constraints:'x'.repeat(3000)});assert.ok(pack.context.includes('26 weeks'));assert.ok(!pack.context.includes('x'.repeat(2001)));
});
test('AI refinements require all five complete sections and never accept partial output',()=>{
 const value=Object.fromEntries(['requirements','implementation','outreach','rollout','risks'].map(k=>[k,`${k}: concrete actions and acceptance evidence.`]));assert.match(validateIdeaRefinement(value),/## Outreach/);assert.throws(()=>validateIdeaRefinement({...value,rollout:''}));assert.throws(()=>validateIdeaRefinement({...value,risks:42}));assert.throws(()=>validateIdeaRefinement(null));
});
test('background reading uses the official publication/PDF and permanent alternatives for every idea',()=>{
 for(const idea of ideas){assert.equal(idea.sources.length,4);assert.ok(idea.sources.some(s=>s.url==='https://doi.org/10.1787/2d08b99d-en'));assert.ok(idea.sources.some(s=>s.url==='https://doi.org/10.1596/978-1-4648-2049-6'));assert.ok(idea.sources.some(s=>s.url.startsWith('https://documents1.worldbank.org/')&&s.url.endsWith('.pdf')));assert.ok(!idea.sources.some(s=>s.url.includes('component-4.html')));}
});
