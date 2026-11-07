import {rng,sidewalkPosition} from './plan.js';

// Shared primitive meshes and materials: no per-person textures or renderers.
export function installHouseholdCharacters(kit) {
  kit.makeResident = (parent, lot, seed, index, pick) => {
    const random=rng(`${seed}:resident:${index}`),root=kit.group(parent);
    const skins=['#d3a17d','#efc6a0','#9f6e54','#bf8b6c','#f1d3b5'];
    const shirts=['#d95883','#559d92','#d5a252','#8e79b7','#bd7755','#eee3c6','#568368'];
    const hairs=['#69503e','#aa743e','#343139','#bb975c','#765245'];
    const skin=skins[Math.floor(random()*skins.length)],shirt=shirts[Math.floor(random()*shirts.length)],hair=hairs[Math.floor(random()*hairs.length)],pants=index%3?'#596c79':'#8c8774';
    const names=['Mia','Theo','June','Robin','Poppy','Alex','Nora','Finn','Lily','Sam','Hazel','Jamie','Cleo','Ollie','Ivy','Ellis','Ruby','Ben','Ada','Rowan','Luca','Mabel','Arlo','Lena','Kit','Daisy','Remy','Willow','Eden','Max','Avery','Pearl'];
    root.scale.setScalar(.95+random()*.16);
    const {part,box,ball,cyl,group}=kit,hipHeight=.87,headHeight=1.65;
    const torso=part(root,'round',shirt,[0,1.14,0],[.40,.52,.26]);
    part(root,'round',pants,[0,hipHeight,0],[.32,.18,.25]);cyl(root,skin,[0,1.46,0],[.12,.14,.12]);
    const head=group(root,0,headHeight,0);head.scale.setScalar(.83);
    ball(head,skin,[0,0,0],[.35,.42,.34]);ball(head,skin,[0,-.025,.173],[.06,.075,.055]);
    for(const side of [-1,1]){ball(head,skin,[side*.174,-.01,0],[.055,.10,.07]);ball(head,'#fff6e7',[side*.07,.025,.151],[.061,.046,.027]);ball(head,'#34303b',[side*.07,.024,.168],[.025,.029,.018]);box(head,hair,[side*.07,.068,.15],[.064,.015,.015]);}
    box(head,'#a36961',[0,-.085,.159],[.075,.015,.012]);
    ball(head,hair,[0,.15,-.035],[.39,.22,.36]);ball(head,hair,[0,.025,-.135],[.34,.32,.14]);
    if(index%4===0)ball(head,hair,[0,.24,-.12],[.22,.22,.22]);
    if(index%4===1)for(let i=0;i<5;i++)ball(head,hair,[Math.sin(i*1.5)*.15,.14+Math.cos(i)*.04,-.02+Math.cos(i*1.5)*.1],[.19,.20,.19]);
    if(index%4===2)part(head,'round',hair,[0,-.12,-.11],[.34,.33,.16]);
    if(index%7===0){cyl(head,'#d7c49c',[0,.23,0],[.51,.04,.5]);cyl(head,'#d7c49c',[0,.31,0],[.33,.15,.33]);}
    if(index%6===0)for(const side of [-1,1])part(head,'ring','#65536a',[side*.079,.025,.185],[.10,.10,.10]);
    const arms=[],elbows=[],legs=[],knees=[];
    for(const side of [-1,1]){
      const arm=group(root,side*.235,1.36,0);arm.rotation.z=side*.06;
      part(arm,'round',shirt,[0,-.14,0],[.135,.29,.15]);
      const elbow=group(arm,0,-.27,0);part(elbow,'round',skin,[0,-.155,0],[.10,.31,.11]);ball(elbow,skin,[0,-.32,.007],[.105,.13,.105]);arms.push(arm);elbows.push(elbow);
      const leg=group(root,side*.105,hipHeight,0);part(leg,'round',pants,[0,-.19,0],[.145,.39,.17]);
      const knee=group(leg,0,-.38,0);part(knee,'round',index%4===3?skin:pants,[0,-.185,0],[.12,.37,.14]);part(knee,'round','#66585b',[0,-.39,.055],[.15,.11,.25]);legs.push(leg);knees.push(knee);
    }
    if(index%5===0)part(root,'cone',shirt,[0,.88,0],[.53,.38,.43]);
    else if(index%4===0){box(root,'#f7e4cc',[0,1.16,.137],[.09,.45,.018]);for(const side of[-1,1])box(root,shirt,[side*.12,1.18,.145],[.12,.47,.023]);}
    else if(index%4===2){box(root,'#eac783',[.02,1.14,.15],[.035,.52,.022],[0,0,-.48]);part(root,'round','#d1979e',[.24,.94,.03],[.17,.23,.20]);}
    const cup=group(elbows[1],0,-.32,.06);cyl(cup,'#fff1dd',[0,.04,.02],[.12,.14,.12]);cyl(cup,'#795244',[0,.114,.02],[.092,.006,.092]);part(cup,'ring','#fff1dd',[.08,.05,.02],[.08,.08,.08]);cup.scale.setScalar(.0001);
    const appearance={skin,shirt,hair,pants,style:index%4,hat:index%7===0,glasses:index%6===0};
    const meta={type:'resident',name:names[index],description:'Enjoying the neighborhood.',index,appearance};
    const proxy=pick(root,'sphere',[0,1.05,0],[.9,2.15,.9],meta),distance=random()*73.76,point=sidewalkPosition(lot,distance);
    root.position.set(point.x,.29,point.z);root.rotation.y=point.angle;
    return {root,head,torso,arms,elbows,legs,knees,cup,hipHeight,headHeight,proxy,meta,lot,distance,speed:.62+random()*.3,direction:random()>.5?1:-1,phase:random()*6.28,wait:0,nextPause:6+random()*18,random};
  };
  return kit;
}
