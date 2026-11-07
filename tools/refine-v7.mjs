import {readFile,writeFile} from 'node:fs/promises';
const path='src/v7-detail.js';let s=await readFile(path,'utf8');
for(const [a,b] of [
 ["[-2.75,2.35", "[2.75,2.35"],
 ["[-2.93,2.35", "[2.57,2.35"],
 ["[-1.55,1.94,.25],[-.55,1.94,.25]", "[.55,1.94,.25],[1.55,1.94,.25]"],
 ["[-1.4+i*.28,1.66,.3]", "[.7+i*.28,1.66,.3]"],
 ["for(const x of [-2.3,2.3,-7.55,7.55]){\n      const z=Math.abs(x)<3?7.48:4.4;", "for(const x of [-7.55,7.55]){\n      const z=4.4;"],
 ["for(const x of [-3.6,3.6]){", "for(const x of [-3.6,-1.1]){"],
]){if(s.includes(b))continue;if(!s.includes(a))throw new Error(`V7 refinement anchor missing: ${a}`);s=s.split(a).join(b);}
await writeFile(path,s);console.log('V7 herb beds clear the existing raised bed; bathroom decor is correctly oriented; duplicate gate lamps are avoided.');
