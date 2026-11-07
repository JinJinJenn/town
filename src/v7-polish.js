import * as THREE from '../vendor/three.module.js';
import { rng } from './plan.js';

// Merge modest immutable assemblies, not dense repeated scenery or editable furniture.
export function optimizeV7Kit(kit) {
  const oldRound=kit.geometries.round, rounded=new THREE.BoxGeometry(1,1,1,3,3,3);
  const v=new THREE.Vector3(),inner=new THREE.Vector3(),normal=new THREE.Vector3();
  for(let i=0;i<rounded.attributes.position.count;i++){
    v.fromBufferAttribute(rounded.attributes.position,i);inner.copy(v).clampScalar(-.41,.41);normal.copy(v).sub(inner).normalize();v.copy(inner).addScaledVector(normal,.09);
    rounded.attributes.position.setXYZ(i,v.x,v.y,v.z);rounded.attributes.normal.setXYZ(i,normal.x,normal.y,normal.z);
  }
  kit.geometries.round=rounded;oldRound.dispose();
  const oldBud=kit.geometries.bud;kit.geometries.bud=new THREE.OctahedronGeometry(.5,0);oldBud.dispose();
  const compile=kit.compile;
  kit.compile=(root,dynamic=false)=>{
    const result=compile(root,dynamic);
    if(dynamic||result.batches.some(b=>b.sources.some(s=>s.userData.paletteRole)))return result;
    const groups=new Map(),owned=[];
    for(const batch of result.batches){
      const material=batch.mesh.material;
      if(material!==kit.materials.matte&&material!==kit.materials.glass&&material!==kit.materials.cloth)continue;
      if(!groups.has(material))groups.set(material,[]);groups.get(material).push(batch);
    }
    for(const [originalMaterial,batches] of groups){
      const vertices=batches.reduce((n,b)=>n+b.mesh.geometry.attributes.position.count*b.mesh.count,0);
      if(batches.length<2||vertices>90000)continue;
      const positions=[],normals=[],uvs=[],colors=[],indices=[];
      const matrix=new THREE.Matrix4(),nm=new THREE.Matrix3(),color=new THREE.Color();
      for(const {mesh} of batches){
        const g=mesh.geometry,p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
        for(let instance=0;instance<mesh.count;instance++){
          mesh.getMatrixAt(instance,matrix);nm.getNormalMatrix(matrix);mesh.getColorAt(instance,color);const offset=positions.length/3;
          for(let i=0;i<p.count;i++){
            v.fromBufferAttribute(p,i).applyMatrix4(matrix);positions.push(v.x,v.y,v.z);
            normal.fromBufferAttribute(n,i).applyMatrix3(nm).normalize();normals.push(normal.x,normal.y,normal.z);
            uvs.push(uv?uv.getX(i):0,uv?uv.getY(i):0);colors.push(color.r,color.g,color.b);
          }
          if(g.index)for(const index of g.index.array)indices.push(offset+index);else for(let i=0;i<p.count;i++)indices.push(offset+i);
        }
      }
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setIndex(indices);geometry.computeBoundingSphere();
      const material=originalMaterial.clone();material.vertexColors=true;
      const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=true;mesh.receiveShadow=true;mesh.name='v7-merged-static';
      for(const batch of batches)result.group.remove(batch.mesh);result.group.add(mesh);owned.push({mesh,geometry,material});
      result.batches=result.batches.filter(b=>!batches.includes(b));result.batches.push({mesh,sources:[]});
    }
    const dispose=result.dispose;result.dispose=()=>{for(const x of owned){x.geometry.dispose();x.material.dispose();}dispose();};return result;
  };
  const dress=kit.dressLot;
  kit.dressLot=(g,lot)=>{
    dress(g,lot);const r=rng(`${lot.gardenSeed}:v7-border`),count=lot.furnished?80:18;
    for(let i=0;i<count;i++){
      const side=i%2?-1:1,x=side*(6.1+r()*1.6),z=-7.5+r()*15,y=.25+r()*.32;
      kit.part(g,'leaf',i%2?'#54a659':'#80bd60',[x,y-.12,z],[.24,.32,.2]);
      kit.part(g,'roseFlower',['#ff7cb8','#ffecc3','#b991ed'][i%3],[x,y+.12,z],[.32,.32,.32],[.18,r()*6.28,.1],'cloth');
    }
    if(!lot.furnished)return;
    for(const side of [-1,1])for(let i=0;i<18;i++){
      const z=-7.6+i*.88;kit.part(g,'leaf','#5b9b55',[side*8.08,.8+Math.sin(i*.8)*.12,z],[.4,.22,.32]);kit.part(g,'bud',i%3?'#f184b2':'#fff0da',[side*8.03,1.05,z],[.22,.2,.23]);
    }
  };kit.artVersion='07-cottage-detail';return kit;
}

export function dressV7Home(kit,{inside,wallRoots,lot,floor}){
  const {box,cyl,part,group,beam}=kit,root=group(inside);root.name='v7-lived-in-details';
  const colors=['#e888b4','#94b57a','#ddba74','#a49bc6','#79b7ac'];
  function books(g,x,y,z,count=4){for(let i=0;i<count;i++)box(g,colors[i%colors.length],[x,y+i*.055,z],[.36-i*.022,.045,.25],[0,i*.1,0]);}
  function cup(g,x,y,z){cyl(g,'#fff0df',[x,y,z],[.16,.15,.16]);cyl(g,'#815737',[x,y+.08,z],[.125,.006,.125]);part(g,'ring','#fff0df',[x+.09,y,z],[.09,.09,.09]);}
  books(root,-3.55,floor+.53,3.03,4);
  for(const x of [-3.78,-2.8]){cyl(root,'#ffecd5',[x,floor+.94,-1.15],[.3,.025,.3]);cup(root,x,floor+1.025,-1.15);}
  for(let i=0;i<7;i++){const a=i*2.4;part(root,'bud',i%2?'#ff82b3':'#ffe6b0',[-3.3+Math.sin(a)*.13,floor+1.33+(i%3)*.05,-1.15+Math.cos(a)*.13],[.16,.12,.16]);}
  books(root,4.87,floor+.87,-3.45,3);
  for(const side of [-1,1])part(root,'round',side<0?'#f7ddb9':'#85b57c',[-3+side*1.03,floor+.82,.94],[.3,.32,.14],[.12,0,side*.1]);
  for(let i=0;i<4;i++)box(root,i%2?'#f4ced9':'#fff1df',[1.48,floor+.91+i*.045,3.84],[.35,.04,.3]);
  for(let i=0;i<3;i++){cyl(root,i%2?'#cf8cab':'#fff0d0',[4.9,floor+.83,1.65+i*.22],[.11,.17,.11]);part(root,'bud','#ffd6a0',[4.9,floor+.94,1.65+i*.22],[.04,.06,.04]);}
  for(const side of ['back','left']){
    const vine=group(wallRoots[side],side==='left'?-lot.width/2+.2:-4.9,3.6,side==='left'?-3.7:-lot.depth/2+.2,side==='left'?Math.PI/2:0);
    for(let i=0;i<13;i++){
      const x=Math.sin(i*.75)*.16,y=-i*.17;if(i)beam(vine,'#6c9350',[Math.sin((i-1)*.75)*.16,y+.17,0],[x,y,0],.025);
      part(vine,'leaf',i%2?'#72b46b':'#a5ca79',[x+(i%2?.13:-.13),y,.04],[.28,.13,.06],[0,0,(i%2?1:-1)*.4]);if(i%3===0)part(vine,'bud','#ef8eb8',[x,y,.1],[.15,.14,.08]);
    }
  }
}
