// V4 dressing uses real instanced geometry and stays attached to its owning wall.
// Nothing is placed in the reserved approach from the front door to the sofa.
export const COTTAGE_PALETTES = Object.freeze({
  blossom: {label:'Rose & cream', sofa:'#d98eab', cushion:'#f2cad4', quilt:'#c1a5d1', rug:'#eed8cf'},
  lavender: {label:'Lilac & linen', sofa:'#b19ac9', cushion:'#e6d4ef', quilt:'#aaaed5', rug:'#dfd8e9'},
  sage: {label:'Sage & honey', sofa:'#93ae9b', cushion:'#e2e7ca', quilt:'#c3b391', rug:'#e4ddc6'},
});
export function paletteRole(hex) {
  if(['b8818b','c9919a','c58a93'].includes(hex))return 'sofa';
  if(['dea7aa','e6d8b8','a8bca2'].includes(hex))return 'cushion';
  if(['ada3bc','c6b8d0'].includes(hex))return 'quilt';
  if(['ded6ba','c6c7aa'].includes(hex))return 'rug';
  return null;
}
export function dressHome(kit,{inside,wallRoots,lot,floor}) {
  const {box,part,ball,cyl,beam,group}=kit;
  const round=(g,c,p,s,r)=>part(g,'round',c,p,s,r);
  function books(g,x,y,z,count=6) {
    const colors=['#b28d9d','#98aca0','#c3a681','#aaa4c3','#e2cdbc'];
    for(let i=0;i<count;i++){
      const h=.27+(i%3)*.07;
      box(g,colors[i%5],[x+i*.11,y+h/2,z],[.085,h,.22],[0,0,i===0?.12:0]);
      box(g,'#f4e7d3',[x+i*.11,y+h*.75,z+.115],[.063,.017,.008]);
    }
  }
  function bouquet(g,x,y,z,scale=.55) {
    const b=group(g,x,y,z);b.scale.setScalar(scale);
    cyl(b,'#edd2bf',[0,.17,0],[.35,.34,.35]);
    for(let i=0;i<5;i++){
      const a=i*2.4,xx=Math.cos(a)*.22,zz=Math.sin(a)*.22,h=.55+(i%2)*.12;
      beam(b,'#7c9b74',[0,.2,0],[xx,h,zz],.025);
      for(let j=0;j<5;j++)ball(b,i%2?'#f1c3d1':'#d98fa9',[xx+Math.cos(j*1.256)*.075,h,zz+Math.sin(j*1.256)*.075],[.13,.085,.13]);
      ball(b,'#ead593',[xx,h+.03,zz],[.06,.05,.06]);
    }
  }
  function vine(g,x,y,z,n=8) {
    for(let i=0;i<n;i++){
      const xx=x+Math.sin(i*.8)*.08;
      beam(g,'#879673',[xx,y-i*.13,z],[x+Math.sin((i+1)*.8)*.08,y-(i+1)*.13,z],.018);
      part(g,'leaf',i%2?'#94ad82':'#aec098',[xx+(i%2?.07:-.07),y-i*.13,z],[.18,.09,.08],[0,0,i%2?.5:-.5]);
    }
  }
  function inwardWindow(root,x,y,w=1.5) {
    const g=group(root,x,y,.14),h=1.55;
    // Interior-facing glazing and trim, instead of the blank rear of the exterior window.
    part(g,'box','#f0d4a9',[0,0,0],[w-.1,h-.08,.025],[0,0,0],'glass');
    for(const s of [-1,1]){
      box(g,'#cead8c',[s*(w/2),0,.045],[.075,h+.15,.09]);
      box(g,'#e6d3b6',[0,s*h/2,.045],[w+.07,.075,.09]);
      for(let i=0;i<3;i++)round(g,i%2?'#f3e8d7':'#eadbc6',[s*(w/2+.14)+i*.05,0,.11],[.065,h+.13,.08]);
    }
    box(g,'#e8d5b5',[0,0,.07],[.055,h,.055]);
    box(g,'#e8d5b5',[0,.05,.07],[w,.055,.055]);
    box(g,'#f4e6ce',[0,-h/2-.1,.15],[w+.35,.12,.34]);
    beam(g,'#ad8d6a',[-w/2-.3,h/2+.18,.18],[w/2+.3,h/2+.18,.18],.045);
  }
  const w=lot.width,d=lot.depth;
  for(const [key,x,z,angle,xs] of [
    ['back',0,-d/2,0,[-3.1,3.1]],['front',0,d/2,Math.PI,[-3.35,3.35]],
    ['left',-w/2,0,Math.PI/2,[-2.4,2.4]],['right',w/2,0,-Math.PI/2,[-2.4,2.4]],
  ]){
    const g=group(wallRoots[key],x,0,z,angle),length=(key==='back'||key==='front')?w:d;
    for(const xx of xs)inwardWindow(g,xx,2.025);
    box(g,'#eddfcd',[0,.87,.13],[length-.1,.07,.07]);
    // Wall-owned shelves vanish with that wall rather than floating during cutaways.
    if(key==='back'){
      for(const xx of [-.65,4.7]){
        box(g,'#b99a80',[xx,3.38,.32],[1.25,.085,.47]);
        books(g,xx-.49,3.43,.3,4);bouquet(g,xx+.34,3.43,.3,.4);
        vine(g,xx+.4,3.4,.48,7);
      }
    }
  }
  const decor=group(inside);decor.name='v4-cottage-dressing';
  // Kitchen fronts and practical everyday objects.
  box(decor,'#e8dcc6',[-1.8,floor+.49,-3.55],[.91,.65,.045]);
  box(decor,'#5f6d68',[-1.8,floor+.46,-3.517],[.72,.38,.026]);
  box(decor,'#b6b4a6',[-1.8,floor+.72,-3.485],[.71,.047,.06]);
  for(let i=0;i<4;i++)ball(decor,'#ae976e',[-2.1+i*.2,floor+.86,-3.49],[.07,.07,.04]);
  for(const x of [-4.8,-3.68,-2.56,-1.44,-.32])box(decor,'#bdc7b5',[x,floor+.8,-3.545],[.86,.023,.015]);
  for(let i=0;i<3;i++){
    cyl(decor,i%2?'#e8d3b5':'#c7acb0',[-.65+i*.22,floor+1.25,-4.18],[.16,.31,.16]);
    cyl(decor,'#b59a75',[-.65+i*.22,floor+1.415,-4.18],[.18,.035,.18]);
    box(decor,i%2?'#efe5ce':'#e3c7d7',[-5.3+i*.18,floor+1.5,-2.365],[.13,.2,.015],[0,0,(i-1)*.15]);
  }
  for(const x of [-3.77,-2.83]){
    cyl(decor,'#faf0df',[x,floor+.935,-1.15],[.4,.025,.4]);
    cyl(decor,'#e3b5b9',[x,floor+1.025,-1.45],[.15,.17,.15]);
  }
  bouquet(decor,-3.3,floor+.93,-1.15,.55);
  // Tall narrow bookcase sits behind the dining chair without blocking its footprint.
  const shelf=group(decor,-5.25,floor,-.85,Math.PI/2);
  box(shelf,'#ba9c80',[0,.94,-.14],[1.08,1.88,.12]);
  for(const x of [-.53,.53])box(shelf,'#d4b495',[x,.94,0],[.08,1.88,.4]);
  for(const y of [.13,.65,1.18,1.82]){box(shelf,'#d4b495',[0,y,0],[1.12,.08,.44]);books(shelf,-.43,y+.05,.02,5);}
  bouquet(shelf,.28,1.86,0,.53);
  // Sofa throw stays off the central seat used by Luca.
  round(decor,'#efe1d0',[-4.05,floor+.49,1.19],[.42,.045,.66],[0,.08,0]);
  round(decor,'#e8d9c5',[-4.05,floor+.25,1.57],[.43,.42,.045]);
  for(let i=0;i<6;i++)box(decor,'#d8bcae',[-4.23+i*.065,floor+.518,1.19],[.018,.01,.61]);
  bouquet(decor,-2.9,floor+.56,3.29,.48);
  // Bedroom quilt and cushions; the bed remains decorative, not a false sleep button.
  for(let i=0;i<8;i++)box(decor,'#e7d2df',[2.13+i*.29,floor+.724,-1.79],[.022,.015,.39]);
  for(let i=0;i<3;i++)for(let j=0;j<2;j++){
    const x=2.45+i*.7,z=-2.95+j*.65;
    for(let k=0;k<5;k++)ball(decor,'#e6c5dc',[x+Math.cos(k*1.256)*.065,floor+.708,z+Math.sin(k*1.256)*.065],[.13,.025,.13]);
    ball(decor,'#ead4ab',[x,floor+.721,z],[.05,.02,.05]);
  }
  books(decor,4.7,floor+.84,-3.7,3);
  // A bath tray, folded towels, soap, and a small candle.
  box(decor,'#c4a184',[4.65,floor+.81,2.4],[1.22,.06,.27]);
  for(const [x,y,z] of [[4.36,.91,2.4],[2.54,1.07,3.82]]){
    cyl(decor,'#f4dfce',[x,floor+y,z],[.13,.16,.13]);
    part(decor,'sphere','#ffe2a6',[x,floor+y+.105,z],[.035,.07,.035],[0,0,0],kit.materials.lantern?'lantern':'glass');
  }
  for(let i=0;i<3;i++)round(decor,i%2?'#d1dcca':'#eddfcf',[3.35,floor+.09+i*.075,3.2],[.54,.07,.36]);
  round(decor,'#e6b5be',[1.7,floor+1,3.9],[.24,.06,.15]);
  return {version:4};
}
