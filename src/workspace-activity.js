const KEY='cognitivegeo-observed-activity-v1';
export function readActivity(){try{const rows=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(rows)?rows.filter(x=>x&&typeof x.id==='string'&&typeof x.kind==='string'&&typeof x.summary==='string'&&Number.isFinite(Date.parse(x.at))).slice(-200):[];}catch{return [];}}
export function recordActivity(kind,summary){const rows=readActivity();rows.push({id:crypto.randomUUID(),kind:String(kind).slice(0,60),summary:String(summary).slice(0,400),at:new Date().toISOString()});try{localStorage.setItem(KEY,JSON.stringify(rows.slice(-200)));}catch{}return rows.at(-1);}
export function clearActivity(){try{localStorage.removeItem(KEY);}catch{}}
