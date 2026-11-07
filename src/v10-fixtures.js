import * as THREE from '../vendor/three.module.js';
// One unlit TV screen batch. No video download, postprocessing or extra light.
export function createHouseholdFixtures(world,life){
  const {origin}=world.home;
  const geometry=new THREE.PlaneGeometry(1.36,.74),material=new THREE.ShaderMaterial({toneMapped:false,uniforms:{time:{value:0},screenOn:{value:1}},vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 vUv;uniform float time;uniform float screenOn;void main(){vec3 c=mix(vec3(.28,.52,.65),vec3(.64,.81,.72),vUv.y);float hill=.26+.08*sin(vUv.x*8.+time*.2);if(vUv.y<hill)c=vec3(.25,.5,.27);float sun=1.-smoothstep(.09,.10,length(vUv-vec2(.73,.72)));c=mix(c,vec3(1.,.82,.4),sun);float box=step(abs(vUv.x-.36-.14*sin(time*.3)),.08)*step(abs(vUv.y-.4),.13);c=mix(c,vec3(.9,.48,.6),box);gl_FragColor=vec4(mix(vec3(.08,.12,.13),c,screenOn),1.);}`});
  const screen=new THREE.Mesh(geometry,material);screen.position.set(origin.x+.312,origin.y+1.55,origin.z+2.1);screen.rotation.y=-Math.PI/2;screen.name='V10 television';world.group.add(screen);
  const hitGeo=new THREE.BoxGeometry(1,1,1),hitMat=new THREE.MeshBasicMaterial({visible:false}),hits=[];
  for(const [activity,name,x,y,z,w,h,d]of[['tv','Television',.4,1.15,2.1,.6,1.6,1.85],['drink','Dining table',-3.3,.8,-1.15,2.0,1.2,1.5]]){
    const hit=new THREE.Mesh(hitGeo,hitMat);hit.position.set(origin.x+x,origin.y+y,origin.z+z);hit.scale.set(w,h,d);hit.userData.selection={type:'furniture',activity,name,lot:world.home.lot};hit.updateMatrixWorld(true);world.targets.push(hit);hits.push(hit);
  }
  return {update(){screen.visible=world.home.isOpen;material.uniforms.time.value=life.stats().time;material.uniforms.screenOn.value=life.stats().watching>0?1:0;},dispose(){for(const h of hits){const i=world.targets.indexOf(h);if(i>=0)world.targets.splice(i,1);}world.group.remove(screen);geometry.dispose();material.dispose();hitGeo.dispose();hitMat.dispose();}};
}
