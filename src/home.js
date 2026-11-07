import * as THREE from '../vendor/three.module.js';
import {dressV5Home} from './v5-look.js';
import {dressHome, COTTAGE_PALETTES, paletteRole} from './home-polish.js';
import {FLOOR_Y, HOME_SEAT, ROOMS} from './home-plan.js';

// Separate immutable batches let us hide the roof and camera-facing walls
// without rebuilding the neighborhood or introducing transparent sorting.
export function createHome(kit, lot) {
  const {box,part,ball,cyl,group,beam}=kit, p=lot.palette, w=lot.width, d=lot.depth;
  const origin=new THREE.Vector3(lot.x,.376,lot.z-1);
  const source=group(null,...origin.toArray());
  const base=group(source), inside=group(source), roof=group(source);
  const wallRoots={front:group(source),back:group(source),left:group(source),right:group(source)};
  const doorRoot=group(source), door=group(doorRoot,-.69,FLOOR_Y,d/2+.04);
  const model=new THREE.Group();let open=false, doorAngle=0;
  const floor=FLOOR_Y, wallTop=4.15;
  const furnishing=(id)=>{const g=group(inside);g.name=id;return g;};
  function rounded(g,c,xyz,size){return part(g,'round',c,xyz,size);}
  function plant(g,x,y,z,size=.5){
    cyl(g,'#bd9b86',[x,y+.16*size,z],[.43*size,.32*size,.43*size]);
    for(let i=0;i<5;i++)part(g,'leaf',i%2?'#86a78b':'#a2bb8f',[x+Math.sin(i*2.4)*.18*size,y+.45*size+(i%2)*.12*size,z+Math.cos(i*2.4)*.18*size],[.25*size,.48*size,.25*size],[0,i,Math.sin(i)*.5]);
  }
  function picture(g,x,y,z,ry=0){
    const a=group(g,x,y,z,ry);box(a,'#ae8d72',[0,0,0],[1.2,.85,.06]);
    box(a,'#eee4ce',[0,0,.04],[1.09,.74,.025]);
    part(a,'disc','#d6a28f',[.22,.12,.06],[.27,.27,1]);
    box(a,'#a4bca2',[0,-.2,.06],[1.02,.19,.02]);
    part(a,'cone','#91aa92',[-.25,-.04,.08],[.4,.45,.015]);
  }
  box(base,'#bcae96',[0,.16,0],[w+.45,.32,d+.45]);
  // Keep the slab below the floorboards; coplanar tops flicker on mobile.
  box(base,'#efe2c9',[0,.32,0],[w,.12,d]);
  // Wide, slightly different floorboards avoid hairline shadow striping.
  for(let i=0;i<24;i++)box(inside,i%3===0?'#dbc7a8':i%3===1?'#e2ceae':'#d8c2a0',[-w/2+(i+.5)*w/24,floor-.012,0],[w/24-.008,.024,d-.22]);
  box(inside,'#c0c8ad',[-2.25,floor+.014,-2.25],[6.25,.025,4.55]);
  box(inside,'#d7e0d5',[3.22,floor+.016,2.45],[4.45,.028,4.35]);
  for(let x=1.2;x<5.45;x+=.6)for(let z=.65;z<4.4;z+=.6){
    if((Math.round(x*10)+Math.round(z*10))%12===1)box(inside,'#bfd0c6',[x,floor+.035,z],[.57,.012,.57]);
  }
  // Each facade has real openings instead of an opaque box behind the glass.
  function facade(root,length,holes){
    const g=group(root);let cursor=-length/2;
    for(const h of [...holes].sort((a,b)=>a.x-b.x)){
      const left=h.x-h.w/2,right=h.x+h.w/2;
      if(left>cursor)box(g,p.wall,[(cursor+left)/2,(wallTop+floor)/2,0],[left-cursor,wallTop-floor,.2]);
      if(h.bottom>floor)box(g,p.wall,[h.x,(h.bottom+floor)/2,0],[h.w,h.bottom-floor,.2]);
      box(g,p.wall,[h.x,(wallTop+h.top)/2,0],[h.w,wallTop-h.top,.2]);cursor=right;
      if(h.window){kit.window(g,h.x,(h.bottom+h.top)/2,.04,0,p,h.w-.08);}
    }
    if(cursor<length/2)box(g,p.wall,[(cursor+length/2)/2,(wallTop+floor)/2,0],[length/2-cursor,wallTop-floor,.2]);
    box(g,p.trim,[0,wallTop-.1,0],[length,.18,.24]);
    box(g,'#e7ddc6',[0,.55,-.125],[length,.25,.06]);
    return g;
  }
  const wins=xs=>xs.map(x=>({x,w:1.5,bottom:1.25,top:2.8,window:true}));
  facade(wallRoots.front,w,[...wins([-3.35,3.35]),{x:0,w:1.45,bottom:floor,top:3.0}]).position.z=d/2;
  const back=facade(wallRoots.back,w,wins([-3.1,3.1]));back.position.z=-d/2;back.rotation.y=Math.PI;
  const left=facade(wallRoots.left,d,wins([-2.4,2.4]));left.position.x=-w/2;left.rotation.y=-Math.PI/2;
  const right=facade(wallRoots.right,d,wins([-2.4,2.4]));right.position.x=w/2;right.rotation.y=Math.PI/2;
  for(const x of [-w/2,w/2])box(base,p.trim,[x,.51,0],[.22,.22,d]);
  box(base,p.trim,[0,.51,-d/2],[w,.22,.22]);
  for(const s of [-1,1])box(base,p.trim,[s*(w/4+.4),.51,d/2],[w/2-.8,.22,.22]);
  // Door is a separate pivot so the resident actually walks through an opening.
  rounded(door,p.shutter,[.69,1.28,0],[1.36,2.56,.1]);
  part(door,'box','#a7c3b6',[.69,1.65,.065],[.93,1.05,.035],[0,0,0],'glass');
  box(door,p.trim,[.69,1.65,.09],[.055,1.05,.03]);box(door,p.trim,[.69,1.65,.09],[.93,.055,.03]);ball(door,'#b89c63',[1.15,1.13,.11],[.09,.09,.09]);
  for(let i=0;i<3;i++)box(base,'#dfd1b8',[0,.06+i*.12,6.22-i*.52],[2.6,.12+i*.24,.56]);
  box(base,'#e5d8bf',[0,.34,5.11],[2.6,.12,.78]);
  box(base,'#e2dac2',[0,.018,7.95],[1.62,.035,2.8]);
  const rise=2, eave=w/2+.52,pitch=Math.atan2(rise,eave),span=Math.hypot(eave,rise);
  part(roof,'gable',p.wall,[0,wallTop,0],[w,rise,d]);
  for(const side of [-1,1]){
    part(roof,'box',p.roof,[side*eave/2,wallTop+rise/2+.07,0],[span+.14,.19,d+1.05],[0,0,-side*pitch],'roof');
    for(const z of [-d/2-.54,d/2+.54])box(roof,p.trim,[side*eave/2,wallTop+rise/2-.03,z],[span+.2,.16,.14],[0,0,-side*pitch]);
    box(roof,p.trim,[side*eave,wallTop-.02,0],[.16,.2,d+1.08]);
  }
  box(roof,p.roof,[0,wallTop+rise+.17,0],[.22,.17,d+1.15]);
  box(roof,'#cda18c',[w*.25,wallTop+1.4,-d*.18],[.67,1.65,.73]);box(roof,p.trim,[w*.25,wallTop+2.24,-d*.18],[.86,.18,.9]);box(roof,'#746f62',[w*.25,wallTop+2.34,-d*.18],[.48,.02,.51]);
  // A low section remains in cutaway mode; the upper partitions leave with the roof.
  for(const [z,len] of [[-2.65,4.1],[2.9,3.6]]){
    box(inside,'#e6d3be',[.95,floor+.38,z],[.16,.76,len]);
    box(roof,'#e6d3be',[.95,2.65,z],[.16,2.94,len]);
    box(inside,p.trim,[.95,floor+.79,z],[.23,.07,len]);
  }
  box(inside,'#d5c5c2',[3.28,floor+.38,.4],[4.45,.76,.16]);box(inside,p.trim,[3.28,floor+.79,.4],[4.45,.07,.23]);
  box(roof,'#d5c5c2',[3.28,2.65,.4],[4.45,2.94,.16]);
  const living=furnishing('living-room');
  rounded(living,'#c6c7aa',[-2.65,floor+.035,2.35],[4.7,.055,4.15]);
  rounded(living,'#ded6ba',[-2.65,floor+.067,2.35],[4.15,.02,3.65]);
  const sofa=group(living,HOME_SEAT.x,floor,HOME_SEAT.z);
  rounded(sofa,'#b8818b',[0,.22,0],[2.8,.32,1]);
  rounded(sofa,'#c9919a',[0,.78,-.39],[2.8,.8,.22]);
  for(const x of [-1.28,1.28])rounded(sofa,'#c58a93',[x,.55,0],[.23,.64,1.03]);
  for(const x of [-.79,0,.79])rounded(sofa,'#dea7aa',[x,.38,.08],[.74,.14,.69]);
  for(const [x,c] of [[-.88,'#e6d8b8'],[.88,'#a8bca2']])part(sofa,'round',c,[x,.76,-.2],[.45,.43,.16],[.14,0,x*.13]);
  rounded(living,'#b79473',[-3,floor+.48,3.3],[2.2,.12,.75]);
  for(const x of [-3.82,-2.18])for(const z of [3.07,3.53])box(living,'#9a8168',[x,floor+.22,z],[.09,.44,.09]);
  box(living,'#87a9a6',[-3.42,floor+.57,3.3],[.48,.055,.38],[0,.16,0]);box(living,'#eee0c7',[-3.41,floor+.61,3.3],[.44,.025,.35],[0,.16,0]);
  cyl(living,'#e3c5b6',[-2.55,floor+.61,3.3],[.16,.19,.16]);cyl(living,'#71584b',[-2.55,floor+.71,3.3],[.12,.009,.12]);
  const tv=group(living,.4,floor,2.1,-Math.PI/2);
  rounded(tv,'#b79b78',[0,.37,0],[1.8,.65,.48]);box(tv,'#7f8d83',[0,1.15,0],[1.55,.93,.09]);box(tv,'#adc3bb',[0,1.15,.057],[1.4,.78,.02]);box(tv,'#809aa0',[0,.95,.073],[1.37,.35,.01]);
  plant(living,-5.0,floor,3.9,1.2);cyl(living,'#9c967d',[-5,floor+.07,.2],[.5,.14,.5]);cyl(living,'#a49b7b',[-5,floor+1.05,.2],[.05,2,.05]);part(living,'cone','#f0dfb8',[-5,floor+2.02,.2],[.75,.55,.75]);
  const kitchen=furnishing('kitchen');
  for(let i=0;i<5;i++){
    const x=-4.8+i*1.12;rounded(kitchen,'#98b6a5',[x,floor+.5,-4],[1.08,1,.82]);
    box(kitchen,'#aec6b5',[x,floor+.52,-3.575],[.98,.78,.035]);box(kitchen,'#af956f',[x+.3,floor+.63,-3.54],[.05,.2,.04]);
  }
  rounded(kitchen,'#eee3ce',[-2.55,floor+1.04,-4],[5.6,.11,.92]);
  rounded(kitchen,'#bdc5bd',[-3.68,floor+1.104,-4],[.92,.025,.58]);rounded(kitchen,'#89a7a3',[-3.68,floor+1.12,-4],[.73,.026,.43]);
  beam(kitchen,'#b7b8a5',[-3.68,floor+1.1,-4.32],[-3.68,floor+1.56,-4.32],.05);beam(kitchen,'#b7b8a5',[-3.68,floor+1.56,-4.32],[-3.68,floor+1.56,-4.04],.05);
  box(kitchen,'#606e68',[-1.8,floor+1.12,-4],[1.15,.035,.69]);
  for(const x of [-2.1,-1.5])for(const z of [-4.17,-3.85])cyl(kitchen,'#354a48',[x,floor+1.15,z],[.23,.025,.23]);
  rounded(kitchen,'#e0d8c4',[-5.1,floor+1.12,-2.8],[.85,2.2,.84]);box(kitchen,'#b4a78f',[-4.65,floor+1.15,-2.8],[.05,.55,.05]);
  rounded(kitchen,'#c7ac86',[-3.3,floor+.84,-1.15],[1.75,.14,1.25]);
  for(const x of [-3.98,-2.62])for(const z of [-1.6,-.7])box(kitchen,'#a28f70',[x,floor+.4,z],[.1,.8,.1]);
  for(const x of [-4.55,-2.05]){
    rounded(kitchen,'#d5c5a2',[x,floor+.47,-1.15],[.58,.12,.65]);box(kitchen,'#aab798',[x+(x<-3?-.25:.25),floor+.86,-1.15],[.1,.75,.65]);
    for(const dx of [-.2,.2])for(const dz of [-.22,.22])box(kitchen,'#a4a080',[x+dx,floor+.23,-1.15+dz],[.065,.46,.065]);
  }
  plant(kitchen,-3.3,floor+.91,-1.15,.62);plant(kitchen,-.35,floor+1.1,-4,.7);
  const bed=furnishing('bedroom');
  rounded(bed,'#c7b299',[3.15,floor+.22,-2.8],[2.45,.34,2.8]);rounded(bed,'#efeadc',[3.15,floor+.48,-2.8],[2.38,.22,2.72]);
  rounded(bed,'#ada3bc',[3.15,floor+.63,-2.45],[2.4,.14,2.05]);box(bed,'#c6b8d0',[3.15,floor+.71,-1.8],[2.39,.06,.44]);
  rounded(bed,'#bf9f85',[3.15,floor+.72,-4.2],[2.6,1.25,.14]);
  for(const x of [2.55,3.75])rounded(bed,'#f5edde',[x,floor+.66,-3.7],[1.02,.2,.55]);
  rounded(bed,'#c3a584',[4.9,floor+.42,-3.7],[.7,.8,.74]);cyl(bed,'#a3a587',[4.9,floor+1.02,-3.7],[.07,.4,.07]);part(bed,'cone','#f0dfb8',[4.9,floor+1.3,-3.7],[.5,.4,.5]);
  box(bed,'#aaa895',[1.65,floor+1,-3.15],[.65,2,1.5]);
  rounded(bed,'#c2b6be',[3.2,floor+.038,-.55],[2.6,.055,.85]);
  picture(bed,3.15,2.7,-4.57);plant(bed,5,floor,-.3,.95);
  const bath=furnishing('bathroom');
  rounded(bath,'#e8e8db',[4.65,floor+.38,2.3],[1.15,.68,2.6]);rounded(bath,'#a6c6bd',[4.65,floor+.73,2.3],[.83,.04,2.2]);
  cyl(bath,'#afb6a5',[4.65,floor+.93,1.1],[.07,.45,.07]);
  rounded(bath,'#a7bba9',[2.1,floor+.43,3.9],[1.3,.84,.76]);rounded(bath,'#f2eddf',[2.1,floor+.9,3.9],[1.4,.12,.86]);rounded(bath,'#b2ccc1',[2.1,floor+.97,3.9],[.66,.03,.47]);
  rounded(bath,'#e9e6d9',[2.05,floor+.27,1.75],[.55,.5,.76]);part(bath,'ring','#f6f1e5',[2.05,floor+.55,1.85],[.56,.68,.56],[-Math.PI/2,0,0]);rounded(bath,'#f0eadd',[2.05,floor+.7,1.39],[.59,.6,.23]);
  box(bath,'#9fbdad',[3.1,floor+.04,3.2],[.85,.04,1.4]);plant(bath,3.1,floor+.97,3.9,.6);
  dressHome(kit,{inside,wallRoots,lot,floor});
  dressV5Home(kit,{inside,wallRoots,lot,floor});
  inside.traverse(m=>{if(m.userData.part)m.userData.paletteRole??=paletteRole(m.userData.color.getHexString());});
  source.updateMatrixWorld(true);
  const batches={};
  for(const [key,root] of Object.entries({base,inside,roof,...wallRoots,door:doorRoot})){
    batches[key]=kit.compile(root,key==='door');model.add(batches[key].group);
  }
  function setOpen(value){open=!!value;batches.inside.group.visible=open;batches.roof.group.visible=!open;}
  function update(camera,dt=0,doorWanted=false){
    if(open){
      const dx=camera.position.x-origin.x,dz=camera.position.z-origin.z;
      batches.front.group.visible=dz<-.1;batches.back.group.visible=dz>.1;
      batches.left.group.visible=dx>.1;batches.right.group.visible=dx<-.1;
    }else for(const key of Object.keys(wallRoots))batches[key].group.visible=true;
    batches.door.group.visible=!open||batches.front.group.visible;
    const wanted=doorWanted?-Math.PI*.52:0;
    const next=THREE.MathUtils.lerp(doorAngle,wanted,1-Math.exp(-dt*8));
    if(Math.abs(next-doorAngle)>.0001){doorAngle=next;door.rotation.y=next;batches.door.update();}
  }
  let palette='roseMint';
  function setPalette(value){
    if(!Object.hasOwn(COTTAGE_PALETTES,value))return false;
    palette=value;const colors=COTTAGE_PALETTES[value];
    for(const {mesh,sources} of batches.inside.batches){
      let changed=false;
      sources.forEach((m,i)=>{const role=m.userData.paletteRole;if(role){m.userData.color.set(colors[role]);mesh.setColorAt(i,m.userData.color);changed=true;}});
      if(changed&&mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
    }
    return true;
  }
  setPalette(palette);setOpen(false);
  return {group:model,origin,lot,setPalette,get palette(){return palette;},polishVersion:5,rooms:ROOMS,seat:HOME_SEAT,get isOpen(){return open;},setOpen,update,
    worldPoint(x,y,z){return new THREE.Vector3(x,y,z).add(origin);},
    visibleWalls:()=>Object.fromEntries(Object.keys(wallRoots).map(k=>[k,batches[k].group.visible])),
    dispose(){Object.values(batches).forEach(b=>b.dispose());model.clear();},
  };
}
