// V4 details layer over the accepted V3 kit without rerolling the town.
export function polishKit(kit) {
  const tree=kit.tree;
  kit.artVersion='04-rose-cottage';
  kit.tree=(parent,x,z,random,pink=false,scale=1)=>{
    tree(parent,x,z,random,pink,scale);
    if(!pink)return;
    const root=kit.group(parent,x,0,z);root.scale.setScalar(scale);
    for(let i=0;i<48;i++){
      const a=i*2.399,d=1.6+(i%5)*.14,y=3.55+(i%7)*.23;
      const xx=Math.cos(a)*d,zz=Math.sin(a)*d;
      kit.part(root,'bud',i%3?'#f5d3dd':'#eaaec8',[xx,y,zz],[.34,.24,.32],[0,a,0]);
      if(i%3===0)kit.part(root,'bud','#fff0df',[xx+.1,y+.1,zz],[.13,.11,.13]);
    }
  };
  return kit;
}
