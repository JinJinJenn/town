import * as THREE from '../vendor/three.module.js';
import { MEDIA_FILES, planIllustratedLayers } from './v6-media.js';
export { planIllustratedLayers } from './v6-media.js';

export function createMediaLibrary(){
  const loader=new THREE.TextureLoader(),textures={},errors=[];
  const library={textures,errors,status:'loading',ready:null,atlas:null,rects:{}};
  library.ready=Promise.all(Object.entries(MEDIA_FILES).map(async([key,file])=>{
    try{const t=await loader.loadAsync(new URL(`../assets/v6/${file}`,import.meta.url).href);t.colorSpace=THREE.SRGBColorSpace;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;textures[key]=t;}catch{errors.push(key);}
  })).then(()=>{
    // Four-pixel transparent gutters prevent neighboring art bleeding into mip levels.
    const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
    const ctx=canvas.getContext('2d');let count=0;
    for(const [index,key] of ['hedge','planter','sign'].entries()){
      const image=textures[key]?.image;if(!image)continue;
      const x=(index%2)*128+4,y=Math.floor(index/2)*128+4,w=image.width,h=image.height;
      ctx.drawImage(image,x,y);library.rects[key]=[(x+.5)/256,1-(y+h-.5)/256,(w-1)/256,(h-1)/256];count++;
    }
    if(count){library.atlas=new THREE.CanvasTexture(canvas);library.atlas.colorSpace=THREE.SRGBColorSpace;library.atlas.minFilter=THREE.LinearMipmapLinearFilter;library.atlas.name='Town V7 garden atlas';}
    library.status=errors.length?(Object.keys(textures).length?'partial':'unavailable'):'ready';return library;
  });return library;
}

export function mountIllustratedLayers(world,library,{enabled=true,evening=false}={}){
  const plan=planIllustratedLayers(world.plan),entries=[];
  for(const [kind,list] of Object.entries(plan))if(library.rects[kind])for(const entry of list)entries.push({...entry,kind});
  const root=new THREE.Group();root.name='v7-atlased-gardens';root.visible=enabled;world.group.add(root);
  let geometry=null,material=null,mesh=null,petalGeometry=null;
  if(entries.length&&library.atlas){
    geometry=new THREE.PlaneGeometry(1,1);const uvRects=new Float32Array(entries.length*4);
    material=new THREE.MeshBasicMaterial({map:library.atlas,side:THREE.DoubleSide,alphaTest:.22,depthWrite:true,fog:true});
    material.onBeforeCompile=shader=>{
      shader.vertexShader='attribute vec4 cardUv;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\nvMapUv=cardUv.xy+vMapUv*cardUv.zw;');
      shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`vec4 cardCenter=modelViewMatrix*instanceMatrix*vec4(0.0,0.0,0.0,1.0);
        vec2 cardSize=vec2(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz));
        vec4 mvPosition=cardCenter+vec4(position.x*cardSize.x,(position.y+.5)*cardSize.y,0.0,0.0);
        gl_Position=projectionMatrix*mvPosition;`);
    };
    material.customProgramCacheKey=()=> 'town-v7-atlas-card';mesh=new THREE.InstancedMesh(geometry,material,entries.length);mesh.frustumCulled=false;mesh.name='v7-garden-atlas';
    const dummy=new THREE.Object3D();entries.forEach((entry,i)=>{dummy.position.set(entry.x,entry.y,entry.z);dummy.scale.set(entry.width,entry.height,1);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);uvRects.set(library.rects[entry.kind],i*4);});
    geometry.setAttribute('cardUv',new THREE.InstancedBufferAttribute(uvRects,4));mesh.instanceMatrix.needsUpdate=true;root.add(mesh);
  }
  const petals=world.group.getObjectByName('v4-petals');
  if(petals&&library.textures.petal){petalGeometry=new THREE.PlaneGeometry(.22,.14);petals.geometry=petalGeometry;petals.material.map=library.textures.petal;petals.material.color.set('#ffffff');petals.material.alphaTest=.12;petals.material.transparent=true;petals.material.needsUpdate=true;}
  function setEvening(value){material?.color.set(value?'#c7b6dc':'#ffffff');}setEvening(evening);
  return {setEnabled(value){root.visible=!!value;},setEvening,
    info(){return {enabled:root.visible,status:library.status,cards:entries.length,batches:mesh?1:0,atlasSize:library.atlas?256:0,textureCount:(library.atlas?1:0)+(library.textures.petal?1:0),texturedPetals:!!petalGeometry,failedAssets:[...library.errors]};},
    dispose(){world.group.remove(root);mesh?.dispose();geometry?.dispose();material?.dispose();petalGeometry?.dispose();}
  };
}
