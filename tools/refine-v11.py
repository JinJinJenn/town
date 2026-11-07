from pathlib import Path
p=Path('src/v11-life.js');s=p.read_text()
if '// V11 invitation handshake' not in s:
 s=s.replace('conversations++;}', "conversations++;for(const c of [a,b])if(c.activeCommand?.kind==='talk')c.activeCommand.conversed=true;}")
 s=s.replace('function decide(a){',"function decide(a){if(Number.isInteger(a.invitedBy)){const inviter=agents[a.invitedBy];if(inviter?.activeCommand?.targetIndex===a.index&&!inviter.activeCommand.conversed){a.dwell=.5;return;}a.invitedBy=null;}")
 s=s.replace("release(a);a.pending=null;a.priority=false;a.slot=null", "release(a);a.invitedBy=null;a.pending=null;a.priority=false;a.slot=null")
 s=s.replace('function finishCommand(a,error=null){', "function finishCommand(a,error=null){const guest=agents[a.activeCommand?.invited];if(guest?.invitedBy===a.index)interrupt(guest);")
 s=s.replace('if(c.startedActivity){finishCommand(a);return;}',"if(c.startedActivity){if(c.kind==='talk'&&Number.isInteger(c.targetIndex)&&!c.conversed){if(time-c.started<180&&agents[c.targetIndex]?.invitedBy===a.index){a.dwell=.5;return;}finishCommand(a,'The conversation was cancelled.');return;}finishCommand(a);return;}")
 s=s.replace('interrupt(b);slot=pairSlots[0];travel(b,pairSlots[1].node);', 'interrupt(b);b.invitedBy=a.index;c.invited=b.index;slot=pairSlots[0];travel(b,pairSlots[1].node);')
 p.write_text(s+'\n// V11 invitation handshake: wait for both partners; cancelling releases both.\n')
p=Path('src/v11-hud.js');s=p.read_text()
s=s.replace('cw-4,32,{active:c.active}',"cw-4,36,{active:c.active,icon:phone?({go:'follow',tv:'tv',drink:'cup',talk:'chat'}[c.kind]):undefined}")
p.write_text(s)
