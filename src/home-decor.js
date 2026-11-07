// Small, deterministic props fit existing furniture; no navigation footprint changes.
export function dressHome(kit, {inside, walls, floor, width, depth}) {
  const {part, box, ball, cyl, group, beam} = kit;
  const colors = ['#bc7691','#94afa3','#b4a2bd','#dbc499','#83a2b3'];
  function books(g,x,y,z,count=5) {
    for(let i=0;i<count;i++) {
      const h=.28+(i%3)*.07;
      box(g,colors[i%colors.length],[x+i*.105,y+h/2,z],[.085,h,.24]);
      box(g,'#f4e8ce',[x+i*.105,y+h*.72,z+.125],[.057,.018,.008]);
    }
  }
  function bouquet(g,x,y,z,s=1) {
    const root=group(g,x,y,z);root.scale.setScalar(s);
    part(root,'round','#f2d3bd',[0,.13,0],[.25,.27,.25]);
    for(let i=0;i<5;i++) {
      const a=i*2.399,xx=Math.cos(a)*.14,zz=Math.sin(a)*.14,h=.42+(i%2)*.09;
      beam(root,'#83a075',[0,.18,0],[xx,h,zz],.022);
      for(let j=0;j<4;j++)ball(root,i%2?'#f5d3dc':'#d88aa9',[xx+Math.cos(j*1.57)*.065,h,zz+Math.sin(j*1.57)*.065],[.13,.08,.13]);
      ball(root,'#f1cf86',[xx,h+.025,zz],[.07,.05,.07]);
    }
  }
  function vine(g,x,y,z,length=1) {
    for(let i=0;i<9;i++) {
      const yy=y-i*length/9,xx=x+Math.sin(i*.9)*.08;
      beam(g,'#799668',[xx,yy,z],[x+Math.sin((i+1)*.9)*.08,yy-length/9,z],.018);
      part(g,'leaf',i%2?'#9db484':'#7d9f77',[xx+(i%2?-.09:.09),yy,z+.04],[.2,.12,.1],[.15,0,i%2?-.4:.4]);
    }
  }
  // Curtains and wall accessories leave with their wall in cutaway mode.
  for(const x of [-3.1,3.1]) {
    beam(walls.back,'#b49671',[x-.92,2.99,-depth/2+.2],[x+.92,2.99,-depth/2+.2],.045);
    for(const side of [-1,1]) for(let j=0;j<4;j++) {
      part(walls.back,'round',j%2?'#eee0d8':'#f8e8df',[x+side*(.65+j*.07),2.1,-depth/2+.22],[.095,1.62,.12]);
    }
  }
  const shelf=group(walls.back,-1.2,3.22,-depth/2+.35);
  box(shelf,'#c19b79',[0,0,0],[2.9,.1,.48]);
  books(shelf,-1.17,.07,0,6);bouquet(shelf,1.07,.06,0,.8);
  for(let i=0;i<3;i++) {
    cyl(shelf,'#e3c6ac',[.05+i*.29,.23,0],[.2,.35,.2]);cyl(shelf,'#b6a084',[.05+i*.29,.415,0],[.23,.06,.23]);
  }
  vine(walls.back,.02,3.28,-depth/2+.62,1.25);
  // A slim bookcase sits on the left wall beside the sofa, outside the reserved path.
  const caseRoot=group(inside,-width/2+.43,floor,-.76,Math.PI/2);
  for(const x of [-.65,.65])box(caseRoot,'#c1a184',[x,1.05,0],[.08,2.1,.38]);
  box(caseRoot,'#d1b598',[0,1.05,-.17],[1.32,2.1,.06]);
  for(let i=0;i<4;i++){const y=.12+i*.62;box(caseRoot,'#c7a585',[0,y,0],[1.4,.09,.45]);books(caseRoot,-.48,y+.05,.06,i%2?6:9);}
  bouquet(caseRoot,.28,2.05,0,.8);
  // Throw blanket on the far arm, clear of Luca's central seat and approach.
  part(inside,'round','#f0dcc8',[-4.12,floor+.69,1.14],[.37,.09,.77]);
  part(inside,'round','#ead4c3',[-4.17,floor+.37,1.52],[.39,.6,.07],[.13,0,0]);
  for(let i=0;i<6;i++)box(inside,'#dcbcb5',[-4.31+i*.061,floor+.72,1.12],[.014,.014,.64]);
  for(let i=0;i<6;i++)beam(inside,'#f1e0cd',[-4.32+i*.063,floor+.1,1.57],[-4.32+i*.063,floor+.02,1.58],.018);
  bouquet(inside,-2.8,floor+.55,3.3,.8);
  // Table settings and a recognisable oven front.
  for(const x of [-3.78,-2.82]) {
    cyl(inside,'#f9eee3',[x,floor+.935,-1.2],[.35,.024,.35]);
    cyl(inside,'#d9adac',[x,floor+1.02,-.9],[.13,.15,.13]);
  }
  box(inside,'#5e6868',[-1.8,floor+.52,-3.54],[.77,.53,.045]);
  box(inside,'#9bada8',[-1.8,floor+.53,-3.51],[.61,.35,.016]);
  box(inside,'#b8a386',[-1.8,floor+.86,-3.5],[.66,.04,.05]);
  for(const x of [-2.05,-1.8,-1.55])ball(inside,'#d5c4aa',[x,floor+.95,-3.51],[.07,.07,.04]);
  // A stitched quilt uses thin strips, not a texture dependency.
  part(inside,'round','#d9b8cc',[3.15,floor+.75,-1.95],[2.34,.07,.68]);
  for(let i=0;i<13;i++)box(inside,i%2?'#efd6df':'#caa5bf',[2.05+i*.18,floor+.794,-1.95],[.025,.008,.62]);
  for(const z of [-2.16,-1.94,-1.72])box(inside,'#efcfdb',[3.15,floor+.801,z],[2.25,.008,.015]);
  // Bedside light and bathroom details use the existing emissive lantern surface.
  part(inside,'sphere','#ffedcb',[4.9,floor+1.3,-3.7],[.25,.22,.25],[0,0,0],'lantern');
  for(let i=0;i<3;i++)part(inside,'round',i%2?'#d5c4c6':'#e8ddd0',[3.85,floor+.12+i*.09,4.05],[.44,.1,.36]);
  for(const [x,c] of [[4.38,'#dfb3bc'],[4.78,'#adc5bd']]) {
    part(inside,'round',c,[x,floor+.94,3.4],[.14,.28,.14]);cyl(inside,'#c5a788',[x,floor+1.105,3.4],[.08,.06,.08]);
  }
  return {version:4};
}
