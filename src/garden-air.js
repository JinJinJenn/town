import * as THREE from '../vendor/three.module.js';
import {rng} from './plan.js';

// One instanced draw call, no alpha sorting and no CPU particle transforms.
export function createGardenAir(kit,plan) {
  const roots=plan.lots.filter(lot=>lot.kind!=='cafe'), count=roots.length*8;
  const geometry=new THREE.PlaneGeometry(.15,.09), material=new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide});
  const time={value:0};
  material.onBeforeCompile=shader=>{
    shader.uniforms.petalTime=time;
    shader.vertexShader='uniform float petalTime;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      float phase=instanceMatrix[3].x*.71+instanceMatrix[3].z*.37;
      float flutter=sin(petalTime*1.3+phase);
      transformed.x+=flutter*.17;
      transformed.z+=cos(petalTime*.62+phase)*.45;
      transformed.y+=mod(phase-petalTime*.20,4.8)-2.0;
    `);
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      vec2 p=vUv*2.0-1.0;
      if(dot(p,p)>1.0)discard;
    `);
  };
  // Enable UVs for the elliptical petal mask without loading a texture.
  material.defines={USE_UV:''};material.customProgramCacheKey=()=> 'town-v4-petals';
  const mesh=new THREE.InstancedMesh(geometry,material,count),dummy=new THREE.Object3D(),c=new THREE.Color();let n=0;
  for(const lot of roots){const r=rng(`${lot.gardenSeed}:petals-v4`);for(let i=0;i<8;i++){
    dummy.position.set(lot.x+(r()-.5)*15,2.2,lot.z+(r()-.5)*15);
    dummy.rotation.set(r()*2.8,r()*6.28,r()*6.28);dummy.scale.setScalar(.6+r()*.9);dummy.updateMatrix();
    mesh.setMatrixAt(n,dummy.matrix);mesh.setColorAt(n,c.set(i%3?'#f3c4d5':'#fbe2df'));n++;
  }}
  mesh.instanceMatrix.needsUpdate=true;mesh.frustumCulled=false;mesh.castShadow=false;mesh.receiveShadow=false;
  return {group:mesh,count,time,setEnabled(value){mesh.visible=!!value;},step(dt){time.value+=dt;},dispose(){mesh.dispose();geometry.dispose();material.dispose();}};
}
