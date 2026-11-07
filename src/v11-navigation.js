import {FURNITURE,FLOOR_Y} from './home-plan.js';
import {planV8Props} from './v8-props.js';

// Adds click destinations, not render objects. Only the furnished lot has an
// interior. Other homes remain closed; sidewalks are connected at crosswalks.
export function extendPlayerNavigation(nav,plan,origin){
  const {nodes}=nav, floorY=origin.y+FLOOR_Y-.07, yardY=origin.y-.07;
  const inside=(p,b,pad=.19)=>Math.abs(p.x-b.x)<b.w/2+pad&&Math.abs(p.z-b.z)<b.d/2+pad;
  const blocks=[...FURNITURE,...nav.obstacles,
    {x:.95,z:-2.65,w:.16,d:4.1},{x:.95,z:2.9,w:.16,d:3.6},
    {x:3.28,z:.4,w:4.45,d:.16},{x:1.65,z:-3.15,w:.65,d:1.5},
    {x:4.9,z:-3.7,w:.7,d:.74},{x:5,z:-.3,w:.6,d:.6},
    {x:2.1,z:3.9,w:1.4,d:.86},{x:2.05,z:1.75,w:.65,d:.86}];
  const floorClear=(x,z)=>x>=-5.33&&x<=5.33&&z>=-4.3&&z<=4.26&&!blocks.some(b=>inside({x,z},b));
  const lot=plan.lots.find(l=>l.furnished);
  const radius={bistro:1.65,lounger:1.4,wheelbarrow:.9,birdbath:.65,birdhouse:.35,beehive:.65,wateringCan:.45,pumpkins:.6,mushrooms:.4};
  const props=planV8Props({seed:lot.gardenSeed,lots:[lot]}).map(p=>({x:p.x,z:p.z+1,r:(radius[p.type]??1)*p.scale+.2}));
  // Known solid scenery on this lot. Flower sprigs remain decorative.
  const yardClear=(x,z)=>Math.abs(x)<=8.12&&z>=-7.1&&z<=8.1&&!(Math.abs(x)<6.02&&z>-5.1&&z<5.05)&&!(Math.abs(x)<1.52&&z>=5.05&&z<6.55)&&!props.some(p=>Math.hypot(x-p.x,z-p.z)<p.r);
  const segment=(a,b,clear)=>{const d=Math.hypot(a.x-b.x,a.z-b.z),steps=Math.max(1,Math.ceil(d/.1));for(let i=0;i<=steps;i++){const f=i/steps;if(!clear(a.x-origin.x+(b.x-a.x)*f,a.z-origin.z+(b.z-a.z)*f))return false;}return true;};
  const link=(a,b)=>{if(a!==b&&!nodes[a].edges.includes(b)){nodes[a].edges.push(b);nodes[b].edges.push(a);}};
  function grid(step,minX,maxX,minZ,maxZ,clear,zone,y){const ids=[],map=new Map();for(let iz=0;minZ+iz*step<=maxZ+.0001;iz++)for(let ix=0;minX+ix*step<=maxX+.0001;ix++){const x=minX+ix*step,z=minZ+iz*step;if(!clear(x,z))continue;const id=nodes.length;nodes.push({id,x:origin.x+x,y,z:origin.z+z,zone,edges:[]});map.set(`${ix}:${iz}`,id);ids.push(id);}
    for(const [key,id] of map){const [x,z]=key.split(':').map(Number);for(const [dx,dz] of [[1,0],[0,1]]){const other=map.get(`${x+dx}:${z+dz}`);if(other!==undefined&&segment(nodes[id],nodes[other],clear))link(id,other);}}return ids;}
  const oldLength=nodes.length, floor=grid(.25,-5.15,5.15,-4.15,4.1,floorClear,'home',floorY),yard=grid(.5,-8,8,-7,8,yardClear,'yard',yardY);
  // Attach floor grids using visible, collision-checked short links.
  for(let i=0;i<oldLength;i++)if(nodes[i].zone==='home')for(const j of floor)if(Math.hypot(nodes[i].x-nodes[j].x,nodes[i].z-nodes[j].z)<.43&&segment(nodes[i],nodes[j],floorClear))link(i,j);
  const entry=nodes.slice(0,oldLength).filter(n=>n.zone==='entry'&&n.z-origin.z>=6.55&&n.z-origin.z<=8.1);
  for(const n of entry)for(const j of yard)if(Math.hypot(n.x-nodes[j].x,n.z-nodes[j].z)<.9&&segment(n,nodes[j],yardClear))link(n.id,j);
  const reachable=new Set([nav.gate]),open=[nav.gate];for(let i=0;i<open.length;i++)for(const id of nodes[open[i]].edges)if(!reachable.has(id)){reachable.add(id);open.push(id);}
  const streetEdges=[];for(const n of nodes.slice(0,oldLength))if(n.zone==='street')for(const id of n.edges)if(id>n.id&&nodes[id].zone==='street')streetEdges.push([n,nodes[id]]);
  function resolve(point){if(!point||![point.x,point.z].every(Number.isFinite))return null;const x=point.x-origin.x,z=point.z-origin.z;let list,clear,y,zone;
    if(Math.abs(x)<5.7&&Math.abs(z)<4.7){if(!floorClear(x,z))return null;list=floor;clear=floorClear;y=floorY;zone='home';}
    else if(Math.abs(x)<=8.12&&z>=-7.1&&z<=8.1){if(!yardClear(x,z))return null;list=yard;clear=yardClear;y=yardY;zone='yard';}
    if(list){let best=null,dist=Infinity;for(const id of list){if(!reachable.has(id))continue;const n=nodes[id],d=Math.hypot(n.x-point.x,n.z-point.z);if(d<dist&&d<.55&&segment(n,point,clear)){best=id;dist=d;}}return best===null?null:{node:best,x:point.x,y,z:point.z,zone};}
    let best=null,distance=.55;for(const [a,b] of streetEdges){const dx=b.x-a.x,dz=b.z-a.z,l=dx*dx+dz*dz,t=Math.max(0,Math.min(1,((point.x-a.x)*dx+(point.z-a.z)*dz)/l)),px=a.x+dx*t,pz=a.z+dz*t,d=Math.hypot(point.x-px,point.z-pz);if(d<distance){distance=d;best={node:t<.5?a.id:b.id,x:point.x,y:.29,z:point.z,zone:'street'};}}return best;
  }
  // A* with a binary heap replaces repeated quadratic scans as the walk grid grows.
  function route(start,end){if(start===end)return[start];if(!nodes[start]||!nodes[end])return[];const cost=new Float64Array(nodes.length).fill(Infinity),prev=new Int32Array(nodes.length).fill(-1),closed=new Uint8Array(nodes.length),heap=[];
    const distance=(a,b)=>Math.hypot(nodes[a].x-nodes[b].x,nodes[a].y-nodes[b].y,nodes[a].z-nodes[b].z);
    const push=(id,f)=>{heap.push({id,f});let i=heap.length-1;while(i){const p=(i-1)>>1;if(heap[p].f<=f)break;heap[i]=heap[p];i=p;}heap[i]={id,f};};
    const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let c=i*2+1;if(c+1<heap.length&&heap[c+1].f<heap[c].f)c++;if(heap[c].f>=last.f)break;heap[i]=heap[c];i=c;}heap[i]=last;}return top.id;};
    cost[start]=0;push(start,distance(start,end));while(heap.length){const a=pop();if(closed[a])continue;if(a===end){const out=[end];while(out.at(-1)!==start)out.push(prev[out.at(-1)]);return out.reverse();}closed[a]=1;for(const b of nodes[a].edges){const g=cost[a]+distance(a,b);if(g<cost[b]){cost[b]=g;prev[b]=a;push(b,g+distance(b,end));}}}return[];
  }
  return {...nav,route,resolve,floorClear,yardClear,reachable,playerGrid:{floor:floor.length,yard:yard.length}};
}
