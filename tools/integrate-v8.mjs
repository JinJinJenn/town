import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
async function patch(file,fn){const before=await readFile(file,'utf8'),after=fn(before);if(after!==before)await writeFile(file,after);}
await patch('src/main.js',s=>{
 if(s.includes("from './v8-props.js'"))return s;
 const old='kit=enhanceV7Kit(optimizeV7Kit(enhanceV5Kit(enhanceV4Kit(enhanceKit(createKit())))))';
 assert.ok(s.includes(old),'V7 kit initializer changed; reconcile instead of replacing blindly.');
 assert.equal(s.split('createArtWorld(kit,createWorld,seed);scene.add(world.group);').length-1,2);
 return "import {enhanceV8Kit,summarizeV8} from './v8-props.js';\n"+s.replace(old,`kit=enhanceV8Kit(${old.slice(4)})`).replaceAll('createArtWorld(kit,createWorld,seed);scene.add(world.group);','createArtWorld(kit,createWorld,seed);world.stats.v8Props=summarizeV8(world.plan);scene.add(world.group);').replace('version:7,detailVersion:','version:8,detailVersion:');
});
await patch('src/home.js',s=>{if(s.includes('kit.dressV8Home?.'))return s;assert.ok(s.includes('  inside.traverse(m=>'));return s.replace('  inside.traverse(m=>','  kit.dressV8Home?.({inside,wallRoots,lot,floor});\n  inside.traverse(m=>');});
await patch('index.html',s=>s.replaceAll('Town V7','Town V8').replaceAll('>V7<','>V8<'));
for(const file of ['package.json','package-lock.json'])await patch(file,s=>s.replaceAll('"0.7.0"','"0.8.0"'));
console.log('V8 prop catalogue and shared-batch integration saved.');
