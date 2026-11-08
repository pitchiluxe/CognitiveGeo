export const REVIEWED_ON = '2026-11-08';
export const REGION_NAMES = {americas:'Americas',europe:'Europe',asia:'Asia & Middle East',africa:'Africa',oceania:'Oceania'};
export const FACTOR_NAMES = ['Buyer budget','Addressable reach','Pilot feasibility','Distribution fit'];
export function safeLink(value) {
  try { const url=new URL(value); return url.protocol==='https:'&&!url.username&&!url.password?url.href:null; } catch { return null; }
}
export function readSaved(raw) {
  try { const data=JSON.parse(raw); return Array.isArray(data)?[...new Set(data.filter(id=>typeof id==='string'))]:[]; } catch { return []; }
}
export function filterDirectory(data,{search='',region='all',category='all',access='all',era='all',family='all',savedOnly=false,saved=[]}={}) {
  const query=search.trim().toLowerCase();
  return data.filter(x=>(!query||[x.name,x.creator,x.description,x.city,x.country,x.category,x.family].join(' ').toLowerCase().includes(query))&&(region==='all'||x.region===region)&&(category==='all'||x.category===category)&&(access==='all'||x.access===access)&&(era==='all'||x.era===era)&&(family==='all'||x.family===family)&&(!savedOnly||saved.includes(x.id)));
}
export function filterIdeas(data,{search='',region='all',category='all',savedOnly=false,saved=[]}={}) {
  const query=search.trim().toLowerCase();
  return data.filter(x=>(!query||[x.name,x.description,x.sector,x.buyer,...x.markets.map(m=>`${m.city} ${m.country}`)].join(' ').toLowerCase().includes(query))&&(region==='all'||x.markets.some(m=>m.region===region))&&(category==='all'||x.sector===category)&&(!savedOnly||saved.includes(x.id)));
}
export function marketScore(factors) { return Math.round(factors.reduce((sum,n)=>sum+n,0)/factors.length*20); }
export function calculateRevenue({customers,price,variableCost,fixedCost,target}) {
  if([customers,price,variableCost,fixedCost,target].some(n=>!Number.isFinite(n)||n<0))throw new RangeError('Use non-negative, finite numbers.');
  const mrr=customers*price,monthlyGrossProfit=customers*(price-variableCost);
  return {mrr,arr:mrr*12,monthlyGrossProfit,monthlyOperatingEstimate:monthlyGrossProfit-fixedCost,targetCustomers:price>0?Math.ceil(target/(price*12)):null,margin:price>0?(price-variableCost)/price*100:0};
}
export async function loadDiscoveryData() {
  const results=await Promise.all(['catalog.json','opportunities.json'].map(async file=>{const response=await fetch(`${import.meta.env.BASE_URL}${file}`);if(!response.ok)throw new Error(`Could not load ${file}. Reload to retry.`);return response.json();}));
  const [catalog,ideas]=results;
  if(!Array.isArray(catalog)||!Array.isArray(ideas)||!catalog.length||!ideas.length)throw new Error('Discovery datasets must be non-empty arrays.');
  const ids=new Set();
  for(const entry of [...catalog,...ideas]){if(!entry.id||ids.has(entry.id)||!entry.name)throw new Error('Invalid or duplicate discovery entry.');ids.add(entry.id);}
  for(const entry of catalog){if(!safeLink(entry.url)||!safeLink(entry.creatorUrl)||!entry.sources?.every(s=>safeLink(s.url))||!validCoordinates(entry.coordinates))throw new Error('Invalid directory sources or coordinates.');}
  for(const idea of ideas){if(!idea.markets?.length||!idea.markets.every(m=>validCoordinates(m.coordinates)&&m.factors.length===4&&m.factors.every(v=>v>=1&&v<=5)))throw new Error('Invalid opportunity markets.');}
  return {catalog,ideas};
}
function validCoordinates(c){return Array.isArray(c)&&c.length===2&&c.every(Number.isFinite)&&Math.abs(c[0])<=90&&Math.abs(c[1])<=180;}
