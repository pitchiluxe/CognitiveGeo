import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeFacilities,filterFacilities } from '../src/facility-data.js';
const entry={id:'dc-example',name:'Example campus',operator:'Example',city:'Atlanta',country:'United States',region:'americas',coordinates:[33.749,-84.388],status:'Under construction',reportedOn:'2026-11-08',sourceUrl:'https://example.com/project',description:'Construction reported by operator.'};
test('facility status, operator, region and text filters combine',()=>{
  assert.equal(filterFacilities([entry],{status:'Under construction',operator:'Example',region:'americas',search:'Atlanta'}).length,1);
  assert.equal(filterFacilities([entry],{status:'Operational'}).length,0);
});
test('facility imports reject invalid coordinates, unsafe sources, statuses and duplicate identifiers',()=>{
  assert.equal(normalizeFacilities([entry])[0].status,'Under construction');
  for(const changed of [{coordinates:[999,0]},{sourceUrl:'javascript:alert(1)'},{status:'Probably running'},{reportedOn:'2026-99-99'}])assert.throws(()=>normalizeFacilities([{...entry,...changed}]));
  assert.throws(()=>normalizeFacilities([entry,entry]));
  assert.throws(()=>normalizeFacilities({}));
});
test('GeoJSON imports use longitude/latitude and preserve explicit status',()=>{
  const [result]=normalizeFacilities({type:'FeatureCollection',features:[{type:'Feature',geometry:{type:'Point',coordinates:[-84.388,33.749]},properties:entry}]});
  assert.deepEqual(result.coordinates,[33.749,-84.388]);assert.equal(result.status,'Under construction');
});
