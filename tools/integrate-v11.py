from pathlib import Path

# Development migration only. The workflow commits generated native source
# before testing. Existing V11 source is never silently regenerated.
p=Path('.')

def save(name,source):
    path=p/name
    if not path.exists(): path.write_text(source)

s=(p/'src/v10-life.js').read_text()
s=s.replace("import {makeLiveNavigation} from './v9-life.js';", "import {makeLiveNavigation} from './v9-life.js';\nimport {extendPlayerNavigation} from './v11-navigation.js';")
s=s.replace('return {...nav,slots};','return extendPlayerNavigation({...nav,slots},plan,origin);')
s=s.replace('const node=id=>nav.nodes[id];let time=0','let commandId=0;const node=id=>nav.nodes[id];let time=0')
s=s.replace('conversationStart:0};agents.push(a);initial(a,id);',"conversationStart:0,commands:[],activeCommand:null,manualHold:0,commandError:null,goNode:nav.nodes.length};nav.nodes.push({id:a.goNode,x:0,y:0,z:0,zone:'goal',edges:[]});agents.push(a);initial(a,id);")
s=s.replace('a.route=path.slice(1);','a.route=Math.hypot(a.pos.x-node(a.node).x,a.pos.y-node(a.node).y,a.pos.z-node(a.node).z)>.001?path:path.slice(1);')
s=s.replace('function arrive(a){a.route=[];',"function arrive(a){if(a.activeCommand?.kind==='go'){a.route=[];a.cursor=0;a.speed=0;a.state='standing';a.activeCommand=null;a.manualHold=time+60;a.dwell=60;return;}a.route=[];")
s=s.replace('function decide(a){if(a.pending)',"function decide(a){if(a.activeCommand||a.commands.length){driveCommands(a);return;}if(time<a.manualHold){a.state='standing';a.dwell=Math.min(1,a.manualHold-time);return;}if(a.pending)")
s=s.replace('function step(dt){', '''function interrupt(a){
    release(a);a.pending=null;a.priority=false;a.slot=null;a.settle=0;a.route=[];a.cursor=0;a.speed=0;a.dwell=0;a.state='standing';
  }
  function finishCommand(a,error=null){a.commandError=error;interrupt(a);a.activeCommand=null;a.manualHold=time+60;a.dwell=60;}
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
    if(c.startedActivity){finishCommand(a);return;}
    let slot;
    if(c.kind==='talk'&&Number.isInteger(c.targetIndex)){
      const b=agents[c.targetIndex];if(!b||b===a){finishCommand(a,'Choose another resident.');return;}
      if(b.activeCommand||b.commands.length){a.state='waiting to chat';a.dwell=.5;if(time-c.started>60)finishCommand(a,'That resident is busy.');return;}
      for(let pairId=0;pairId<3;pairId++){const pairSlots=nav.slots.filter(s=>s.activity==='talk'&&s.pair===pairId);if(pairSlots.every(s=>!reserved.has(s.node)||reserved.get(s.node)===b.index)){interrupt(b);slot=pairSlots[0];travel(b,pairSlots[1].node);break;}}
    }else slot=chooseSlot(a,c.kind);
    if(slot){travel(a,slot.node);c.startedActivity=true;return;}
    a.state='waiting for '+(c.kind==='drink'?'a chair':c.kind==='tv'?'the sofa':'a conversation');a.dwell=.5;
    if(time-c.started>90)finishCommand(a,'The object is still occupied.');
  }
  function command(index,kind,point=null,targetIndex=null){const a=agents[index];if(!a||!['go','tv','drink','talk'].includes(kind))return {ok:false,reason:'Unknown action.'};if(kind==='go'&&!nav.resolve(point))return {ok:false,reason:'Choose clear floor, the front garden, or a sidewalk.'};
    if(a.commands.length+(a.activeCommand?1:0)>=6)return {ok:false,reason:'The action queue is full.'};
    a.commandError=null;a.commands.push({id:++commandId,kind,targetIndex,point:point?{x:point.x,z:point.z}:null,label:{go:'Go here',tv:'Watch TV',drink:'Have a drink',talk:'Chat'}[kind]});
    if(!a.activeCommand){interrupt(a);a.manualHold=0;}return {ok:true};
  }
  function cancelCommand(index,id){const a=agents[index];if(!a)return false;if(a.activeCommand?.id===id){finishCommand(a);return true;}const i=a.commands.findIndex(c=>c.id===id);if(i>=0){a.commands.splice(i,1);return true;}return false;}
  function cancelAll(index){const a=agents[index];if(!a)return false;a.commands=[];finishCommand(a);return true;}
  function getCommands(index){const a=agents[index];return a?[...(a.activeCommand?[{...a.activeCommand,active:true}]:[]),...a.commands.map(c=>({...c,active:false}))]:[];}
  function step(dt){''')
s=s.replace('a.activityTime+=dt;if(!a.route.length){',"a.activityTime+=dt;if(!a.route.length){if(a.commands.length&&!a.activeCommand){driveCommands(a);} ")
s=s.replace('if(a.settle>0)','if(a.route.length){}else if(a.settle>0)')
s=s.replace('a.node=target.id;a.cursor++;','if(target.id!==a.goNode)a.node=target.id;a.cursor++;')
s=s.replace('return {nav,agents,step,gather,requestActivity','return {nav,agents,step,gather,command,cancelCommand,cancelAll,getCommands,requestActivity')
s=s.replace('function requestActivity(index,kind){','function legacyRequestActivity(index,kind){')
s=s.replace('function gather(){',"const requestActivity=(index,kind)=>command(index,kind).ok;\n  function gather(){")
s=s.replace('!agents.some(b=>b!==a&&b.pending===s.activity)','!agents.some(b=>b!==a&&(b.pending===s.activity||b.activeCommand?.kind===s.activity)&&b.index<a.index)')
save('src/v11-life.js',s)

s=(p/'src/v10-hud.js').read_text().replace("text('Town 10'","text('Town 11'")
start=s.index('    if(context&&!menu)');end=s.index('    const focused=',start)
s=s[:start]+'''    // The command strip shares the glyph atlas and the existing GPU batch.
    if(m.queue?.length&&!menu){
      const qw=Math.min(bw,420),qx=bx,qy=by-72,cw=(qw-16)/6;
      rect(qx,qy,qw,64,colors.panel,13);text('Actions',qx+10,qy+7,11,colors.muted);
      for(let i=0;i<m.queue.length;i++){const c=m.queue[i],xx=qx+8+i*cw;
        button('cancel:'+c.id,c.kind==='go'?'Go here':c.kind==='tv'?'TV':c.kind==='drink'?'Drink':'Chat',xx,qy+24,cw-4,32,{active:c.active});
        icon('close',xx+cw-15,qy+24,10,c.active?colors.white:colors.muted);
      }
    }
    if(m.goal){icon('follow',m.goal.x-15,m.goal.y-15,30,colors.mint);}
    if(context&&!menu){
      const ground=context.kind==='ground',person=context.kind==='resident';
      const w=Math.min(210,width-16),h=person?130:90,x=Math.max(8,Math.min(width-w-8,context.x-w/2)),y=Math.max(52,Math.min(by-82-h,context.y-h+14));
      hits.push({id:'panel',label:'Actions',x,y,w,h});rect(x,y,w,h,colors.panel,14);
      text(ground?'Walk here':person?context.title:context.kind==='drink'?'Dining table':'Television',x+12,y+12,15);
      button(ground?'go':person?'chat-target':context.kind,ground?'Go here':person?'Chat':context.kind==='drink'?'Have a drink':'Watch TV',x+10,y+42,w-20,36);
      if(person)button('select-target','Select resident',x+10,y+83,w-20,34);
    }
''' +s[end:]
s=s.replace('m.residents.map(r=>r.index),context','m.residents.map(r=>r.index),m.queue,m.goal,context')
s=s.replace("function activate(id){stamp='';if(id==='tv'||id==='drink')context=null;", "function activate(id){stamp='';if(['go','chat-target','select-target','tv','drink'].includes(id)&&context){const payload=context;context=null;onAction(id,payload);return;}")
s=s.replace("openContext(kind,x,y){context={kind,x,y};menu='';stamp='';}","openContext(kind,x,y,data={}){context={kind,x,y,...data};menu='';focus=-1;stamp='';},dismiss(){context=null;menu='';stamp='';}")
s=s.replace('portraitCount:32,textureSize','portraitCount:32,context:context?{kind:context.kind,point:context.point}:null,textureSize')
save('src/v11-hud.js',s)

s=(p/'src/main-v10.js').read_text().replace("from './v10-life.js'","from './v11-life.js'").replace("from './v10-hud.js'","from './v11-hud.js'")
s=s.replace("raf=0,notice='',noticeUntil=0;", "raf=0,notice='',noticeUntil=0,goal=null,goalUntil=0;")
s=s.replace('function action(id){','''function action(id,payload={}){
    if(id.startsWith('cancel:')){life.cancelCommand(selected,Number(id.split(':')[1]));return;}
    if(id==='cancel-all'){life.cancelAll(selected);notify('Actions cancelled.');return;}
    if(id==='next-resident'){selected=(selected+1)%life.agents.length;following=false;return;}
    if(id==='select-target'){selected=payload.targetIndex;following=false;return;}
    if(id==='go'){const result=life.command(selected,'go',payload.point);if(!result.ok)notify(result.reason);else {goal=life.nav.resolve(payload.point);goalUntil=performance.now()+3500;}return;}
    if(id==='chat-target'){const result=life.command(selected,'talk',null,payload.targetIndex);if(!result.ok)notify(result.reason);return;}
''')
s=s.replace("life.requestActivity(selected,'tv');notify('TV activity updated.');", "{const r=life.command(selected,'tv');if(!r.ok)notify(r.reason);} ")
s=s.replace("life.requestActivity(selected,'drink');notify('A drink at the table is queued.');", "{const r=life.command(selected,'drink');if(!r.ok)notify(r.reason);} ")
s=s.replace("life.requestActivity(selected,'talk');notify('A conversation is queued.');", "{const r=life.command(selected,'talk');if(!r.ok)notify(r.reason);} ")
start=s.index('  function selectAt(');end=s.index('  function pan(',start)
s=s[:start]+'''  function selectAt(x,y,right=false){
    hud.dismiss();const r=canvas.getBoundingClientRect();ndc.set((x-r.left)/r.width*2-1,1-(y-r.top)/r.height*2);ray.setFromCamera(ndc,camera);
    const selections=ray.intersectObjects(world.getTargets(),false),m=selections[0]?.object.userData.selection;
    if(m?.type==='resident'){
      if(right||m.index===selected){selected=m.index;following=false;}
      else hud.openContext('resident',x-r.left,y-r.top,{targetIndex:m.index,title:world.residents[m.index].meta.name});
      return;
    }
    if(right)return;
    if(m?.type==='furniture'){hud.openContext(m.activity||'tv',x-r.left,y-r.top);return;}
    const o=world.home.origin,ground=new THREE.Vector3(),floor=new THREE.Vector3();
    ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-(o.y+.4-.07)),floor);
    let point;
    if(Math.abs(floor.x-o.x)<5.7&&Math.abs(floor.z-o.z)<4.7){
      if(!world.home.isOpen){notify('Open the roof to choose a floor destination.');return;}point=floor;
    }else {ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-.29),ground);point=ground;}
    const destination=life.nav.resolve(point);
    if(!destination){notify('That spot is blocked. Choose clear floor or sidewalk.');goal=null;return;}
    goal=destination;goalUntil=performance.now()+3500;
    hud.openContext('ground',x-r.left,y-r.top,{point:{x:destination.x,z:destination.z}});
  }
''' +s[end:]
s=s.replace('else if(e.button===0)selectAt(e.clientX,e.clientY);','else if(e.button===0||e.button===2)selectAt(e.clientX,e.clientY,e.button===2);')
s=s.replace("const k=e.key.toLowerCase(),map={' ':'pause'", "const k=e.key.toLowerCase(),map={' ':'next-resident','n':'next-resident','p':'pause','0':'pause','delete':'cancel-all'")
s=s.replace("'x':'sit'","'x':'cancel-all'")
s=s.replace('return {seed,selected:',"const current=life.getCommands(selected).find(c=>c.kind==='go'),dest=current?.destination??(now<goalUntil?goal:null);let projectedGoal=null;if(dest){const v=new THREE.Vector3(dest.x,dest.y+.07,dest.z).project(camera);projectedGoal={x:(v.x+1)*canvas.clientWidth/2,y:(1-v.y)*canvas.clientHeight/2};}\n    return {seed,queue:life.getCommands(selected),goal:projectedGoal,selected:")
s=s.replace('version:10,frames','version:11,frames')
s=s.replace('getView:()=>',"commands:()=>life.getCommands(selected),selected:()=>selected,resolvePoint:p=>life.nav.resolve(p),pointScreen:(x,z)=>{const g=life.nav.resolve({x,z});if(!g)return null;const p=new THREE.Vector3(x,g.y,z).project(camera);return {x:(p.x+1)*canvas.clientWidth/2,y:(1-p.y)*canvas.clientHeight/2};},getView:()=>")
s=s.replace('appearance:a.actor.meta.appearance})),','appearance:a.actor.meta.appearance,commands:life.getCommands(a.index),error:a.commandError,logicalPosition:{...a.pos}})),')
save('src/main-v11.js',s)
(p/'src/main.js').write_text("export {start} from './main-v11.js';\n")
s=(p/'index.html').read_text().replace('V10','V11').replace('Space pauses.','P or 0 pauses. Space or N selects the next resident.').replace('X uses the sofa.','X cancels actions. Click the floor and choose Go here. Click queued actions to cancel them.')
(p/'index.html').write_text(s)
for name in ['package.json','package-lock.json']:
    f=p/name;f.write_text(f.read_text().replace('0.10.0','0.11.0'))
print('V11 native source integrated; commit it before browser review.')
