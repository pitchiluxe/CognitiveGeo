import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { filterClusters, projectCount } from '../src/telemetry.js';
const data=JSON.parse(await readFile(new URL('../public/data.json',import.meta.url),'utf8'));
test('provided records retain their specified telemetry',()=>{
  assert.equal(data.length,18);
  assert.equal(new Set(data.map(c=>c.clusterId)).size,18);
  assert.deepEqual(data[0].coordinates,[33.9558,-83.9879]);
  assert.equal(data[0].activeModels[0].tokensPerSecond,85.4);
  assert.equal(data[1].cybersecurity.mcpGatewayStatus,'VULNERABLE');
  for(const c of data){assert.ok(c.coordinates[0]>=-90&&c.coordinates[0]<=90);assert.ok(c.coordinates[1]>=-180&&c.coordinates[1]<=180);assert.ok(c.activeModels.every(m=>m.tokensPerSecond>0&&m.allocatedContext>0));}
});
test('search, region and model filters combine and handle empty results',()=>{
  assert.equal(filterClusters(data,{search:'PARIS',region:'europe',model:'llama'})[0].clusterId,'node-eu-west-12');
  assert.equal(filterClusters(data,{search:'Paris',region:'asia'}).length,0);
  assert.equal(filterClusters(data,{model:'nonexistent'}).length,0);
  assert.equal(filterClusters(data,{}).length,18);
  assert.equal(filterClusters(data,{search:'node-us-east-04'})[0].location.city,'Lawrenceville');
});
test('timeline anchors current count and projects positive monotonic growth',()=>{
  assert.equal(projectCount(2026),12846);
  for(let year=2022;year<2030;year++){assert.ok(projectCount(year)>0);assert.ok(projectCount(year+1)>projectCount(year));}
  assert.equal(projectCount(2027),Math.round(12846*1.49));
});
