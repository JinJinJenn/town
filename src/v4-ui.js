import {COTTAGE_PALETTES} from './home-polish.js';

export function mountV4UI(api){
  const $=id=>document.getElementById(id);
  const roster=$('residents-dialog'),list=$('resident-list'),search=$('resident-search');
  let photo=false,lastFocus=null;
  const read=(key)=>{try{return localStorage.getItem(key);}catch{return null;}};
  const save=(key,value)=>{try{localStorage.setItem(key,value);}catch{}};
  function renderResidents(){
    const query=search.value.trim().toLocaleLowerCase();list.replaceChildren();
    const people=api.residents().filter(r=>r.meta.name.toLocaleLowerCase().includes(query));
    for(const r of people){
      const button=document.createElement('button');button.className='resident-choice';
      const avatar=document.createElement('span');avatar.className='resident-avatar';avatar.textContent=r.meta.name.slice(0,1);avatar.setAttribute('aria-hidden','true');
      const name=document.createElement('span');name.textContent=r.meta.name;
      const follow=document.createElement('small');follow.textContent='Follow their walk →';
      button.append(avatar,name,follow);button.onclick=()=>{roster.close();api.followResident(r.meta.index);};list.append(button);
    }
    $('roster-count').textContent=`${people.length} of ${api.residents().length} residents`;
    if(!people.length){const p=document.createElement('p');p.textContent='No residents match that name.';list.append(p);}
  }
  $('residents').onclick=()=>{search.value='';renderResidents();api.clearKeys();roster.showModal();search.focus();};
  search.addEventListener('input',renderResidents);
  for(const dialog of document.querySelectorAll('dialog')){
    dialog.addEventListener('click',event=>{if(event.target===dialog){const b=dialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)dialog.close();}});
  }
  const swatches=$('palette-options');
  for(const [id,palette] of Object.entries(COTTAGE_PALETTES)){
    const button=document.createElement('button');button.type='button';button.className='palette-choice';button.dataset.palette=id;button.setAttribute('aria-label',palette.label);button.title=palette.label;
    const dot=document.createElement('span');dot.style.background=`linear-gradient(135deg, ${palette.sofa} 50%, ${palette.quilt} 50%)`;button.append(dot,document.createTextNode(palette.label));
    button.onclick=()=>{if(api.home().setPalette(id)){save('town.palette.v5',id);syncPalette();}};swatches.append(button);
  }
  function syncPalette(){for(const b of swatches.children)b.setAttribute('aria-pressed',String(b.dataset.palette===api.home().palette));}
  function restorePalette(){api.home().setPalette(read('town.palette.v5')||'roseMint');syncPalette();}
  function setPhoto(value){
    photo=!!value;document.body.classList.toggle('photo-mode',photo);$('exit-photo').hidden=!photo;
    $('photo').setAttribute('aria-pressed',String(photo));
    if(photo){lastFocus=document.activeElement;$('exit-photo').focus();}else lastFocus?.focus();
  }
  $('photo').onclick=()=>setPhoto(!photo);$('exit-photo').onclick=()=>setPhoto(false);
  window.addEventListener('keydown',e=>{if(e.key==='Escape'&&photo)setPhoto(false);});
  const petals=$('petals');petals.checked=read('town.petals.v4')==='0'?false:!matchMedia('(prefers-reduced-motion: reduce)').matches;
  petals.onchange=()=>{api.setPetals(petals.checked);save('town.petals.v4',petals.checked?'1':'0');};
  restorePalette();api.setPetals(petals.checked);
  return {
    syncSelection(isHome){$('cottage-style').hidden=!isHome;$('home-badges').hidden=!isHome;syncPalette();},
    resetWorld(){restorePalette();api.setPetals(petals.checked);if(roster.open)renderResidents();},
    get photo(){return photo;},get petals(){return petals.checked;},
  };
}
