import * as THREE from '../vendor/three.module.js';

export function createArtLighting(scene, renderer, kit) {
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const sky=new THREE.HemisphereLight('#e9efff','#a69c83',1.15);
  const sun=new THREE.DirectionalLight('#ffe4cd',2.65);
  const fill=new THREE.DirectionalLight('#efdae7',.42);
  sun.position.set(-42,58,32);fill.position.set(48,28,-35);sun.castShadow=true;
  const size=innerWidth<700?1024:2048;sun.shadow.mapSize.set(size,size);
  Object.assign(sun.shadow.camera,{left:-76,right:76,top:76,bottom:-76,near:1,far:180});
  sun.shadow.bias=-.00012;sun.shadow.normalBias=.045;sun.shadow.intensity=.65;
  scene.add(sky,sun,sun.target,fill);
  function apply(evening=false){
    sky.color.set(evening?'#becdeb':'#e9efff');sky.groundColor.set(evening?'#8e8297':'#a69c83');sky.intensity=evening?.85:1.15;
    sun.color.set(evening?'#ffbb8c':'#ffe4cd');sun.intensity=evening?1.65:2.65;sun.position.set(-42,evening?29:58,32);
    fill.color.set(evening?'#c9bee8':'#efdae7');fill.intensity=evening?.32:.42;
    renderer.toneMappingExposure=evening?.97:1.02;
    scene.background.set(evening?'#b7b5ce':'#e6ddd3');scene.fog.color.copy(scene.background);
    kit.materials.glass.emissiveIntensity=evening?.8:.24;
    kit.materials.lantern.emissiveIntensity=evening?2.5:1.5;
  }
  apply();return {apply};
}

// One additional full-screen pass: orthographic depth contact shading and subtle
// highlight diffusion. No imported postprocessing framework or baked still image.
// Soft rendering can be disabled in the help panel, retaining ordinary WebGL.
export function createDioramaRenderer(renderer) {
  const halfFloat=renderer.extensions.has('EXT_color_buffer_float');
  const target=new THREE.WebGLRenderTarget(1,1,{
    type:halfFloat?THREE.HalfFloatType:THREE.UnsignedByteType,
    minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,depthBuffer:true,
    samples:2,
  });
  target.depthTexture=new THREE.DepthTexture(1,1,THREE.UnsignedIntType);
  const uniforms={
    beauty:{value:target.texture},depth:{value:target.depthTexture},
    pixel:{value:new THREE.Vector2(1,1)},extent:{value:new THREE.Vector2(80,50)},
    nearFar:{value:new THREE.Vector2(.1,350)},aoStrength:{value:1.65},
  };
  const material=new THREE.ShaderMaterial({uniforms,depthTest:false,depthWrite:false,
    vertexShader:`varying vec2 vUv;
      void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}`,
    fragmentShader:`
      uniform sampler2D beauty,depth;
      uniform vec2 pixel,extent,nearFar;
      uniform float aoStrength;
      varying vec2 vUv;
      vec3 viewAt(vec2 uv){
        float z=texture2D(depth,uv).x;
        return vec3((uv-.5)*extent,-mix(nearFar.x,nearFar.y,z));
      }
      void main(){
        vec3 color=texture2D(beauty,vUv).rgb;
        float centerDepth=texture2D(depth,vUv).x;
        if(centerDepth<.9999){
          vec3 p=viewAt(vUv);
          vec3 l=viewAt(vUv-vec2(pixel.x,0.0)),r=viewAt(vUv+vec2(pixel.x,0.0));
          vec3 b=viewAt(vUv-vec2(0.0,pixel.y)),t=viewAt(vUv+vec2(0.0,pixel.y));
          vec3 dx=abs(l.z-p.z)<abs(r.z-p.z)?p-l:r-p;
          vec3 dy=abs(b.z-p.z)<abs(t.z-p.z)?p-b:t-p;
          vec3 n=normalize(cross(dx,dy));
          float occlusion=0.0;
          for(int i=0;i<12;i++){
            float fi=float(i),a=fi*2.399963;
            float radius=.16+.92*sqrt((fi+.5)/12.0);
            vec2 uv=clamp(vUv+vec2(cos(a),sin(a))*radius/extent,pixel,1.0-pixel);
            vec3 delta=viewAt(uv)-p;
            float distanceTo=length(delta);
            float facing=max(0.0,dot(n,delta/max(distanceTo,.0001))-.09);
            float falloff=1.0-smoothstep(.08,1.45,distanceTo);
            occlusion+=facing*falloff*step(.035,distanceTo);
          }
          color*=1.0-clamp(occlusion*aoStrength/12.0,0.0,.36);
        }
        // Diffuse only highlights; avoid a milky bloom over the whole picture.
        vec3 glow=vec3(0.0);
        for(int i=0;i<8;i++){
          float a=float(i)*.785398;
          vec3 sampleColor=texture2D(beauty,clamp(vUv+vec2(cos(a),sin(a))*pixel*3.5,0.0,1.0)).rgb;
          glow+=max(vec3(0.0),sampleColor-1.25);
        }
        color+=glow*.014;
        gl_FragColor=vec4(color,1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const scene=new THREE.Scene(),camera=new THREE.Camera(),geometry=new THREE.PlaneGeometry(2,2);
  const quad=new THREE.Mesh(geometry,material);quad.frustumCulled=false;scene.add(quad);
  const size=new THREE.Vector2();let enabled=halfFloat,width=0,height=0;
  const stats={drawCalls:0,triangles:0};
  function capture(){stats.drawCalls=renderer.info.render.calls;stats.triangles=renderer.info.render.triangles;}
  return {
    stats,
    get enabled(){return enabled;},
    get supported(){return halfFloat;},
    setEnabled(value){enabled=halfFloat&&!!value;},
    render(world,view){
      if(!enabled){renderer.setRenderTarget(null);renderer.render(world,view);capture();return;}
      renderer.getDrawingBufferSize(size);
      if(width!==size.x||height!==size.y){
        width=size.x;height=size.y;target.setSize(width,height);uniforms.pixel.value.set(1/width,1/height);
      }
      uniforms.extent.value.set(view.right-view.left,view.top-view.bottom);
      uniforms.nearFar.value.set(view.near,view.far);
      renderer.setRenderTarget(target);renderer.render(world,view);capture();
      renderer.setRenderTarget(null);renderer.render(scene,camera);
    },
    dispose(){target.dispose();target.depthTexture?.dispose();material.dispose();geometry.dispose();},
  };
}
