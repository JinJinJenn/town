import {rng} from './plan.js';
import {FLOOR_Y,HOME_SEAT} from './home-plan.js';
import {makeLiveNavigation} from './v9-life.js';
import {extendPlayerNavigation} from './v11-navigation.js';
import {addV12SeatSlots} from './v12-seats.js';

const angleDelta=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

export function makeHouseholdNavigation(plan,origin){
  const nav=makeLiveNavigation(plan,origin);
  const reachable=new Set([nav.gate]),queue=[nav.gate];for(let i=0;i<queue.length;i++)for(const id of nav.nodes[queue[i]].edges)if(!reachable.has(id)){reachable.add(id);queue.push(id);}
  const nearest=(x,z)=>nav.nodes.filter(n=>n.zone==='home'&&reachable.has(n.id)).reduce((a,b)=>Math.hypot(a.x-origin.x-x,a.z-origin.z-z)<Math.hypot(b.x-origin.x-x,b.z-origin.z-z)?a:b).id;
  const slots=[];
  const groups=[nav.homeSlots.slice(0,4),nav.homeSlots.slice(4,8)];
  for(const [group,nodes] of groups.entries())for(const [side,node] of nodes.entries())slots.push({id:`talk-${group}-${side}`,node,activity:'talk',pair:group,group,side,hipY:0});
  slots.push({id:'tv',node:nav.seat,activity:'tv',facing:0,hipY:HOME_SEAT.hipY});
  for(const [i,x] of [-4.55,-2.05].entries()){
    const approach=nearest(i===0?-4.7:-1.22,-.28),id=nav.nodes.length;
    nav.nodes.push({id,x:origin.x+x,y:origin.y+FLOOR_Y-.07,z:origin.z-1.15,zone:'drink',edges:[approach]});nav.nodes[approach].edges.push(id);
    slots.push({id:`drink-${i}`,node:id,activity:'drink',facing:i===0?Math.PI/2:-Math.PI/2,hipY:.53});
  }
  return addV12SeatSlots(extendPlayerNavigation({...nav,slots},plan,origin),plan,origin);
}

export function createHousehold(world){
  const nav=makeHouseholdNavigation(world.plan,world.home.origin),random=rng(`${world.plan.seed}:household10`),reserved=new Map(),byNode=new Map(nav.slots.map(s=>[s.node,s])),agents=[];
  let commandId=0;const node=id=>nav.nodes[id];let time=0,arrivals=0,departures=0,conversations=0,drinks=0,tvSessions=0,seatSessions=0,gathering=false;const socialSignatures=new Map(),socialStarts=new Map();
  const free=list=>{const start=Math.floor(random()*list.length);for(let j=0;j<list.length;j++){const id=list[(start+j)%list.length];if(!reserved.has(id))return id;}return null;};
  function release(a){const old=[...(a.socialGroup||[])];a.socialGroup=[];a.partner=null;for(const idx of old){const b=agents[idx];if(!b||b===a)continue;b.socialGroup=(b.socialGroup||[]).filter(i=>i!==a.index);b.partner=b.socialGroup.length>1?(b.socialGroup.find(i=>i!==b.index)??null):null;if(b.partner===null&&b.slot?.activity==='talk'){b.state='waiting for a chat';b.dwell=Math.min(b.dwell,2);}}if(reserved.get(a.reserved)===a.index)reserved.delete(a.reserved);a.reserved=null;}
  function claim(a,id){release(a);reserved.set(id,a.index);a.reserved=id;}
  function initial(a,id){a.node=id;a.pos={x:node(id).x,y:node(id).y,z:node(id).z};a.route=[];a.cursor=0;a.slot=byNode.get(id)||null;claim(a,id);a.state=a.slot?'settling':'strolling';a.settle=a.slot?.2:0;a.dwell=a.slot?30:0;a.face=a.slot?.facing??random()*Math.PI*2;}
  for(const r of world.residents){const ring=nav.rings.get(r.lot.id),id=ring[Math.floor(((r.distance%73.76)+73.76)%73.76/73.76*32)],a={actor:r,index:r.meta.index,node:id,pos:{},route:[],cursor:0,state:'strolling',speed:0,stride:r.phase,walk:0,face:r.root.rotation.y,reserved:null,slot:null,partner:null,visits:0,visitDue:5+r.meta.index*.8,dwell:0,settle:0,sit:0,activityTime:0,pending:null,priority:false,conversationStart:0,socialGroup:[],commands:[],activeCommand:null,manualHold:0,commandError:null,goNode:nav.nodes.length};nav.nodes.push({id:a.goNode,x:0,y:0,z:0,zone:'goal',edges:[]});agents.push(a);initial(a,id);}
  const talkSlots=nav.slots.filter(s=>s.activity==='talk'),drinkSlots=nav.slots.filter(s=>s.activity==='drink'),tvSlot=nav.slots.find(s=>s.activity==='tv');
  for(let i=0;i<4;i++)initial(agents[i],talkSlots[i].node);
  initial(agents[4],drinkSlots[0].node);initial(agents[5],drinkSlots[1].node);initial(agents[20],tvSlot.node);
  for(const a of agents){if(a.slot){a.visits=1;a.visitDue=90;a.settle=0;a.sit=a.slot.activity==='talk'?0:1;startActivity(a);}a.actor.root.rotation.y=a.face;animate(a,0);}
  world.setLiveController({step});
  function travel(a,id){const path=nav.route(a.node,id);if(!path.length)return false;claim(a,id);a.slot=byNode.get(id)||null;a.route=Math.hypot(a.pos.x-node(a.node).x,a.pos.y-node(a.node).y,a.pos.z-node(a.node).z)>.001?path:path.slice(1);a.cursor=0;a.dwell=0;a.settle=0;a.state=a.slot?(a.slot.activity==='tv'?'going to TV':a.slot.activity==='drink'?'going for a drink':'visiting'):'walking';if(!a.route.length)arrive(a);return true;}
  function arrive(a){if(a.activeCommand?.kind==='go'){a.route=[];a.cursor=0;a.speed=0;a.state='standing';a.activeCommand=null;a.manualHold=time+60;a.dwell=60;return;}a.route=[];a.cursor=0;a.speed=0;if(a.slot){a.state='settling';a.settle=.7;a.face=a.slot.facing??a.face;a.visits++;a.visitDue=time+55+random()*45;a.priority=false;arrivals++;}else{a.state='enjoying the neighborhood';a.dwell=6+random()*10;a.face=random()*Math.PI*2;}if(a.pending&&!a.slot)a.dwell=0;}
  function startActivity(a){a.activityTime=0;if(a.slot.activity==='tv'){a.state='watching TV';a.face=0;a.dwell=26+random()*16;tvSessions++;}else if(a.slot.activity==='drink'){a.state='having a drink';a.dwell=22+random()*14;drinks++;}else if(a.slot.activity==='seat'){a.state='sitting';a.face=a.slot.facing??a.face;a.dwell=24+random()*18;seatSessions++;}else{a.state='waiting for a chat';a.dwell=25;pair(a);}}
  function pair(a){
    if(a.slot?.activity!=='talk'||a.route.length||a.settle>0)return;
    const gid=a.slot.group??a.slot.pair,members=agents.filter(b=>b.slot?.activity==='talk'&&(b.slot.group??b.slot.pair)===gid&&!b.route.length&&b.settle<=0);
    if(members.length<2)return;
    const ids=members.map(b=>b.index).sort((x,y)=>x-y),signature=ids.join(',');
    if(socialSignatures.get(gid)!==signature){socialSignatures.set(gid,signature);socialStarts.set(gid,time);conversations++;}
    const cx=members.reduce((s,b)=>s+b.pos.x,0)/members.length,cz=members.reduce((s,b)=>s+b.pos.z,0)/members.length,start=socialStarts.get(gid)??time;
    for(const b of members){b.socialGroup=[...ids];const k=ids.indexOf(b.index),preferred=b.activeCommand?.kind==='talk'&&Number.isInteger(b.activeCommand.targetIndex)&&ids.includes(b.activeCommand.targetIndex)?b.activeCommand.targetIndex:null;b.partner=preferred??ids[(k+1)%ids.length];b.conversationStart=start;b.dwell=Math.max(b.dwell,60+random()*20);b.state='talking';b.face=Math.atan2(cx-b.pos.x,cz-b.pos.z);if(b.activeCommand?.kind==='talk')b.activeCommand.conversed=true;}
  }
  function depart(a){const id=free(nav.publicSlots);if(id!==null&&travel(a,id)){departures++;return true;}a.dwell=2;return false;}
  function chooseSlot(a,kind=null){let choices=nav.slots.filter(s=>(!kind||s.activity===kind)&&!reserved.has(s.node)&&!agents.some(b=>b!==a&&(b.pending===s.activity||b.activeCommand?.kind===s.activity)&&b.index<a.index));if(!choices.length)return null;
    // Finish existing pairs before starting another unpaired conversation.
    const waiting=choices.filter(s=>s.activity==='talk'&&nav.slots.some(t=>t.activity==='talk'&&(t.group??t.pair)===(s.group??s.pair)&&t.node!==s.node&&reserved.has(t.node)));if(!kind&&waiting.length)choices=waiting;
    return choices[Math.floor(random()*choices.length)];}
  function decide(a){if(Number.isInteger(a.invitedBy)){const inviter=agents[a.invitedBy];if(inviter?.activeCommand?.targetIndex===a.index&&!inviter.activeCommand.conversed){a.dwell=.5;return;}a.invitedBy=null;}if(a.activeCommand||a.commands.length){driveCommands(a);return;}if(time<a.manualHold){a.state='standing';a.dwell=Math.min(1,a.manualHold-time);return;}if(a.pending){const slot=chooseSlot(a,a.pending);if(slot&&travel(a,slot.node)){a.pending=null;return;}}
    if(a.slot){depart(a);return;}if(a.priority||time>=a.visitDue){const slot=chooseSlot(a);if(slot){travel(a,slot.node);return;}}
    const id=free(nav.publicSlots);if(id!==null&&id!==a.node)travel(a,id);else a.dwell=1;}
  function animate(a,dt){const r=a.actor,blend=1-Math.exp(-dt*8),sitting=a.slot&&['watching TV','having a drink','sitting'].includes(a.state);a.walk+=(clamp(a.speed/1.2,0,1)-a.walk)*blend;a.sit+=(Number(!!sitting)-a.sit)*blend;
    r.root.rotation.y+=clamp(angleDelta(a.face,r.root.rotation.y),-3.6*dt,3.6*dt);const w=a.walk*(1-a.sit),s=a.sit,wave=Math.sin(a.stride),grouped=(a.socialGroup?.length??0)>1&&!a.route.length;
    const order=grouped?a.socialGroup.indexOf(a.index):0,speaking=grouped&&(Math.floor((time-a.conversationStart)/2.8)%a.socialGroup.length===order);if(grouped)a.state=speaking?'talking':'listening';a.speaking=speaking;
    const gesture=speaking?.5+.5*Math.sin(a.activityTime*3.6):0,sip=a.state==='having a drink'?Math.pow(Math.max(0,Math.sin(a.activityTime*.9)),3):0;
    r.legs[0].rotation.x=wave*.39*w-Math.PI*.5*s;r.legs[1].rotation.x=-wave*.39*w-Math.PI*.5*s;r.knees[0].rotation.x=Math.max(0,-wave)*.56*w+Math.PI*.5*s;r.knees[1].rotation.x=Math.max(0,wave)*.56*w+Math.PI*.5*s;
    r.arms[0].rotation.x=-.05-wave*.29*w-.18*s-gesture*.35;r.arms[1].rotation.x=-.05+wave*.29*w-.18*s-(a.state==='having a drink'?.22+sip*.52:0);
    r.arms[0].rotation.z=-.06-gesture*.20;r.arms[1].rotation.z=.06;
    if(r.elbows){r.elbows[0].rotation.x=-.12-gesture*.68;r.elbows[1].rotation.x=-.12-(a.state==='having a drink'?.85+sip*.75:s*.12);}
    r.head.position.y=(r.headHeight??1.48)+Math.abs(wave)*.006*w;r.head.rotation.x=grouped&&!speaking?Math.sin(time*3.2+a.index)*.055:sip*.06;r.head.rotation.y=a.state==='watching TV'?.78+Math.sin(time*.8)*.025:grouped?Math.sin(time*1.7)*.055:0;
    if(r.torso)r.torso.rotation.y=a.state==='watching TV'?.17:0;
    if(r.cup){r.cup.scale.setScalar(a.state==='having a drink'?1:.0001);r.cup.rotation.x=-(r.arms[1].rotation.x+(r.elbows?.[1].rotation.x??0));}
    const hipY=a.slot?.hipY||.45,seatY=world.home.origin.y+FLOOR_Y+hipY-(r.hipHeight??.73)*r.root.scale.x;
    const street=node(a.node).zone==='street'&&a.route.length,lane=street?.14:0;r.root.position.set(a.pos.x+Math.cos(a.face)*lane,a.pos.y+(seatY-a.pos.y)*s+Math.abs(wave)*.012*w,a.pos.z-Math.sin(a.face)*lane);
    r.meta.description=a.state[0].toUpperCase()+a.state.slice(1)+'.';
  }
  function interrupt(a){
    release(a);a.invitedBy=null;a.pending=null;a.priority=false;a.slot=null;a.settle=0;a.route=[];a.cursor=0;a.speed=0;a.dwell=0;a.state='standing';
  }
  function finishCommand(a,error=null){const guest=agents[a.activeCommand?.invited];if(guest?.invitedBy===a.index)interrupt(guest);a.commandError=error;interrupt(a);a.activeCommand=null;a.manualHold=time+60;a.dwell=60;}
  function driveCommands(a){
    if(!a.activeCommand){if(!a.commands.length)return;interrupt(a);a.activeCommand=a.commands.shift();a.activeCommand.started=time;}
    const c=a.activeCommand;
    if(c.kind==='go'){
      const goal=nav.resolve(c.point);if(!goal){finishCommand(a,'That spot is not reachable.');return;}
      const path=nav.route(a.node,goal.node);if(!path.length){finishCommand(a,'No clear route.');return;}
      const n=node(a.goNode);Object.assign(n,{x:goal.x,y:goal.y,z:goal.z});
      a.route=Math.hypot(a.pos.x-node(a.node).x,a.pos.y-node(a.node).y,a.pos.z-node(a.node).z)>.001?path:path.slice(1);
      a.route.push(a.goNode);a.cursor=0;a.state='going here';c.destination={x:goal.x,y:goal.y,z:goal.z};return;
    }
    if(c.startedActivity){if(c.kind==='talk'&&Number.isInteger(c.targetIndex)&&!c.conversed){if(time-c.started<180&&agents[c.targetIndex]?.invitedBy===a.index){a.dwell=.5;return;}finishCommand(a,'The conversation was cancelled.');return;}finishCommand(a);return;}
    let slot;
    if(c.kind==='talk'&&Number.isInteger(c.targetIndex)){
      const b=agents[c.targetIndex];if(!b||b===a){finishCommand(a,'Choose another resident.');return;}
      if(b.slot?.activity==='talk'&&!b.route.length){const gid=b.slot.group??b.slot.pair,freeSlot=nav.slots.find(s=>s.activity==='talk'&&(s.group??s.pair)===gid&&!reserved.has(s.node));if(freeSlot){slot=freeSlot;c.invited=b.index;}}
      else{if(b.activeCommand||b.commands.length){a.state='waiting to chat';a.dwell=.5;if(time-c.started>60)finishCommand(a,'That resident is busy.');return;}for(let groupId=0;groupId<3;groupId++){const groupSlots=nav.slots.filter(s=>s.activity==='talk'&&(s.group??s.pair)===groupId),freeSlots=groupSlots.filter(s=>!reserved.has(s.node));if(freeSlots.length>=2){interrupt(b);b.invitedBy=a.index;c.invited=b.index;slot=freeSlots[0];travel(b,freeSlots[1].node);break;}}}
    }else if(c.kind==='seat'&&c.targetSeat)slot=nav.slots.find(s=>s.activity==='seat'&&s.seatId===c.targetSeat&&!reserved.has(s.node));
    else slot=chooseSlot(a,c.kind);
    if(slot){travel(a,slot.node);c.startedActivity=true;return;}
    a.state='waiting for '+(c.kind==='drink'?'a chair':c.kind==='tv'?'the sofa':c.kind==='seat'?'a seat':'a conversation');a.dwell=.5;
    if(time-c.started>90)finishCommand(a,'The object is still occupied.');
  }
  function command(index,kind,point=null,targetIndex=null,targetSeat=null){const a=agents[index];if(!a||!['go','tv','drink','talk','seat'].includes(kind))return {ok:false,reason:'Unknown action.'};if(kind==='go'&&!nav.resolve(point))return {ok:false,reason:'Choose clear floor, the front garden, or a sidewalk.'};
    if(a.commands.length+(a.activeCommand?1:0)>=6)return {ok:false,reason:'The action queue is full.'};
    a.commandError=null;a.commands.push({id:++commandId,kind,targetIndex,targetSeat,point:point?{x:point.x,z:point.z}:null,label:{go:'Go here',tv:'Watch TV',drink:'Have a drink',talk:'Chat',seat:'Sit'}[kind]});
    if(!a.activeCommand){interrupt(a);a.manualHold=0;}return {ok:true};
  }
  function cancelCommand(index,id){const a=agents[index];if(!a)return false;if(a.activeCommand?.id===id){finishCommand(a);return true;}const i=a.commands.findIndex(c=>c.id===id);if(i>=0){a.commands.splice(i,1);return true;}return false;}
  function cancelAll(index){const a=agents[index];if(!a)return false;a.commands=[];finishCommand(a);return true;}
  function getCommands(index){const a=agents[index];return a?[...(a.activeCommand?[{...a.activeCommand,active:true}]:[]),...a.commands.map(c=>({...c,active:false}))]:[];}
  function step(dt){if(!Number.isFinite(dt)||dt<0)return;time+=dt;
    for(const a of agents){a.activityTime+=dt;if(!a.route.length){if(a.commands.length&&!a.activeCommand){driveCommands(a);} if(a.route.length){}else if(a.settle>0){a.settle=Math.max(0,a.settle-dt);if(a.settle===0)startActivity(a);}else{if(a.state==='waiting for a chat')pair(a);a.dwell-=dt;if(a.dwell<=0)decide(a);}}
      if(a.route.length){const target=node(a.route[a.cursor]),dx=target.x-a.pos.x,dy=target.y-a.pos.y,dz=target.z-a.pos.z,d=Math.hypot(dx,dy,dz);if(d>.001)a.face=Math.atan2(dx,dz);
        let desired=1.12+a.index%5*.06;desired*=1-Math.min(.65,Math.abs(angleDelta(a.face,a.actor.root.rotation.y))/Math.PI);if(a.sit>.06)desired*=1-a.sit;if(a.cursor===a.route.length-1)desired=Math.min(desired,Math.max(.18,d*2));
        for(const b of agents){if(a===b||!b.route.length)continue;const bx=b.pos.x-a.pos.x,bz=b.pos.z-a.pos.z,forward=bx*Math.sin(a.face)+bz*Math.cos(a.face),side=Math.abs(bx*Math.cos(a.face)-bz*Math.sin(a.face));if(forward>0&&forward<.64&&side<.24&&Math.cos(a.face-b.face)>.55)desired=Math.min(desired,Math.max(.10,(forward-.28)*2));}
        a.speed+=clamp(desired-a.speed,-dt*4,dt*2.8);const move=Math.min(d,a.speed*dt);if(d>0){a.pos.x+=dx/d*move;a.pos.y+=dy/d*move;a.pos.z+=dz/d*move;a.stride+=move*6.4;}if(d-move<.00001){if(target.id!==a.goNode)a.node=target.id;a.cursor++;if(a.cursor>=a.route.length)arrive(a);}
      }else a.speed=Math.max(0,a.speed-dt*4);animate(a,dt);
    }
  }
  function legacyRequestActivity(index,kind){const a=agents[index];if(!a||!['tv','drink','talk'].includes(kind))return false;if(a.slot?.activity===kind&&!a.route.length){a.pending=null;a.dwell=0;release(a);return true;}a.pending=kind;a.priority=true;if(!a.route.length)a.dwell=0;return true;}
  const requestActivity=(index,kind)=>command(index,kind).ok;
  function gather(){gathering=true;for(const a of agents){a.priority=true;a.visitDue=0;if(!a.route.length&&!a.slot)a.dwell=0;}return true;}
  function stats(){return {time,inside:agents.filter(a=>a.pos.x>world.home.origin.x-5.6&&a.pos.x<world.home.origin.x+5.6&&a.pos.z>world.home.origin.z-4.6&&a.pos.z<world.home.origin.z+4.6).length,chatting:agents.filter(a=>a.partner!==null).length,walking:agents.filter(a=>a.route.length).length,visited:agents.filter(a=>a.visits>0).length,arrivals,departures,gathering,slots:nav.slots.length,conversations,drinks,tvSessions,watching:agents.filter(a=>a.state==='watching TV').length,drinking:agents.filter(a=>a.state==='having a drink').length,pairs:agents.filter(a=>a.partner!==null&&a.index<a.partner).length,groups:new Set(agents.filter(a=>(a.socialGroup?.length??0)>1).map(a=>a.slot?.group??a.slot?.pair)).size,maxGroup:Math.max(0,...agents.map(a=>a.socialGroup?.length??0)),seated:agents.filter(a=>a.state==='sitting').length,seatSessions};}
  return {nav,agents,step,gather,command,cancelCommand,cancelAll,getCommands,requestActivity,requestSit:index=>requestActivity(index,'tv'),stats,doorWanted:()=>agents.some(a=>a.route.length&&Math.abs(a.pos.x-world.home.origin.x)<1&&Math.abs(a.pos.z-world.home.origin.z-4.7)<2.5),dispose(){world.setLiveController(null);reserved.clear();}};
}

// V11 invitation handshake: wait for both partners; cancelling releases both.
