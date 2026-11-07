import * as THREE from '../vendor/three.module.js';
import { rng } from './plan.js';

// Checkpoint 03: the approved pastel diorama, implemented as reusable geometry.
// All additions use independent random streams and join the existing batches.
export const ART_VERSION = '03-pastel-gardens';
export function plantingPlan(lot) {
  const r = rng(`${lot.gardenSeed}:art03`), beds = [];
  if (lot.kind === 'park') {
    for (const x of [-7.1, 7.1]) for (const z of [-4.6, -2.4, 2.6, 4.5]) beds.push({x,z,size:.8+r()*.2});
    for (const x of [-4.2,-2,2.2,4.2]) beds.push({x,z:-7.1,size:.75+r()*.2});
  } else {
    for (const x of [-7.05,7.05]) for (const z of [-4.5,-2.1,.3,2.7,5.1]) {
      // Benches need a clear seat and approach, even before they are interactive.
      if(lot.kind==='cafe' && x<0 && Math.abs(z)<1.6)continue;
      if(lot.kind!=='cafe' && x>0 && z>1 && z<4)continue;
      beds.push({x,z,size:.72+r()*.16});
    }
    for (const x of [-5.9,-3.7,3.7,5.9]) beds.push({x,z:7.25,size:.68+r()*.1});
  }
  return beds;
}

export function raisedBedPlan(){return {x:4.25,z:-7.25,width:1.75};}

export function enhanceKit(kit) {
  const {part,box,ball,cyl,beam,group,shadow} = kit;
  const time = {value:0};
  kit.artTime = time;
  kit.artVersion = ART_VERSION;
  const crown = new THREE.IcosahedronGeometry(.5,1);
  // Keep the silhouette faceted, but soften its normals like painted clay.
  const pos=crown.attributes.position, norm=crown.attributes.normal, v=new THREE.Vector3();
  crown.computeVertexNormals();
  for(let i=0;i<pos.count;i++) {
    v.fromBufferAttribute(pos,i).normalize().multiplyScalar(.65);
    v.addScaledVector(new THREE.Vector3().fromBufferAttribute(norm,i),.35).normalize();
    norm.setXYZ(i,v.x,v.y,v.z);
  }
  kit.geometries.crown=crown;
  kit.geometries.bud=new THREE.IcosahedronGeometry(.5,0);
  const canopy=new THREE.BufferGeometry();
  canopy.setAttribute('position',new THREE.Float32BufferAttribute([
    0,.22,0, .5,0,0, .433,0,.25,
    .5,0,0, .483,-.065,.1294, .433,0,.25,
  ],3));canopy.computeVertexNormals();kit.geometries.canopy=canopy;
  kit.materials.cloth=kit.materials.matte.clone();kit.materials.cloth.side=THREE.DoubleSide;
  kit.materials.lantern=new THREE.MeshStandardMaterial({color:'#fff1d2',roughness:.7,emissive:'#ffb35b',emissiveIntensity:1.5});
  kit.materials.water.roughness=.24;
  kit.materials.water.metalness=.08;
  kit.materials.water.onBeforeCompile=s=>{
    s.uniforms.artTime=time;
    s.vertexShader='varying vec3 vPondPosition;\n'+s.vertexShader;
    s.vertexShader=s.vertexShader.replace('#include <worldpos_vertex>',`#include <worldpos_vertex>
      vec4 pondPosition=vec4(transformed,1.0);
      #ifdef USE_INSTANCING
      pondPosition=instanceMatrix*pondPosition;
      #endif
      vPondPosition=(modelMatrix*pondPosition).xyz;
    `);
    s.fragmentShader='uniform float artTime; varying vec3 vPondPosition;\n'+s.fragmentShader;
    s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      float ripple=sin(vPondPosition.x*6.5+sin(vPondPosition.z*2.4)+artTime*.75)*sin(vPondPosition.z*5.1-artTime*.55);
      float light=smoothstep(.7,.95,ripple);
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.56,.77,.68),light*.23);
    `);
  };
  kit.materials.water.customProgramCacheKey=()=> 'pond-ripples-art03';
  kit.materials.glass.emissive.set('#ffc783');kit.materials.glass.emissiveIntensity=.24;
  kit.materials.shadow.opacity=.5;

  // Preserve source recipes; recolor the assembled pieces rather than rerolling lots.
  const replacements={
    '#a7b0a7':'#999ba5','#d9ddcb':'#d4cdc8','#e6e6d3':'#ede2d7',
    '#b5c49b':'#a4b58c','#b2c394':'#a3b77f','#d5d1bb':'#c7b9a9','#e5dfcc':'#eadcc9',
    '#e4d4b5':'#ebd9bc','#dfc2b8':'#e8b7b2','#d6debe':'#d1d9b8','#e9d9b7':'#ecd7b9',
    '#d7c9b9':'#e8c9be','#8da89b':'#8ba99a','#a494aa':'#9b8cb3','#8e9eac':'#899cba',
    '#ad91a4':'#bc8ba1','#9891b0':'#9f91bc','#9dbbb4':'#d6c29e','#abc7be':'#dfccaa',
    '#a7c3b6':'#deccae','#c7929e':'#cb8f9e','#e9dfcb':'#f5e5d1',
    '#a0c3b1':'#8bbcb5','#81b2a6':'#71b7b0','#99c4b3':'#83b9b4',
  };
  const compile=kit.compile;
  kit.compile=(root,dynamic=false)=>{
    root.traverse(m=>{
      if(!m.userData.part||m.userData.artColored)return;
      const key='#'+m.userData.color.getHexString();
      if(replacements[key])m.userData.color.set(replacements[key]);
      m.userData.artColored=true;
    });
    return compile(root,dynamic);
  };
  function foliage(g,c,p,s,angle=0) {return part(g,'crown',c,p,s,[0,angle,0]);}
  function hydrangea(g,x,z,r,size=1) {
    const f=group(g,x,0,z);f.scale.setScalar(size);
    shadow(f,0,0,1.8,1.5,.012);
    for(let i=0;i<5;i++){
      const a=i*2.4;foliage(f,['#718c62','#849f70','#92ab7a'][i%3],[Math.sin(a)*.38,.35+(i%2)*.12,Math.cos(a)*.33],[.9,.72,.85],a);
    }
    const palette=['#d995b1','#ecc2ce','#f5dfd7','#c5b2d7'];
    const color=palette[Math.floor(r()*palette.length)];
    for(let i=0;i<7;i++){
      const a=i*2.4, rr=i===0?0:.48, x=Math.cos(a)*rr,z=Math.sin(a)*rr,y=.57+(i%3)*.12;
      foliage(f,color,[x,y,z],[.51,.43,.5],a);
      for(let j=0;j<4;j++){
        const b=j*2.4+i;part(f,'bud',j%3===0?'#fff1e1':color,[x+Math.cos(b)*.17,y+.14+Math.sin(j)*.055,z+Math.sin(b)*.17],[.16,.13,.16]);
      }
    }
  }
  kit.flowers=(g,x,z,r,count=5)=>{
    const colors=['#d783a2','#f0bf9e','#e6cfef','#fff0d5'];
    for(let i=0;i<count;i++){
      const a=r()*Math.PI*2,d=r()*.45,xx=x+Math.cos(a)*d,zz=z+Math.sin(a)*d,h=.35+r()*.38;
      cyl(g,'#718c58',[xx,h/2,zz],[.035,h,.035]);
      part(g,'crown','#8ca774',[xx+.07,h*.5,zz],[.25,.07,.13],[0,a,-.5]);
      const c=colors[Math.floor(r()*colors.length)];
      for(let p=0;p<5;p++){
        const b=p*Math.PI*.4;part(g,'bud',c,[xx+Math.cos(b)*.09,h,zz+Math.sin(b)*.09],[.17,.1,.17]);
      }
      part(g,'bud','#ecc66c',[xx,h+.045,zz],[.1,.07,.1]);
    }
  };
  kit.tree=(g,x,z,r,pink=false,scale=1)=>{
    const t=group(g,x,0,z,r()*6.28);t.scale.setScalar(scale);
    shadow(t,0,0,5.5,4.6);
    cyl(t,'#a18368',[0,1.65,0],[.36,3.3,.38]);
    for(let i=0;i<5;i++){
      const a=i*2.4;beam(t,'#9f8168',[0,1.5+i*.15,0],[Math.cos(a)*1.3,3.5+(i%2)*.55,Math.sin(a)*1.1],.18);
    }
    const colors=pink?['#e4adbf','#edbdcb','#f3d0d6','#d99eaf']:['#a1b77d','#b6c68f','#91aa75','#c4ce9b'];
    for(let i=0;i<9;i++){
      const a=i*2.4,d=i===0?0:1.05+(i%3)*.12,y=3.55+(i%3)*.57;
      foliage(t,colors[i%4],[Math.cos(a)*d,y,Math.sin(a)*d],[2.3,2.15,2.2],a);
    }
    for(let i=0;i<15;i++){
      const a=i*2.399,d=1.4+r()*.6;
      foliage(t,colors[i%4],[Math.cos(a)*d,3.6+r()*1.75,Math.sin(a)*d],[.75+r()*.5,.8+r()*.5,.8+r()*.4],a);
    }
    if(pink)for(let i=0;i<15;i++){
      const a=r()*6.28,d=.5+r()*2.3;
      part(t,'bud',i%2?'#f1cfda':'#dbb1bf',[Math.sin(a)*d,.02,Math.cos(a)*d],[.14,.035,.09],[0,a,0]);
    }
  };
  function windowBox(g,x,y,z,width=1.4,r=rng('window')){
    const b=group(g,x,y,z);
    box(b,'#b49373',[0,0,0],[width,.27,.4]);
    box(b,'#d4b38d',[0,.06,.23],[width+.1,.12,.07]);
    box(b,'#728756',[0,.15,0],[width*.9,.045,.31]);
    for(let i=0;i<4;i++){
      const xx=(i-1.5)*width*.21;
      foliage(b,'#8da477',[xx,.23,.01],[.4,.3,.38]);
      for(let j=0;j<3;j++)part(b,'bud',i%2?'#ecc3ce':'#f4dfc4',[xx+(r()-.5)*.24,.36+r()*.13,(r()-.5)*.2],[.19,.16,.19]);
    }
  }
  const originalWindow=kit.window;
  kit.window=(g,x,y,z,ry,p,w=1.35)=>{
    originalWindow(g,x,y,z,ry,p,w);
    // Attached to the same wall batch, so these vanish correctly in cutaway mode.
    const f=group(g,x,y,z,ry);windowBox(f,0,-.97,.38,w+.3,rng(`${x}:${y}:${z}`));
  };
  function umbrella(g,x,z,color='#d49aa9'){
    const u=group(g,x,0,z);
    cyl(u,'#b79e7e',[0,1.68,0],[.065,3.36,.065]);cyl(u,'#b8a98d',[0,.06,0],[.5,.12,.5]);
    for(let i=0;i<12;i++)part(u,'canopy',i%2?'#f5e5d3':color,[0,3.15,0],[2.5,1.4,2.5],[0,i*Math.PI/6,0],'cloth');
    ball(u,'#d6b38e',[0,3.49,0],[.11,.14,.11]);
  }
  function planterBed(g,x,z,r,width=2.2){
    const b=group(g,x,0,z);box(b,'#8d9a6c',[0,.22,0],[width,.43,.85]);
    for(const s of [-1,1]){
      for(const y of [.13,.34])box(b,'#c3a07c',[0,y,s*.47],[width+.15,.19,.07]);
      box(b,'#b18e69',[s*(width/2+.04),.27,0],[.08,.53,1.02]);
    }
    for(let i=0;i<4;i++){
      const xx=(i-1.5)*width*.21;foliage(b,'#91ad70',[xx,.64,0],[.55,.66,.6],i);
      part(b,'bud',i%2?'#f0d4be':'#df9cb0',[xx,.85,.12],[.27,.26,.27]);
    }
  }
  function facadeDetail(g,lot){
    const b=group(g,0,0,-1),{width:w,depth:d,height:height,palette:p}=lot,h=height+.35;
    for(const yy of (lot.floors===2?[2,5.05]:[2])){
      for(const xx of [-w*.29,w*.29])windowBox(b,xx,yy-.97,d/2+.4,lot.kind==='cafe'?2.35:1.55,rng(`${lot.id}:${xx}:${yy}`));
      for(const side of [-1,1])for(const zz of [-d*.25,d*.25]){
        const f=group(b,side*(w/2+.05),yy,zz,side*Math.PI/2);windowBox(f,0,-.97,.38,1.5);
      }
    }
    // The small attic opening breaks up the otherwise bare gable.
    box(b,p.trim,[0,h+.64,d/2+.055],[.83,.9,.1]);
    part(b,'box','#ebd4a7',[0,h+.64,d/2+.12],[.63,.71,.035],[0,0,0],'glass');
    box(b,p.trim,[0,h+.64,d/2+.15],[.05,.72,.04]);box(b,p.trim,[0,h+.64,d/2+.15],[.65,.05,.04]);
    if(lot.kind==='cafe'){
      umbrella(b,-3.35,d/2+3.35);umbrella(b,3.35,d/2+3.35,'#ddadba');
      const aw=w+.25;
      for(let i=0;i<24;i++){
        const x=-aw/2+(i+.5)*aw/24;
        part(b,'sphere',Math.floor(i/2)%2?'#f5e5d1':'#cb8f9e',[x,2.76,d/2+2.02],[aw/24,.22,.095]);
      }
      for(const x of [-w*.29,w*.29]){
        const f=group(b,x,2,d/2+.23);
        for(const shelfY of [-.4,.15]){
          box(f,'#ba9474',[0,shelfY,.02],[1.98,.055,.12]);
          for(let i=0;i<4;i++){
            const xx=-.7+i*.46;part(f,'round',i%2?'#e5bd77':'#e8b69a',[xx,shelfY+.13,.09],[.31,.2,.1]);
          }
        }
      }
      for(const x of [-4.8,-1.4,1.4,4.8]){
        beam(b,'#9d8165',[x,3.03,d/2+1],[x,2.66,d/2+1],.025);
        part(b,'round','#ffdfa2',[x,2.56,d/2+1],[.18,.22,.18],[0,0,0],'lantern');
      }
      const board=group(b,1.35,.06,d/2+3.25,-.15);
      box(board,'#a3886a',[0,.59,0],[.79,1.18,.1],[.12,0,0]);box(board,'#647b70',[0,.61,.08],[.63,.95,.04],[.12,0,0]);
      for(let i=0;i<4;i++)box(board,'#e6d9bc',[0,.8-i*.14,.15],[.39-i*.045,.025,.01]);
      for(const x of [-.34,.34])beam(board,'#9b7f65',[x,1.09,-.02],[x,0,-.45],.06);
    }
  }
  function duck(g,x,z,angle=0,size=1){
    const d=group(g,x,.24,z,angle);d.scale.setScalar(size);
    ball(d,'#f8edd9',[0,.12,0],[.52,.29,.72]);ball(d,'#f5e6ce',[0,.4,.26],[.26,.34,.25]);
    part(d,'cone','#f6e9d5',[0,.17,-.35],[.22,.38,.24],[-.8,0,0]);
    part(d,'round','#d6a45e',[0,.39,.43],[.19,.09,.22]);
    for(const s of [-1,1])ball(d,'#554b43',[s*.105,.46,.31],[.035,.035,.035]);
    part(d,'ring','#b6d5c6',[0,-.035,-.05],[1.05,1.4,1],[-Math.PI/2,0,0],'water');
  }
  function pondDetail(g,r){
    for(let i=0;i<20;i++){
      const a=r()*6.28,x=Math.cos(a)*(1.3+r()*.75),z=Math.sin(a)*(2.25+r()*.65);
      if(Math.abs(z)<1.22)continue;
      const size=.28+r()*.34;
      part(g,'disc',i%2?'#88ad7b':'#a6bd83',[x,.197,z],[size,size,1],[-Math.PI/2,0,a]);
      if(i%3===0){
        for(let j=0;j<5;j++){
          const b=j*1.256;part(g,'bud','#f0c1d4',[x+Math.cos(b)*.07,.26,z+Math.sin(b)*.07],[.13,.12,.13]);
        }
        ball(g,'#e9cb79',[x,.3,z],[.07,.05,.07]);
      }
    }
    duck(g,.7,2.0,-.5);duck(g,-1.0,-2.2,1.2,.76);
    for(const s of [-1,1])for(let i=0;i<5;i++){
      const x=s*(3.4+r()*.5),z=1.8+r()*1.9;
      for(let j=0;j<3;j++)beam(g,'#8b9c69',[x,.12,z],[x+(r()-.5)*.36,.55+r()*.4,z+(r()-.5)*.3],.027);
    }
  }
  kit.dressLot=(g,lot)=>{
    const r=rng(`${lot.gardenSeed}:art-details`);
    for(const bed of plantingPlan(lot))hydrangea(g,bed.x,bed.z,r,bed.size);
    if(lot.kind==='park'){
      if(lot.id===9)pondDetail(g,r);
      for(const s of [-1,1])planterBed(g,s*4.3,6.8,r,2.3);
    }else{
      if(!lot.furnished)facadeDetail(g,lot);
      // Low continuous borders tie the individual flowers together. These stay
      // against the fence, outside the benches and away from the central gate.
      for(const side of [-1,1]){
        part(g,'round','#819867',[side*7.78,.23,.4],[.55,.45,13.5]);
        part(g,'round','#91a571',[side*4.9,.2,7.82],[5.4,.38,.47]);
        for(let i=0;i<9;i++){
          foliage(g,i%2?'#92a876':'#9eb17e',[side*7.75,.45,-5.4+i*1.36],[.62,.42,.85],i);
        }
      }
      // Vegetable beds sit beside the house, never across the entrance route.
      const raised=raisedBedPlan();planterBed(g,raised.x,raised.z,r,raised.width);
      if(lot.furnished)kit.bicycle(g,-6.65,6.4,.45);
      for(const x of [-2.1,2.1]){
        cyl(g,'#9f856c',[x,.6,7.3],[.08,1.2,.08]);part(g,'round','#ffe4b4',[x,1.23,7.3],[.22,.3,.22],[0,0,0],'lantern');
      }
    }
  };
  return kit;
}
