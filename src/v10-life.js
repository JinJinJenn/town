import {rng} from './plan.js';
import {FLOOR_Y,HOME_SEAT} from './home-plan.js';
import {makeLiveNavigation} from './v9-life.js';

const angleDelta=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

export function makeHouseholdNavigation(plan,origin){
  const nav=makeLiveNavigation(plan,origin);
  const nearest=(x,z)=>nav.nodes.filter(n=>n.zone==='home').reduce((a,b)=>Math.hypot(a.x-origin.x-x,a.z-origin.z-z)<Math.hypot(b.x-origin.x-x,b.z-origin.z-z)?a:b).id;
  const slots=[];
  for(const [pair,points] of [ [[-4.7,1.9],[-4.7,3.0]], [[-.7,-1.3],[-.7,.1]], [[-2.4,-2.75],[-1.1,-2.75]] ].entries()){
    for(const [side,[x,z]] of points.entries())slots.push({id:`talk-${pair}-${side}`,node:nearest(x,z),activity:'talk',pair,side,hipY:0});
  }
  slots.push({id:'tv',node:nav.seat,activity:'tv',facing:0,hipY:HOME_SEAT.hipY});
  for(const [i,x] of [-4.55,-2.05].entries()){
    const approach=nearest(i===0?-4.7:-1.22,-.28),id=nav.nodes.length;
    nav.nodes.push({id,x:origin.x+x,y:origin.y+FLOOR_Y-.07,z:origin.z-1.15,zone:'drink',edges:[approach]});nav.nodes[approach].edges.push(id);
    slots.push({id:`drink-${i}`,node:id,activity:'drink',facing:i===0?Math.PI/2:-Math.PI/2,hipY:.53});
  }
  return {...nav,slots};
}

export function createHousehold(world){
  const nav=makeHouseholdNavigation(world.plan,world.home.origin),random=rng(`${world.plan.seed}:household10`),reserved=new Map(),byNode=new Map(nav.slots.map(s=>[s.node,s])),agents=[];
  const node=id=>nav.nodes[id];let time=0,arrivals=0,departures=0,conversations=0,drinks=0,tvSessions=0,gathering=false;
  const free=list=>{const start=Math.floor(random()*list.length);for(let j=0;j<list.length;j++){const id=list[(start+j)%list.length];if(!reserved.has(id))return id;}return null;};
  function release(a){if(a.partner!==null){const b=agents[a.partner];if(b?.partner===a.index){b.partner=null;b.dwell=Math.min(b.dwell,2);b.state='waiting for a chat';}a.partner=null;}if(reserved.get(a.reserved)===a.index)reserved.delete(a.reserved);a.reserved=null;}
  function claim(a,id){release(a);reserved.set(id,a.index);a.reserved=id;}
  function initial(a,id){a.node=id;a.pos={x:node(id).x,y:node(id).y,z:node(id).z};a.route=[];a.cursor=0;a.slot=byNode.get(id)||null;claim(a,id);a.state=a.slot?'settling':'strolling';a.settle=a.slot?.2:0;a.dwell=a.slot?30:0;a.face=a.slot?.facing??random()*Math.PI*2;}
  for(const r of world.residents){const ring=nav.rings.get(r.lot.id),id=ring[Math.floor(((r.distance%73.76)+73.76)%73.76/73.76*32)],a={actor:r,index:r.meta.index,node:id,pos:{},route:[],cursor:0,state:'strolling',speed:0,stride:r.phase,walk:0,face:r.root.rotation.y,reserved:null,slot:null,partner:null,visits:0,visitDue:5+r.meta.index*.8,dwell:0,settle:0,sit:0,activityTime:0,pending:null,priority:false,conversationStart:0};agents.push(a);initial(a,id);}
  for(let i=0;i<4;i++)initial(agents[i],nav.slots[i].node);
  initial(agents[4],nav.slots[7].node);initial(agents[5],nav.slots[8].node);initial(agents[20],nav.seat);
  for(const a of agents){if(a.slot){a.visits=1;a.visitDue=90;a.settle=0;a.sit=a.slot.activity==='talk'?0:1;startActivity(a);}a.actor.root.rotation.y=a.face;animate(a,0);}
  world.setLiveController({step});
  function travel(a,id){const path=nav.route(a.node,id);if(!path.length)return false;claim(a,id);a.slot=byNode.get(id)||null;a.route=path.slice(1);a.cursor=0;a.dwell=0;a.settle=0;a.state=a.slot?(a.slot.activity==='tv'?'going to TV':a.slot.activity==='drink'?'going for a drink':'visiting'):'walking';if(!a.route.length)arrive(a);return true;}
  function arrive(a){a.route=[];a.cursor=0;a.speed=0;if(a.slot){a.state='settling';a.settle=.7;a.face=a.slot.facing??a.face;a.visits++;a.visitDue=time+55+random()*45;a.priority=false;arrivals++;}else{a.state='enjoying the neighborhood';a.dwell=6+random()*10;a.face=random()*Math.PI*2;}if(a.pending&&!a.slot)a.dwell=0;}
  function startActivity(a){a.activityTime=0;if(a.slot.activity==='tv'){a.state='watching TV';a.face=0;a.dwell=26+random()*16;tvSessions++;}else if(a.slot.activity==='drink'){a.state='having a drink';a.dwell=22+random()*14;drinks++;}else{a.state='waiting for a chat';a.dwell=25;pair(a);}}
  function pair(a){if(a.slot?.activity!=='talk'||a.partner!==null||a.route.length||a.settle>0)return;const other=nav.slots.find(s=>s.activity==='talk'&&s.pair===a.slot.pair&&s.node!==a.slot.node),b=agents[reserved.get(other.node)];if(!b||b.route.length||b.settle>0||b.partner!==null||b.slot?.activity!=='talk')return;
    a.partner=b.index;b.partner=a.index;a.conversationStart=b.conversationStart=time;a.dwell=b.dwell=18+random()*14;a.state=b.state='talking';a.face=Math.atan2(b.pos.x-a.pos.x,b.pos.z-a.pos.z);b.face=a.face+Math.PI;conversations++;}
  function depart(a){const id=free(nav.publicSlots);if(id!==null&&travel(a,id)){departures++;return true;}a.dwell=2;return false;}
  function chooseSlot(a,kind=null){let choices=nav.slots.filter(s=>(!kind||s.activity===kind)&&!reserved.has(s.node));if(!choices.length)return null;
    // Finish existing pairs before starting another unpaired conversation.
    const waiting=choices.filter(s=>s.activity==='talk'&&nav.slots.some(t=>t.pair===s.pair&&t.node!==s.node&&reserved.has(t.node)));if(!kind&&waiting.length)choices=waiting;
    return choices[Math.floor(random()*choices.length)];}
  function decide(a){if(a.pending){const slot=chooseSlot(a,a.pending);if(slot){a.pending=null;travel(a,slot.node);return;}}
    if(a.slot){depart(a);return;}if(a.priority||time>=a.visitDue){const slot=chooseSlot(a);if(slot){travel(a,slot.node);return;}}
    const id=free(nav.publicSlots);if(id!==null&&id!==a.node)travel(a,id);else a.dwell=1;}
  function animate(a,dt){const r=a.actor,blend=1-Math.exp(-dt*8),sitting=a.slot&&['watching TV','having a drink'].includes(a.state);a.walk+=(clamp(a.speed/1.2,0,1)-a.walk)*blend;a.sit+=(Number(!!sitting)-a.sit)*blend;
    r.root.rotation.y+=clamp(angleDelta(a.face,r.root.rotation.y),-3.6*dt,3.6*dt);const w=a.walk*(1-a.sit),s=a.sit,wave=Math.sin(a.stride),paired=a.partner!==null&&!a.route.length;
    const speaking=paired&&(Math.floor((time-a.conversationStart)/3.4)%2===(a.index< a.partner?0:1));if(paired)a.state=speaking?'talking':'listening';a.speaking=speaking;
    const gesture=speaking?.5+.5*Math.sin(a.activityTime*3.6):0,sip=a.state==='having a drink'?Math.pow(Math.max(0,Math.sin(a.activityTime*.9)),3):0;
    r.legs[0].rotation.x=wave*.39*w-Math.PI*.5*s;r.legs[1].rotation.x=-wave*.39*w-Math.PI*.5*s;r.knees[0].rotation.x=Math.max(0,-wave)*.56*w+Math.PI*.5*s;r.knees[1].rotation.x=Math.max(0,wave)*.56*w+Math.PI*.5*s;
    r.arms[0].rotation.x=-.05-wave*.29*w-.18*s-gesture*.35;r.arms[1].rotation.x=-.05+wave*.29*w-.18*s-(a.state==='having a drink'?.22+sip*.52:0);
    r.arms[0].rotation.z=-.06-gesture*.20;r.arms[1].rotation.z=.06;
    if(r.elbows){r.elbows[0].rotation.x=-.12-gesture*.68;r.elbows[1].rotation.x=-.12-(a.state==='having a drink'?.85+sip*.75:s*.12);}
    r.head.position.y=(r.headHeight??1.48)+Math.abs(wave)*.006*w;r.head.rotation.x=paired&&!speaking?Math.sin(time*3.2+a.index)*.055:sip*.06;r.head.rotation.y=a.state==='watching TV'?.78+Math.sin(time*.8)*.025:paired?Math.sin(time*1.7)*.055:0;
    if(r.torso)r.torso.rotation.y=a.state==='watching TV'?.17:0;
    if(r.cup){r.cup.scale.setScalar(a.state==='having a drink'?1:.0001);r.cup.rotation.x=-(r.arms[1].rotation.x+(r.elbows?.[1].rotation.x??0));}
    const hipY=a.slot?.hipY||.45,seatY=world.home.origin.y+FLOOR_Y+hipY-(r.hipHeight??.73)*r.root.scale.x;
    const street=node(a.node).zone==='street'&&a.route.length,lane=street?.14:0;r.root.position.set(a.pos.x+Math.cos(a.face)*lane,a.pos.y+(seatY-a.pos.y)*s+Math.abs(wave)*.012*w,a.pos.z-Math.sin(a.face)*lane);
    r.meta.description=a.state[0].toUpperCase()+a.state.slice(1)+'.';
  }
  function step(dt){if(!Number.isFinite(dt)||dt<0)return;time+=dt;
    for(const a of agents){a.activityTime+=dt;if(!a.route.length){if(a.settle>0){a.settle=Math.max(0,a.settle-dt);if(a.settle===0)startActivity(a);}else{if(a.state==='waiting for a chat')pair(a);a.dwell-=dt;if(a.dwell<=0)decide(a);}}
      if(a.route.length){const target=node(a.route[a.cursor]),dx=target.x-a.pos.x,dy=target.y-a.pos.y,dz=target.z-a.pos.z,d=Math.hypot(dx,dy,dz);if(d>.001)a.face=Math.atan2(dx,dz);
        let desired=1.12+a.index%5*.06;desired*=1-Math.min(.65,Math.abs(angleDelta(a.face,a.actor.root.rotation.y))/Math.PI);if(a.sit>.06)desired*=1-a.sit;if(a.cursor===a.route.length-1)desired=Math.min(desired,Math.max(.18,d*2));
        for(const b of agents){if(a===b||!b.route.length)continue;const bx=b.pos.x-a.pos.x,bz=b.pos.z-a.pos.z,forward=bx*Math.sin(a.face)+bz*Math.cos(a.face),side=Math.abs(bx*Math.cos(a.face)-bz*Math.sin(a.face));if(forward>0&&forward<.64&&side<.24&&Math.cos(a.face-b.face)>.55)desired=Math.min(desired,Math.max(.10,(forward-.28)*2));}
        a.speed+=clamp(desired-a.speed,-dt*4,dt*2.8);const move=Math.min(d,a.speed*dt);if(d>0){a.pos.x+=dx/d*move;a.pos.y+=dy/d*move;a.pos.z+=dz/d*move;a.stride+=move*6.4;}if(d-move<.00001){a.node=target.id;a.cursor++;if(a.cursor>=a.route.length)arrive(a);}
      }else a.speed=Math.max(0,a.speed-dt*4);animate(a,dt);
    }
  }
  function requestActivity(index,kind){const a=agents[index];if(!a||!['tv','drink','talk'].includes(kind))return false;if(a.slot?.activity===kind&&!a.route.length){a.pending=null;a.dwell=0;release(a);return true;}a.pending=kind;a.priority=true;if(!a.route.length)a.dwell=0;return true;}
  function gather(){gathering=true;for(const a of agents){a.priority=true;a.visitDue=0;if(!a.route.length&&!a.slot)a.dwell=0;}return true;}
  function stats(){return {time,inside:agents.filter(a=>a.pos.x>world.home.origin.x-5.6&&a.pos.x<world.home.origin.x+5.6&&a.pos.z>world.home.origin.z-4.6&&a.pos.z<world.home.origin.z+4.6).length,chatting:agents.filter(a=>a.partner!==null).length,walking:agents.filter(a=>a.route.length).length,visited:agents.filter(a=>a.visits>0).length,arrivals,departures,gathering,slots:nav.slots.length,conversations,drinks,tvSessions,watching:agents.filter(a=>a.state==='watching TV').length,drinking:agents.filter(a=>a.state==='having a drink').length,pairs:agents.filter(a=>a.partner!==null&&a.index<a.partner).length};}
  return {nav,agents,step,gather,requestActivity,requestSit:index=>requestActivity(index,'tv'),stats,doorWanted:()=>agents.some(a=>a.route.length&&Math.abs(a.pos.x-world.home.origin.x)<1&&Math.abs(a.pos.z-world.home.origin.z-4.7)<2.5),dispose(){world.setLiveController(null);reserved.clear();}};
}
