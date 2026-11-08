import {readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const files=(await readdir('release')).filter(file=>file.endsWith('.exe')||file.endsWith('.blockmap')||file==='latest.yml');
if(!files.some(file=>file.endsWith('.exe')))throw new Error('No Windows installer found in release/.');
const sums=await Promise.all(files.sort().map(async file=>`${createHash('sha256').update(await readFile(`release/${file}`)).digest('hex')}  ${file}`));
await writeFile('release/SHA256SUMS.txt',sums.join('\n')+'\n');
console.log(`Wrote checksums for ${files.length} release assets.`);
