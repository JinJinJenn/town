import * as THREE from '../vendor/three.module.js';
import {rng} from './plan.js';

export function enhanceV4Kit(kit){
  const {box,part,ball,beam,group}=kit;
  const tree=kit.tree;
  kit.tree=(parent,x,z,random,pink=false,scale=1)=>{
    tree(parent,x,z,random,pink,scale);
    if(!pink)return;
    const t=parent.children.at(-1),r=rng(`v4-blossom:${x}:${z}:${scale}`);
    for(let i=0;i<18;i++){
      const a=i*2.399,radius=1.15+r()*.9,xx=Math.cos(a)*radius,zz=Math.sin(a)*radius,y=3.7+r()*1.65;
      for(let j=0;j<5;j++)part(t,'bud',i%3?'#f2bfd3':'#ffe6e8',[xx+Math.cos(j*1.256)*.12,y,zz+Math.sin(j*1.256)*.12],[.23,.13,.23]);
      part(t,'bud','#efcb8e',[xx,y+.055,zz],[.085,.065,.085]);
    }
  };
  const dress=kit.dressLot;
  kit.dressLot=(g,lot)=>{
    dress(g,lot);
    if(!lot.furnished)return;
    const arch=group(g,0,0,8.05);
    for(const sign of [-1,1]){
      box(arch,'#f1e5d4',[sign*1.2,1.25,0],[.14,2.5,.16]);
      box(arch,'#d6bba7',[sign*1.2,1.25,0],[.04,2.5,.18]);
      for(let i=0;i<7;i++){
        const y=.5+i*.3,xx=sign*(1.2+Math.sin(i)*.08);
        part(arch,'leaf','#8ca77a',[xx,y,.05],[.25,.15,.18]);
        part(arch,'bud',i%2?'#e4a5c0':'#f6d5de',[xx+sign*.05,y+.11,.1],[.22,.19,.2]);
      }
    }
    for(let i=0;i<8;i++){
      const a=i*Math.PI/8,b=(i+1)*Math.PI/8;
      beam(arch,'#e8d3bf',[Math.cos(a)*1.2,2.5+Math.sin(a)*.42,0],[Math.cos(b)*1.2,2.5+Math.sin(b)*.42,0],.13);
      part(arch,'leaf','#8ba275',[Math.cos(a)*1.2,2.52+Math.sin(a)*.42,0],[.32,.2,.3]);
      part(arch,'bud','#edb3c9',[Math.cos(a)*1.2,2.64+Math.sin(a)*.42,.1],[.22,.18,.24]);
    }
    for(let i=0;i<4;i++)part(g,'round',i%2?'#e6cebd':'#efddcd',[0,.075,6.1+i*.55],[1.35,.055,.45],[0,Math.sin(i)*.045,0]);
  };
  return kit;
}

// A bounded, deterministic petal batch. The GPU moves it using simulation time,
// so pause and reduced-motion settings stop the effect without per-frame uploads.
export function createPetals(kit,world,enabled=true){
  const r=rng(`${world.plan.seed}:v4-petals`),count=96;
  const geometry=new THREE.CircleGeometry(.08,5);
  const material=new THREE.MeshBasicMaterial({color:'#f2bfd3',side:THREE.DoubleSide,depthWrite:false});
  material.onBeforeCompile=shader=>{
    shader.uniforms.townTime=kit.artTime;
    shader.vertexShader='uniform float townTime;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`
      vec4 mvPosition=vec4(transformed,1.0);
      #ifdef USE_INSTANCING
      mvPosition=instanceMatrix*mvPosition;
      #endif
      float phase=mvPosition.x*.72+mvPosition.z*.31;
      mvPosition.y=mod(mvPosition.y-townTime*.28+10000.0,6.0)+.6;
      mvPosition.x+=sin(townTime*.45+phase)*.7;
      mvPosition.z+=cos(townTime*.32+phase)*.35;
      mvPosition=modelViewMatrix*mvPosition;
      gl_Position=projectionMatrix*mvPosition;
    `);
  };
  material.customProgramCacheKey=()=> 'town-petals-v4';
  const mesh=new THREE.InstancedMesh(geometry,material,count),dummy=new THREE.Object3D();
  for(let i=0;i<count;i++){
    const lot=world.plan.lots[i%world.plan.lots.length];
    dummy.position.set(lot.x+(r()-.5)*17,1+r()*5,lot.z+(r()-.5)*17);
    dummy.rotation.set(r()*Math.PI,r()*Math.PI,r()*Math.PI);dummy.scale.setScalar(.7+r()*.6);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate=true;mesh.frustumCulled=false;mesh.visible=enabled;mesh.name='v4-petals';world.group.add(mesh);
  const dispose=world.dispose;
  world.dispose=()=>{mesh.dispose();geometry.dispose();material.dispose();dispose.call(world);};
  world.setPetals=value=>mesh.visible=!!value;
  world.stats.petalInstances=count;
  return mesh;
}
