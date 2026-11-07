import * as THREE from '../vendor/three.module.js';
import {rng} from './plan.js';
export const MEDIA_FILES=Object.freeze({hedge:'hedge.webp',planter:'planter.webp',sign:'sign.webp',petal:'petal.webp'});
const sizes={hedge:[96,50],planter:[96,91],sign:[95,96]};
// Only garden margins receive cards; interaction and navigation stay fully 3D.
export function planIllustratedLayers(plan){
 const groups={hedge:[],planter:[],sign:[]};
 function add(type,lot,x,z,width){const c=Math.cos(lot.rotation),s=Math.sin(lot.rotation);groups[type].push({lot:lot.id,x:lot.x+c*x+s*z,z:lot.z-s*x+c*z,y:.43,width,height:width*sizes[type][1]/sizes[type][0]});}
 for(const lot of plan.lots){
  const r=rng(`${plan.seed}:v6-cards:${lot.id}`);
  for(const side of [-1,1]){
   add('hedge',lot,side*5.7,-7.55,2.6+r()*.35);add('hedge',lot,side*5.7,7.55,2.6+r()*.35);
   add('planter',lot,side*7.3,lot.kind==='park'?-1.6:1.4,1.15+r()*.25);
  }
  if(lot.kind==='park'||lot.kind==='cafe')add('sign',lot,4.7,5.4,1.65);
 }
 return groups;
}
export function createMediaLibrary(){
 const loader=new THREE.TextureLoader(),textures={},errors=[];
 const library={textures,errors,status:'loading',ready:null};
 library.ready=Promise.all(Object.entries(MEDIA_FILES).map(async([key,file])=>{
  try{const texture=await loader.loadAsync(new URL(`../assets/v6/${file}`,import.meta.url).href);texture.colorSpace=THREE.SRGBColorSpace;texture.generateMipmaps=true;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.magFilter=THREE.LinearFilter;texture.name=`Town V6 ${key}`;textures[key]=texture;}catch{errors.push(key);}
 })).then(()=>{library.status=errors.length?(Object.keys(textures).length?'partial':'unavailable'):'ready';return library;});
 return library;
}
export function mountIllustratedLayers(world,library,{enabled=true,evening=false}={}){
 const data=planIllustratedLayers(world.plan),root=new THREE.Group();root.name='v6-illustrated-gardens';world.group.add(root);
 const meshes=[],materials=[],geometry=new THREE.PlaneGeometry(1,1),dummy=new THREE.Object3D();
 for(const [kind,entries] of Object.entries(data)){
  const map=library.textures[kind];if(!map)continue;
  const material=new THREE.MeshBasicMaterial({map,side:THREE.DoubleSide,alphaTest:.22,transparent:false,depthWrite:true,fog:true});
  // View-space expansion keeps the card's bottom-center anchored to the ground.
  // Alpha testing writes only visible art into depth, preserving 3D occlusion.
  material.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`
   vec4 cardCenter=modelViewMatrix*instanceMatrix*vec4(0.0,0.0,0.0,1.0);
   vec2 cardSize=vec2(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz));
   vec4 mvPosition=cardCenter+vec4(position.x*cardSize.x,(position.y+.5)*cardSize.y,0.0,0.0);
   gl_Position=projectionMatrix*mvPosition;
  `);};
  material.customProgramCacheKey=()=> 'town-v6-grounded-card';
  const mesh=new THREE.InstancedMesh(geometry,material,entries.length);mesh.name=`v6-${kind}`;mesh.frustumCulled=false;
  entries.forEach((entry,i)=>{dummy.position.set(entry.x,entry.y,entry.z);dummy.rotation.set(0,0,0);dummy.scale.set(entry.width,entry.height,1);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});
  mesh.instanceMatrix.needsUpdate=true;root.add(mesh);meshes.push(mesh);materials.push(material);
 }
 root.visible=enabled;
 const petals=world.group.getObjectByName('v4-petals');let petalGeometry=null;
 if(petals&&library.textures.petal){petalGeometry=new THREE.PlaneGeometry(.22,.14);petals.geometry=petalGeometry;petals.material.map=library.textures.petal;petals.material.color.set('#ffffff');petals.material.alphaTest=.12;petals.material.transparent=true;petals.material.needsUpdate=true;}
 function setEvening(value){for(const material of materials)material.color.set(value?'#c7b6dc':'#ffffff');}setEvening(evening);
 return {setEnabled(value){root.visible=!!value;},setEvening,
  info(){return {enabled:root.visible,status:library.status,cards:meshes.reduce((n,m)=>n+m.count,0),batches:meshes.length,textureCount:Object.keys(library.textures).length,texturedPetals:!!petalGeometry,failedAssets:[...library.errors]};},
  dispose(){world.group.remove(root);for(const mesh of meshes)mesh.dispose();for(const material of materials)material.dispose();geometry.dispose();petalGeometry?.dispose();}
 };
}
