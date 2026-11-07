import {readFile,writeFile} from 'node:fs/promises';
// Idempotent fixes from the first actual WebGL review.
let s=await readFile('src/v10-fixtures.js','utf8');
s=s.replace(/\bactive\b/g,'screenOn');
await writeFile('src/v10-fixtures.js',s);
s=await readFile('src/v10-hud.js','utf8');
if(!s.includes('ctx.rect(0,0,64,76)'))s=s.replace('ctx.translate(x,y);','ctx.translate(x,y);ctx.beginPath();ctx.rect(0,0,64,76);ctx.clip();');
if(!s.includes('closeContext(){'))s=s.replace('openContext(kind,x,y){',"closeContext(){context=null;stamp='';},openContext(kind,x,y){");
s=s.replace("if(id==='menu'){menu=", "if(id==='menu'){context=null;menu=");
s=s.replace("if(id==='roster'){menu=", "if(id==='roster'){context=null;menu=");
s=s.replace("if(key==='Escape'){menu=menu?'':'options';", "if(key==='Escape'){if(context)context=null;else menu=menu?'':'options';");
await writeFile('src/v10-hud.js',s);
s=await readFile('src/main-v10.js','utf8');
s=s.replace('function selectAt(x,y){const r=', 'function selectAt(x,y){hud.closeContext();const r=');
await writeFile('src/main-v10.js',s);
console.log('V10 shader compilation, portrait clipping and contextual-menu dismissal fixes applied.');
