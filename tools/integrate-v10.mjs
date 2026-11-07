import {readFile,writeFile} from 'node:fs/promises';
const read=p=>readFile(p,'utf8');
const patch=(s,a,b)=>{if(!s.includes(a))throw new Error(`Integration anchor missing: ${a.slice(0,80)}`);return s.replace(a,b);};
let life=await read('src/v10-life.js');
if(!life.includes('const reachable='))life=patch(life,"  const nearest=(x,z)=>nav.nodes.filter(n=>n.zone==='home')","  const reachable=new Set([nav.gate]),queue=[nav.gate];for(let i=0;i<queue.length;i++)for(const id of nav.nodes[queue[i]].edges)if(!reachable.has(id)){reachable.add(id);queue.push(id);}\n  const nearest=(x,z)=>nav.nodes.filter(n=>n.zone==='home'&&reachable.has(n.id))");
life=life.replace("if(slot){a.pending=null;travel(a,slot.node);return;}","if(slot&&travel(a,slot.node)){a.pending=null;return;}");
if(!life.includes('!agents.some(b=>b!==a&&b.pending'))life=life.replace("(!kind||s.activity===kind)&&!reserved.has(s.node)","(!kind||s.activity===kind)&&!reserved.has(s.node)&&!agents.some(b=>b!==a&&b.pending===s.activity)");
await writeFile('src/v10-life.js',life);
let main=await read('src/main-v9.js');
main=main.replace("import {createLiveMode} from './v9-life.js';","import {createHousehold as createLiveMode} from './v10-life.js';\nimport {installHouseholdCharacters} from './v10-characters.js';\nimport {createHouseholdFixtures} from './v10-fixtures.js';");
main=main.replace("from './v9-hud.js'","from './v10-hud.js'");
main=patch(main,'  const lighting=','  installHouseholdCharacters(kit);\n  const lighting=');
main=patch(main,'world,life,media,atmosphere;','world,life,media,atmosphere,fixtures;');
main=patch(main,'life?.dispose();media?.dispose();','fixtures?.dispose();life?.dispose();media?.dispose();');
main=patch(main,'life=createLiveMode(world);world.step(0);','life=createLiveMode(world);fixtures=createHouseholdFixtures(world,life);world.step(0);');
main=patch(main,'elevation=.94;viewHeight=innerWidth<700?29:20','elevation=.79;viewHeight=innerWidth<700?27:17.7');
main=patch(main,'const shift=innerWidth<700?5.3:1.2','const shift=innerWidth<700?4.6:.9');
main=patch(main,"case 'sit':life.requestSit(selected);notify(life.agents[selected].state==='sitting'?'Getting up from the sofa.':'A sofa visit is queued.');break;","case 'sit':case 'tv':life.requestActivity(selected,'tv');notify('TV activity updated.');break;case 'drink':life.requestActivity(selected,'drink');notify('A drink at the table is queued.');break;case 'talk':life.requestActivity(selected,'talk');notify('A conversation is queued.');break;");
main=patch(main,"else if(m?.type==='furniture')action('sit');","else if(m?.type==='furniture')hud.openContext(m.activity||'tv',x-r.left,y-r.top);");
main=patch(main,"'x':'sit','r':'overview'","'x':'sit','t':'tv','b':'drink','r':'overview'");
const modelStart=main.indexOf('  function model(now)'),modelEnd=main.indexOf('  function simulate',modelStart);
main=main.slice(0,modelStart)+`  function model(now){
    const a=life.agents[selected],stats=life.stats(),near=life.agents.filter(a=>a.slot&&!a.route.length),roster=[a,...near.filter(b=>b!==a),...life.agents.filter(b=>b!==a&&!near.includes(b))].slice(0,6),bubbles=[];
    for(const b of near){const activity=b.state==='talking'?'chat':b.state==='watching TV'?'tv':b.state==='having a drink'?'cup':null;if(!activity)continue;const p=b.actor.root.position.clone();p.y+=2.12;p.project(camera);if(p.z>=-1&&p.z<=1)bubbles.push({x:(p.x+1)*canvas.clientWidth/2,y:(1-p.y)*canvas.clientHeight/2,icon:activity});}
    const person=a=>({name:a.actor.meta.name,index:a.index,appearance:a.actor.meta.appearance});
    return {seed,selected:{...person(a),state:a.state[0].toUpperCase()+a.state.slice(1),partner:a.partner===null?'':life.agents[a.partner].actor.meta.name},inside:stats.inside,speed,open:world.home.isOpen,evening,soft:compositor.enabled,ambient,following,residents:roster.map(person),allResidents:life.agents.map(person),bubbles,notice:now<noticeUntil?notice:''};
  }
`+main.slice(modelEnd);
main=patch(main,'atmosphere.sync();marker.position','atmosphere.sync();fixtures.update();marker.position');
main=patch(main,'new THREE.OctahedronGeometry(.16)','new THREE.OctahedronGeometry(.19)');
main=patch(main,'scene.add(marker);','marker.scale.set(.75,1.7,.75);scene.add(marker);');
main=main.replace('marker.position.y+=2.05','marker.position.y+=2.3').replace('version:9,frames','version:10,frames');
main=main.replace('routeLength:a.route.length,speed:a.speed','routeLength:a.route.length,speed:a.speed,partner:a.partner,activity:a.slot?.activity,appearance:a.actor.meta.appearance');
main=patch(main,'getHome:()=>','getView:()=>({yaw,elevation,viewHeight,target:target.toArray()}),getHome:()=>');
main=patch(main,'hud:()=>hud.info(),action,',"hud:()=>hud.info(),objectScreen:kind=>{const p=world.home.worldPoint(kind==='drink'?-3.3:.4,kind==='drink'?.9:1.55,kind==='drink'?-1.15:2.1).project(camera);return {x:(p.x+1)*canvas.clientWidth/2,y:(1-p.y)*canvas.clientHeight/2};},action,");
await writeFile('src/main-v10.js',main);
await writeFile('src/main.js',"export {start} from './main-v10.js';\n");
let world=await read('src/world.js');if(!world.includes('if(kit.makeResident)')){world=patch(world,'function makeResident(kit,parent,lot,seed,index,pick) {','function makeResident(kit,parent,lot,seed,index,pick) {\n  if(kit.makeResident)return kit.makeResident(parent,lot,seed,index,pick);');await writeFile('src/world.js',world);}
let hud=await read('src/v9-hud.js');
hud=patch(hud,'  const texture=new THREE.CanvasTexture(atlas);',`  drawIcon('cup',c=>{line(c,[[5,10],[5,25],[22,25],[22,10],[5,10]]);line(c,[[22,12],[29,12],[29,21],[22,21]]);line(c,[[10,5],[12,2]]);line(c,[[17,6],[19,2]]);});
  drawIcon('tv',c=>{c.strokeRect(3,7,26,19);line(c,[[10,2],[16,7],[23,2]]);line(c,[[9,30],[23,30]]);});
  const texture=new THREE.CanvasTexture(atlas);`);
hud=patch(hud,'gl_FragColor=vec4(vTint.rgb,vTint.a*a);','vec3 rgb=vRadius< -1.5?texture2D(atlas,vUv).rgb:vec3(1.);gl_FragColor=vec4(vTint.rgb*rgb,vTint.a*a);');
hud=patch(hud,'rad[n+i]=region?-1:radius','rad[n+i]=region?(region.rgb?-2:-1):radius');
hud=patch(hud,'lastUpdate=-1;',"lastUpdate=-1,portraitSeed='',portraitBuilds=0,context=null;\n"+`  function buildPortraits(m){if(portraitSeed===m.seed)return;portraitSeed=m.seed;portraitBuilds++;ctx.clearRect(0,256,1024,192);
    for(const r of m.allResidents){const a=r.appearance;if(!a)continue;const x=r.index%16*64,y=256+Math.floor(r.index/16)*80;cells.set('@portrait:'+r.index,{x,y,w:64,h:76,rgb:true});ctx.save();ctx.translate(x,y);const ellipse=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,w,h,0,0,Math.PI*2);ctx.fill();};
      ellipse(a.shirt,32,74,28,24);ellipse(a.skin,32,48,7,12);ellipse(a.hair,32,28,20,25);if(a.style===0)ellipse(a.hair,44,10,10,10);ellipse(a.skin,32,32,16,21);ellipse(a.hair,30,14,19,9);if(a.style===1)for(let i=0;i<5;i++)ellipse(a.hair,17+i*7,13+(i%2)*3,7,7);if(a.style===2)ellipse(a.hair,16,34,5,19);ellipse('#332c35',26,31,1.8,2);ellipse('#332c35',38,31,1.8,2);ctx.strokeStyle='#ac6c65';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(32,41,4,0,Math.PI);ctx.stroke();if(a.glasses){ctx.strokeStyle='#56485b';ctx.lineWidth=2;ctx.strokeRect(20,26,11,10);ctx.strokeRect(33,26,11,10);}if(a.hat){ellipse('#d7c49c',32,13,27,5);ctx.fillStyle='#d7c49c';ctx.fillRect(17,0,30,12);}ctx.restore();}
    texture.needsUpdate=true;
  }
  function portrait(r,x,y,w,h){rect(x,y,w,h,r.index===currentSelected?colors.pale:colors.button,10);const c=cells.get('@portrait:'+r.index);if(c)quad(x,y,w,h,colors.white,c);else icon('person',x+5,y+8,w-10);}
  let currentSelected=-1;
`);
hud=patch(hud,"function selectedPanel(m,x,y,w){icon('diamond',x,y+7,34,colors.mint);text(m.selected.name,x+41,y+3,18);text(m.selected.state,x+41,y+28,12,colors.muted);button('follow','Follow',x+w-84,y+4,36,36,{icon:'follow',active:m.following});button('sit','Sit / stand',x+w-42,y+4,36,36,{icon:'seat'});}","function selectedPanel(m,x,y,w){portrait(m.selected,x,y,48,57);text(m.selected.name,x+57,y+3,18);text(m.selected.state.slice(0,23),x+57,y+27,11,colors.muted);button('follow','Follow',x+w-39,y+4,36,36,{icon:'follow',active:m.following});}");
hud=patch(hud,'vertices=0;hits=[];const phone=width<1000;','vertices=0;hits=[];buildPortraits(m);currentSelected=m.selected.index;const phone=width<760;');
hud=patch(hud,"icon('chat',b.x-9,b.y-10,18,colors.mint)","icon(b.icon||'chat',b.x-9,b.y-10,18,colors.mint)");
const start=hud.indexOf('    const bw=phone?'),end=hud.indexOf("    if(menu==='options')",start);
hud=hud.slice(0,start)+`    const bw=phone?width-16:680,bx=phone?8:18,by=height-(phone?150:135);
    hits.push({id:'panel',label:'Live mode',x:bx,y:by,w:bw,h:phone?140:122});
    rect(bx,by+3,bw,phone?140:122,[.4,.18,.28,.16],17);rect(bx,by,bw,phone?137:119,colors.panel,17);
    if(phone){selectedPanel(m,bx+10,by+9,bw-20);const space=(bw-20)/8;['pause','1','2','3','home','gather','roster','menu'].forEach((id,i)=>button(id,id==='pause'?'Pause / play':id==='gather'?'Gather neighbors':id==='roster'?'Residents':id==='menu'?'Options':id,bx+10+i*space,by+81,space-3,40,{icon:{pause:m.speed===0?'play':'pause',home:'home',gather:'people',roster:'person',menu:'more'}[id],active:['1','2','3'].includes(id)&&m.speed===Number(id)}));}
    else{selectedPanel(m,bx+12,by+12,260);for(let i=0;i<Math.min(6,m.residents.length);i++){const r=m.residents[i],x=bx+290+i*62;portrait(r,x,by+10,42,49);hits.push({id:'resident:'+r.index,label:r.name,x,y:by+10,w:46,h:55});}text('LIVE',bx+14,by+89,13,colors.mint);text('Town 10',bx+65,by+90,11,colors.muted);const start=bx+290;['pause','1','2','3','home','gather','roster','menu'].forEach((id,i)=>button(id,id==='pause'?'Pause / play':id==='gather'?'Gather neighbors':id==='roster'?'Residents':id==='menu'?'Options':id,start+i*46,by+74,39,34,{icon:{pause:m.speed===0?'play':'pause',home:'home',gather:'people',roster:'person',menu:'more'}[id],active:['1','2','3'].includes(id)&&m.speed===Number(id)}));}
`+hud.slice(end);
const rs=hud.indexOf("    else if(menu==='residents')"),re=hud.indexOf('    const focused=',rs);
hud=hud.slice(0,rs)+`    else if(menu==='residents'){const w=Math.min(432,width-24),x=(width-w)/2,y=Math.max(8,by-454),cw=(w-24)/4;rect(x,y,w,442,colors.panel,16);text('Neighbors',x+14,y+15,20);button('close','Close',x+w-43,y+8,32,32,{icon:'close'});m.allResidents.forEach((r,i)=>{const xx=x+12+(i%4)*cw,yy=y+54+Math.floor(i/4)*47;portrait(r,xx,yy,30,36);text(r.name.slice(0,6),xx+32,yy+12,10);hits.push({id:'resident:'+r.index,label:r.name,x:xx,y:yy,w:cw-4,h:44});});}
    if(context&&!menu){const w=190,x=Math.max(8,Math.min(width-w-8,context.x-w/2)),y=Math.max(55,Math.min(by-102,context.y-97));rect(x,y,w,88,colors.panel,14);text(context.kind==='drink'?'Dining table':'Television',x+12,y+12,15);button(context.kind,context.kind==='drink'?'Have a drink':'Watch TV',x+10,y+42,w-20,36);}
`+hud.slice(re);
hud=patch(hud,'m.residents.map(r=>r.index),menu,hover','m.residents.map(r=>r.index),context,menu,hover');
hud=patch(hud,"function activate(id){stamp='';","function activate(id){stamp='';if(id==='tv'||id==='drink')context=null;");
hud=patch(hud,'resize();return {resize,update,render,hit,activate,',"resize();return {resize,update,render,hit,activate,openContext(kind,x,y){context={kind,x,y};menu='';stamp='';},");
hud=patch(hud,'glyphAtlasUploads:1,textureSize','glyphAtlasUploads:1,portraitAtlasBuilds:portraitBuilds,portraitCount:32,textureSize');
await writeFile('src/v10-hud.js',hud);
let html=await read('index.html');html=html.replaceAll('Town V9','Town V10');await writeFile('index.html',html);
for(const file of['package.json','package-lock.json']){const s=await read(file);await writeFile(file,s.replaceAll('"version": "0.9.0"','"version": "0.10.0"'));}
console.log('V10 native source integrated: household activities, portraits, contextual actions and closer camera.');
