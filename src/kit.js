import * as THREE from '../vendor/three.module.js';

// A reusable parametric kit. Individual pieces are compacted into instanced
// batches after assembly; the generator does not submit thousands of meshes.
export function createKit() {
  const geometries = {
    box: new THREE.BoxGeometry(1, 1, 1),
    sphere: new THREE.SphereGeometry(.5, 10, 7),
    leaf: new THREE.DodecahedronGeometry(.5, 0),
    cylinder: new THREE.CylinderGeometry(.5, .5, 1, 10),
    cone: new THREE.ConeGeometry(.5, 1, 10),
    ring: new THREE.TorusGeometry(.5, .055, 5, 16),
    disc: new THREE.CircleGeometry(.5, 24),
    plane: new THREE.PlaneGeometry(1, 1),
  };
  const rounded = new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
  const v = new THREE.Vector3(), inner = new THREE.Vector3(), normal = new THREE.Vector3();
  for (let i = 0; i < rounded.attributes.position.count; i++) {
    v.fromBufferAttribute(rounded.attributes.position, i);
    inner.copy(v).clampScalar(-.41, .41);
    normal.copy(v).sub(inner).normalize();
    v.copy(inner).addScaledVector(normal, .09);
    rounded.attributes.position.setXYZ(i, v.x, v.y, v.z);
    rounded.attributes.normal.setXYZ(i, normal.x, normal.y, normal.z);
  }
  geometries.round = rounded;
  const gable = new THREE.BufferGeometry();
  gable.setAttribute('position', new THREE.Float32BufferAttribute([
    -.5,0,-.5, .5,0,-.5, 0,1,-.5, -.5,0,.5, .5,0,.5, 0,1,.5,
  ], 3));
  gable.setIndex([0,2,1, 3,4,5, 0,3,5,0,5,2, 1,2,5,1,5,4, 0,1,4,0,4,3]);
  geometries.gable = gable.toNonIndexed(); geometries.gable.computeVertexNormals(); gable.dispose();
  const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = shadowCanvas.height = 64;
  const ctx = shadowCanvas.getContext('2d');
  const gradient = ctx.createRadialGradient(32,32,3,32,32,32);
  gradient.addColorStop(0,'rgba(30,45,25,.55)'); gradient.addColorStop(1,'rgba(30,45,25,0)');
  ctx.fillStyle = gradient; ctx.fillRect(0,0,64,64);
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  const materials = {
    matte: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .95, metalness: 0 }),
    glass: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .65, emissive: 0xffdba2, emissiveIntensity: .05 }),
    water: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .32, metalness: .05 }),
    shadow: new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false, opacity: .38, polygonOffset: true, polygonOffsetFactor: -1 }),
  };
  const color = new THREE.Color();
  const tint = (hex, amount) => '#' + color.set(hex).multiplyScalar(amount).getHexString();
  function group(parent, x=0, y=0, z=0, ry=0) {
    const g = new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; if(parent) parent.add(g); return g;
  }
  function part(parent, shape, hex, p, s, r=[0,0,0], surface='matte') {
    const m = new THREE.Mesh(geometries[shape], materials[surface]);
    m.position.set(...p); m.scale.set(...s); m.rotation.set(...r);
    m.userData.part = true; m.userData.color = new THREE.Color(hex);
    m.userData.surface = surface; parent.add(m); return m;
  }
  const box = (g,c,p,s,r) => part(g,'box',c,p,s,r);
  const ball = (g,c,p,s) => part(g,'sphere',c,p,s);
  const cyl = (g,c,p,s,r) => part(g,'cylinder',c,p,s,r);
  function beam(g,c,a,b,width=.09) {
    const av=new THREE.Vector3(...a), bv=new THREE.Vector3(...b);
    const m=part(g,'cylinder',c,av.clone().add(bv).multiplyScalar(.5).toArray(),[width,av.distanceTo(bv),width]);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),bv.sub(av).normalize()); return m;
  }
  function shadow(g,x,z,w,d,y=.018) { return part(g,'disc','#ffffff',[x,y,z],[w,d,1],[-Math.PI/2,0,0],'shadow'); }
  function compile(root, dynamic=false) {
    root.updateMatrixWorld(true);
    const groups = new Map();
    root.traverse(m => {
      if(!m.isMesh || !m.userData.part) return;
      const key = m.geometry.uuid + ':' + m.material.uuid;
      if(!groups.has(key)) groups.set(key,[]); groups.get(key).push(m);
    });
    const output=new THREE.Group(), batches=[];
    for(const sources of groups.values()) {
      const first=sources[0], mesh=new THREE.InstancedMesh(first.geometry,first.material,sources.length);
      mesh.castShadow=first.userData.surface!=='shadow'; mesh.receiveShadow=true;
      if(dynamic) { mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); mesh.frustumCulled=false; }
      sources.forEach((m,i)=>{mesh.setMatrixAt(i,m.matrixWorld);mesh.setColorAt(i,m.userData.color);});
      mesh.instanceMatrix.needsUpdate=true;
      if(mesh.instanceColor) mesh.instanceColor.needsUpdate=true;
      if(!dynamic) {mesh.computeBoundingBox();mesh.computeBoundingSphere();}
      output.add(mesh); batches.push({mesh,sources});
    }
    return { group:output, batches,
      update() { root.updateMatrixWorld(true); for(const {mesh,sources} of batches){ sources.forEach((m,i)=>mesh.setMatrixAt(i,m.matrixWorld));mesh.instanceMatrix.needsUpdate=true; } },
      dispose(){ for(const {mesh} of batches) mesh.dispose(); }
    };
  }
  function flowers(g,x,z,rnd,count=5) {
    const colors=['#e4a4b4','#f1d499','#bca9cd','#f5eee0'];
    for(let i=0;i<count;i++) {
      const a=rnd()*Math.PI*2, d=rnd()*.4, xx=x+Math.cos(a)*d, zz=z+Math.sin(a)*d, h=.25+rnd()*.23;
      cyl(g,'#78936e',[xx,h/2,zz],[.045,h,.045]);
      ball(g,colors[Math.floor(rnd()*colors.length)],[xx,h,zz],[.19,.12,.19]);
      ball(g,'#e9cc7b',[xx,h+.05,zz],[.06,.04,.06]);
    }
  }
  function planter(g,x,z,rnd,size=.8) {
    part(g,'round','#b9ad91',[x,.16,z],[size,.3,size*.62]);
    box(g,'#7d8c63',[x,.32,z],[size*.86,.06,size*.5]); flowers(g,x,z,rnd,4);
  }
  function tree(g,x,z,rnd,pink=false,scale=1) {
    const t=group(g,x,0,z); t.scale.setScalar(scale);
    shadow(t,0,0,3.8,3.6);
    cyl(t,'#aa947b',[0,1.35,0],[.27,2.7,.27]);
    beam(t,'#aa947b',[0,1.5,0],[.7,2.6,.2],.16);
    beam(t,'#aa947b',[0,1.8,0],[-.6,2.9,-.1],.16);
    const palette=pink?['#dcbcc6','#e8ccd1','#d4b4c3']:['#a5bb91','#b5c59d','#8fae85'];
    for(let i=0;i<7;i++) {
      const a=i*2.4, rr=i===0?0:.72;
      const m=part(t,'leaf',palette[i%3],[Math.cos(a)*rr,2.7+(i%3)*.48,Math.sin(a)*rr],[2.15,2.35,2.1]);
      m.rotation.set(rnd(),rnd()*3,rnd());
    }
  }
  function pine(g,x,z,scale=1) {
    const t=group(g,x,0,z);t.scale.setScalar(scale);shadow(t,0,0,2.7,2.7);
    cyl(t,'#a68e76',[0,.6,0],[.25,1.2,.25]);
    ['#86a899','#9db5a1','#b2c5ad'].forEach((c,i)=>part(t,'cone',c,[0,1.25+i*.82,0],[2.45-i*.55,1.85,2.45-i*.55]));
  }
  function fence(g,a,b) {
    const dx=b[0]-a[0], dz=b[1]-a[1], length=Math.hypot(dx,dz), n=Math.max(1,Math.round(length/1.15));
    const f=group(g,(a[0]+b[0])/2,0,(a[1]+b[1])/2,Math.atan2(-dz,dx));
    [.43,.82].forEach(y=>box(f,'#eee9d6',[0,y,0],[length,.09,.09]));
    for(let i=0;i<=n;i++) {
      const x=-length/2+i*length/n;
      box(f,'#f1ebd9',[x,.54,0],[.13,1.08,.14]);
      part(f,'cone','#f4efdf',[x,1.12,0],[.21,.18,.21]);
    }
  }
  function bench(g,x,z,ry=0) {
    const b=group(g,x,0,z,ry), wood='#c4a587', frame='#7d8c78';
    [-.7,.7].forEach(xx=>{box(b,frame,[xx,.26,0],[.1,.52,.68]);box(b,frame,[xx,.69,-.28],[.08,.95,.08]);});
    [-.23,0,.23].forEach(zz=>box(b,wood,[0,.57,zz],[1.9,.09,.18]));
    [.87,1.08].forEach(y=>box(b,wood,[0,y,-.31],[1.9,.15,.09]));
  }
  function lamp(g,x,z) {
    const l=group(g,x,0,z);cyl(l,'#9b9e8b',[0,.1,0],[.42,.2,.42]);cyl(l,'#83917d',[0,1.85,0],[.105,3.7,.105]);
    box(l,'#6f806d',[0,3.61,0],[.42,.08,.42]);part(l,'round','#f8ecd0',[0,3.87,0],[.34,.44,.34],[0,0,0],'glass');
    part(l,'cone','#7d8d79',[0,4.17,0],[.6,.25,.6]);ball(l,'#8e9e84',[0,4.33,0],[.1,.1,.1]);
  }
  function table(g,x,z) {
    const t=group(g,x,0,z);cyl(t,'#f0e8d6',[0,.83,0],[1.25,.11,1.25]);cyl(t,'#8d9a82',[0,.4,0],[.09,.8,.09]);
    beam(t,'#8d9a82',[-.35,.06,-.3],[.35,.06,.3],.08);beam(t,'#8d9a82',[-.35,.06,.3],[.35,.06,-.3],.08);
    for(const sign of [-1,1]) {
      const c=group(t,0,0,sign*1.0,sign===1?Math.PI:0);
      part(c,'round','#dfd8c4',[0,.45,0],[.56,.12,.52]);box(c,'#c6cbb4',[0,.9,-.23],[.55,.6,.08]);
      for(const xx of [-.21,.21])for(const zz of [-.18,.18])cyl(c,'#8b9b82',[xx,.24,zz],[.045,.48,.045]);
    }
    cyl(t,'#c28d94',[.2,.96,0],[.16,.18,.16]);cyl(t,'#7e6552',[.2,1.055,0],[.12,.008,.12]);
    cyl(t,'#e8d4b5',[-.22,.98,0],[.12,.2,.12]);ball(t,'#a4b78a',[-.22,1.15,0],[.24,.24,.24]);
  }
  function bicycle(g,x,z,ry=0) {
    const b=group(g,x,.02,z,ry), frame='#a5b9a6';
    for(const xx of [-.65,.65]){part(b,'ring','#727969',[xx,.44,0],[.85,.85,.85]);cyl(b,'#d4cfb8',[xx,.44,0],[.08,.12,.08],[Math.PI/2,0,0]);}
    [[[-.65,.44,0],[-.2,1.0,0]],[[-.65,.44,0],[.05,.45,0]],[[-.2,1,0],[.05,.45,0]],[[-.2,1,0],[.48,1.1,0]],[[.05,.45,0],[.48,1.1,0]],[[.48,1.1,0],[.65,.44,0]]].forEach(([a,c])=>beam(b,frame,a,c,.065));
    box(b,'#9b8b77',[-.24,1.09,0],[.35,.08,.2]);beam(b,'#b8baa6',[.48,1.1,0],[.46,1.35,0],.06);beam(b,'#b8baa6',[.46,1.35,-.2],[.46,1.35,.2],.06);
    part(b,'round','#cbb598',[.8,1.06,0],[.38,.27,.4]);
  }
  function window(g,x,y,z,ry,p,w=1.35) {
    const f=group(g,x,y,z,ry), h=1.55;
    box(f,tint(p.wall,.65),[0,0,0],[w+.2,h+.18,.11]);
    box(f,p.trim,[0,0,.06],[w+.16,h+.16,.12]);
    part(f,'box','#9dbbb4',[0,0,.13],[w,h,.055],[0,0,0],'glass');
    box(f,p.trim,[0,0,.18],[.075,h,.06]);box(f,p.trim,[0,0,.18],[w,.065,.06]);
    box(f,'#f7efd8',[0,-h/2-.12,.16],[w+.35,.12,.31]);
    for(const sign of [-1,1]) {
      box(f,p.shutter,[sign*(w/2+.29),0,.06],[.32,h+.12,.1]);
      for(let i=0;i<5;i++)box(f,tint(p.shutter,.88),[sign*(w/2+.29),-.58+i*.29,.12],[.27,.035,.035]);
    }
  }
  let signMaterial;
  function sign(g,text,x,y,z,w=3.4) {
    if(!signMaterial) {
      const c=document.createElement('canvas');c.width=512;c.height=128;
      const cx=c.getContext('2d');cx.fillStyle='#f2ead7';cx.fillRect(0,0,512,128);cx.strokeStyle='#b7b89c';cx.lineWidth=5;cx.strokeRect(9,9,494,110);
      cx.fillStyle='#6c7e61';cx.textAlign='center';cx.textBaseline='middle';cx.font='italic 54px Georgia';cx.fillText(text,256,67);
      const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
      signMaterial=new THREE.MeshStandardMaterial({map:tex,roughness:1});
    }
    const mesh=new THREE.Mesh(geometries.plane,signMaterial);mesh.position.set(x,y,z);mesh.scale.set(w,w/4,1);mesh.userData={part:true,color:new THREE.Color('#ffffff')};g.add(mesh);
  }
  function building(g,lot,rnd) {
    const b=group(g,0,0,-1), p=lot.palette, w=lot.width, d=lot.depth, h=lot.height+.35, rise=2.0;
    shadow(b,0,0,w+2,d+2);
    box(b,'#c7bda4',[0,.17,0],[w+.4,.34,d+.4]);
    box(b,p.wall,[0,(h+.35)/2,0],[w,h-.35,d]);
    for(let y=.65;y<h-.2;y+=.46)box(b,tint(p.wall,.94),[0,y,0],[w+.02,.018,d+.02]);
    for(const xx of [-w/2,w/2])for(const zz of [-d/2,d/2])box(b,p.trim,[xx,h/2+.17,zz],[.14,h-.32,.14]);
    part(b,'gable',p.wall,[0,h,0],[w,rise,d]);
    const eave=w/2+.52, pitch=Math.atan2(rise,eave), span=Math.hypot(eave,rise);
    for(const side of [-1,1]) {
      box(b,p.roof,[side*eave/2,h+rise/2+.07,0],[span+.14,.19,d+1.05],[0,0,-side*pitch]);
      for(const zz of [-d/2-.54,d/2+.54])box(b,p.trim,[side*eave/2,h+rise/2-.03,zz],[span+.2,.16,.14],[0,0,-side*pitch]);
      for(let xx=.85;xx<eave;xx+=.92)box(b,tint(p.roof,.91),[side*xx,h+rise*(1-xx/eave)+.18,0],[.023,.025,d+1.05]);
    }
    box(b,tint(p.roof,1.04),[0,h+rise+.17,0],[.22,.17,d+1.15]);
    for(const xx of [-eave,eave])box(b,p.trim,[xx,h-.02,0],[.16,.2,d+1.08]);
    const chimneyY=h+1.4;
    box(b,'#cda18c',[w*.25,chimneyY,-d*.18],[.67,1.65,.73]);box(b,'#eee1c6',[w*.25,chimneyY+.84,-d*.18],[.86,.18,.9]);box(b,'#7a796a',[w*.25,chimneyY+.94,-d*.18],[.48,.02,.51]);
    for(let y=chimneyY-.45;y<chimneyY+.7;y+=.25)box(b,'#d8b09a',[w*.25,y,-d*.18],[.69,.025,.75]);
    const rows=lot.floors===2?[2,5.05]:[2];
    for(const yy of rows) {
      for(const xx of [-w*.29,w*.29])window(b,xx,yy,d/2+.02,0,p,lot.kind==='cafe'?2.2:1.28);
      for(const side of [-1,1])for(const zz of [-d*.25,d*.25])window(b,side*(w/2+.02),yy,zz,side*Math.PI/2,p,1.25);
      for(const xx of [-w*.27,w*.27])window(b,xx,yy,-d/2-.02,Math.PI,p,1.25);
    }
    const front=d/2;
    box(b,p.trim,[0,1.62,front+.06],[1.55,2.65,.15]);box(b,p.shutter,[0,1.6,front+.16],[1.28,2.45,.08]);
    part(b,'box','#abc7be',[0,1.99,front+.21],[.89,1.22,.025],[0,0,0],'glass');box(b,p.trim,[0,1.99,front+.24],[.045,1.22,.025]);box(b,p.trim,[0,2.02,front+.24],[.9,.045,.025]);ball(b,'#c4a76e',[.42,1.1,front+.27],[.1,.1,.1]);
    for(let i=0;i<3;i++)box(b,'#dfd5bd',[0,.08+i*.11,front+.8-i*.3],[3.1,.16+i*.14,1.7-i*.35]);
    if(lot.kind==='cafe') {
      const n=12, aw=w+.25;
      for(let i=0;i<n;i++) {
        const xx=-aw/2+(i+.5)*aw/n, c=i%2?'#e9dfcb':'#c7929e';
        box(b,c,[xx,3.16,front+1.0],[aw/n+.008,.1,2.03],[.23,0,0]);box(b,c,[xx,2.88,front+2.0],[aw/n+.008,.27,.09]);
      }
      for(const xx of [-aw/2,aw/2])cyl(b,'#f2e5cd',[xx,1.39,front+1.85],[.09,2.78,.09]);
      table(b,-3.35,front+2.65);table(b,3.35,front+2.65);sign(b,"Jenn's Cafe",0,3.82,front+.13,3.5);
      bicycle(b,w/2+.55,1,Math.PI/2);
    } else {
      box(b,p.roof,[0,3.04,front+.8],[3.1,.18,1.9],[.14,0,0]);box(b,p.trim,[0,2.91,front+1.75],[3.15,.14,.12]);
      for(const xx of [-1.3,1.3])box(b,p.trim,[xx,1.5,front+1.45],[.12,2.8,.12]);
      for(const xx of [-w*.29,w*.29])planter(b,xx,front+.4,rnd,1.25);
    }
    const pathStart=front+1.65;
    box(g,'#e2dac2',[0,.018,(pathStart+9.6)/2],[1.62,.035,9.6-pathStart]);
    return { chimney:[lot.x+w*.25,chimneyY+1.35,lot.z-d*.18-1] };
  }
  return {THREE,materials,geometries,tint,group,part,box,ball,cyl,beam,shadow,compile,flowers,planter,tree,pine,fence,bench,lamp,table,bicycle,window,building};
}
