import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { safeLink } from '../src/discovery-data.js';
import { normalizeFacilities } from '../src/facility-data.js';
const read=async file=>JSON.parse(await readFile(new URL(`../public/${file}`,import.meta.url),'utf8'));
const [catalog,ideas,centers]=await Promise.all(['catalog.json','opportunities.json','datacenters.json'].map(read));
test('discovery records have unique IDs, public sources, creator attribution and valid map positions',()=>{
  assert.equal(catalog.length,62);assert.equal(ideas.length,20);
  const all=[...catalog,...ideas,...centers];assert.equal(new Set(all.map(x=>x.id)).size,all.length);
  for(const x of catalog){assert.ok(x.creatorInfo.length>15);assert.ok(safeLink(x.url));assert.ok(safeLink(x.creatorUrl));assert.ok(x.sources.every(s=>safeLink(s.url)));assert.ok(x.coordinates.length===2&&Math.abs(x.coordinates[0])<=90&&Math.abs(x.coordinates[1])<=180);}
  const ids=new Set(catalog.map(x=>x.id));for(const idea of ideas){assert.ok(idea.stack.every(id=>ids.has(id)),`${idea.id} references missing AI`);assert.equal(idea.markets.length,3);assert.equal(idea.validation.length,3);assert.ok(idea.markets.every(m=>m.factors.length===4&&m.factors.every(n=>n>=1&&n<=5)));}
});
test('facility sources preserve construction, commissioning and operational distinctions',()=>{
  assert.equal(normalizeFacilities(centers).length,65);
  const byId=Object.fromEntries(centers.map(x=>[x.id,x]));assert.equal(byId['dc-equinix-sg6'].status,'Operational');assert.equal(byId['dc-microsoft-vaughan'].status,'Commissioning');assert.equal(byId['dc-microsoft-peschiera'].status,'Under construction');assert.equal(byId['dc-google-canelones'].status,'In development');
  assert.equal(new Set(centers.map(x=>x.region)).size,5);
});
