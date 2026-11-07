// This checkpoint furnishes one known lot without changing the other recipes.
export const HOME_ID = 10;
export const HOME_WIDTH = 11.4;
export const HOME_DEPTH = 9.4;
export const FLOOR_Y = .4;
export const HOME_SEAT = Object.freeze({x:-3, z:1.1, hipY:.45, facing:0});
export const HOME_ROUTE = Object.freeze([
  [0,0,9.2], [0,0,6.6], [0,.12,6.1], [0,.25,5.6],
  [0,.4,5.15], [0,.4,4.05], [-1,.4,4.05], [-1,.4,2.3], [-3,.4,2.3], [-3,.4,1.1],
].map(Object.freeze));
export const ROOMS = Object.freeze([
  {name:'Living room', minX:-5.5,maxX:.85,minZ:.5,maxZ:4.5},
  {name:'Kitchen', minX:-5.5,maxX:.85,minZ:-4.5,maxZ:.5},
  {name:'Bedroom', minX:1.05,maxX:5.5,minZ:-4.5,maxZ:.3},
  {name:'Bathroom', minX:1.05,maxX:5.5,minZ:.5,maxZ:4.5},
]);
// Furniture footprints used by both geometry and clearance regression checks.
export const FURNITURE = Object.freeze([
  {id:'sofa',x:-3,z:1.1,w:2.8,d:1.0},
  {id:'coffee-table',x:-3,z:3.3,w:2.2,d:.75},
  {id:'kitchen-counter',x:-2.55,z:-4,w:5.5,d:.82},
  {id:'dining-table',x:-3.3,z:-1.15,w:1.75,d:1.25},
  {id:'bed',x:3.15,z:-2.8,w:2.45,d:2.8},
  {id:'bath',x:4.65,z:2.3,w:1.15,d:2.6},
]);
export function advanceRoute(position, route, index, budget) {
  const p={...position};let remaining=Math.max(0,budget), next=index;
  while(next<route.length){
    const target=route[next],dx=target.x-p.x,dy=target.y-p.y,dz=target.z-p.z;
    const distance=Math.hypot(dx,dy,dz);
    if(distance<=remaining+1e-8){Object.assign(p,target);remaining-=distance;next++;}
    else {const f=remaining/distance;p.x+=dx*f;p.y+=dy*f;p.z+=dz*f;break;}
  }
  return {position:p,index:next,done:next===route.length};
}
