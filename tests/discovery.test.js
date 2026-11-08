import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterDirectory, filterIdeas, calculateRevenue, marketScore, safeLink, readSaved } from '../src/discovery-data.js';

test('directory combines creator search, category, region and access filters',()=>{
  const data=[{id:'claude',name:'Claude',creator:'Anthropic',description:'Assistant',category:'Assistant',region:'americas',access:'Hosted',era:'Modern',city:'San Francisco',country:'United States'},{id:'gemma',name:'Gemma',creator:'Google DeepMind',description:'Open models',category:'Language models',region:'europe',access:'Open weights',era:'Modern',city:'London',country:'United Kingdom'}];
  assert.deepEqual(filterDirectory(data,{search:'deepmind',region:'europe',access:'Open weights'}).map(x=>x.id),['gemma']);
  assert.equal(filterDirectory(data,{search:'Anthropic',category:'Language models'}).length,0);
  assert.equal(filterDirectory(data,{savedOnly:true,saved:['claude']}).length,1);
});
test('opportunity filters match actual target markets and rank transparently',()=>{
  const ideas=[{id:'voice',name:'Voice helper',sector:'Accessibility',description:'Access',markets:[{id:'us',region:'americas',country:'United States',city:'Atlanta',factors:[5,4,3,4]}]},{id:'learn',name:'Learning',sector:'Education',description:'Tutor',markets:[{id:'in',region:'asia',country:'India',city:'Bengaluru',factors:[4,5,3,3]}]}];
  assert.equal(filterIdeas(ideas,{region:'asia'})[0].id,'learn');
  assert.equal(filterIdeas(ideas,{search:'Atlanta'})[0].id,'voice');
  assert.equal(marketScore([5,4,3,4]),80);
});
test('revenue scenarios separate annual revenue, gross profit and target accounts',()=>{
  assert.deepEqual(calculateRevenue({customers:1000,price:100,variableCost:25,fixedCost:10000,target:1000000}),{mrr:100000,arr:1200000,monthlyGrossProfit:75000,monthlyOperatingEstimate:65000,targetCustomers:834,margin:75});
  assert.equal(calculateRevenue({customers:0,price:0,variableCost:5,fixedCost:0,target:1000000}).targetCustomers,null);
  assert.throws(()=>calculateRevenue({customers:-1,price:5,variableCost:0,fixedCost:0,target:1}),RangeError);
  assert.throws(()=>calculateRevenue({customers:NaN,price:5,variableCost:0,fixedCost:0,target:1}),RangeError);
});
test('unsafe links and corrupt saved data cannot enter the UI',()=>{
  assert.equal(safeLink('javascript:alert(1)'),null);
  assert.equal(safeLink('https://openai.com/'),'https://openai.com/');
  assert.equal(safeLink('https://secret@example.com/'),null);
  assert.deepEqual(readSaved('{broken'),[]);
  assert.deepEqual(readSaved('["claude","claude",42]'),['claude']);
});
