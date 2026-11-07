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
  drawIcon('cup',c=>{line(c,[[5,10],[5,25],[22,25],[22,10],[5,10]]);line(c,[[22,12],[29,12],[29,21],[22,21]]);line(c,[[10,5],[12,2]]);line(c,[[17,6],[19,2]]);});
  drawIcon('tv',c=>{c.strokeRect(3,7,26,19);line(c,[[10,2],[16,7],[23,2]]);line(c,[[9,30],[23,30]]);});
  const texture=new THREE.CanvasTexture(atlas);texture.minFilter=texture.magFilter=THREE.LinearFilter;texture.generateMipmaps=false;
  const limit=16000,pos=new Float32Array(limit*2),uv=new Float32Array(limit*2),col=new Float32Array(limit*4),local=new Float32Array(limit*2),sizes=new Float32Array(limit*2),rad=new Float32Array(limit),indices=new Uint16Array(limit/4*6);
  for(let i=0,j=0;i<limit;i+=4,j+=6)indices.set([i,i+1,i+2,i,i+2,i+3],j);
  const geometry=new THREE.BufferGeometry();for(const[name,array,size]of[['position',pos,2],['uv',uv,2],['tint',col,4],['local',local,2],['size',sizes,2],['radius',rad,1]])geometry.setAttribute(name,new THREE.BufferAttribute(array,size).setUsage(THREE.DynamicDrawUsage));geometry.setIndex(new THREE.BufferAttribute(indices,1));
  const material=new THREE.ShaderMaterial({side:THREE.DoubleSide,transparent:true,depthTest:false,depthWrite:false,toneMapped:false,uniforms:{atlas:{value:texture},resolution:{value:new THREE.Vector2()}},vertexShader:`attribute vec4 tint;attribute vec2 local;attribute vec2 size;attribute float radius;varying vec4 vTint;varying vec2 vUv;varying vec2 vLocal;varying vec2 vSize;varying float vRadius;uniform vec2 resolution;void main(){vTint=tint;vUv=uv;vLocal=local;vSize=size;vRadius=radius;gl_Position=vec4(position.x/resolution.x*2.-1.,1.-position.y/resolution.y*2.,0.,1.);}`,fragmentShader:`uniform sampler2D atlas;varying vec4 vTint;varying vec2 vUv;varying vec2 vLocal;varying vec2 vSize;varying float vRadius;void main(){float a;if(vRadius<0.)a=texture2D(atlas,vUv).a;else{vec2 q=abs(vLocal*vSize-vSize*.5)-(vSize*.5-vec2(vRadius));float d=length(max(q,0.))+min(max(q.x,q.y),0.)-vRadius;a=1.-smoothstep(-.7,.7,d);}vec3 rgb=vRadius< -1.5?texture2D(atlas,vUv).rgb:vec3(1.);gl_FragColor=vec4(vTint.rgb*rgb,vTint.a*a);}`});
  const scene=new THREE.Scene(),camera=new THREE.Camera(),mesh=new THREE.Mesh(geometry,material);mesh.frustumCulled=false;scene.add(mesh);
  const colors={panel:[1,.94,.96,.97],edge:[.66,.24,.4,1],ink:[.30,.14,.25,1],muted:[.49,.36,.43,1],pink:[.87,.28,.49,1],mint:[.34,.62,.31,1],pale:[.91,.96,.85,1],white:[1,1,1,1],button:[.96,.84,.89,1]};
  let vertices=0,hits=[],width=0,height=0,menu='',hover='',focus=-1,stamp='',lastUpdate=-1,portraitSeed='',portraitBuilds=0,context=null;
  function buildPortraits(m){if(portraitSeed===m.seed)return;portraitSeed=m.seed;portraitBuilds++;ctx.clearRect(0,256,1024,192);
    for(const r of m.allResidents){const a=r.appearance;if(!a)continue;const x=r.index%16*64,y=256+Math.floor(r.index/16)*80;cells.set('@portrait:'+r.index,{x,y,w:64,h:76,rgb:true});ctx.save();ctx.translate(x,y);ctx.beginPath();ctx.rect(0,0,64,76);ctx.clip();const ellipse=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,w,h,0,0,Math.PI*2);ctx.fill();};
      ellipse(a.shirt,32,74,28,24);ellipse(a.skin,32,48,7,12);ellipse(a.hair,32,28,20,25);if(a.style===0)ellipse(a.hair,44,10,10,10);ellipse(a.skin,32,32,16,21);ellipse(a.hair,30,14,19,9);if(a.style===1)for(let i=0;i<5;i++)ellipse(a.hair,17+i*7,13+(i%2)*3,7,7);if(a.style===2)ellipse(a.hair,16,34,5,19);ellipse('#332c35',26,31,1.8,2);ellipse('#332c35',38,31,1.8,2);ctx.strokeStyle='#ac6c65';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(32,41,4,0,Math.PI);ctx.stroke();if(a.glasses){ctx.strokeStyle='#56485b';ctx.lineWidth=2;ctx.strokeRect(20,26,11,10);ctx.strokeRect(33,26,11,10);}if(a.hat){ellipse('#d7c49c',32,13,27,5);ctx.fillStyle='#d7c49c';ctx.fillRect(17,0,30,12);}ctx.restore();}
    texture.needsUpdate=true;
  }
  function portrait(r,x,y,w,h){rect(x,y,w,h,r.index===currentSelected?colors.pale:colors.button,10);const c=cells.get('@portrait:'+r.index);if(c)quad(x,y,w,h,colors.white,c);else icon('person',x+5,y+8,w-10);}
  let currentSelected=-1;

  function quad(x,y,w,h,c,region=null,radius=0){if(vertices+4>limit)return;const n=vertices;vertices+=4;const coords=[[x,y],[x+w,y],[x+w,y+h],[x,y+h]],q=[[0,0],[1,0],[1,1],[0,1]];for(let i=0;i<4;i++){pos.set(coords[i],(n+i)*2);local.set(q[i],(n+i)*2);sizes.set([w,h],(n+i)*2);col.set(c,(n+i)*4);rad[n+i]=region?(region.rgb?-2:-1):radius;uv.set(region?[(region.x+q[i][0]*region.w)/1024,1-(region.y+q[i][1]*region.h)/512]:[0,0],(n+i)*2);}}
  const rect=(x,y,w,h,c,r=10)=>quad(x,y,w,h,c,null,r);
  function text(value,x,y,size=14,color=colors.ink){const s=size/26;for(const ch of String(value)){const c=cells.get(ch)||cells.get('?');quad(x-3*s,y-3*s,40*s,40*s,color,c);x+=(c.advance+.6)*s;}return x;}
  const icon=(name,x,y,size=26,color=colors.ink)=>quad(x,y,size,size,color,cells.get('@'+name));
  function button(id,label,x,y,w=40,h=40,opts={}){const active=opts.active||hover===id;rect(x,y,w,h,active?colors.mint:colors.button,10);if(opts.icon)icon(opts.icon,x+(w-26)/2,y+(h-26)/2,26,active?colors.white:colors.ink);else text(label,x+Math.max(6,(w-label.length*7.4)/2),y+(h-15)/2,14,active?colors.white:colors.ink);hits.push({id,label,x,y,w,h});}
  function selectedPanel(m,x,y,w){portrait(m.selected,x,y,48,57);text(m.selected.name,x+57,y+3,18);text(m.selected.state.slice(0,23),x+57,y+27,11,colors.muted);button('follow','Follow',x+w-39,y+4,36,36,{icon:'follow',active:m.following});}
  function renderModel(m){
    vertices=0;hits=[];buildPortraits(m);currentSelected=m.selected.index;const phone=width<760;
    rect(12,12,phone?244:280,34,colors.panel,17);icon('diamond',22,19,20,colors.mint);text('LIVE',49,21,12,colors.mint);text(`${m.inside} at home / 32 neighbors`,89,21,phone?10:12,colors.ink);
    for(const b of m.bubbles??[]){if(b.x<10||b.x>width-20||b.y<55||b.y>height-170)continue;rect(b.x-12,b.y-12,24,21,colors.panel,8);icon(b.icon||'chat',b.x-9,b.y-10,18,colors.mint);}
    const bw=phone?width-16:680,bx=phone?8:18,by=height-(phone?150:135);
    hits.push({id:'panel',label:'Live mode',x:bx,y:by,w:bw,h:phone?140:122});
    rect(bx,by+3,bw,phone?140:122,[.4,.18,.28,.16],17);rect(bx,by,bw,phone?137:119,colors.panel,17);
    if(phone){selectedPanel(m,bx+10,by+9,bw-20);const space=(bw-20)/8;['pause','1','2','3','home','gather','roster','menu'].forEach((id,i)=>button(id,id==='pause'?'Pause / play':id==='gather'?'Gather neighbors':id==='roster'?'Residents':id==='menu'?'Options':id,bx+10+i*space,by+81,space-3,40,{icon:{pause:m.speed===0?'play':'pause',home:'home',gather:'people',roster:'person',menu:'more'}[id],active:['1','2','3'].includes(id)&&m.speed===Number(id)}));}
    else{selectedPanel(m,bx+12,by+12,260);for(let i=0;i<Math.min(6,m.residents.length);i++){const r=m.residents[i],x=bx+290+i*62;portrait(r,x,by+10,42,49);hits.push({id:'resident:'+r.index,label:r.name,x,y:by+10,w:46,h:55});}text('LIVE',bx+14,by+89,13,colors.mint);text('Town 10',bx+65,by+90,11,colors.muted);const start=bx+290;['pause','1','2','3','home','gather','roster','menu'].forEach((id,i)=>button(id,id==='pause'?'Pause / play':id==='gather'?'Gather neighbors':id==='roster'?'Residents':id==='menu'?'Options':id,start+i*46,by+74,39,34,{icon:{pause:m.speed===0?'play':'pause',home:'home',gather:'people',roster:'person',menu:'more'}[id],active:['1','2','3'].includes(id)&&m.speed===Number(id)}));}
    if(menu==='options'){const w=Math.min(300,width-24),x=width-w-12,y=Math.max(56,by-342);rect(x,y,w,328,colors.panel,16);text('Live mode',x+16,y+15,20);button('close','Close',x+w-43,y+8,32,32,{icon:'close'});const rows=[['overview','Neighborhood overview'],['roof',m.open?'Put the roof back':'Look inside'],['evening',m.evening?'Daylight':'Evening light'],['palette','Change cottage colors'],['quality',m.soft?'Soft shading: on':'Soft shading: off'],['ambient',m.ambient?'Ambient details: on':'Ambient details: off'],['new','New neighborhood']];rows.forEach(([id,label],i)=>button(id,label,x+12,y+52+i*37,w-24,32));}
    else if(menu==='residents'){const w=Math.min(432,width-24),x=(width-w)/2,y=Math.max(8,by-454),cw=(w-24)/4;rect(x,y,w,442,colors.panel,16);text('Neighbors',x+14,y+15,20);button('close','Close',x+w-43,y+8,32,32,{icon:'close'});m.allResidents.forEach((r,i)=>{const xx=x+12+(i%4)*cw,yy=y+54+Math.floor(i/4)*47;portrait(r,xx,yy,30,36);text(r.name.slice(0,6),xx+32,yy+12,10);hits.push({id:'resident:'+r.index,label:r.name,x:xx,y:yy,w:cw-4,h:44});});}
    if(context&&!menu){const w=190,x=Math.max(8,Math.min(width-w-8,context.x-w/2)),y=Math.max(55,Math.min(by-102,context.y-97));rect(x,y,w,88,colors.panel,14);text(context.kind==='drink'?'Dining table':'Television',x+12,y+12,15);button(context.kind,context.kind==='drink'?'Have a drink':'Watch TV',x+10,y+42,w-20,36);}
    const focused=hits[focus];if(focused)rect(focused.x-2,focused.y-2,focused.w+4,2,colors.mint,0);
    if(hover&&!phone){const b=hits.find(b=>b.id===hover);if(b){const w=Math.min(200,b.label.length*7+20),x=Math.max(8,Math.min(width-w-8,b.x+b.w/2-w/2));rect(x,b.y-30,w,25,colors.ink,7);text(b.label,x+9,b.y-24,11,colors.white);}}
    if(m.notice){const w=Math.min(width-24,340);rect((width-w)/2,58,w,32,colors.panel,16);text(m.notice,(width-w)/2+14,67,12,colors.ink);}
    geometry.setDrawRange(0,vertices/4*6);for(const a of Object.values(geometry.attributes))a.needsUpdate=true;
  }
  function resize(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;material.uniforms.resolution.value.set(width,height);stamp='';}
  function update(m,now){const next=JSON.stringify([m.selected,m.speed,m.inside,m.open,m.evening,m.soft,m.ambient,m.following,m.notice,m.residents.map(r=>r.index),context,menu,hover,focus,width,height]);if(next!==stamp||now-lastUpdate>250){stamp=next;lastUpdate=now;renderModel(m);}}
  function hit(x,y){return [...hits].reverse().find(b=>x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h)||null;}
  function activate(id){stamp='';if(id==='tv'||id==='drink')context=null;if(id==='menu'){context=null;menu=menu?'':'options';return;}if(id==='roster'){context=null;menu=menu==='residents'?'':'residents';return;}if(id==='close'){menu='';return;}if(id.startsWith('resident:'))menu='';onAction(id);}
  function render(){const auto=renderer.autoClear;renderer.autoClear=false;renderer.setRenderTarget(null);renderer.render(scene,camera);renderer.autoClear=auto;}
  resize();return {resize,update,render,hit,activate,closeContext(){context=null;stamp='';},openContext(kind,x,y){context={kind,x,y};menu='';stamp='';},hover(x,y){const id=hit(x,y)?.id??'';if(id!==hover){hover=id;canvas.style.cursor=id?'pointer':'grab';}},key(key){if(key==='Tab'){focus=(focus+1)%hits.length;stamp='';return true;}if((key==='Enter'||key===' ')&&focus>=0){activate(hits[focus].id);return true;}if(key==='Escape'){if(context)context=null;else menu=menu?'':'options';stamp='';return true;}focus=-1;return false;},info:()=>({drawCalls:1,glyphAtlasUploads:1,portraitAtlasBuilds:portraitBuilds,portraitCount:32,textureSize:[1024,512],vertices,controls:hits.map(b=>({...b})),menu}),dispose(){geometry.dispose();material.dispose();texture.dispose();}};
}
