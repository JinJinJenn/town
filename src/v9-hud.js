import * as THREE from '../vendor/three.module.js';
// The canvas is an atlas builder only. Visible text/icons/panels are one WebGL batch.
export function createLiveHUD(renderer,canvas,onAction){
  const atlas=document.createElement('canvas');atlas.width=1024;atlas.height=512;
  const ctx=atlas.getContext('2d'),cells=new Map();let cell=0;
  const allocate=key=>{const n=cell++,x=n%25*40,y=Math.floor(n/25)*40,v={x,y,w:40,h:40,advance:24};cells.set(key,v);return v;};
  ctx.fillStyle='#fff';ctx.font='600 26px system-ui, sans-serif';ctx.textBaseline='top';
  for(let n=32;n<127;n++){const ch=String.fromCharCode(n),c=allocate(ch);ctx.fillText(ch,c.x+3,c.y+3);c.advance=ctx.measureText(ch).width;}
  function drawIcon(name,fn){const c=allocate('@'+name);ctx.save();ctx.translate(c.x+4,c.y+4);ctx.lineWidth=2.6;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=ctx.fillStyle='#fff';fn(ctx);ctx.restore();}
  const line=(c,pts)=>{c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
  drawIcon('play',c=>{c.beginPath();c.moveTo(9,5);c.lineTo(27,16);c.lineTo(9,27);c.closePath();c.fill();});
  drawIcon('pause',c=>{c.fillRect(8,6,5,20);c.fillRect(20,6,5,20);});
  drawIcon('home',c=>{line(c,[[3,15],[16,4],[29,15]]);line(c,[[7,13],[7,28],[25,28],[25,13]]);line(c,[[13,28],[13,20],[19,20],[19,28]]);});
  drawIcon('people',c=>{for(const[x,y,r]of[[11,10,5],[24,12,4]]){c.beginPath();c.arc(x,y,r,0,7);c.stroke();}line(c,[[2,28],[3,21],[9,18],[14,18],[20,21],[21,28]]);line(c,[[22,20],[28,22],[30,28]]);});
  drawIcon('more',c=>{for(const x of[6,16,26]){c.beginPath();c.arc(x,16,2.3,0,7);c.fill();}});
  drawIcon('follow',c=>{c.beginPath();c.arc(16,16,8,0,7);c.stroke();for(const p of[[16,2,16,9],[16,23,16,30],[2,16,9,16],[23,16,30,16]])line(c,[[p[0],p[1]],[p[2],p[3]]]);});
  drawIcon('seat',c=>{line(c,[[6,18],[6,8],[26,8],[26,18]]);line(c,[[3,15],[8,15],[8,22],[24,22],[24,15],[29,15],[29,27],[3,27],[3,15]]);});
  drawIcon('diamond',c=>{c.beginPath();c.moveTo(16,2);c.lineTo(26,16);c.lineTo(16,30);c.lineTo(6,16);c.closePath();c.fill();});
  drawIcon('person',c=>{c.beginPath();c.arc(16,10,6,0,7);c.fill();c.beginPath();c.ellipse(16,27,11,10,0,Math.PI,0);c.fill();});
  drawIcon('close',c=>{line(c,[[8,8],[24,24]]);line(c,[[24,8],[8,24]]);});
  drawIcon('chat',c=>{c.beginPath();c.roundRect(2,4,28,20,7);c.stroke();line(c,[[10,24],[7,29],[18,24]]);for(const x of[9,16,23]){c.beginPath();c.arc(x,14,1,0,7);c.fill();}});
  const texture=new THREE.CanvasTexture(atlas);texture.minFilter=texture.magFilter=THREE.LinearFilter;texture.generateMipmaps=false;
  const limit=16000,pos=new Float32Array(limit*2),uv=new Float32Array(limit*2),col=new Float32Array(limit*4),local=new Float32Array(limit*2),sizes=new Float32Array(limit*2),rad=new Float32Array(limit),indices=new Uint16Array(limit/4*6);
  for(let i=0,j=0;i<limit;i+=4,j+=6)indices.set([i,i+1,i+2,i,i+2,i+3],j);
  const geometry=new THREE.BufferGeometry();for(const[name,array,size]of[['position',pos,2],['uv',uv,2],['tint',col,4],['local',local,2],['size',sizes,2],['radius',rad,1]])geometry.setAttribute(name,new THREE.BufferAttribute(array,size).setUsage(THREE.DynamicDrawUsage));geometry.setIndex(new THREE.BufferAttribute(indices,1));
  const material=new THREE.ShaderMaterial({side:THREE.DoubleSide,transparent:true,depthTest:false,depthWrite:false,toneMapped:false,uniforms:{atlas:{value:texture},resolution:{value:new THREE.Vector2()}},vertexShader:`attribute vec4 tint;attribute vec2 local;attribute vec2 size;attribute float radius;varying vec4 vTint;varying vec2 vUv;varying vec2 vLocal;varying vec2 vSize;varying float vRadius;uniform vec2 resolution;void main(){vTint=tint;vUv=uv;vLocal=local;vSize=size;vRadius=radius;gl_Position=vec4(position.x/resolution.x*2.-1.,1.-position.y/resolution.y*2.,0.,1.);}`,fragmentShader:`uniform sampler2D atlas;varying vec4 vTint;varying vec2 vUv;varying vec2 vLocal;varying vec2 vSize;varying float vRadius;void main(){float a;if(vRadius<0.)a=texture2D(atlas,vUv).a;else{vec2 q=abs(vLocal*vSize-vSize*.5)-(vSize*.5-vec2(vRadius));float d=length(max(q,0.))+min(max(q.x,q.y),0.)-vRadius;a=1.-smoothstep(-.7,.7,d);}gl_FragColor=vec4(vTint.rgb,vTint.a*a);}`});
  const scene=new THREE.Scene(),camera=new THREE.Camera(),mesh=new THREE.Mesh(geometry,material);mesh.frustumCulled=false;scene.add(mesh);
  const colors={panel:[1,.94,.96,.97],edge:[.66,.24,.4,1],ink:[.30,.14,.25,1],muted:[.49,.36,.43,1],pink:[.87,.28,.49,1],mint:[.34,.62,.31,1],pale:[.91,.96,.85,1],white:[1,1,1,1],button:[.96,.84,.89,1]};
  let vertices=0,hits=[],width=0,height=0,menu='',hover='',focus=-1,stamp='',lastUpdate=-1;
  function quad(x,y,w,h,c,region=null,radius=0){if(vertices+4>limit)return;const n=vertices;vertices+=4;const coords=[[x,y],[x+w,y],[x+w,y+h],[x,y+h]],q=[[0,0],[1,0],[1,1],[0,1]];for(let i=0;i<4;i++){pos.set(coords[i],(n+i)*2);local.set(q[i],(n+i)*2);sizes.set([w,h],(n+i)*2);col.set(c,(n+i)*4);rad[n+i]=region?-1:radius;uv.set(region?[(region.x+q[i][0]*region.w)/1024,1-(region.y+q[i][1]*region.h)/512]:[0,0],(n+i)*2);}}
  const rect=(x,y,w,h,c,r=10)=>quad(x,y,w,h,c,null,r);
  function text(value,x,y,size=14,color=colors.ink){const s=size/26;for(const ch of String(value)){const c=cells.get(ch)||cells.get('?');quad(x-3*s,y-3*s,40*s,40*s,color,c);x+=(c.advance+.6)*s;}return x;}
  const icon=(name,x,y,size=26,color=colors.ink)=>quad(x,y,size,size,color,cells.get('@'+name));
  function button(id,label,x,y,w=40,h=40,opts={}){const active=opts.active||hover===id;rect(x,y,w,h,active?colors.mint:colors.button,10);if(opts.icon)icon(opts.icon,x+(w-26)/2,y+(h-26)/2,26,active?colors.white:colors.ink);else text(label,x+Math.max(6,(w-label.length*7.4)/2),y+(h-15)/2,14,active?colors.white:colors.ink);hits.push({id,label,x,y,w,h});}
  function selectedPanel(m,x,y,w){icon('diamond',x,y+7,34,colors.mint);text(m.selected.name,x+41,y+3,18);text(m.selected.state,x+41,y+28,12,colors.muted);button('follow','Follow',x+w-84,y+4,36,36,{icon:'follow',active:m.following});button('sit','Sit / stand',x+w-42,y+4,36,36,{icon:'seat'});}
  function renderModel(m){
    vertices=0;hits=[];const phone=width<1000;
    rect(12,12,phone?194:240,34,colors.panel,17);icon('diamond',22,19,20,colors.mint);text('LIVE',49,21,12,colors.mint);text(`${m.inside} at home / 32 neighbors`,89,21,phone?10:12,colors.ink);
    for(const b of m.bubbles??[]){if(b.x<10||b.x>width-20||b.y<55||b.y>height-170)continue;rect(b.x-12,b.y-12,24,21,colors.panel,8);icon('chat',b.x-9,b.y-10,18,colors.mint);}
    const bw=phone?width-16:Math.min(width-40,1120),bx=(width-bw)/2,by=height-(phone?142:102);
    hits.push({id:'panel',label:'Live mode',x:bx,y:by,w:bw,h:phone?128:81});
    rect(bx,by+3,bw,phone?131:84,[.4,.18,.28,.16],17);rect(bx,by,bw,phone?128:81,colors.panel,17);
    if(phone){selectedPanel(m,bx+10,by+10,bw-20);const space=(bw-20)/8;['pause','1','2','3','home','gather','roster','menu'].forEach((id,i)=>button(id,id==='pause'?'Pause / play':id==='gather'?'Gather neighbors':id==='roster'?'Residents':id==='menu'?'Options':id,bx+10+i*space,by+69,space-3,36,{icon:{pause:m.speed===0?'play':'pause',home:'home',gather:'people',roster:'person',menu:'more'}[id],active:['1','2','3'].includes(id)&&m.speed===Number(id)}));}
    else{selectedPanel(m,bx+14,by+16,280);const portraitX=bx+310;for(let i=0;i<Math.min(6,m.residents.length);i++){const r=m.residents[i],x=portraitX+i*44;button('resident:'+r.index,r.name,x,by+12,38,38,{icon:'person',active:r.index===m.selected.index});text(r.name.slice(0,6),x,by+55,10,colors.muted);}const right=bx+bw-358;['pause','1','2','3','home','gather','roster','menu'].forEach((id,i)=>button(id,id==='pause'?'Pause / play':id==='gather'?'Gather neighbors':id==='roster'?'Residents':id==='menu'?'Options':id,right+i*43,by+19,38,40,{icon:{pause:m.speed===0?'play':'pause',home:'home',gather:'people',roster:'person',menu:'more'}[id],active:['1','2','3'].includes(id)&&m.speed===Number(id)}));}
    if(menu==='options'){const w=Math.min(300,width-24),x=width-w-12,y=Math.max(56,by-342);rect(x,y,w,328,colors.panel,16);text('Live mode',x+16,y+15,20);button('close','Close',x+w-43,y+8,32,32,{icon:'close'});const rows=[['overview','Neighborhood overview'],['roof',m.open?'Put the roof back':'Look inside'],['evening',m.evening?'Daylight':'Evening light'],['palette','Change cottage colors'],['quality',m.soft?'Soft shading: on':'Soft shading: off'],['ambient',m.ambient?'Ambient details: on':'Ambient details: off'],['new','New neighborhood']];rows.forEach(([id,label],i)=>button(id,label,x+12,y+52+i*37,w-24,32));}
    else if(menu==='residents'){const w=Math.min(432,width-24),x=(width-w)/2,y=Math.max(55,by-354),cw=(w-24)/4;rect(x,y,w,342,colors.panel,16);text('Neighbors',x+14,y+15,20);button('close','Close',x+w-43,y+8,32,32,{icon:'close'});m.allResidents.forEach((r,i)=>button('resident:'+r.index,r.name,x+12+(i%4)*cw,y+54+Math.floor(i/4)*34,cw-4,29,{active:r.index===m.selected.index}));}
    const focused=hits[focus];if(focused)rect(focused.x-2,focused.y-2,focused.w+4,2,colors.mint,0);
    if(hover&&!phone){const b=hits.find(b=>b.id===hover);if(b){const w=Math.min(200,b.label.length*7+20),x=Math.max(8,Math.min(width-w-8,b.x+b.w/2-w/2));rect(x,b.y-30,w,25,colors.ink,7);text(b.label,x+9,b.y-24,11,colors.white);}}
    if(m.notice){const w=Math.min(width-24,340);rect((width-w)/2,58,w,32,colors.panel,16);text(m.notice,(width-w)/2+14,67,12,colors.ink);}
    geometry.setDrawRange(0,vertices/4*6);for(const a of Object.values(geometry.attributes))a.needsUpdate=true;
  }
  function resize(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;material.uniforms.resolution.value.set(width,height);stamp='';}
  function update(m,now){const next=JSON.stringify([m.selected,m.speed,m.inside,m.open,m.evening,m.soft,m.ambient,m.following,m.notice,m.residents.map(r=>r.index),menu,hover,focus,width,height]);if(next!==stamp||now-lastUpdate>250){stamp=next;lastUpdate=now;renderModel(m);}}
  function hit(x,y){return [...hits].reverse().find(b=>x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h)||null;}
  function activate(id){stamp='';if(id==='menu'){menu=menu?'':'options';return;}if(id==='roster'){menu=menu==='residents'?'':'residents';return;}if(id==='close'){menu='';return;}if(id.startsWith('resident:'))menu='';onAction(id);}
  function render(){const auto=renderer.autoClear;renderer.autoClear=false;renderer.setRenderTarget(null);renderer.render(scene,camera);renderer.autoClear=auto;}
  resize();return {resize,update,render,hit,activate,hover(x,y){const id=hit(x,y)?.id??'';if(id!==hover){hover=id;canvas.style.cursor=id?'pointer':'grab';}},key(key){if(key==='Tab'){focus=(focus+1)%hits.length;stamp='';return true;}if((key==='Enter'||key===' ')&&focus>=0){activate(hits[focus].id);return true;}if(key==='Escape'){menu=menu?'':'options';stamp='';return true;}focus=-1;return false;},info:()=>({drawCalls:1,glyphAtlasUploads:1,textureSize:[1024,512],vertices,controls:hits.map(b=>({...b})),menu}),dispose(){geometry.dispose();material.dispose();texture.dispose();}};
}
