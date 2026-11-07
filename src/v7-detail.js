import * as THREE from '../vendor/three.module.js';
import {rng} from './plan.js';

// The V7 pass is additive: shared small meshes, not new collision furniture.
// Wall decorations are owned by the corresponding cutaway batch.
export function dressV7Home(kit,{inside,wallRoots,lot,floor}){
  const {group,box,part,cyl,beam,ball}=kit;
  const root=group(inside);root.name='v7-lived-in-details';
  const round=(g,c,p,s,r)=>part(g,'round',c,p,s,r);
  const accent=(g,shape,c,p,s,r)=>{const m=part(g,shape,c,p,s,r);m.userData.paletteRole='accent';return m;};
  function bloom(g,x,y,z,s=.18,c='#ef649f'){
    if(kit.geometries.roseFlower)part(g,'roseFlower',c,[x,y,z],[s,s,s],[.06,x,.06],'cloth');
    else ball(g,c,[x,y,z],[s,s*.3,s]);
    part(g,'leaf','#f5ce70',[x,y+.025,z],[s*.12,s*.1,s*.12]);
  }
  function vase(g,x,y,z,s=1){
    cyl(g,'#f6dfd4',[x,y+.16*s,z],[.25*s,.32*s,.25*s]);
    for(let i=0;i<5;i++){
      const a=i*2.399,xx=x+Math.cos(a)*.14*s,zz=z+Math.sin(a)*.14*s,h=y+(.43+i%2*.08)*s;
      beam(g,'#548553',[x,y+.18*s,z],[xx,h,zz],.017*s);
      bloom(g,xx,h,zz,.21*s,i%2?'#ff9dc9':'#f4e0ae');
    }
  }
  function book(g,x,y,z,c='#bc75a4',angle=0){
    box(g,c,[x,y,z],[.36,.06,.27],[0,angle,0]);
    box(g,'#f7e8d4',[x,y+.013,z+.013],[.32,.035,.24],[0,angle,0]);
  }
  // Panel moulding, wallpaper rails and cornices follow every disappearing wall.
  for(const [key,x,z,angle,length] of [
    ['back',0,-lot.depth/2,0,lot.width],['front',0,lot.depth/2,Math.PI,lot.width],
    ['left',-lot.width/2,0,Math.PI/2,lot.depth],['right',lot.width/2,0,-Math.PI/2,lot.depth],
  ]){
    const wall=group(wallRoots[key],x,0,z,angle);wall.name=`v7-wall-${key}`;
    // Do not bridge the actual front doorway with a skirting board.
    for(let i=0;i<Math.floor(length/.46);i++){
      const xx=-length/2+.23+i*.46;
      if(key==='front'&&Math.abs(xx)<.85)continue;
      box(wall,'#e0d9c5',[xx,.91,.138],[.022,.72,.025]);
      box(wall,'#f9ebd6',[xx,1.29,.14],[.43,.05,.035]);
    }
    box(wall,'#f6e9d7',[0,3.97,.13],[length-.12,.13,.19]);
    box(wall,'#d6b9a1',[0,3.86,.12],[length-.12,.035,.11]);
    // Small framed botanical triptychs occupy the space between windows.
    if(key==='back'||key==='left'){
      for(let j=-1;j<=1;j++){
        const f=group(wall,j*.55,2.5,.19);
        box(f,'#c9975e',[0,0,0],[.46,.65,.07]);box(f,'#fff4dc',[0,0,.045],[.38,.56,.018]);
        beam(f,'#639454',[0,-.19,.065],[0,.11,.065],.014);
        for(let k=0;k<5;k++)part(f,'leaf','#ef8fba',[Math.cos(k*1.256)*.075,.12+Math.sin(k*1.256)*.075,.075],[.11,.11,.025]);
        part(f,'leaf','#7faa65',[-.07,-.08,.07],[.14,.055,.022],[0,0,.45]);
      }
    }
    const windows=(key==='back')?[-3.1,3.1]:key==='front'?[-3.35,3.35]:[-2.4,2.4];
    for(const xx of windows){
      // Painted pleats and ties add depth without transparent curtains.
      for(const s of [-1,1]){
        for(let i=0;i<4;i++)round(wall,i%2?'#f9e1e7':'#dfaec2',[xx+s*.96+i*.043,2.08,.26],[.052,1.55,.12]);
        box(wall,'#d7ad72',[xx+s*1.02,1.72,.33],[.23,.06,.035]);
      }
      for(let i=0;i<6;i++)round(wall,'#f4d0dc',[xx-.65+i*.26,2.95,.24],[.29,.18,.15]);
    }
    if(key==='back'){
      // Kitchen subway tiles only below the window sill, never across glazing.
      for(let row=0;row<2;row++)for(let i=0;i<14;i++){
        const xx=-5.25+i*.39+(row%2)*.19;
        if(xx>.3)continue;
        box(wall,i%3?'#faeee1':'#dfebd9',[xx,1.05+row*.13,.145],[.37,.11,.016]);
      }
      // A short wall-mounted utensil rail, safely clear of windows.
      beam(wall,'#b88b53',[-1.65,1.94,.22],[-.48,1.94,.22],.038);
      for(let i=0;i<4;i++){
        const xx=-1.5+i*.26;beam(wall,'#c19c65',[xx,1.91,.27],[xx,1.63,.27],.028);
        part(wall,'disc',i%2?'#d8bd8c':'#8a8176',[xx,1.54,.27],[.14,.19,1]);
      }
    }
    if(key==='right'){
      // Bath mirror and towels belong to this wall, not the invisible wall space.
      round(wall,'#c39a6c',[2.75,2.35,.18],[1.05,1.3,.07]);
      box(wall,'#b4d9d7',[2.75,2.35,.23],[.88,1.12,.025]);
      box(wall,'#e9faf2',[2.57,2.35,.25],[.06,.96,.01],[0,0,-.3]);
      beam(wall,'#b89a65',[.55,1.94,.25],[1.55,1.94,.25],.035);
      for(let i=0;i<3;i++)round(wall,i%2?'#d0e4bb':'#efb9d0',[.7+i*.28,1.66,.3],[.25,.53,.055]);
    }
  }
  // Textiles: fringe and woven lines sit above existing rugs rather than fighting them.
  for(let i=0;i<24;i++){
    const x=-4.63+i*.17;
    for(const z of [.49,4.2])box(root,'#f3ead7',[x,floor+.085,z],[.025,.012,.19]);
  }
  for(let i=0;i<12;i++)box(root,'#eac8cc',[-2.65,floor+.088,.76+i*.285],[3.67,.009,.012]);
  for(const x of [-4.28,-1.05])for(let i=0;i<7;i++)bloom(root,x,floor+.105,1+i*.41,.19,'#e69bb5');
  // A kitchen runner and a few ceramic pieces brighten the floor and counters.
  round(root,'#f5d8d9',[-2.85,floor+.055,-2.75],[2.6,.04,.58]);
  for(let i=0;i<12;i++)box(root,'#faf0da',[-4.03+i*.21,floor+.083,-2.75],[.06,.012,.5]);
  cyl(root,'#eccf9e',[-1.02,floor+1.18,-3.92],[.37,.09,.37]);
  for(let i=0;i<5;i++)part(root,kit.geometries.bud?'bud':'sphere',i%2?'#f1b44e':'#d9727a',[-1.1+Math.cos(i*2.4)*.11,floor+1.27,-3.92+Math.sin(i*2.4)*.1],[.14,.14,.14]);
  for(let i=0;i<3;i++)cyl(root,'#f9eee0',[-4.68,floor+1.15+i*.025,-4.02],[.4,.025,.4]);
  round(root,'#d3ba8d',[-4.5,floor+1.13,-3.88],[.47,.035,.35],[0,.2,0]);
  for(let i=0;i<3;i++)round(root,'#d6a767',[-4.58+i*.1,floor+1.19,-3.9],[.1,.1,.2],[0,-.12,0]);
  // Freestanding side table beside the sofa, away from its occupied center/approach.
  cyl(root,'#d3ad7b',[-4.85,floor+.56,2],[.58,.09,.58]);
  cyl(root,'#a88865',[-4.85,floor+.27,2],[.09,.54,.09]);vase(root,-4.85,floor+.61,2,.7);
  book(root,-3.38,floor+.67,3.36,'#a6b99c',.1);book(root,-3.36,floor+.73,3.35,'#dba4ba',-.06);
  // Floor basket beside the bookcase; simple slats are shared cube instances.
  round(root,'#bca17c',[-4.91,floor+.22,-.04],[.58,.42,.49]);
  for(let i=0;i<5;i++)box(root,'#ead3a7',[-5.15+i*.12,floor+.24,.213],[.024,.31,.016]);
  round(root,'#e8dfce',[-4.91,floor+.43,-.04],[.49,.09,.42]);
  // The bed gets a stitched quilt grid and fringed throw, preserving palette ownership.
  for(let i=0;i<8;i++)box(root,'#ffc7dd',[2.06+i*.31,floor+.716,-2.55],[.014,.008,1.48]);
  for(let i=0;i<6;i++)box(root,'#ffd3e4',[3.15,floor+.717,-3.23+i*.29],[2.23,.008,.012]);
  for(let i=0;i<14;i++)box(root,'#eff1d6',[2.07+i*.165,floor+.79,-1.47],[.018,.014,.11]);
  accent(root,'round','#90b86f',[3.16,floor+.8,-3.45],[.52,.19,.3]);
  // Slippers remain beside the bed, outside the sofa route.
  for(const x of [4.48,4.76])round(root,'#df9ebc',[x,floor+.09,-1.1],[.2,.15,.38],[0,.2,0]);
  round(root,'#b9a17e',[1.65,floor+.18,-.4],[.46,.34,.43]);book(root,1.65,floor+.38,-.4,'#89ab98',.12);
  // Bathroom edging, bottles and towel basket sit on fixtures, not travel space.
  for(let i=0;i<5;i++){
    const x=1.52+i*.23;box(root,i%2?'#dfc5b1':'#f4eadc',[x,floor+.97,4.12],[.18,.015,.04]);
  }
  for(const [x,z,c] of [[5.02,1.22,'#db9cba'],[5.03,1.48,'#b4c8a3'],[1.54,3.7,'#aad1bb']]){
    cyl(root,c,[x,floor+.86,z],[.13,.23,.13]);cyl(root,'#e3c38f',[x,floor+1,z],[.075,.05,.075]);
  }
  // A tabletop lantern and small bouquet in the bedroom.
  vase(root,4.7,floor+.84,-3.44,.45);
  let instances=0;root.traverse(m=>{if(m.userData.part)instances++;});
  return {version:7,instances};
}

// Deterministic border patches are outside buildings, sidewalks and the front gate.
export function planV7Garden(plan){
  const patches=[];
  for(const lot of plan.lots){
    const r=rng(`${plan.seed}:v7-border:${lot.id}`),n=lot.furnished?38:12;
    for(const side of [-1,1])for(let i=0;i<n;i++){
      const along=-7.45+(i/(n-1))*14.9;
      const x=side*(7.65+r()*.26),z=along;
      patches.push({lot:lot.id,x,z,height:.3+r()*.38,lavender:i%4===0,flower:i%3});
    }
  }
  return patches;
}

export function enhanceV7Kit(kit){
  const {group,part,box,beam,cyl}=kit;
  const dress=kit.dressLot;
  kit.dressLot=(g,lot)=>{
    dress(g,lot);
    const patches=planV7Garden({seed:lot.gardenSeed,lots:[lot]});
    for(const p of patches){
      const {x,z,height:h}=p;
      // Thin leaves and spires provide detail at the existing camera distance.
      for(let j=0;j<3;j++)part(g,'leaf',j%2?'#79a24d':'#539350',[x+(j-1)*.09,.15+j*.025,z],[.1,.31,.09],[0,j*2,(j-1)*.55]);
      if(p.lavender){
        beam(g,'#609357',[x,.1,z],[x,h+.32,z],.025);
        for(let j=0;j<4;j++)part(g,'bud',j%2?'#bf82e0':'#9164c3',[x,h+j*.11,z],[.19-j*.025,.15,.19-j*.025]);
      }else{
        part(g,'roseFlower',p.flower?'#f18dbd':'#fff2ce',[x,h,z],[.32,.32,.32],[.1,x,.1],'cloth');
        part(g,'bud','#e8bf65',[x,h+.03,z],[.07,.05,.07]);
      }
    }
    if(!lot.furnished)return;
    // Low scalloped planted beds make the focal house read as a cared-for garden.
    for(const s of [-1,1])for(let i=0;i<27;i++){
      const z=-7.45+i*.57;
      part(g,'bud',i%2?'#d3c1a6':'#ead4bd',[s*7.32,.13,z],[.29,.2,.34]);
      if(i%3===0){
        part(g,'leaf','#6e9e50',[s*7.72,.39,z],[.43,.38,.46]);
        for(let k=0;k<4;k++)part(g,'roseFlower',i%2?'#f299bc':'#e5c7f2',[s*7.72+Math.sin(k)*.15,.6+k%2*.07,z+Math.cos(k)*.15],[.3,.3,.3],[.1,k,.1],'cloth');
      }
    }
    // Climbing flowers on the front fence never fill the walk-through gate.
    for(const s of [-1,1])for(let i=0;i<12;i++){
      const x=s*(2+i*.5);part(g,'leaf','#739f59',[x,.75,8.13],[.34,.15,.18]);
      part(g,'roseFlower',i%2?'#f5b0d0':'#e969a8',[x,.91,8.1],[.35,.35,.35],[.4,i,.35],'cloth');
    }
    // Garden lanterns use emissive materials, not dozens of costly point lights.
    for(const x of [-7.55,7.55]){
      const z=4.4;
      cyl(g,'#9b7457',[x,.47,z],[.07,.94,.07]);
      box(g,'#efcd89',[x,1.02,z],[.22,.29,.22],[0,0,0]);
      part(g,'box','#ffdf9e',[x,1.03,z],[.18,.24,.18],[0,0,0],'lantern');
      part(g,'cone','#92654f',[x,1.23,z],[.36,.17,.36]);
    }
    // A pair of raised herb beds occupy the rear garden margins, not the house.
    for(const x of [-3.6,-1.1]){
      box(g,'#bd916b',[x,.19,-7.55],[1.8,.38,.63]);box(g,'#695e46',[x,.39,-7.55],[1.65,.04,.5]);
      for(let j=0;j<6;j++)part(g,'leaf',j%2?'#89b868':'#58a46d',[x-.66+j*.26,.56,-7.55],[.3,.32,.32]);
    }
  };
  kit.detailVersion='07-lived-in-cottage';
  return kit;
}

// Two small instanced effects share one unit-plane geometry and simulation time.
// Their shader motion does not upload instance matrices every animation frame.
export function createV7Atmosphere(kit,world,enabled=true){
  const r=rng(`${world.plan.seed}:v7-atmosphere`),geometry=new THREE.PlaneGeometry(1,1);
  const origin=world.home.origin,objects=[],materials=[];
  function batch(name,count,kind){
    const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,side:THREE.DoubleSide,
      uniforms:{time:kit.artTime,night:{value:0}},
      vertexShader:`uniform float time;uniform float night;varying vec2 vUv;varying float vFade;
       void main(){vUv=uv;vec4 p=instanceMatrix*vec4(0.,0.,0.,1.);float phase=p.x*.51+p.z*.73;
       ${kind==='motes'?`p.x+=sin(time*.35+phase)*.6;p.z+=cos(time*.27+phase)*.45;p.y+=sin(time*.49+phase)*.2;vFade=.4+.6*pow(.5+.5*sin(time*1.2+phase),2.);`:`float t=fract(time*.19+phase);p.y+=t*.62;p.x+=sin(t*5.+phase)*.055;vFade=sin(t*3.14159)*.52;`}
       vec4 center=modelViewMatrix*p;float size=length(instanceMatrix[0].xyz);center.xy+=position.xy*size;
       gl_Position=projectionMatrix*center;}`,
      fragmentShader:`uniform float night;varying vec2 vUv;varying float vFade;void main(){float d=length((vUv-.5)*2.);float a=pow(max(0.,1.-d),2.)*vFade;
       if(a<.012)discard;gl_FragColor=vec4(${kind==='motes'?'mix(vec3(1.,.83,.49),vec3(.78,1.,.56),night)':'vec3(.98,.96,.91)'},a);
       #include <tonemapping_fragment>
       #include <colorspace_fragment>
      }`});
    const mesh=new THREE.InstancedMesh(geometry,material,count),dummy=new THREE.Object3D();mesh.name=name;mesh.frustumCulled=false;
    for(let i=0;i<count;i++){
      if(kind==='motes'){
        const side=i%2?1:-1;dummy.position.set(origin.x+side*(6.25+r()*1.5),.9+r()*1.8,origin.z-6+r()*14);dummy.scale.setScalar(.065+r()*.08);
      }else{dummy.position.set(origin.x-2.55+(r()-.5)*.06,origin.y+.4+.76+r()*.12,origin.z+3.3+(r()-.5)*.04);dummy.scale.setScalar(.1+r()*.08);}
      dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate=true;world.group.add(mesh);objects.push(mesh);materials.push(material);return mesh;
  }
  batch('v7-garden-motes',48,'motes');const steam=batch('v7-cup-steam',8,'steam');
  let motion=!!enabled,disposed=false;
  const update=()=>{objects[0].visible=motion;steam.visible=motion&&world.home.isOpen;};
  const step=world.step,dispose=world.dispose;
  world.step=dt=>{step.call(world,dt);update();};
  world.dispose=()=>{if(disposed)return;disposed=true;for(const mesh of objects){world.group.remove(mesh);mesh.dispose();}materials.forEach(m=>m.dispose());geometry.dispose();dispose.call(world);};
  update();world.stats.v7Effects=56;
  return {setEnabled(v){motion=!!v;update();},setEvening(v){materials.forEach(m=>m.uniforms.night.value=v?1:0);},sync:update,
    info(){return{instances:56,batches:2,enabled:motion,time:kit.artTime.value,steamVisible:steam.visible};}};
}
