import {rng} from './plan.js';

// V8 props are primitive assemblies compiled with the existing shared batches.
// These are decoration only: navigation, furniture use and saved palettes stay intact.
export const PROP_TYPES = Object.freeze(['bistro','lounger','grill','pottingBench','wheelbarrow','wateringCan','birdbath','birdhouse','beehive','clothesline','laundry','doghouse','petBowls','pumpkins','mushrooms','tomatoes','produceCrate','firewood','hoseReel','windSpinner','picnic','swing','sandbox','toyWagon','pastryCart','recycleBins','easel','chess','toaster','rangeHood','radio','cactus','wallClock','keyRack','terrarium','tissueBox']);
const THEMES = [
 ['pottingBench','tomatoes','wheelbarrow','wateringCan','hoseReel','produceCrate'],
 ['bistro','grill','lounger','firewood','pumpkins','windSpinner'],
 ['clothesline','doghouse','toyWagon','laundry','petBowls','mushrooms'],
 ['lounger','birdbath','beehive','birdhouse','easel','wateringCan'],
];
// Local lot coordinates; all non-park props stay outside the house and front gate.
export function planV8Props(plan){
 const out=[];
 for(const lot of plan.lots){
  const r=rng(`${plan.seed}:props-v8:${lot.id}`);
  const add=(type,x,z,scale=1,angle=0)=>out.push({type,lot:lot.id,x,z,scale,angle,tint:Math.floor(r()*4)});
  if(lot.kind==='park'){
   add('picnic',0,5.85,.95);add('swing',0,-6.15,.95);add('sandbox',3.75,3.8,.9);add('toyWagon',-2.9,5.65,.8,.2);
   add('birdhouse',-4.4,-3.65,.9);add('mushrooms',-4.4,3.8,.9);add('recycleBins',3.3,-6.55,.8);add('chess',-4.9,-1.6,.8);add('windSpinner',4.4,-4.3,.85);continue;
  }
  if(lot.kind==='cafe'){
   add('pastryCart',-1.6,-6.9,1.15);add('produceCrate',1,-6.9,.85);add('recycleBins',2.9,-6.9,.9);add('easel',-6.35,4.1,.85,.15);add('birdbath',6.3,4.8,.8);add('pumpkins',-5.8,-6.6,.9);continue;
  }
  if(lot.furnished){
   add('bistro',-3.55,5.65,.85);add('lounger',4.25,5.55,.9,Math.PI/2);add('wheelbarrow',-6.35,.4,.7);add('birdbath',6.35,-1.9,.8);
   add('birdhouse',.7,-7.2,.9);add('beehive',2.2,-7.2,.8);add('wateringCan',-2,6.8,.8);add('pumpkins',5.65,6.9,.72);add('mushrooms',-5.1,7.55,.85);continue;
  }
  const types=THEMES[(lot.id+Math.floor(r()*4))%THEMES.length];
  const anchors=[[-3.5,5.85,.9,0],[3.6,5.8,.9,0],[0,-6.9,.85,0],[-6.35,.3,.72,Math.PI/2],[6.35,-1.7,.72,-Math.PI/2],[2.0,-7,.75,0]];
  types.forEach((type,i)=>add(type,...anchors[i]));
 }
 return out;
}

export function buildV8Prop(kit,parent,type,x=0,y=0,z=0,scale=1,angle=0,tint=0){
 if(!PROP_TYPES.includes(type))throw new Error(`Unknown V8 prop: ${type}`);
 const {group,part,box,cyl,beam}=kit,g=group(parent,x,y,z,angle);g.scale.setScalar(scale);g.name=`v8-${type}`;g.userData.v8Type=type;
 const pink=['#e65896','#ae82c7','#5eb4a0','#e4ae60'][tint%4],cream='#fff0d6',wood='#bf8550',dark='#526763',green='#77af53';
 const b=(c,p,s,r)=>box(g,c,p,s,r),c=(col,p,s,r)=>cyl(g,col,p,s,r),q=(col,p,s,r)=>part(g,'round',col,p,s,r),bud=(col,p,s)=>part(g,'bud',col,p,s);
 const rod=(a,d,w=.05,col=wood)=>beam(g,col,a,d,w);
 function legs(w,d,h){for(const xx of [-w/2,w/2])for(const zz of [-d/2,d/2])b(wood,[xx,h/2,zz],[.07,h,.07]);}
 function pot(px,py,pz,s=.35){c(pink,[px,py+s*.35,pz],[s,s*.7,s]);c('#614c38',[px,py+s*.71,pz],[s*.87,.025,s*.87]);for(let i=0;i<3;i++)part(g,'leaf',green,[px+Math.cos(i*2.1)*s*.2,py+s*(1+i*.1),pz+Math.sin(i*2.1)*s*.2],[s*.34,s*.85,s*.3],[0,i,(i-1)*.4]);}
 function wheel(px,py,pz,s=.38){c(dark,[px,py,pz],[s,.1,s],[Math.PI/2,0,0]);c(cream,[px,py,pz+.06],[s*.42,.025,s*.42],[Math.PI/2,0,0]);}
 function crate(px,py,pz,w=.7,d=.55){b(wood,[px,py+.05,pz],[w,.1,d]);for(const side of [-1,1])for(let i=0;i<3;i++){b('#d9a66e',[px,py+.14+i*.13,pz+side*d/2],[w,.1,.05]);b(wood,[px+side*w/2,py+.14+i*.13,pz],[.05,.1,d]);}}
 function chair(px,pz,ry=0){const ch=group(g,px,0,pz,ry);box(ch,pink,[0,.45,0],[.55,.09,.55]);box(ch,cream,[0,.79,-.24],[.55,.62,.06]);for(const xx of [-.21,.21])for(const zz of [-.21,.21])box(ch,wood,[xx,.22,zz],[.055,.44,.055]);}
 switch(type){
 case 'bistro':
  c(cream,[0,.84,0],[1.22,.08,1.22]);c(wood,[0,.4,0],[.13,.8,.13]);b(wood,[0,.06,0],[.75,.1,.75]);chair(-.95,0,-Math.PI/2);chair(.95,0,Math.PI/2);pot(0,.89,0,.24);break;
 case 'lounger':
  for(let i=0;i<9;i++)b(i%2?cream:pink,[0,.4,-.9+i*.19],[.78,.08,.15]);b(pink,[0,.64,-1.05],[.78,.66,.09],[-.45,0,0]);legs(.64,1.6,.38);q(cream,[0,.63,-.74],[.65,.18,.37],[-.3,0,0]);break;
 case 'grill':
  legs(.65,.58,.65);q(dark,[0,.81,0],[1,.35,.8]);for(let i=0;i<8;i++)b('#b7c3b9',[-.4+i*.115,1,0],[.025,.025,.66]);b(wood,[.73,.8,0],[.4,.07,.7]);b(cream,[.74,.86,0],[.27,.03,.38]);bud('#cd8158',[.74,.9,0],[.16,.07,.2]);c(dark,[0,.18,0],[.3,.2,.3]);break;
 case 'pottingBench':
  legs(1.5,.65,.85);b(wood,[0,.88,0],[1.8,.1,.85]);b('#dcb37b',[0,.27,0],[1.64,.07,.75]);for(const xx of [-.77,.77])b(wood,[xx,1.36,-.35],[.08,1.05,.08]);b(cream,[0,1.75,-.35],[1.8,.06,.4]);pot(-.55,.94,0);pot(.05,.94,.08,.3);pot(.56,1.79,-.35,.25);crate(.25,.31,0,.7,.5);break;
 case 'wheelbarrow':
  wheel(0,.28,-.67,.48);b(wood,[0,.57,-.02],[.68,.08,.9]);for(const xx of [-.36,.36])b(pink,[xx,.76,-.02],[.07,.37,.95]);for(const zz of [-.46,.46])b(pink,[0,.76,zz],[.75,.37,.07]);for(const s of [-1,1]){rod([s*.27,.5,-.65],[s*.35,.72,1.05],.06,dark);rod([s*.29,.5,.34],[s*.29,.05,.5],.05,dark);}bud('#7b5942',[0,.8,0],[.64,.27,.7]);break;
 case 'wateringCan':
  c('#71b9a6',[0,.25,0],[.48,.5,.48]);rod([.18,.2,0],[.62,.6,0],.12,'#71b9a6');part(g,'ring',cream,[-.24,.37,0],[.48,.48,.48]);c(cream,[.65,.63,0],[.22,.04,.22],[0,0,-.65]);break;
 case 'birdbath':
  c('#dcc7a2',[0,.07,0],[.72,.14,.72]);c('#e9d4ae',[0,.53,0],[.22,.94,.22]);c(cream,[0,1.05,0],[1.15,.15,1.15]);c('#80cbc6',[0,1.13,0],[1.02,.012,1.02]);bud('#d89a70',[.38,1.24,0],[.24,.22,.34]);bud('#f0bd6e',[.38,1.37,.1],[.12,.15,.14]);break;
 case 'birdhouse':
  b(wood,[0,.9,0],[.1,1.8,.1]);b(cream,[0,1.8,0],[.65,.7,.5]);part(g,'gable',pink,[0,2.15,0],[.79,.4,.66]);c(dark,[0,1.88,.26],[.22,.025,.22],[Math.PI/2,0,0]);rod([0,1.58,.24],[0,1.58,.52],.055);break;
 case 'beehive':
  for(let i=0;i<4;i++)b(i%2?cream:'#e4bb61',[0,.25+i*.23,0],[.75,.19,.7]);b(wood,[0,.13,0],[.95,.09,.9]);part(g,'gable',pink,[0,1.05,0],[.98,.36,.9]);b(dark,[0,.3,.36],[.32,.075,.02]);b(wood,[0,.25,.46],[.45,.04,.3]);break;
 case 'clothesline':
  for(const xx of [-1.15,1.15]){b(cream,[xx,1,0],[.085,2,.085]);rod([xx,1.93,-.3],[xx,1.93,.3],.055);}rod([-1.15,1.9,0],[1.15,1.9,0],.018,dark);
  for(let i=0;i<4;i++){b(i%2?pink:cream,[-.84+i*.55,1.5,0],[.43,.7,.035]);for(const dx of [-.14,.14])b(wood,[-.84+i*.55+dx,1.9,.025],[.035,.1,.04]);}break;
 case 'laundry':
  q(wood,[0,.24,0],[.65,.45,.5]);for(let i=0;i<5;i++)b(cream,[-.27+i*.135,.24,.255],[.035,.35,.025]);for(let i=0;i<3;i++)q(i%2?pink:cream,[0,.46+i*.045,0],[.5,.06,.4]);break;
 case 'doghouse':
  b(wood,[0,.09,0],[1.1,.14,1.2]);b(cream,[0,.55,-.15],[1,.95,.9]);part(g,'gable',pink,[0,1.03,-.1],[1.3,.5,1.4]);q(dark,[0,.43,.312],[.48,.7,.025]);b(wood,[0,.17,.6],[.65,.06,.4]);break;
 case 'petBowls':
  b('#d3bf8a',[0,.035,0],[.9,.05,.5]);for(const s of [-1,1]){c(s<0?pink:cream,[s*.24,.14,0],[.36,.2,.36]);c(s<0?'#a58456':'#85c7ca',[s*.24,.245,0],[.29,.02,.29]);}break;
 case 'pumpkins':
  for(let i=0;i<3;i++){const xx=(i-1)*.37,zz=i%2*.23,s=.4+i%2*.2;bud(i%2?'#f2c66f':'#e8a06c',[xx,s*.42,zz],[s,s*.8,s]);rod([xx,s*.7,zz],[xx+.03,s*.95,zz],.06,green);}break;
 case 'mushrooms':
  for(let i=0;i<5;i++){const xx=Math.sin(i*2.4)*.35,zz=Math.cos(i*2.4)*.3,h=.21+(i%3)*.12;c(cream,[xx,h/2,zz],[.08,h,.08]);part(g,'cone',i%2?pink:'#dca064',[xx,h,zz],[.32,.16,.32]);bud(cream,[xx+.05,h+.055,zz+.055],[.065,.018,.065]);}break;
 case 'tomatoes':
  b(wood,[0,.13,0],[1.4,.24,.65]);b('#71543a',[0,.26,0],[1.28,.035,.52]);for(const xx of [-.48,0,.48]){rod([xx,.27,0],[xx,1.25,0],.04);for(let i=0;i<3;i++){part(g,'leaf',green,[xx,.5+i*.22,0],[.33,.23,.34]);bud('#df655c',[xx+.16,.53+i*.22,.13],[.15,.15,.15]);}}break;
 case 'produceCrate':
  crate(0,0,0);for(let i=0;i<8;i++)bud(i%2?'#edbb5f':'#dc6c74',[(i%3-1)*.19,.46,Math.floor(i/3)*.16-.15],[.2,.2,.2]);break;
 case 'firewood':
  for(const xx of [-.55,.55])b(dark,[xx,.55,0],[.05,1.1,.65]);b(dark,[0,.1,0],[1.15,.06,.65]);for(let i=0;i<9;i++){const xx=(i%3-1)*.28,yy=.24+Math.floor(i/3)*.22;c(wood,[xx,yy,0],[.21,.65,.21],[Math.PI/2,0,0]);c('#eac38b',[xx,yy,.33],[.16,.015,.16],[Math.PI/2,0,0]);}break;
 case 'hoseReel':
  b(wood,[0,.48,0],[.1,.96,.1]);c(pink,[0,.72,.08],[.6,.12,.6],[Math.PI/2,0,0]);for(let i=0;i<4;i++)part(g,'ring','#70a776',[0,.72,.17+i*.025],[.3+i*.07,.3+i*.07,.3+i*.07]);rod([.25,.5,.2],[.35,.08,.45],.04,green);break;
 case 'windSpinner':
  b(cream,[0,.9,0],[.055,1.8,.055]);for(let i=0;i<4;i++){const a=i*Math.PI/2;b(i%2?pink:cream,[Math.sin(a)*.24,1.85+Math.cos(a)*.24,.035],[.22,.52,.04],[0,0,-a-.3]);}bud('#e8bd64',[0,1.85,.07],[.15,.15,.1]);break;
 case 'picnic':
  for(let i=0;i<6;i++)b(i%2?'#ddb47e':wood,[0,.85,-.45+i*.18],[2.15,.09,.15]);for(const s of [-1,1]){b(pink,[0,.46,s*.87],[2.35,.09,.38]);for(const xx of [-.75,.75])rod([xx,.06,s*1.03],[xx,.82,s*.35],.09);}
  b(cream,[0,.91,0],[.55,.018,1.02]);c(pink,[.3,1.01,0],[.15,.18,.15]);break;
 case 'swing':
  for(const xx of [-1.35,1.35])for(const s of [-1,1])rod([xx,.03,s*.7],[xx,2.4,0],.1,'#8bb9a3');rod([-1.5,2.4,0],[1.5,2.4,0],.12,pink);
  for(const xx of [-.62,.62]){b(pink,[xx,.52,0],[.65,.08,.4]);for(const s of [-1,1])rod([xx+s*.28,2.38,0],[xx+s*.28,.56,0],.018,dark);}break;
 case 'sandbox':
  b('#efd392',[0,.08,0],[1.75,.12,1.55]);for(const s of [-1,1]){b(wood,[s*.9,.15,0],[.13,.28,1.8]);b(wood,[0,.15,s*.82],[1.9,.28,.13]);}c(pink,[.35,.27,.2],[.25,.3,.25]);part(g,'cone','#e3bf79',[-.3,.23,-.1],[.55,.35,.5]);break;
 case 'toyWagon':
  b(pink,[0,.28,0],[.95,.12,.6]);for(const s of [-1,1])b(cream,[0,.46,s*.3],[1,.32,.045]);for(const xx of [-.35,.35])for(const zz of [-.37,.37])wheel(xx,.17,zz,.25);rod([.5,.32,0],[1.1,.9,0],.04,dark);rod([1.1,.9,-.16],[1.1,.9,.16],.05,dark);bud('#e6b860',[0,.48,0],[.35,.35,.35]);break;
 case 'pastryCart':
  b(cream,[0,.65,0],[1.7,.9,.8]);for(const xx of [-.65,.65])wheel(xx,.23,.46,.4);b(wood,[0,1.12,0],[1.85,.1,.95]);for(const xx of [-.8,.8])b(wood,[xx,1.65,-.35],[.06,1.1,.06]);
  for(let i=0;i<10;i++)b(i%2?cream:pink,[-.9+i*.2,2.14,0],[.2,.09,1.1],[.08,0,0]);
  for(let i=0;i<6;i++){const xx=-.6+(i%3)*.6,zz=Math.floor(i/3)*.35-.18;c('#e5be87',[xx,1.23,zz],[.25,.16,.25]);bud(i%2?pink:cream,[xx,1.33,zz],[.27,.1,.27]);}break;
 case 'recycleBins':
  for(const s of [-1,1]){q(s<0?'#6fa99a':'#7697ba',[s*.32,.45,0],[.5,.85,.55]);b(dark,[s*.32,.91,0],[.56,.08,.61]);b(cream,[s*.32,.57,.282],[.18,.2,.012]);}break;
 case 'easel':
  for(const xx of [-.36,.36])rod([xx,0,0],[xx,1.7,-.18],.06);rod([0,1.6,-.18],[0,0,-.7],.06);b(wood,[0,.75,.07],[.92,.06,.22]);b(cream,[0,1.22,-.02],[.8,.85,.06]);b('#a0c6ac',[0,1,.02],[.7,.27,.016]);bud(pink,[.13,1.41,.025],[.25,.25,.015]);break;
 case 'chess':
  b(wood,[0,.4,0],[.24,.8,.24]);b(cream,[0,.85,0],[1.1,.09,1.1]);for(let i=0;i<16;i++)if((i%4+Math.floor(i/4))%2)b(dark,[(i%4-1.5)*.25,.901,(Math.floor(i/4)-1.5)*.25],[.25,.012,.25]);for(const xx of [-.25,0,.25]){c(pink,[xx,.97,-.35],[.08,.12,.08]);bud(cream,[xx,1.01,.35],[.13,.18,.13]);}chair(-1,0,-Math.PI/2);chair(1,0,Math.PI/2);break;
 case 'toaster':
  q(pink,[0,.15,0],[.47,.29,.3]);for(const s of [-1,1]){b(dark,[0,.298,s*.075],[.32,.014,.025]);b('#e6ba79',[0,.34,s*.075],[.24,.14,.03]);}break;
 case 'rangeHood':
  b(cream,[0,0,0],[.9,.18,.6]);b(cream,[0,.32,-.12],[.4,.55,.34]);b(dark,[0,-.1,0],[.68,.025,.45]);break;
 case 'radio':
  q(wood,[0,.19,0],[.65,.38,.25]);c(dark,[-.15,.2,.14],[.23,.025,.23],[Math.PI/2,0,0]);b(cream,[.15,.24,.14],[.2,.09,.02]);rod([.2,.39,0],[.29,.75,0],.012,dark);break;
 case 'cactus':
  c(pink,[0,.14,0],[.28,.28,.28]);c('#65a371',[0,.45,0],[.13,.5,.13]);rod([0,.4,0],[.16,.4,0],.08,green);rod([.16,.4,0],[.16,.55,0],.08,green);bud('#e884b5',[0,.71,0],[.12,.09,.12]);break;
 case 'wallClock':
  c(wood,[0,0,0],[.64,.1,.64],[Math.PI/2,0,0]);c(cream,[0,0,.06],[.55,.02,.55],[Math.PI/2,0,0]);rod([0,0,.08],[.13,.08,.08],.025,dark);rod([0,0,.08],[-.04,.19,.08],.022,dark);break;
 case 'keyRack':
  b(wood,[0,0,0],[.65,.2,.08]);for(const xx of [-.2,0,.2]){rod([xx,0,.06],[xx,-.18,.06],.023,dark);part(g,'ring',pink,[xx,-.21,.065],[.095,.095,.095]);}break;
 case 'terrarium':
  c(cream,[0,.08,0],[.5,.15,.5]);c('#87654b',[0,.16,0],[.43,.02,.43]);for(let i=0;i<4;i++)part(g,'leaf',i%2?green:'#a0cbbc',[Math.sin(i*2.4)*.1,.26,Math.cos(i*2.4)*.1],[.16,.3,.16]);break;
 case 'tissueBox':
  b(pink,[0,.12,0],[.38,.24,.27]);b(dark,[0,.245,0],[.2,.01,.035]);b(cream,[.02,.33,0],[.13,.2,.012],[0,0,.18]);break;
 }
 return g;
}

export function enhanceV8Kit(kit){
 const previous=kit.dressLot;
 kit.dressLot=(g,lot)=>{previous(g,lot);for(const p of planV8Props({seed:lot.gardenSeed,lots:[lot]}))buildV8Prop(kit,g,p.type,p.x,0,p.z,p.scale,p.angle,p.tint);};
 kit.dressV8Home=options=>dressV8Home(kit,options);
 return kit;
}
export function dressV8Home(kit,{inside,wallRoots,floor}){
 const build=(parent,type,x,y,z,s=1,a=0)=>buildV8Prop(kit,parent,type,x,y,z,s,a);
 const root=kit.group(inside);root.name='v8-home-props';
 build(root,'toaster',-2.8,floor+1.1,-4);
 build(root,'tissueBox',4.96,floor+.83,-3.37,.65);
 build(wallRoots.back,'rangeHood',-1.8,2.9,-4.38);
 build(wallRoots.back,'wallClock',1.6,3.15,-4.55,1.1);
 build(wallRoots.front,'keyRack',-1.75,1.86,4.52,1,Math.PI);
 const shelf=kit.group(wallRoots.left,-5.48,3.3,0,Math.PI/2);
 kit.box(shelf,'#bf8550',[0,0,0],[1.4,.07,.4]);build(shelf,'radio',-.3,.045,.03,.8);build(shelf,'cactus',.42,.045,.03,.6);
 const rearShelf=kit.group(wallRoots.back,1.6,1.75,-4.42);kit.box(rearShelf,'#bf8550',[0,0,0],[.75,.07,.42]);build(rearShelf,'terrarium',0,.05,0,.85);
 return {version:8,props:8};
}
export function summarizeV8(plan){
 // Use the same per-lot seed as the assembly path.
 const placements=plan.lots.flatMap(lot=>planV8Props({seed:lot.gardenSeed,lots:[lot]}));
 const types=[...new Set([...placements.map(p=>p.type),'toaster','tissueBox','rangeHood','wallClock','keyRack','radio','cactus','terrarium'])].sort();
 return {version:8,exterior:placements.length,interior:8,total:placements.length+8,types,typeCount:types.length};
}
