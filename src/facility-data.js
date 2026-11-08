import { safeLink,REGION_NAMES } from './discovery-data.js';
export const FACILITY_STATUSES=['Operational','Under construction','Commissioning','In development','Announced','Status unclear'];
export const STATUS_COLORS={'Operational':0x53dfb5,'Under construction':0xf1bb65,'Commissioning':0x82c7e2,'In development':0xb7a1ed,'Announced':0xa28cc9,'Status unclear':0x84959e};
export function filterFacilities(entries,{search='',status='all',operator='all',region='all',savedOnly=false,saved=[]}={}){const query=search.trim().toLowerCase();return entries.filter(x=>(!query||[x.name,x.operator,x.city,x.country,x.description].join(' ').toLowerCase().includes(query))&&(status==='all'||x.status===status)&&(operator==='all'||x.operator===operator)&&(region==='all'||x.region===region)&&(!savedOnly||saved.includes(x.id)));}
export function normalizeFacilities(input){
  const raw=input?.type==='FeatureCollection'?input.features?.map(f=>{if(f.geometry?.type!=='Point')throw new Error('GeoJSON facilities must be Point features.');return {...f.properties,coordinates:[f.geometry.coordinates[1],f.geometry.coordinates[0]]};}):Array.isArray(input)?input:input?.entries;
  if(!Array.isArray(raw)||raw.length===0||raw.length>20000)throw new Error('Import 1–20,000 facility records as a JSON array or Point FeatureCollection.');
  const ids=new Set();return raw.map((x,index)=>{
    const textKeys=['id','name','operator','city','country','region','status','reportedOn','sourceUrl'];
    if(textKeys.some(k=>typeof x[k]!=='string'||!x[k].trim()||x[k].length>2000))throw new Error(`Record ${index+1}: missing or invalid required fields.`);
    if(!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,119}$/.test(x.id)||ids.has(x.id))throw new Error(`Record ${index+1}: invalid or duplicate id.`);ids.add(x.id);
    if(!FACILITY_STATUSES.includes(x.status)||!Object.hasOwn(REGION_NAMES,x.region)||!safeLink(x.sourceUrl))throw new Error(`Record ${index+1}: invalid status, region, or HTTPS source.`);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(x.reportedOn)||!Number.isFinite(Date.parse(x.reportedOn))||new Date(x.reportedOn).toISOString().slice(0,10)!==x.reportedOn)throw new Error(`Record ${index+1}: reportedOn must be a valid YYYY-MM-DD date.`);
    if(!Array.isArray(x.coordinates)||x.coordinates.length!==2||!x.coordinates.every(Number.isFinite)||Math.abs(x.coordinates[0])>90||Math.abs(x.coordinates[1])>180)throw new Error(`Record ${index+1}: coordinates must be [latitude, longitude].`);
    return Object.fromEntries([...textKeys,'coordinates','description','targetOpening','locationNote','provenance','reviewedOn'].map(k=>[k,k==='coordinates'?x.coordinates:typeof x[k]==='string'?x[k].slice(0,4000):k==='reviewedOn'?x.reportedOn:'Not specified']));
  });
}
