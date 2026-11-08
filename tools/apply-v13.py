"""One-time, guarded V13 migration. Commit generated runtime before browser QA."""
from pathlib import Path
p=Path('src/v11-life.js')
s=p.read_text()
if 'const GET_UP_SECONDS=.82;' not in s:
    def patch(a,b):
        global s
        assert a in s, f'Version drift: {a[:90]}'
        s=s.replace(a,b,1)
    patch('const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));', '''const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// Stand before routing away from occupied furniture. Keep the outgoing hip pivot
// until the full seated-to-standing transition ends, including outdoor seats.
const GET_UP_SECONDS=.82;
const isSeatActivity=slot=>slot&&['seat','tv','drink'].includes(slot.activity);''')
    patch('  function release(a){const old=[...(a.socialGroup||[])];', '''  function beginGetUp(a){
    if(a.getUpRemaining>0||a.sit<.075||!isSeatActivity(a.slot))return;
    a.exitSlot=a.slot;a.getUpRemaining=GET_UP_SECONDS;a.getUpCount++;a.speed=0;
  }
  // A released seat is not reusable while its previous Sim is standing up.
  function isBlocked(id){return reserved.has(id)||agents.some(a=>a.getUpRemaining>0&&a.exitSlot?.node===id);}
  function release(a){beginGetUp(a);const old=[...(a.socialGroup||[])];''')
    patch('if(!reserved.has(id))return id;', 'if(!isBlocked(id))return id;')
    patch('settle:0,sit:0,activityTime:0,pending:null','settle:0,sit:0,exitSlot:null,getUpRemaining:0,getUpCount:0,activityTime:0,pending:null')
    patch('a.sit+=(Number(!!sitting)-a.sit)*blend;', 'a.sit+=(Number(!!sitting)-a.sit)*blend;a.sit=clamp(a.sit,0,1);')
    patch("const hipY=a.slot?.hipY||.45,seatFloor=a.slot?.activity==='seat'?node(a.slot.node).y:world.home.origin.y+FLOOR_Y,seatY=seatFloor+hipY-(r.hipHeight??.73)*r.root.scale.x;", """const poseSlot=a.exitSlot||a.slot;
    const hipY=poseSlot?.hipY??.45,seatFloor=poseSlot?.activity==='seat'?node(poseSlot.node).y:world.home.origin.y+FLOOR_Y;
    const seatY=seatFloor+hipY-(r.hipHeight??.73)*r.root.scale.x;""")
    patch('&&!reserved.has(s.node)&&!agents.some', '&&!isBlocked(s.node)&&!agents.some')
    patch('&&!reserved.has(s.node));', '&&!isBlocked(s.node));')
    patch('freeSlots=groupSlots.filter(s=>!reserved.has(s.node));','freeSlots=groupSlots.filter(s=>!isBlocked(s.node));')
    patch('&&s.seatId===c.targetSeat&&!reserved.has(s.node)','&&s.seatId===c.targetSeat&&!isBlocked(s.node)')
    patch('    for(const a of agents){a.activityTime+=dt;if(!a.route.length){', '''    for(const a of agents){a.activityTime+=dt;
      if(a.getUpRemaining>0){
        a.getUpRemaining=Math.max(0,a.getUpRemaining-dt);
        a.state='standing up';a.speed=0; // no path advance while legs are bent
        animate(a,dt);
        if(a.getUpRemaining===0){
          a.exitSlot=null;a.sit=0;a.actor.root.position.y=a.pos.y;
          a.state=a.route.length?'walking':'standing';
        }
        continue;
      }
      if(!a.route.length){''')
    patch("seated:agents.filter(a=>a.state==='sitting').length,seatSessions", "seated:agents.filter(a=>a.state==='sitting').length,standingUp:agents.filter(a=>a.getUpRemaining>0).length,getUps:agents.reduce((n,a)=>n+a.getUpCount,0),seatSessions")
    p.write_text(s)
    print('V13 seated transition applied')
else:
    print('V13 seated transition already present')
for filename,a,b in [('src/main-v11.js','version:12','version:13'),('src/v11-hud.js',"text('Town 12'","text('Town 13'"),('index.html','Town V12','Town V13'),('package.json','0.12.0','0.13.0'),('package-lock.json','0.12.0','0.13.0')]:
    f=Path(filename);data=f.read_text()
    if b not in data:
        assert a in data, f'{filename} version drift'
        data=data.replace(a,b)
        f.write_text(data)
f=Path('src/main-v11.js');data=f.read_text()
a='activity:a.slot?.activity,appearance:a.actor.meta.appearance'
b='activity:a.slot?.activity,sitBlend:a.sit,getUpRemaining:a.getUpRemaining,exitSeat:a.exitSlot?.id??null,renderY:a.actor.root.position.y,appearance:a.actor.meta.appearance'
if b not in data:
    assert a in data, 'resident QA hooks changed'
    f.write_text(data.replace(a,b,1))
print('V13 renderer, HUD and QA probes ready')
