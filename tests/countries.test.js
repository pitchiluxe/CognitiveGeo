import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {COUNTRY_USE_CASES,COUNTRY_SOURCES,DRC_PLAN,countryDelivery,countryCases,countryIdea} from '../src/country-opportunity-data.js';
import {buildIdeaPack} from '../src/idea-agent-data.js';
import {chooseCountryLabels} from '../src/country-labels.js';
const data=JSON.parse(await readFile(new URL('../public/countries.json',import.meta.url),'utf8'));
test('country roster has 193 UN members plus two observers and sourced dated indicators',()=>{
 assert.equal(data.entries.length,195);assert.equal(data.entries.filter(c=>c.status==='UN member state').length,193);assert.equal(new Set(data.entries.map(c=>c.id)).size,195);assert.equal(data.entries.filter(c=>c.region==='africa').length,54);assert.equal(data.entries.find(c=>c.id==='VAT').status,'UN observer state');
 for(const c of data.entries){assert.ok(c.coordinates.length===2&&Math.abs(c.coordinates[0])<=90&&Math.abs(c.coordinates[1])<=180);assert.ok(c.languages.length);for(const m of Object.values(c.indicators)){assert.ok(m.sourceUrl.startsWith('https://data.worldbank.org/indicator/'));assert.ok(m.value===null||(Number.isFinite(m.value)&&m.value>=0&&m.value<=100));if(m.value!==null)assert.match(m.year,/^\d{4}$/);}}
});
test('every country has usable opportunity, pricing, safeguards and complete launch prompts',()=>{
 const ids=new Set();for(const country of data.entries){assert.equal(countryCases(country).length,14);assert.equal(countryCases(country,'IAM & Security').length,4);for(const usecase of countryCases(country)){const idea=countryIdea(country,usecase);assert.ok(!ids.has(idea.id));ids.add(idea.id);const pack=buildIdeaPack(idea,idea.markets[0]);assert.ok(pack.build.includes(usecase.mvp));assert.ok(pack.build.includes(usecase.risk));assert.ok(pack.strategy.includes(country.name));assert.ok(idea.monthlyPrice>idea.variableCost);assert.ok(idea.sources.every(s=>s.url.startsWith('https://')));assert.ok(idea.noveltyNote.includes('hypothesis'));}}assert.equal(ids.size,2730);
});
test('unknown infrastructure remains unknown and DRC keeps a grounded local entry sequence',()=>{
 const drc=data.entries.find(c=>c.id==='COD');assert.equal(countryCases(drc)[0].id,'iam-lifecycle');assert.equal(DRC_PLAN.roadmap.length,5);assert.ok(countryDelivery(drc).some(x=>x.includes('low-bandwidth')));const unknown=structuredClone(drc);unknown.indicators.internet.value=null;unknown.indicators.electricity.value=null;assert.ok(countryDelivery(unknown).some(x=>x.includes('Internet-use observation unavailable')));assert.ok(countryDelivery(unknown).some(x=>x.includes('Electricity-access observation unavailable')));assert.ok(countryIdea(drc,COUNTRY_USE_CASES[0]).sources.includes(COUNTRY_SOURCES.drcRegistry));assert.throws(()=>countryIdea(drc,{id:'invented'}));
});
test('country-name placement clips, avoids overlap, and respects density limits',()=>{
 const items=[{id:'one',name:'Congo',x:100,y:100},{id:'two',name:'DR Congo',x:102,y:100},{id:'three',name:'Kenya',x:200,y:150},{id:'four',name:'Outside',x:-30,y:100}];const labels=chooseCountryLabels(items,{width:400,height:300,max:20});assert.deepEqual(labels.map(x=>x.id),['one','three']);assert.equal(chooseCountryLabels(items,{width:400,height:300,max:1}).length,1);
});
