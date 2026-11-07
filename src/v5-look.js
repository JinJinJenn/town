import * as THREE from '../vendor/three.module.js';

// Rose Mint Pop is an art direction, not a full-screen saturation filter.
// Neutrals stay neutral, resident skin/clothes are untouched, and cottage
// palette-owned colors remain independently editable.
export const V5_STYLE = 'Rose Mint Pop';
const replacements = Object.freeze({
  '999ba5':'#77718e','d4cdc8':'#f4e9eb','ede2d7':'#fff3e7',
  'c7b9a9':'#c7a99c','eadcc9':'#f3ddd4','a4b58c':'#83aa58','a3b77f':'#83b34c',
  'e4adbf':'#f177ac','edbdcb':'#ff9ac7','f3d0d6':'#ffc4df','d99eaf':'#de5793',
  'd995b1':'#e8519c','ecc2ce':'#fc9cc8','f5dfd7':'#fff1dc','c5b2d7':'#b381e2',
  'f2bfd3':'#ffa3ce','ffe6e8':'#ffe7f2','dbb1bf':'#ed7bb4','f1cfda':'#ffc1df',
  'd783a2':'#e54993','f0bf9e':'#ffb377','e6cfef':'#c691ee','fff0d5':'#fff0b0',
  '8bbcb5':'#4cbaa4','71b7b0':'#3caa9c','83b9b4':'#53b6a3',
  'd6c29e':'#f4d09a','dfccaa':'#ffdfaa','deccae':'#f5d9b0',
  'e8b7b2':'#f2b2c8','d1d9b8':'#d7ead3','ebd9bc':'#f8e4cb',
  '8ba99a':'#5da98e','9b8cb3':'#9c7ac4','899cba':'#80a3d0',
  'bc8ba1':'#dc82aa','9f91bc':'#ae8cd0','cb8f9e':'#e35e9b',
  'd49aa9':'#eb7aae','ddadba':'#f69bbd','c99799':'#e77ca5',
  'a5b9a6':'#69bea1','e6cebd':'#eac8b5','efddcd':'#ffe5d5',
});
export function roseMintColor(value) {
  const color=value.isColor?value.clone():new THREE.Color(value);
  const key=color.getHexString();
  if(replacements[key])return color.set(replacements[key]);
  const hsl=color.getHSL({},THREE.SRGBColorSpace);
  const h=hsl.h*360;
  // Selective foliage enrichment in display space, converted back to linear
  // for instanceColor. Keep very pale wall/linen tones out of this range.
  if(h>=55&&h<=165&&hsl.s>.09&&hsl.l>.2&&hsl.l<.79){
    const hue=THREE.MathUtils.clamp(h+6,82,151)/360;
    color.setHSL(hue,Math.min(.58,hsl.s*1.65+.12),Math.max(.29,hsl.l-.065),THREE.SRGBColorSpace);
  }else if(h>=295&&h<=355&&hsl.s>.12&&hsl.l>.35&&hsl.l<.85){
    color.setHSL(hsl.h,Math.min(.72,hsl.s*1.35+.12),hsl.l,THREE.SRGBColorSpace);
  }
  return color;
}

export function enhanceV5Kit(kit){
  const originalCompile=kit.compile;
  kit.compile=(root,dynamic=false)=>{
    const result=originalCompile(root,dynamic);
    // Dynamic resident batches use their original colors. No skin-tone filter.
    if(!dynamic)for(const {mesh,sources} of result.batches){
      for(let i=0;i<sources.length;i++){
        const source=sources[i];
        if(source.userData.surface==='shadow'||source.userData.paletteRole)continue;
        mesh.setColorAt(i,roseMintColor(source.userData.color));
      }
      if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
    }
    return result;
  };
  // One inexpensive 30-triangle flower shared across every new garden bloom.
  const vertices=[];
  const point=(a,r,y)=>[Math.cos(a)*r,y,Math.sin(a)*r];
  for(let petal=0;petal<5;petal++){
    const a=petal*Math.PI*2/5,outline=[point(a-.4,.09,.005),point(a-.39,.28,.04),point(a-.2,.5,.09),point(a+.2,.5,.09),point(a+.39,.28,.04),point(a+.4,.09,.005)];
    for(let i=0;i<outline.length;i++)vertices.push(...point(a,.24,.015),...outline[(i+1)%outline.length],...outline[i]);
  }
  const flower=new THREE.BufferGeometry();flower.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));flower.computeVertexNormals();kit.geometries.roseFlower=flower;
  const dress=kit.dressLot;
  kit.dressLot=(g,lot)=>{
    dress(g,lot);
    if(lot.kind==='park')return;
    const count=lot.furnished?14:6;
    for(const side of [-1,1])for(let i=0;i<count;i++){
      const x=side*(2.75+(i%7)*.65),z=i<7?7.65:-7.5,y=.58+(i%3)*.09;
      kit.part(g,'leaf',i%2?'#4d8643':'#78ac58',[x,y-.18,z],[.36,.3,.32]);
      kit.part(g,'roseFlower',i%3?'#f06bab':'#fff0d8',[x,y,z],[.64,.64,.64],[.12,i*.67,.12],'cloth');
      kit.part(g,'bud','#f4d17e',[x,y+.035,z],[.09,.07,.09]);
    }
  };
  kit.artVersion='05-rose-mint';
  return kit;
}

// The detail batch shares the existing home transforms, materials and cutaways.
export function dressV5Home(kit,{inside,wallRoots,lot,floor}){
  const {part,box,cyl,beam,group}=kit;
  const dress=group(inside);dress.name='v5-rose-mint-home';
  const textile=(g,shape,color,p,s,r)=>{const m=part(g,shape,color,p,s,r);m.userData.paletteRole='accent';return m;};
  // A separate mint throw sits on the foot of the quilt, not on the pillows.
  textile(dress,'round','#8bbf68',[3.15,floor+.76,-1.67],[2.36,.055,.35]);
  for(let i=0;i<11;i++)box(dress,'#e5efc8',[2.07+i*.215,floor+.793,-1.67],[.016,.01,.31]);
  for(const x of [2,4.3])textile(dress,'round','#8bbf68',[x,floor+.65,-1.67],[.05,.2,.35]);
  // Keep the sofa's central seat and approach entirely clear.
  textile(dress,'round','#84b875',[-3.88,floor+.78,.87],[.33,.33,.12],[.14,0,-.12]);
  for(const x of [-4.57,-.73])box(dress,'#e3a7ba',[x,floor+.083,2.35],[.025,.01,3.45]);
  for(const z of [.63,4.07])box(dress,'#e3a7ba',[-2.65,floor+.083,z],[3.84,.01,.025]);
  // Botanical wall art uses geometry, not baked-in UI or unreadable text.
  function framedFlower(root,x,y,z,ry){
    const frame=group(root,x,y,z,ry);
    box(frame,'#be8e58',[0,0,0],[.7,.88,.06]);box(frame,'#fff2dc',[0,0,.04],[.6,.78,.03]);
    beam(frame,'#528b45',[0,-.24,.067],[.035,.2,.067],.018);
    for(const side of [-1,1])part(frame,'leaf','#81b665',[side*.09,-.06,.08],[.2,.08,.025],[0,0,side*.45]);
    for(let i=0;i<5;i++){const a=i*1.256;part(frame,'sphere','#ed74a5',[.035+Math.cos(a)*.1,.2+Math.sin(a)*.1,.083],[.14,.14,.035]);}
    part(frame,'sphere','#ebc25f',[.035,.2,.105],[.065,.065,.025]);
  }
  framedFlower(wallRoots.back,1.2,2.6,-lot.depth/2+.16,0);
  framedFlower(wallRoots.left,-lot.width/2+.16,2.55,1.2,Math.PI/2);
  // Kitchen handles, jars and bath tray are small but readable at cottage zoom.
  for(let i=0;i<5;i++){
    const x=-4.8+i*1.12;
    box(dress,'#d2a04f',[x-.21,floor+.79,-3.53],[.22,.035,.035]);
    for(const y of [.2,.83])box(dress,'#6caa82',[x,floor+y,-3.55],[.85,.016,.014]);
  }
  for(let i=0;i<3;i++){
    cyl(dress,'#ffe9c9',[-2.7+i*.27,floor+1.24,-4.15],[.18,.24,.18]);
    cyl(dress,'#c69b61',[-2.7+i*.27,floor+1.37,-4.15],[.2,.03,.2]);
  }
  textile(dress,'round','#86bf74',[4.37,floor+.85,2.4],[.28,.035,.23]);
  return {version:5};
}
