import { mkdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
await mkdir(path.join(root,'vendor'),{recursive:true});
try {
  for(const file of ['three.module.js','three.core.js'])await copyFile(path.join(root,'node_modules/three/build',file),path.join(root,'vendor',file));
  await copyFile(path.join(root,'node_modules/three/LICENSE'),path.join(root,'vendor/THREE-LICENSE.txt'));
  console.log('Pinned Three.js runtime copied to vendor/. Town can now run without a CDN.');
} catch(error) {
  console.error('Run npm install first, then npm run vendor.');
  throw error;
}
